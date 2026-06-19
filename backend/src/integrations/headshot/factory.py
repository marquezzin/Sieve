"""Factory de HeadshotClient.

Lê config via `decouple.config`:
- `HEADSHOT_PROVIDER` (default `"render"`) — qual implementação usar
- `HEADSHOT_API_URL` (default produção no Render) — base URL da API
- `HEADSHOT_API_KEY` — credencial (header `x-api-key`)
- `HEADSHOT_TIMEOUT` (default 240s, cast=float) — timeout do POST /generate
- `HEADSHOT_WAKE_TIMEOUT` (default 60s, cast=float) — timeout por GET /health
- `HEADSHOT_MAX_RETRIES` (default 1, cast=int) — retries em 5xx/rede no POST

Providers: `"render"` (default, HTTP real) e `"fake"` (determinístico, offline —
usado em teste e em ambiente sem credencial). Pra adicionar provider novo:
1. Cria `<provider>_client.py` herdando de `HeadshotClient`
2. Adiciona branch no dispatch abaixo
3. Documenta defaults específicos no header do client
"""

from decouple import config

from .base import HeadshotClient, HeadshotError
from .fake_client import FakeHeadshotClient
from .render_client import RenderHeadshotClient

_DEFAULT_API_URL = "https://curriculo-headshot-api.onrender.com"


def get_headshot_client(
    *,
    provider: str | None = None,
    api_key: str | None = None,
    base_url: str | None = None,
    timeout: float | None = None,
    wake_timeout: float | None = None,
    max_retries: int | None = None,
) -> HeadshotClient:
    """Retorna a implementação configurada de HeadshotClient.

    Argumentos explícitos têm precedência sobre env vars — útil pra testes e
    pra casos onde o caller já conhece o provider que quer.
    """
    provider = (provider or config("HEADSHOT_PROVIDER", default="render")).lower()

    if provider == "fake":
        return FakeHeadshotClient()

    resolved_api_key = api_key or config("HEADSHOT_API_KEY", default="")
    resolved_base_url = base_url or config("HEADSHOT_API_URL", default=_DEFAULT_API_URL)
    resolved_timeout = (
        timeout
        if timeout is not None
        else config("HEADSHOT_TIMEOUT", default=240.0, cast=float)
    )
    resolved_wake_timeout = (
        wake_timeout
        if wake_timeout is not None
        else config("HEADSHOT_WAKE_TIMEOUT", default=60.0, cast=float)
    )
    resolved_max_retries = (
        max_retries
        if max_retries is not None
        else config("HEADSHOT_MAX_RETRIES", default=1, cast=int)
    )

    if provider == "render":
        return RenderHeadshotClient(
            base_url=resolved_base_url,
            api_key=resolved_api_key,
            timeout=resolved_timeout,
            wake_timeout=resolved_wake_timeout,
            max_retries=resolved_max_retries,
        )

    raise HeadshotError(
        f"Provider desconhecido: {provider!r}. Suportados: ['fake', 'render']"
    )
