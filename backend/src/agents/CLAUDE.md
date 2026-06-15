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
  pela KB e `{{CURRENT_DATE}}` pela data de hoje (pra resolver datas relativas tipo
  "ano que vem" e evitar `end` no passado com `status: in_progress`). Fora isso é
  estático (cache-safe) — estado dinâmico vem da conversa.
- **Higiene do `collected_data`** — as tools `record_education`/`record_experience`/
  `record_project` fazem **upsert por chave natural** (`_upsert` em
  `run_interviewer_turn.py`): institution+course / company+role / name. Isso impede
  duplicatas quando o modelo chama a mesma tool duas vezes e permite refinar uma
  entrada sem duplicá-la. Anti-fabricação de datas é reforçada no system prompt + nos
  schemas das tools (`chat/prompts/tools.py`): só registrar `start`/`end` informados.
- **Sync com o perfil** — a tool `record_personal_info` espelha os campos
  sobrepostos (location/phone/linkedin_url/github_url) no `CandidateProfile` via
  `accounts.services.sync_profile_from_personal_info`. O resto (experiências,
  educação, projetos, skills) fica só no `collected_data` até a Fase 2. A escrita
  do perfil é responsabilidade do app `accounts` — nunca tocar no model direto.
- **`models.py: AgentRun`** — auditoria de cada chamada (agent_name, session,
  input/output, usage, status/error). Read-only no admin.

## Atomicidade do turno

`execute()` roda o turno inteiro dentro de `transaction.atomic()`: a mensagem do
usuário, a resposta do assistant e as mutações da sessão são gravadas como uma
unidade. Se o turno falhar no meio (LLMError, disconnect), o rollback desfaz tudo
— **não sobra mensagem de usuário "pendurada"** (que corromperia o histórico com
dois `user` seguidos). O `AgentRun` de erro é gravado **fora** da transação, pra
preservar a auditoria mesmo no rollback.

## Dependências injetadas (testabilidade)

`RunInterviewerTurn(llm_client=..., knowledge_loader=...)` — testes injetam
`FakeLLMClient` (com `messages_create`) e um `KnowledgeLoader` fake. Sem mock de
framework.

## Patterns / Stop list

- LLM **sempre** via `integrations.llm` (factory/loop) — nunca SDK cru no use case.
- Loop de tool_use tem hard-cap (`max_rounds=10`) — anti-loop-infinito.
- Próximos agentes (redator, revisor, juiz, ATS) entram aqui como novos use cases;
  orquestração entre eles vira **Celery chain** (Fase 2+), não framework.
