"""Client Anthropic (SDK oficial) com prompt caching e tool use.

Ative com `uv add anthropic` no produto que precisar — a lib NÃO está no
pyproject default do template porque LLM é opt-in por produto.

Padrões importantes:
- import lazy do `anthropic` dentro do método (não quebra import estático).
- prompt caching ativado por default no system block (`cache_control: ephemeral`).
- api_key via decouple.config quando não passada.

Métodos:
- `complete(...)` — atalho legado que devolve o texto da primeira content block.
- `messages_create(...)` — chamada estruturada que devolve `LLMResponse` (dicts
  simples), usada pelo loop de tool_use.
"""

from decouple import config

from .base import LLMError, LLMResponse

DEFAULT_MODEL = "claude-haiku-4-5-20251001"


def build_messages_kwargs(
    *,
    model: str,
    system: str,
    messages: list[dict],
    tools: list[dict] | None,
    max_tokens: int,
    cache_system: bool,
) -> dict:
    """Constrói os kwargs de `messages.create` — função pura e testável.

    Quando `cache_system=True`, envolve o system prompt num bloco com
    `cache_control: {"type": "ephemeral"}` pra ativar prompt caching no provider.
    `tools` só entra no kwargs quando passado (não-None).
    """
    kwargs: dict = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": messages,
    }
    if cache_system:
        kwargs["system"] = [
            {
                "type": "text",
                "text": system,
                "cache_control": {"type": "ephemeral"},
            }
        ]
    else:
        kwargs["system"] = system

    if tools is not None:
        kwargs["tools"] = tools

    return kwargs


def _block_to_dict(block) -> dict:
    """Converte um content block do SDK em dict simples.

    Prefere `block.model_dump()` (pydantic do SDK) e cai pra construção manual
    quando indisponível.
    """
    model_dump = getattr(block, "model_dump", None)
    if callable(model_dump):
        return model_dump()

    block_type = getattr(block, "type", None)
    if block_type == "text":
        return {"type": "text", "text": getattr(block, "text", "")}
    if block_type == "tool_use":
        return {
            "type": "tool_use",
            "id": getattr(block, "id", None),
            "name": getattr(block, "name", None),
            "input": getattr(block, "input", None),
        }
    # Tipo desconhecido — devolve o que der pra inspecionar sem quebrar.
    return {"type": block_type}


def _usage_to_dict(usage) -> dict:
    """Extrai os campos de tokens do usage do SDK (cache fields podem faltar)."""
    return {
        "input_tokens": getattr(usage, "input_tokens", 0) or 0,
        "output_tokens": getattr(usage, "output_tokens", 0) or 0,
        "cache_read_input_tokens": getattr(usage, "cache_read_input_tokens", 0) or 0,
        "cache_creation_input_tokens": getattr(usage, "cache_creation_input_tokens", 0)
        or 0,
    }


class AnthropicClient:
    def __init__(
        self,
        *,
        api_key: str | None = None,
        model: str = DEFAULT_MODEL,
    ):
        self._api_key = api_key or config("ANTHROPIC_API_KEY", default=None)
        self._model = model
        self._client = None  # lazy init na primeira chamada

    def _get_client(self):
        if self._client is None:
            # Import lazy — anthropic NÃO está no pyproject default.
            # Ative com `uv add anthropic` no produto que consumir esse client.
            from anthropic import Anthropic

            if not self._api_key:
                raise LLMError(
                    "ANTHROPIC_API_KEY não configurada (env ou api_key=...)."
                )
            self._client = Anthropic(api_key=self._api_key)
        return self._client

    def complete(
        self,
        *,
        system: str,
        messages: list[dict],
        cache_system: bool = True,
        max_tokens: int = 4096,
    ) -> str:
        """Chama messages.create e devolve o texto da primeira content block.

        Quando `cache_system=True`, envolve o system prompt num bloco com
        `cache_control: {"type": "ephemeral"}` pra ativar prompt caching no
        provider — dramaticamente reduz custo/latência em chamadas repetidas
        com o mesmo system.
        """
        client = self._get_client()
        kwargs = build_messages_kwargs(
            model=self._model,
            system=system,
            messages=messages,
            tools=None,
            max_tokens=max_tokens,
            cache_system=cache_system,
        )
        try:
            response = client.messages.create(**kwargs)
        except Exception as exc:  # noqa: BLE001 — re-raise como erro do módulo
            raise LLMError(f"Anthropic messages.create falhou: {exc}") from exc
        return response.content[0].text

    def messages_create(
        self,
        *,
        system: str,
        messages: list[dict],
        tools: list[dict] | None = None,
        max_tokens: int = 4096,
        cache_system: bool = True,
    ) -> LLMResponse:
        """Uma chamada a messages.create devolvendo `LLMResponse` estruturado.

        Converte os content blocks e o usage do SDK em dicts simples. Em erro do
        SDK, re-raise como `LLMError` (sem swallowing).
        """
        client = self._get_client()
        kwargs = build_messages_kwargs(
            model=self._model,
            system=system,
            messages=messages,
            tools=tools,
            max_tokens=max_tokens,
            cache_system=cache_system,
        )
        try:
            response = client.messages.create(**kwargs)
        except Exception as exc:  # noqa: BLE001 — re-raise como erro do módulo
            raise LLMError(f"Anthropic messages.create falhou: {exc}") from exc

        return LLMResponse(
            stop_reason=getattr(response, "stop_reason", "") or "",
            content=[_block_to_dict(block) for block in response.content],
            usage=_usage_to_dict(getattr(response, "usage", None)),
            model=getattr(response, "model", self._model),
        )
