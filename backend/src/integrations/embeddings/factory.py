"""Factory de EmbeddingsClient.

Lê config via `decouple.config`:
- `EMBEDDINGS_PROVIDER` (default `"voyage"`) — qual implementação usar
- `EMBEDDINGS_API_KEY` — credencial do provider escolhido
- `EMBEDDINGS_MODEL` — nome do modelo (default depende do provider)
- `EMBEDDINGS_TIMEOUT` — timeout em segundos (default 30s pra batches grandes)
- `EMBEDDINGS_MAX_RETRIES` — tentativas em 5xx/conexão (default 3)

Providers: `"voyage"` (default, HTTP real) e `"fake"` (determinístico, offline —
usado em teste e em ambiente sem credencial, ex. o signal de embedding do
`ResumeVersion`). Pra adicionar `"openai"`:
1. Cria `openai_client.py` herdando de `EmbeddingsClient`
2. Adiciona branch no dispatch abaixo
3. Documenta defaults específicos de modelo no header
"""

from decouple import config

from .base import EmbeddingsClient, EmbeddingsError
from .fake_client import DeterministicEmbeddingsClient
from .voyage_client import VoyageEmbeddingsClient

_DEFAULT_MODELS = {
    "voyage": "voyage-3",
    "fake": "deterministic",
}


def get_embeddings_client(
    *,
    provider: str | None = None,
    api_key: str | None = None,
    model: str | None = None,
    timeout: float | None = None,
    max_retries: int | None = None,
) -> EmbeddingsClient:
    """Retorna a implementação configurada de EmbeddingsClient.

    Argumentos explícitos têm precedência sobre env vars — útil pra testes
    e pra casos onde o caller já conhece o provider que quer.
    """
    provider = (provider or config("EMBEDDINGS_PROVIDER", default="voyage")).lower()

    resolved_api_key = api_key or config("EMBEDDINGS_API_KEY", default="")
    resolved_model = model or config(
        "EMBEDDINGS_MODEL",
        default=_DEFAULT_MODELS.get(provider, ""),
    )
    resolved_timeout = (
        timeout
        if timeout is not None
        else config("EMBEDDINGS_TIMEOUT", default=30.0, cast=float)
    )
    resolved_retries = (
        max_retries
        if max_retries is not None
        else config("EMBEDDINGS_MAX_RETRIES", default=3, cast=int)
    )

    if provider == "fake":
        return DeterministicEmbeddingsClient()

    if provider == "voyage":
        return VoyageEmbeddingsClient(
            api_key=resolved_api_key,
            model=resolved_model or "voyage-3",
            timeout=resolved_timeout,
            max_retries=resolved_retries,
        )

    raise EmbeddingsError(
        f"Provider desconhecido: {provider!r}. Suportados: {sorted(_DEFAULT_MODELS)}"
    )
