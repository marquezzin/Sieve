"""Tipos e erro base da categoria llm.

Define o contrato estruturado consumido pelos clientes LLM (Anthropic, etc.)
e pelo loop de tool_use. Nada aqui importa o SDK `anthropic` — os tipos são
dicts simples, agnósticos de provider, pra que o loop e os testes não dependam
da lib opt-in.
"""

from dataclasses import dataclass


class LLMError(Exception):
    """Erro genérico da categoria llm. Implementações re-raise como esta."""


@dataclass(frozen=True)
class LLMResponse:
    """Resposta estruturada de uma chamada a messages.create.

    `content` carrega os content blocks crus da Anthropic convertidos em dicts
    simples (text / tool_use). `usage` agrega os campos de tokens (cache fields
    podem vir 0 quando não há prompt caching ativo).
    """

    stop_reason: str  # "end_turn" | "tool_use" | "max_tokens" | ...
    content: list[dict]  # blocos de content crus (text / tool_use) como dicts
    usage: dict  # input_tokens, output_tokens, cache_read_*, cache_creation_*
    model: str


@dataclass(frozen=True)
class ToolUseLoopResult:
    """Resultado do loop de tool_use (ver tool_use.run_tool_use_loop)."""

    final_text: str  # texto concatenado dos blocos text do ÚLTIMO turn assistant
    assistant_blocks: list[dict]  # blocos de content do último turn assistant
    messages: list[dict]  # messages completo (assistant turns + tool_result)
    usage: dict  # usage ACUMULADO somando todas as chamadas do loop
    rounds: int  # nº de rounds de tool_use executados
