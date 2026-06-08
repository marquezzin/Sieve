# agents — agentes de IA (use cases dedicados)

Casa dos agentes do Sieve. ADR 0002: cada agente é um **use case dedicado** que
monta o system prompt (persona + knowledge base), chama o LLM com tool use e
persiste resultado — **sem framework de orquestração**.

> **Em conflito com `backend/CLAUDE.md`, esse arquivo perde.**

## Fase 1 — só o entrevistador

- **`use_cases/run_interviewer_turn.py`** — `RunInterviewerTurn`. Executa um turn:
  persiste a msg do usuário → monta system (`prompts/interviewer_system.md` +
  `KnowledgeLoader.load_for_agent("interviewer")`) → reconstrói histórico → roda
  `integrations.llm.tool_use.run_tool_use_loop` com as tools de `chat.prompts.tools`
  → persiste resposta + muta a sessão (collected_data/current_phase) → grava `AgentRun`.
- **`prompts/interviewer_system.md`** — template; `{{KNOWLEDGE_BASE}}` é substituído
  pela KB em runtime. Estático (cache-safe) — estado dinâmico vem da conversa.
- **`models.py: AgentRun`** — auditoria de cada chamada (agent_name, session,
  input/output, usage, status/error). Read-only no admin.

## Dependências injetadas (testabilidade)

`RunInterviewerTurn(llm_client=..., knowledge_loader=...)` — testes injetam
`FakeLLMClient` (com `messages_create`) e um `KnowledgeLoader` fake. Sem mock de
framework.

## Patterns / Stop list

- LLM **sempre** via `integrations.llm` (factory/loop) — nunca SDK cru no use case.
- Loop de tool_use tem hard-cap (`max_rounds=10`) — anti-loop-infinito.
- Próximos agentes (redator, revisor, juiz, ATS) entram aqui como novos use cases;
  orquestração entre eles vira **Celery chain** (Fase 2+), não framework.
