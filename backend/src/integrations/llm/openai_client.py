"""Client OpenAI (SDK oficial) como ADAPTER pro formato canônico Anthropic.

Ative com `uv add openai` no produto que precisar — a lib NÃO está no pyproject
default do template porque LLM é opt-in por produto.

O resto do sistema (loop de tool_use, schemas de tools, storage) fala SEMPRE o
formato canônico estilo Anthropic (blocos `text` / `tool_use` / `tool_result`).
Este client traduz canônico↔OpenAI INTERNAMENTE e devolve `LLMResponse`
canônico — assim nada fora daqui muda ao trocar de provider.

Padrões importantes:
- import lazy do `openai` dentro do método (não quebra import estático sem a lib).
- usa a Chat Completions API (`client.chat.completions.create`).
- api_key via `decouple.config("OPENAI_API_KEY")` quando não passada.
- prompt caching da OpenAI é automático → `cache_system` é no-op aqui.
- em erro do SDK, re-raise como `LLMError` (sem swallowing).

As funções de tradução (`to_openai_messages`, `to_openai_tools`,
`from_openai_response`) são puras e NÃO importam o SDK — testáveis isoladamente.
"""

import json

from decouple import config

from .base import LLMError, LLMResponse

DEFAULT_MODEL = "gpt-4o-mini"


def to_openai_messages(system: str, messages: list[dict]) -> list[dict]:
    """Traduz (system, messages canônicas) → lista de messages da OpenAI.

    - `system` (str) vira `{"role":"system","content":system}` no início.
    - user/assistant com content string passam direto.
    - user com blocos `tool_result` → UM `{"role":"tool",...}` por bloco.
    - user com blocos `text` → junta num único `{"role":"user","content":...}`.
    - assistant com blocos: `text` vira `content` (str, pode ser ""), `tool_use`
      vira `tool_calls` com `arguments` serializado em JSON.

    Função pura — não importa o SDK `openai`.
    """
    out: list[dict] = []
    if system:
        out.append({"role": "system", "content": system})

    for message in messages:
        role = message.get("role")
        content = message.get("content")

        # content string passa direto (user ou assistant simples).
        if isinstance(content, str):
            out.append({"role": role, "content": content})
            continue

        blocks = content or []

        if role == "user":
            tool_results = [b for b in blocks if b.get("type") == "tool_result"]
            if tool_results:
                # Cada tool_result vira uma message role="tool" separada.
                for block in tool_results:
                    out.append(
                        {
                            "role": "tool",
                            "tool_call_id": block.get("tool_use_id"),
                            "content": _tool_result_content(block.get("content")),
                        }
                    )
            else:
                # Blocos de texto → junta num único user content.
                text = "".join(
                    b.get("text", "") for b in blocks if b.get("type") == "text"
                )
                out.append({"role": "user", "content": text})
            continue

        if role == "assistant":
            text = "".join(
                b.get("text", "") for b in blocks if b.get("type") == "text"
            )
            tool_calls = [
                {
                    "id": b.get("id"),
                    "type": "function",
                    "function": {
                        "name": b.get("name"),
                        "arguments": json.dumps(b.get("input") or {}),
                    },
                }
                for b in blocks
                if b.get("type") == "tool_use"
            ]
            msg: dict = {"role": "assistant", "content": text}
            if tool_calls:
                msg["tool_calls"] = tool_calls
            out.append(msg)
            continue

        # Role desconhecido — passa o que der pra não engolir silenciosamente.
        out.append({"role": role, "content": content})

    return out


def _tool_result_content(value) -> str:
    """content do tool_result no formato esperado pela OpenAI (str)."""
    if isinstance(value, str):
        return value
    try:
        return json.dumps(value)
    except (TypeError, ValueError):
        return str(value)


def to_openai_tools(tools: list[dict] | None) -> list[dict] | None:
    """Traduz tools no schema Anthropic → schema function da OpenAI.

    Anthropic: `{"name","description","input_schema"}`
    OpenAI: `{"type":"function","function":{"name","description","parameters"}}`

    Função pura — não importa o SDK `openai`.
    """
    if tools is None:
        return None
    return [
        {
            "type": "function",
            "function": {
                "name": tool.get("name"),
                "description": tool.get("description", ""),
                "parameters": tool.get("input_schema", {}),
            },
        }
        for tool in tools
    ]


_FINISH_REASON_MAP = {
    "tool_calls": "tool_use",
    "stop": "end_turn",
    "length": "max_tokens",
}


def from_openai_response(resp) -> LLMResponse:
    """Traduz a resposta da Chat Completions API → `LLMResponse` canônico.

    - `stop_reason`: mapeia `finish_reason` ("tool_calls"→"tool_use",
      "stop"→"end_turn", "length"→"max_tokens"; outro passa direto).
    - `content`: bloco `text` (se content não-vazio) seguido de um bloco
      `tool_use` por tool_call (input desserializado de `arguments`).
    - `usage`: prompt→input, completion→output, cached_tokens→cache_read.
    - `model`: `resp.model`.

    Função pura — não importa o SDK `openai`. Aceita objeto do SDK ou um fake
    com a mesma forma (atributos / dot-access).
    """
    choice = resp.choices[0]
    message = choice.message
    finish_reason = getattr(choice, "finish_reason", "") or ""

    stop_reason = _FINISH_REASON_MAP.get(finish_reason, finish_reason)

    content: list[dict] = []
    text = getattr(message, "content", None)
    if text:
        content.append({"type": "text", "text": text})

    for tc in getattr(message, "tool_calls", None) or []:
        arguments = getattr(tc.function, "arguments", None) or "{}"
        try:
            tool_input = json.loads(arguments)
        except (TypeError, ValueError):
            tool_input = {}
        content.append(
            {
                "type": "tool_use",
                "id": getattr(tc, "id", None),
                "name": getattr(tc.function, "name", None),
                "input": tool_input,
            }
        )

    return LLMResponse(
        stop_reason=stop_reason,
        content=content,
        usage=_usage_to_dict(getattr(resp, "usage", None)),
        model=getattr(resp, "model", ""),
    )


def _usage_to_dict(usage) -> dict:
    """Extrai os campos de tokens do usage da OpenAI no shape canônico.

    `cache_creation_input_tokens` é sempre 0 (OpenAI não distingue criação de
    cache). `cache_read_input_tokens` vem de `prompt_tokens_details.cached_tokens`.
    """
    if usage is None:
        return {
            "input_tokens": 0,
            "output_tokens": 0,
            "cache_read_input_tokens": 0,
            "cache_creation_input_tokens": 0,
        }
    details = getattr(usage, "prompt_tokens_details", None)
    cached = getattr(details, "cached_tokens", 0) or 0 if details is not None else 0
    return {
        "input_tokens": getattr(usage, "prompt_tokens", 0) or 0,
        "output_tokens": getattr(usage, "completion_tokens", 0) or 0,
        "cache_read_input_tokens": cached,
        "cache_creation_input_tokens": 0,
    }


class OpenAIClient:
    """Adapter OpenAI ↔ formato canônico Anthropic, via Chat Completions API.

    Aceita os mesmos inputs canônicos do `AnthropicClient.messages_create` e
    devolve `LLMResponse` canônico. O SDK `openai` pode ser injetado via
    `_sdk_client=` (útil em testes sem a lib instalada).
    """

    def __init__(
        self,
        *,
        api_key: str | None = None,
        model: str = DEFAULT_MODEL,
        base_url: str | None = None,
        _sdk_client=None,
    ):
        self._api_key = api_key or config("OPENAI_API_KEY", default=None)
        self._model = model
        self._base_url = base_url
        self._client = _sdk_client  # lazy init se None

    def _get_client(self):
        if self._client is None:
            # Import lazy — openai NÃO está no pyproject default.
            # Ative com `uv add openai` no produto que consumir esse client.
            from openai import OpenAI

            if not self._api_key:
                raise LLMError("OPENAI_API_KEY não configurada (env ou api_key=...).")
            kwargs: dict = {"api_key": self._api_key}
            if self._base_url:
                kwargs["base_url"] = self._base_url
            self._client = OpenAI(**kwargs)
        return self._client

    def messages_create(
        self,
        *,
        system: str,
        messages: list[dict],
        tools: list[dict] | None = None,
        max_tokens: int = 4096,
        cache_system: bool = True,  # noqa: ARG002 — no-op (cache automático)
    ) -> LLMResponse:
        """Uma chamada à Chat Completions devolvendo `LLMResponse` canônico.

        `cache_system` é ignorado (cache da OpenAI é automático). Em erro do SDK,
        re-raise como `LLMError` (sem swallowing).
        """
        client = self._get_client()
        kwargs: dict = {
            "model": self._model,
            "max_tokens": max_tokens,
            "messages": to_openai_messages(system, messages),
        }
        openai_tools = to_openai_tools(tools)
        if openai_tools is not None:
            kwargs["tools"] = openai_tools

        try:
            response = client.chat.completions.create(**kwargs)
        except Exception as exc:  # noqa: BLE001 — re-raise como erro do módulo
            raise LLMError(f"OpenAI chat.completions.create falhou: {exc}") from exc

        return from_openai_response(response)
