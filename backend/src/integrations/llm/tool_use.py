"""Loop de tool_use (function calling) em Python puro.

ADR 0002 — orquestração de agentes sem framework (LangGraph/CrewAI). O loop é
agnóstico de provider: só depende de um `client` com `.messages_create(...)` que
devolve `LLMResponse`. NÃO importa o SDK `anthropic` — isso permite testar com um
fake client sem a lib opt-in instalada.
"""

import json
from collections.abc import Callable
from typing import Any

from .base import LLMError, LLMResponse, ToolUseLoopResult

_USAGE_FIELDS = (
    "input_tokens",
    "output_tokens",
    "cache_read_input_tokens",
    "cache_creation_input_tokens",
)


def _accumulate_usage(acc: dict, usage: dict) -> None:
    """Soma os campos de tokens de `usage` em `acc` (in-place)."""
    for field in _USAGE_FIELDS:
        acc[field] = acc.get(field, 0) + (usage.get(field, 0) or 0)


def _text_from_blocks(blocks: list[dict]) -> str:
    """Concatena os blocos de tipo text de um turn do assistant."""
    return "".join(
        block.get("text", "") for block in blocks if block.get("type") == "text"
    )


def _serialize_tool_result(value: Any) -> str:
    """Converte o retorno do tool_executor no content (str) do tool_result.

    str passa direto; o resto vira JSON. Se não for serializável, cai no str().
    """
    if isinstance(value, str):
        return value
    try:
        return json.dumps(value)
    except (TypeError, ValueError):
        return str(value)


def run_tool_use_loop(
    *,
    client,
    system: str,
    messages: list[dict],
    tools: list[dict],
    tool_executor: Callable[[str, dict], Any],
    max_rounds: int = 10,
    max_tokens: int = 4096,
) -> ToolUseLoopResult:
    """Executa o loop de tool_use até o assistant parar de pedir ferramentas.

    - `client`: objeto com `.messages_create(system, messages, tools, max_tokens)
      -> LLMResponse`.
    - `tool_executor`: Callable[[tool_name, tool_input], Any] — retorna valor
      JSON-serializável (vira o content do tool_result). Se levantar exceção, o
      loop captura e manda tool_result com `is_error=True` e str(exc).
    - Loop: chama messages_create; appenda o turn do assistant; se
      stop_reason == 'tool_use', executa cada bloco tool_use, monta os
      tool_result, appenda como message role=user, acumula usage, incrementa
      rounds e repete. Caso contrário, encerra.
    - Hard cap `max_rounds`: se exceder, `raise LLMError` (anti-loop-infinito).

    Não muta a lista `messages` recebida — opera sobre uma cópia.
    """
    convo: list[dict] = list(messages)
    accumulated_usage: dict = {field: 0 for field in _USAGE_FIELDS}
    rounds = 0
    last_assistant_blocks: list[dict] = []

    while True:
        if rounds >= max_rounds:
            raise LLMError(
                f"tool_use loop excedeu max_rounds={max_rounds} sem encerrar "
                "(stop_reason continua 'tool_use')."
            )

        response: LLMResponse = client.messages_create(
            system=system,
            messages=convo,
            tools=tools,
            max_tokens=max_tokens,
        )
        _accumulate_usage(accumulated_usage, response.usage)

        assistant_blocks = response.content
        last_assistant_blocks = assistant_blocks
        convo.append({"role": "assistant", "content": assistant_blocks})

        if response.stop_reason != "tool_use":
            break

        tool_use_blocks = [
            block for block in assistant_blocks if block.get("type") == "tool_use"
        ]
        tool_result_blocks: list[dict] = []
        for block in tool_use_blocks:
            tool_use_id = block.get("id")
            tool_name = block.get("name")
            tool_input = block.get("input") or {}
            result_block: dict = {
                "type": "tool_result",
                "tool_use_id": tool_use_id,
            }
            try:
                output = tool_executor(tool_name, tool_input)
            except Exception as exc:  # noqa: BLE001 — vira tool_result is_error
                result_block["content"] = str(exc)
                result_block["is_error"] = True
            else:
                result_block["content"] = _serialize_tool_result(output)
            tool_result_blocks.append(result_block)

        convo.append({"role": "user", "content": tool_result_blocks})
        rounds += 1

    return ToolUseLoopResult(
        final_text=_text_from_blocks(last_assistant_blocks),
        assistant_blocks=last_assistant_blocks,
        messages=convo,
        usage=accumulated_usage,
        rounds=rounds,
    )
