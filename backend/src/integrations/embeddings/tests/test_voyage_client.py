"""Testes do VoyageEmbeddingsClient via httpx.MockTransport.

Mockamos o transport HTTP — assim validamos payload enviado e parsing da
response sem rede real. Não precisamos da lib `respx` (não está na stack).
"""

import json

import httpx
import pytest

from integrations.embeddings.base import EmbeddingsError
from integrations.embeddings.voyage_client import (
    VOYAGE_API_URL,
    VoyageEmbeddingsClient,
)


def _make_client_with_handler(handler, *, max_retries: int = 3) -> VoyageEmbeddingsClient:
    """Injeta MockTransport monkeypatching httpx.Client dentro do método.

    Como o cliente cria httpx.Client internamente, usamos uma subclasse que
    sobrescreve _post_with_retry pra rodar contra o MockTransport.
    """
    transport = httpx.MockTransport(handler)

    class _Patched(VoyageEmbeddingsClient):
        def _post_with_retry(self, *, payload, headers):  # type: ignore[override]
            last_5xx = None
            with httpx.Client(timeout=self._timeout, transport=transport) as client:
                for _ in range(self._max_retries):
                    try:
                        response = client.post(
                            VOYAGE_API_URL, json=payload, headers=headers
                        )
                    except httpx.HTTPError as exc:
                        raise EmbeddingsError(
                            f"Voyage request failed (network): {exc}"
                        ) from exc
                    if response.status_code < 500:
                        return response
                    last_5xx = response
                assert last_5xx is not None
                return last_5xx

    return _Patched(api_key="test-key", model="voyage-3", max_retries=max_retries)


# ---------- sucesso ----------


def test_embed_single_text_returns_one_vector():
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        captured["headers"] = dict(request.headers)
        captured["body"] = json.loads(request.content)
        return httpx.Response(
            200,
            json={
                "object": "list",
                "data": [{"object": "embedding", "embedding": [0.1, 0.2, 0.3], "index": 0}],
                "model": "voyage-3",
                "usage": {"total_tokens": 5},
            },
        )

    client = _make_client_with_handler(handler)
    vec = client.embed("hello world")

    assert vec == [0.1, 0.2, 0.3]
    assert captured["url"] == VOYAGE_API_URL
    assert captured["headers"]["authorization"] == "Bearer test-key"
    assert captured["body"] == {
        "input": ["hello world"],
        "model": "voyage-3",
        "input_type": "document",
    }


def test_embed_batch_preserves_order_even_when_api_reorders():
    """Voyage devolve `index` por item — ordenamos pra garantir alinhamento."""

    def handler(request: httpx.Request) -> httpx.Response:
        # Devolve fora de ordem de propósito.
        return httpx.Response(
            200,
            json={
                "data": [
                    {"embedding": [3.0], "index": 2},
                    {"embedding": [1.0], "index": 0},
                    {"embedding": [2.0], "index": 1},
                ]
            },
        )

    client = _make_client_with_handler(handler)
    vectors = client.embed_batch(["a", "b", "c"])

    assert vectors == [[1.0], [2.0], [3.0]]


def test_embed_query_sends_input_type_query():
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["body"] = json.loads(request.content)
        return httpx.Response(
            200,
            json={"data": [{"embedding": [0.5], "index": 0}]},
        )

    client = _make_client_with_handler(handler)
    client.embed("busca por python", input_type="query")

    assert captured["body"]["input_type"] == "query"


def test_embed_empty_list_short_circuits_without_http():
    def handler(request: httpx.Request) -> httpx.Response:  # pragma: no cover
        raise AssertionError("não deveria chamar a API com lista vazia")

    client = _make_client_with_handler(handler)
    assert client.embed_batch([]) == []


# ---------- erros ----------


def test_status_401_raises_embeddings_error_with_message():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(401, json={"detail": "invalid api key"})

    client = _make_client_with_handler(handler)
    with pytest.raises(EmbeddingsError) as exc_info:
        client.embed("x")

    msg = str(exc_info.value)
    assert "401" in msg
    assert "invalid api key" in msg


def test_status_500_retries_then_raises_embeddings_error():
    calls = {"count": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        calls["count"] += 1
        return httpx.Response(500, text="internal error")

    client = _make_client_with_handler(handler, max_retries=3)
    with pytest.raises(EmbeddingsError) as exc_info:
        client.embed("x")

    assert calls["count"] == 3, "deve tentar max_retries vezes em 5xx"
    assert "500" in str(exc_info.value)


def test_status_500_then_200_succeeds_after_retry():
    calls = {"count": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        calls["count"] += 1
        if calls["count"] < 2:
            return httpx.Response(503, text="unavailable")
        return httpx.Response(
            200,
            json={"data": [{"embedding": [9.9], "index": 0}]},
        )

    client = _make_client_with_handler(handler, max_retries=3)
    vec = client.embed("x")

    assert vec == [9.9]
    assert calls["count"] == 2


def test_malformed_response_missing_data_raises():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"unexpected": "shape"})

    client = _make_client_with_handler(handler)
    with pytest.raises(EmbeddingsError, match="missing 'data'"):
        client.embed("x")


def test_malformed_response_wrong_count_raises():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={"data": [{"embedding": [1.0], "index": 0}]},
        )

    client = _make_client_with_handler(handler)
    with pytest.raises(EmbeddingsError, match="expected 2"):
        client.embed_batch(["a", "b"])


def test_malformed_response_non_json_raises():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, text="<html>not json</html>")

    client = _make_client_with_handler(handler)
    with pytest.raises(EmbeddingsError, match="not valid JSON"):
        client.embed("x")


def test_malformed_item_missing_embedding_raises():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={"data": [{"index": 0}]},  # sem 'embedding'
        )

    client = _make_client_with_handler(handler)
    with pytest.raises(EmbeddingsError, match="malformed"):
        client.embed("x")


# ---------- construtor ----------


def test_constructor_rejects_empty_api_key():
    with pytest.raises(EmbeddingsError, match="api_key"):
        VoyageEmbeddingsClient(api_key="")
