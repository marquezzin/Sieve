"""Helper para agentes single-shot que produzem saída estruturada via tool.

ADR 0002 — sem framework. Diferente do entrevistador (conversacional, multi-turn),
o redator/revisor/juiz fazem UMA chamada com UMA tool de submissão: o modelo
preenche o `input` da tool e o use case captura esse dict. Reusa o
`run_tool_use_loop` (agnóstico de provider) com um cap baixo de rounds.
"""

from dataclasses import dataclass
from typing import Any

from core.errors import ApplicationError
from integrations.llm.tool_use import run_tool_use_loop


@dataclass(frozen=True)
class StructuredResult:
    data: dict  # o `input` capturado da tool de submissão
    usage: dict
    rounds: int


def run_structured_agent(
    *,
    client: Any,
    system: str,
    user_content: str,
    tool: dict,
    max_rounds: int = 3,
) -> StructuredResult:
    """Roda o loop com uma única tool de submissão e devolve o input capturado.

    O modelo deve chamar `tool["name"]`; o executor captura o `input` e responde
    `{"ok": true}` pra encerrar. Se o modelo não chamar a tool, levanta
    `ApplicationError` (saída inválida — melhor falhar explícito que persistir lixo).
    """
    tool_name = tool["name"]
    captured: dict = {}

    def executor(name: str, tool_input: dict) -> Any:
        if name == tool_name:
            captured["data"] = tool_input
            return {"ok": True}
        return {"ok": False, "error": f"tool desconhecida: {name}"}

    result = run_tool_use_loop(
        client=client,
        system=system,
        messages=[{"role": "user", "content": user_content}],
        tools=[tool],
        tool_executor=executor,
        max_rounds=max_rounds,
    )

    if "data" not in captured:
        raise ApplicationError(
            f"Agente não chamou a tool de submissão {tool_name!r} — saída inválida."
        )

    return StructuredResult(data=captured["data"], usage=result.usage, rounds=result.rounds)
