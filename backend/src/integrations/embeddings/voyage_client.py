"""Cliente HTTP para Voyage AI Embeddings.

Voyage AI fornece modelos de embeddings de alta qualidade pra texto técnico
(default `voyage-3`, 1024 dimensões). API REST simples — não usamos SDK
próprio, só httpx puro.

Env vars esperadas (lidas via decouple no factory, não aqui):
- `EMBEDDINGS_API_KEY` — chave da Voyage (https://dash.voyageai.com/api-keys)
- `EMBEDDINGS_MODEL` — default `voyage-3` (alternativas: `voyage-3-lite`,
  `voyage-code-3`, `voyage-large-2`)

Endpoint: https://api.voyageai.com/v1/embeddings
Docs: https://docs.voyageai.com/reference/embeddings-api

Retry:
- Connection-level retry via `httpx.HTTPTransport(retries=N)` (cobre DNS,
  connect, read timeouts).
- 5xx HTTP retry via wrapper interno em `_post_with_retry` (loop sem
  `time.sleep` — tentativa imediata; rede já tem latência natural).
- 4xx (401, 422, etc) NÃO retentam — erro de cliente, retry só piora.
"""

from typing import Any

import httpx

from .base import EmbeddingsClient, EmbeddingsError, InputType

VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings"


class VoyageEmbeddingsClient(EmbeddingsClient):
    def __init__(
        self,
        *,
        api_key: str,
        model: str = "voyage-3",
        timeout: float = 30.0,
        max_retries: int = 3,
    ):
        if not api_key:
            raise EmbeddingsError("api_key obrigatório para VoyageEmbeddingsClient")
        self._api_key = api_key
        self._model = model
        self._timeout = timeout
        self._max_retries = max(1, max_retries)

    def embed_batch(
        self,
        texts: list[str],
        *,
        input_type: InputType = "document",
    ) -> list[list[float]]:
        if not texts:
            return []

        payload = {
            "input": texts,
            "model": self._model,
            "input_type": input_type,
        }
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        response = self._post_with_retry(payload=payload, headers=headers)
        return self._parse_response(response, expected_count=len(texts))

    def _post_with_retry(
        self,
        *,
        payload: dict[str, Any],
        headers: dict[str, str],
    ) -> httpx.Response:
        """POST com retry em 5xx. Conexão retenta via HTTPTransport."""
        transport = httpx.HTTPTransport(retries=self._max_retries)
        last_5xx: httpx.Response | None = None

        try:
            with httpx.Client(timeout=self._timeout, transport=transport) as client:
                for _ in range(self._max_retries):
                    try:
                        response = client.post(
                            VOYAGE_API_URL,
                            json=payload,
                            headers=headers,
                        )
                    except httpx.HTTPError as exc:
                        # HTTPTransport(retries=N) já esgotou retries de conexão.
                        raise EmbeddingsError(
                            f"Voyage request failed (network): {exc}"
                        ) from exc

                    if response.status_code < 500:
                        return response
                    last_5xx = response

                # Esgotou tentativas em 5xx — devolve a última pro _parse tratar.
                assert last_5xx is not None
                return last_5xx
        finally:
            transport.close()

    def _parse_response(
        self,
        response: httpx.Response,
        *,
        expected_count: int,
    ) -> list[list[float]]:
        status = response.status_code

        if status >= 400:
            body_preview = response.text[:500]
            raise EmbeddingsError(
                f"Voyage API error {status}: {body_preview}"
            )

        try:
            payload = response.json()
        except ValueError as exc:
            raise EmbeddingsError(
                f"Voyage response is not valid JSON: {response.text[:200]}"
            ) from exc

        data = payload.get("data")
        if not isinstance(data, list):
            raise EmbeddingsError(
                f"Voyage response missing 'data' list: {payload}"
            )
        if len(data) != expected_count:
            raise EmbeddingsError(
                f"Voyage returned {len(data)} embeddings, expected {expected_count}"
            )

        # Voyage devolve `index` em cada item — ordenar pra garantir ordem original.
        try:
            sorted_data = sorted(data, key=lambda item: item["index"])
            vectors = [item["embedding"] for item in sorted_data]
        except (KeyError, TypeError) as exc:
            raise EmbeddingsError(
                f"Voyage response item malformed: {exc}"
            ) from exc

        for i, vec in enumerate(vectors):
            if not isinstance(vec, list) or not vec:
                raise EmbeddingsError(
                    f"Voyage embedding at index {i} is not a non-empty list"
                )

        return vectors
