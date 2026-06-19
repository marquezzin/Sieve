"""Cliente HTTP para a API de headshot hospedada no Render.

A API recebe uma foto base (multipart/form-data, campo `photo`) e devolve um
PNG profissional gerado, embrulhado em JSON base64. API REST simples — sem SDK,
só httpx puro.

Endpoints:
- `GET /health` → `{"status": "ok"}` (sem auth) — usado pra acordar o servidor.
- `POST /generate-headshot` → `{"image": {"mimeType": ..., "data": "<base64>"}}`
  Header obrigatório `x-api-key`. Erros: 400 / 401 / 502.

Env vars esperadas (lidas via decouple no factory, não aqui):
- `HEADSHOT_API_URL` — base URL (default produção no factory)
- `HEADSHOT_API_KEY` — chave da API (header `x-api-key`)

## Divergência deliberada da regra "sem time.sleep em retry"

O `voyage_client` proíbe `time.sleep` porque roda dentro do request web. Este
cliente roda dentro de uma task Celery (worker em background), então `time.sleep`
é ACEITÁVEL e necessário aqui:

A API está no Render free tier e DORME após inatividade. A primeira chamada
após inatividade pode levar 30-50s (o request fica pendurado durante o
spin-up). Antes de POSTar, o cliente acorda o servidor via `GET /health` com
timeout longo, repetindo com pequeno backoff até obter 200. Isso garante a
experiência "fica carregando até realmente devolver". Ver `_wake`.
"""

import base64
import time
from typing import Any

import httpx
from loguru import logger

from .base import HeadshotClient, HeadshotError


class RenderHeadshotClient(HeadshotClient):
    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        timeout: float = 240.0,
        wake_timeout: float = 60.0,
        wake_attempts: int = 6,
        wake_backoff: float = 3.0,
        max_retries: int = 1,
    ):
        if not base_url:
            raise HeadshotError("base_url obrigatório para RenderHeadshotClient")
        if not api_key:
            raise HeadshotError("api_key obrigatório para RenderHeadshotClient")
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key
        self._timeout = timeout
        self._wake_timeout = wake_timeout
        self._wake_attempts = max(1, wake_attempts)
        self._wake_backoff = wake_backoff
        self._max_retries = max(0, max_retries)

    def generate(
        self,
        image_bytes: bytes,
        *,
        filename: str = "photo.png",
        content_type: str = "image/png",
    ) -> bytes:
        self._wake()
        response = self._post_with_retry(
            image_bytes=image_bytes,
            filename=filename,
            content_type=content_type,
        )
        return self._parse_response(response)

    def _make_client(self, *, timeout: float) -> httpx.Client:
        """Hook de teste: subclasses injetam um MockTransport aqui."""
        return httpx.Client(timeout=timeout)

    def _wake(self) -> None:
        """Acorda o servidor (Render free tier dorme após inatividade).

        Faz `GET /health` com timeout longo, repetindo com backoff até 200.
        Cada GET pode ficar pendurado durante o spin-up e retornar 200 ao
        acordar. Se esgotar as tentativas SEM 200, NÃO falha fatalmente — loga
        warning e segue pro POST mesmo assim (o POST tem seu próprio timeout
        longo e também pode acordar o servidor).
        """
        url = f"{self._base_url}/health"
        for attempt in range(1, self._wake_attempts + 1):
            logger.info(
                "headshot: aguardando wake-up do servidor... (tentativa {}/{})",
                attempt,
                self._wake_attempts,
            )
            try:
                with self._make_client(timeout=self._wake_timeout) as client:
                    response = client.get(url)
                if response.status_code == 200:
                    logger.info("headshot: servidor acordado.")
                    return
                logger.warning(
                    "headshot: /health respondeu {} (esperava 200), retry.",
                    response.status_code,
                )
            except httpx.HTTPError as exc:
                logger.warning("headshot: /health falhou ({}), retry.", exc)

            if attempt < self._wake_attempts and self._wake_backoff > 0:
                time.sleep(self._wake_backoff)

        logger.warning(
            "headshot: wake-up esgotou {} tentativas sem 200; "
            "seguindo pro POST mesmo assim.",
            self._wake_attempts,
        )

    def _post_with_retry(
        self,
        *,
        image_bytes: bytes,
        filename: str,
        content_type: str,
    ) -> httpx.Response:
        """POST com retry em 5xx e erro de rede. 4xx NÃO retenta.

        Roda no worker Celery, então `time.sleep` entre tentativas é aceitável.
        """
        url = f"{self._base_url}/generate-headshot"
        headers = {"x-api-key": self._api_key}
        attempts = self._max_retries + 1
        last_5xx: httpx.Response | None = None
        last_network_exc: httpx.HTTPError | None = None

        for attempt in range(1, attempts + 1):
            try:
                with self._make_client(timeout=self._timeout) as client:
                    response = client.post(
                        url,
                        headers=headers,
                        files={"photo": (filename, image_bytes, content_type)},
                    )
            except httpx.HTTPError as exc:
                last_network_exc = exc
                logger.warning(
                    "headshot: POST falhou (rede) tentativa {}/{}: {}",
                    attempt,
                    attempts,
                    exc,
                )
                if attempt < attempts:
                    if self._wake_backoff > 0:
                        time.sleep(self._wake_backoff)
                    continue
                raise HeadshotError(
                    f"headshot request failed (network): {exc}"
                ) from exc

            if response.status_code < 500:
                return response

            last_5xx = response
            logger.warning(
                "headshot: POST respondeu {} tentativa {}/{}.",
                response.status_code,
                attempt,
                attempts,
            )
            if attempt < attempts and self._wake_backoff > 0:
                time.sleep(self._wake_backoff)

        # Esgotou tentativas em 5xx — devolve a última pro _parse tratar.
        if last_5xx is not None:
            return last_5xx
        # Defensivo: só chega aqui se attempts<=0, que o __init__ previne.
        raise HeadshotError(
            f"headshot request failed (network): {last_network_exc}"
        )

    def _parse_response(self, response: httpx.Response) -> bytes:
        status = response.status_code

        if status >= 400:
            body_preview = response.text[:500]
            raise HeadshotError(self._friendly_error(status, body_preview))

        try:
            payload: dict[str, Any] = response.json()
        except ValueError as exc:
            raise HeadshotError(
                f"headshot response is not valid JSON: {response.text[:200]}"
            ) from exc

        try:
            data_b64 = payload["image"]["data"]
        except (KeyError, TypeError) as exc:
            raise HeadshotError(
                f"headshot response missing image.data: {payload}"
            ) from exc

        if not isinstance(data_b64, str) or not data_b64:
            raise HeadshotError(
                f"headshot response image.data is empty or not a string: {payload}"
            )

        try:
            decoded = base64.b64decode(data_b64, validate=True)
        except (ValueError, base64.binascii.Error) as exc:
            raise HeadshotError(
                f"headshot response image.data is not valid base64: {exc}"
            ) from exc

        if not decoded:
            raise HeadshotError("headshot response decoded to empty bytes")

        return decoded

    @staticmethod
    def _friendly_error(status: int, body_preview: str) -> str:
        if status == 401:
            return f"headshot API 401: x-api-key ausente ou inválida. {body_preview}"
        if status == 400:
            return (
                "headshot API 400: foto ausente, não é imagem ou excede 10MB. "
                f"{body_preview}"
            )
        if status == 502:
            return f"headshot API 502: falha ao gerar o headshot. {body_preview}"
        return f"headshot API error {status}: {body_preview}"
