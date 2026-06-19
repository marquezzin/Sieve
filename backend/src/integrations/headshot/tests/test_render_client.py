"""Testes do RenderHeadshotClient via httpx.MockTransport.

Mockamos o transport HTTP — assim validamos o payload enviado (header x-api-key,
campo multipart `photo`) e o parsing da response sem rede real. Não precisamos
de `respx` nem `unittest.mock` (fora da stack). O client expõe o hook
`_make_client` justamente pra injetar o MockTransport aqui.
"""

import base64

import httpx
import pytest

from integrations.headshot.base import HeadshotError
from integrations.headshot.fake_client import MINIMAL_PNG_BYTES
from integrations.headshot.render_client import RenderHeadshotClient

_PNG_B64 = base64.b64encode(MINIMAL_PNG_BYTES).decode("ascii")


def _make_client_with_handler(handler, *, max_retries: int = 1) -> RenderHeadshotClient:
    """Cria um RenderHeadshotClient cujo httpx.Client usa um MockTransport.

    `wake_backoff=0` evita sleeps nos testes; timeouts curtos por garantia.
    """
    transport = httpx.MockTransport(handler)

    class _Patched(RenderHeadshotClient):
        def _make_client(self, *, timeout):  # type: ignore[override]
            return httpx.Client(timeout=timeout, transport=transport)

    return _Patched(
        base_url="https://headshot.test",
        api_key="test-key",
        timeout=1.0,
        wake_timeout=1.0,
        wake_attempts=3,
        wake_backoff=0.0,
        max_retries=max_retries,
    )


# ---------- sucesso ----------


def test_wake_then_generate_returns_png_bytes():
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/health":
            return httpx.Response(200, json={"status": "ok"})
        # /generate-headshot
        captured["headers"] = dict(request.headers)
        captured["body"] = request.content
        return httpx.Response(
            200,
            json={"image": {"mimeType": "image/png", "data": _PNG_B64}},
        )

    client = _make_client_with_handler(handler)
    result = client.generate(b"raw-photo-bytes", filename="selfie.jpg", content_type="image/jpeg")

    assert result == MINIMAL_PNG_BYTES
    assert captured["headers"]["x-api-key"] == "test-key"
    # campo multipart `photo` + filename presentes no corpo enviado
    assert b'name="photo"' in captured["body"]
    assert b"selfie.jpg" in captured["body"]
    assert b"raw-photo-bytes" in captured["body"]


# ---------- erros ----------


def test_401_raises_headshot_error():
    calls = {"generate": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/health":
            return httpx.Response(200, json={"status": "ok"})
        calls["generate"] += 1
        return httpx.Response(401, json={"error": "missing x-api-key"})

    client = _make_client_with_handler(handler, max_retries=1)
    with pytest.raises(HeadshotError) as exc_info:
        client.generate(b"x")

    assert "401" in str(exc_info.value)
    assert calls["generate"] == 1, "4xx não deve retentar"


def test_5xx_retries_then_raises():
    calls = {"generate": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/health":
            return httpx.Response(200, json={"status": "ok"})
        calls["generate"] += 1
        return httpx.Response(502, text="bad gateway")

    client = _make_client_with_handler(handler, max_retries=2)
    with pytest.raises(HeadshotError) as exc_info:
        client.generate(b"x")

    assert calls["generate"] == 3, "deve tentar max_retries+1 vezes em 5xx"
    assert "502" in str(exc_info.value)


def test_5xx_then_200_succeeds():
    calls = {"generate": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/health":
            return httpx.Response(200, json={"status": "ok"})
        calls["generate"] += 1
        if calls["generate"] < 2:
            return httpx.Response(503, text="unavailable")
        return httpx.Response(
            200,
            json={"image": {"mimeType": "image/png", "data": _PNG_B64}},
        )

    client = _make_client_with_handler(handler, max_retries=1)
    result = client.generate(b"x")

    assert result == MINIMAL_PNG_BYTES
    assert calls["generate"] == 2


def test_malformed_json_raises():
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/health":
            return httpx.Response(200, json={"status": "ok"})
        return httpx.Response(200, json={"unexpected": "shape"})

    client = _make_client_with_handler(handler)
    with pytest.raises(HeadshotError, match="missing image.data"):
        client.generate(b"x")


# ---------- construtor ----------


def test_constructor_rejects_empty_api_key():
    with pytest.raises(HeadshotError, match="api_key"):
        RenderHeadshotClient(base_url="https://headshot.test", api_key="")


def test_constructor_rejects_empty_base_url():
    with pytest.raises(HeadshotError, match="base_url"):
        RenderHeadshotClient(base_url="", api_key="k")
