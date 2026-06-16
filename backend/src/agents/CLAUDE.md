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

## Fase 2 — pipeline de currículo (writer → reviewer → judge)

Três agentes **single-shot** (não conversacionais) que rodam em sequência via
Celery chain. Cada um monta system (persona + KB full-load), faz UMA submissão
estruturada e persiste no app `resumes`.

- **`use_cases/structured.py`** — `run_structured_agent(client, system, user_content, tool)`.
  Reusa `run_tool_use_loop` com UMA tool de submissão; captura o `input` que o
  modelo preenche e devolve `StructuredResult(data, usage, rounds)`. Se o modelo
  não chamar a tool → `ApplicationError` (melhor falhar que persistir lixo).
- **`prompts/resume_tools.py`** — schemas das tools: `build_resume_tool()`
  (`submit_resume`, shape do `structured_data` — writer e reviewer) e
  `SUBMIT_SCORE_TOOL` (`submit_score`, 6 critérios + feedback). `SCORE_CRITERIA`
  são as 6 keys canônicas.
- **`use_cases/run_writer.py`** — `RunWriter().execute(resume=...)`:
  `session.collected_data` → `structured_data` → `ResumeVersion v1` + HTML.
  Full-load `load_for_agent("writer")` no system; few-shot via `retrieve_chunks`
  (best-effort, filtrado por `target_role` quando houver — exceção de embeddings
  é engolida, não derruba o pipeline). Marca `resume.status=writer_done`.
- **`use_cases/run_reviewer.py`** — `RunReviewer().execute(version=...)`:
  `vN` → `vN+1` revisada (verbos, métricas inferíveis, sem clichês), preservando
  fatos e os `id`s das entradas. `status=reviewer_done`.
- **`use_cases/run_judge.py`** — `RunJudge().execute(version=...)`: nota 0–10 por
  critério + feedback → `ResumeScore`. **O `overall` é computado aqui** (não vem
  do LLM) por `compute_overall()` com `RUBRIC_WEIGHTS` (pesos da rubrica, somam
  1.0). `status=ready`.
- **Prompts** (`writer_system.md` / `reviewer_system.md` / `judge_system.md`) —
  estáticos (cache-safe); `{{KNOWLEDGE_BASE}}` é a KB e (só no writer)
  `{{CURRENT_DATE}}` a data. Anti-fabricação reforçada em todos.
- **Modelo** — mesmo provider/modelo do entrevistador (OpenAI por default).
  Override por agente via `settings.LLM_MODEL_WRITER/REVIEWER/JUDGE` (vazio =
  herda `OPENAI_MODEL`). `get_llm_client(model=...)`.
- **Falha** — em `LLMError`/`ApplicationError` cada use case marca
  `resume.status=failed` + `resume.error`, grava `AgentRun` de erro e **re-raise**
  (o chain do Celery não dispara os agentes seguintes).
- **`tasks.py`** (owner: `celery-orchestration`) — `generate_resume_pipeline(resume_id)`
  encadeia `run_writer_task.s | run_reviewer_task.s | run_judge_task.s`. Disparado
  por `chat/api/views.py:finalize` via `.delay()` (que cria o `Resume` placeholder
  antes). Tasks THIN: buscam objeto, chamam 1 use case, retornam o id (str).

## Patterns / Stop list

- LLM **sempre** via `integrations.llm` (factory/loop) — nunca SDK cru no use case.
- Loop de tool_use tem hard-cap (`max_rounds`) — anti-loop-infinito.
- Agentes do pipeline: orquestração entre eles é **Celery chain**, não framework
  (ADR 0002). Próximos agentes (ATS) entram como novos use cases no mesmo padrão.
