"""Factory de client LLM.

Lê config via `decouple.config`:
- `LLM_PROVIDER` (default `"openai"`) — qual implementação usar
- `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` — credencial e modelo do Anthropic
  (default model `claude-haiku-4-5-20251001`, o entrevistador da Fase 1)
- `OPENAI_API_KEY` / `OPENAI_MODEL` — credencial e modelo do OpenAI
  (default model `gpt-4o-mini`)

Todos os clients expõem a mesma interface (`messages_create` devolvendo
`LLMResponse` canônico estilo Anthropic), então o caller é agnóstico de provider.

Pra adicionar um provider novo:
1. Cria `<provider>_client.py` expondo `messages_create`
2. Adiciona branch no dispatch abaixo
3. Documenta defaults específicos de modelo no header
"""

from decouple import config

from .anthropic_client import DEFAULT_MODEL as ANTHROPIC_DEFAULT_MODEL
from .anthropic_client import AnthropicClient
from .base import LLMError
from .openai_client import DEFAULT_MODEL as OPENAI_DEFAULT_MODEL
from .openai_client import OpenAIClient


def get_llm_client(
    *,
    provider: str | None = None,
    api_key: str | None = None,
    model: str | None = None,
):
    """Retorna a implementação configurada de client LLM.

    Default provider `"openai"`. Argumentos explícitos têm precedência sobre env
    vars — útil pra testes e pra override pontual pelo caller. Provider
    desconhecido → `LLMError`.
    """
    provider = (provider or config("LLM_PROVIDER", default="openai")).lower()

    if provider == "anthropic":
        resolved_api_key = api_key or config("ANTHROPIC_API_KEY", default=None)
        resolved_model = model or config(
            "ANTHROPIC_MODEL", default=ANTHROPIC_DEFAULT_MODEL
        )
        return AnthropicClient(api_key=resolved_api_key, model=resolved_model)

    if provider == "openai":
        resolved_api_key = api_key or config("OPENAI_API_KEY", default=None)
        resolved_model = model or config("OPENAI_MODEL", default=OPENAI_DEFAULT_MODEL)
        return OpenAIClient(api_key=resolved_api_key, model=resolved_model)

    raise LLMError(
        f"Provider LLM desconhecido: {provider!r}. "
        "Suportados: ['anthropic', 'openai']"
    )
