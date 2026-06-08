# Fase 1 — Accounts + Chat conversacional + agente entrevistador (MVP draft)

**Status:** 🔲 Pendente
**Pré-requisitos:** Fase 0 ✅

## Contexto

A Fase 0 entregou o mecanismo de conhecimento. Esta fase entrega a **primeira interação real do usuário com IA**: ele loga, abre uma sessão de chat, conversa com um agente entrevistador que mantém memória, avança fases automaticamente, e usa tool calls pra registrar dados estruturados. O entrevistador ainda **não gera currículo** — só coleta. A geração vem na Fase 2.

É a fase onde validamos:
- O padrão de agente (use case dedicado + `KnowledgeLoader` + tool use nativo do SDK Anthropic).
- O loop de tool_use em Python puro (sem framework de orquestração).
- A memória conversacional via `ChatMessage` JSONField com blocos Anthropic.
- Prompt caching funcionando (medível via `cache_read_input_tokens` no `usage`).

## Outcome esperado

Ao fim da fase, o usuário consegue:

1. Logar via JWT (endpoint do template já pronto).
2. `POST /api/v1/chat/sessions/` → cria sessão e recebe a primeira mensagem do entrevistador.
3. Conversar via `POST /api/v1/chat/sessions/{id}/messages/`, com o entrevistador:
   - Mantendo histórico (próxima chamada inclui mensagens anteriores)
   - Chamando tools (`record_education`, `record_experience`, etc.) que populam `collected_data` no Postgres
   - Avançando `current_phase` via tool `mark_phase_complete()`
   - Pedindo clarificação via tool `request_clarification()` quando o usuário foi vago
4. `POST /api/v1/chat/sessions/{id}/finalize/` → marca sessão como completed, retorna `collected_data` final pronto pra ser entregue ao redator da Fase 2.
5. Acessar tudo via frontend mínimo (`/chat` page com histórico + input + indicador de fase atual).

## Escopo

### Faz parte

- App `accounts/` com `CandidateProfile` (OneToOne User + headline + location + phone + linkedin_url + github_url).
- Signal `post_save` em `User` cria `CandidateProfile` vazio automaticamente.
- App `chat/` com `InterviewSession` + `ChatMessage`.
- App `agents/` (esqueleto) com use case `RunInterviewerTurn` em `agents/use_cases/run_interviewer_turn.py` — único use case da fase.
- Modelo `AgentRun` em `agents/models.py` pra auditoria de cada chamada de LLM (agent_name, session FK, input, output, usage, status).
- Prompts em `agents/prompts/interviewer_system.md` (template Jinja-like simples) e `chat/prompts/tools.py` (schemas das tools).
- Integration `backend/src/integrations/llm/` **estendida**: helper que faz loop de tool_use até `stop_reason != "tool_use"`, injeta `cache_control: ephemeral` no system prompt, e devolve `usage` agregado incluindo `cache_read_input_tokens`.
- Knowledge base **real** em `knowledge_base/interviewing/`: `persona.md`, `questions_by_phase.md`, `follow_up_patterns.md`, `stop_signals.md`, `scope_guardrails.md` — substitui os placeholders.
  - **`scope_guardrails.md` (`priority: always`)** define o comportamento quando o candidato sai do contexto: divagação inofensiva (redirecionar), pedido fora de escopo (recusar + voltar ao fluxo), tentativa de injeção/jailbreak (recusar sem revelar system prompt), e cruzamento com anti-fabricação (`ats/do_not_fabricate.md`). O `interviewer_system.md` **deve** carregar esse doc e reforçar as regras no system prompt — não basta confiar no comportamento default do modelo.
- API REST em `/api/v1/chat/` + `/api/v1/accounts/me/`.
- Frontend domain `frontend/src/domains/chat/` (ChatPage + hooks + components mínimos) e `frontend/src/domains/profile/` mínimo (só pra ler `me`).
- Tests: factories, use case com `FakeLLMClient` injetado, tests da API com `auth_client`.

### NÃO faz parte

- Redator, revisor, juiz (Fase 2)
- Models `Resume` / `ResumeVersion` (Fase 2)
- Pipeline Celery chain (Fase 2)
- Geração de currículo final (Fase 2)
- Export PDF (Fase 2)
- Matching com vaga (Fase 3)
- Kanban (Fase 3)
- Foto profissional (Fase 4)
- Streaming SSE (deferido — eventual upgrade da Fase 4)

## Decisões a tomar (com defaults sugeridos)

| Decisão | Default | Trade-off |
|---|---|---|
| Modelo do entrevistador | Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) | Rápido + barato; Sonnet seria melhor mas custo 5x maior pra conversa multi-turn |
| Política de retry HTTP | 2 retries em 5xx; 0 em 4xx | Implementar no helper de `integrations/llm/` |
| Histórico mandado por turn | Todo o histórico da sessão | Entrevista é curta (~30 turns). Sliding window só se passar de ~50 turns |
| Criação de `CandidateProfile` | Signal `post_save` em User | Garante que sempre existe; frontend só faz GET/PATCH |
| `current_phase` enum | `intro`, `personal_info`, `education`, `experience`, `projects`, `skills`, `review`, `done` | Ajustar se necessário; defines em `chat/models.py` |
| Prompt cache | `cache_control: ephemeral` no system prompt completo | TTL 5min; medir hit rate via `cache_read_input_tokens` |
| Chamada do LLM síncrona ou async | Síncrona via DRF (Haiku responde <10s) | Async via Celery vira otimização futura se passar de 10s |

## Arquivos a criar / modificar

### Backend — apps novos

```
backend/src/accounts/
├── __init__.py
├── apps.py                     # AccountsConfig — ready() conecta signal
├── models.py                   # CandidateProfile(OneToOneField User)
├── signals.py                  # post_save User → get_or_create CandidateProfile
├── admin.py
├── migrations/0001_initial.py
├── selectors.py                # get_profile_for_user(user)
├── api/
│   ├── __init__.py
│   ├── serializers.py          # CandidateProfileSerializer
│   ├── views.py                # MeView (GET/PATCH /api/v1/accounts/me/)
│   └── urls.py
├── CLAUDE.md
├── AGENTS.md
└── tests/
    ├── __init__.py
    ├── factories.py            # CandidateProfileFactory, UserFactory
    ├── test_signals.py
    └── test_api.py

backend/src/chat/
├── __init__.py
├── apps.py
├── models.py                   # InterviewSession + ChatMessage
├── admin.py                    # read-only ou só list
├── migrations/0001_initial.py
├── selectors.py                # get_session_for_user, list_messages, build_history_for_llm
├── prompts/
│   ├── __init__.py
│   └── tools.py                # INTERVIEWER_TOOLS = [{name, description, input_schema}, ...]
├── api/
│   ├── __init__.py
│   ├── serializers.py          # SessionSerializer, MessageSerializer, StartSessionSerializer
│   ├── views.py                # SessionViewSet (start/get/finalize) + MessagesView (list/post)
│   └── urls.py
├── CLAUDE.md
├── AGENTS.md
└── tests/
    ├── __init__.py
    ├── factories.py            # InterviewSessionFactory, ChatMessageFactory
    └── test_api.py             # endpoints

backend/src/agents/
├── __init__.py
├── apps.py
├── models.py                   # AgentRun (audit log)
├── admin.py
├── migrations/0001_initial.py
├── prompts/
│   ├── __init__.py
│   └── interviewer_system.md   # template assembled com KB + fase + collected_data
├── use_cases/
│   ├── __init__.py
│   └── run_interviewer_turn.py # único use case da fase
├── CLAUDE.md
├── AGENTS.md
└── tests/
    ├── __init__.py
    ├── factories.py            # AgentRunFactory
    └── test_run_interviewer_turn.py  # FakeLLMClient injetado
```

### Backend — integration estendida

```
backend/src/integrations/llm/
├── client.py                   # adicionar helper: run_tool_use_loop(messages, system, tools, ...) → response + accumulated_usage
└── tests/test_tool_use_loop.py # com FakeAnthropicClient
```

### Backend — config

| Arquivo | Mudança |
|---|---|
| `backend/config/settings/base.py` | Registrar `accounts`, `chat`, `agents` em `LOCAL_APPS`. Adicionar `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL_INTERVIEWER` (default `claude-haiku-4-5-20251001`) via `decouple.config`. |
| `backend/config/urls.py` | `include("accounts.api.urls")` em `/api/v1/accounts/`; `include("chat.api.urls")` em `/api/v1/chat/`. |
| `backend/.env.example` | Documentar `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL_INTERVIEWER`. |
| `backend/pyproject.toml` | Adicionar `"accounts", "chat", "agents"` em `[tool.ruff.lint.isort].known-first-party`. |

### Knowledge base real

```
knowledge_base/interviewing/
├── persona.md                  # ~400 palavras: tom, estilo, do/don't
├── questions_by_phase.md       # ~800 palavras: perguntas-guia por fase
├── follow_up_patterns.md       # ~400 palavras: como aprofundar
└── stop_signals.md             # ~300 palavras: quando avançar fase
```

Todos com frontmatter:
```yaml
---
category: interviewing
agents: [interviewer]
priority: always
tags: [persona | conversation | phases]
---
```

### Frontend

```
frontend/src/domains/chat/
├── CLAUDE.md
├── index.ts                    # barrel: useChat hook, ChatPage
├── api/
│   ├── client.ts               # import apiClient de domains/auth
│   ├── sessions.ts             # createSession, getSession, finalizeSession
│   └── messages.ts             # listMessages, sendMessage
├── hooks/
│   ├── useSession.ts           # useQuery(sessionId)
│   ├── useMessages.ts          # useQuery + paginação
│   └── useSendMessage.ts       # useMutation + invalida useMessages
├── components/
│   ├── atoms/
│   │   ├── MessageBubble/
│   │   └── PhaseIndicator/
│   ├── molecules/
│   │   ├── MessageList/
│   │   └── ChatInput/
├── pages/
│   └── ChatPage/
│       ├── ChatPage.tsx
│       └── index.ts
└── types/
    └── index.ts                # Session, Message, Phase

frontend/src/router.tsx         # rota lazy /chat dentro do ProtectedRoute
frontend/src/components/templates/AppShellTemplate.tsx  # adicionar item "Chat" no nav
```

## Reuso (não criar — usar)

| Componente | Onde | Como usar |
|---|---|---|
| `BaseModel` | `backend/src/core/models/base.py:18` | Herdar em CandidateProfile, InterviewSession, ChatMessage, AgentRun |
| `ApplicationError`, `NotFoundError` | `backend/src/core/errors.py` | Usar em use cases — handler mapeia pro envelope |
| `EnvelopeRenderer`, `StandardPagination` | `backend/src/core/api/` | Já default no DRF — `Response(data)` plain |
| `IsObjectOwner` | `backend/src/core/permissions.py` | Permission das views de chat (sessões são do user) |
| `RequestIDMiddleware` | `backend/src/core/middleware.py` | Já ativo — `request.request_id` disponível pra logs |
| `KnowledgeLoader` | `backend/src/knowledge/services/loader.py` | Injetar via DI em `RunInterviewerTurn.__init__` |
| `api_client`, `auth_client`, `superuser_client` | `backend/conftest.py` | Fixtures pra tests de API |
| `apiClient` (axios singleton) | `frontend/src/domains/auth/api/client.ts` | Todas as chamadas HTTP do domain chat passam por aqui |
| `AppShellTemplate` | `frontend/src/components/templates/AppShellTemplate/` | Wrap da ChatPage |
| `useLogin` / `useLogout` | `frontend/src/domains/auth/hooks/` | Login já pronto |

## Critérios de aceite

### Backend — automatizáveis (rodar via `make test-fast`)

- [ ] `accounts.tests.test_signals.test_user_save_creates_profile` passa — novo User dispara criação de CandidateProfile.
- [ ] `accounts.tests.test_api.test_get_me_returns_profile` passa — GET `/api/v1/accounts/me/` retorna 200 com CandidateProfile.
- [ ] `accounts.tests.test_api.test_patch_me_updates_profile` passa — PATCH atualiza campos editáveis.
- [ ] `accounts.tests.test_api.test_me_requires_auth` passa — 401 sem JWT.
- [ ] `chat.tests.test_api.test_create_session` passa — POST `/sessions/` retorna 201 com primeira mensagem do assistant.
- [ ] `chat.tests.test_api.test_send_message` passa — POST `/sessions/{id}/messages/` retorna 201 com resposta do assistant.
- [ ] `chat.tests.test_api.test_session_isolation` passa — user A não consegue acessar session de user B (403).
- [ ] `chat.tests.test_api.test_finalize_returns_collected_data` passa — POST `/finalize/` retorna 200 com `collected_data` populado e status="completed".
- [ ] `chat.tests.test_api.test_messages_paginated` passa — GET `/messages/` retorna envelope paginado.
- [ ] `agents.tests.test_run_interviewer_turn.test_first_turn_includes_kb_in_system_prompt` passa — verifica que system prompt enviado ao FakeLLMClient contém conteúdo carregado via `KnowledgeLoader.load_for_agent("interviewer")`.
- [ ] `agents.tests.test_run_interviewer_turn.test_tool_use_record_experience_updates_session` passa — quando FakeLLMClient retorna `tool_use` com `record_experience`, `session.collected_data["experiences"]` ganha entrada.
- [ ] `agents.tests.test_run_interviewer_turn.test_mark_phase_complete_advances_phase` passa — tool `mark_phase_complete` muda `current_phase`.
- [ ] `agents.tests.test_run_interviewer_turn.test_tool_use_loop_terminates_on_text_response` passa — loop encerra quando assistant retorna text sem tool_use.
- [ ] `agents.tests.test_run_interviewer_turn.test_persists_agent_run` passa — cria `AgentRun` com input/output/usage.
- [ ] `agents.tests.test_run_interviewer_turn.test_request_clarification_tool` passa — tool `request_clarification` cria mensagem visível pro usuário.
- [ ] `integrations.llm.tests.test_tool_use_loop.test_multi_tool_in_single_turn` passa — loop faz N rounds de tool_use no mesmo turn antes de retornar text.
- [ ] `integrations.llm.tests.test_tool_use_loop.test_cache_control_injected` passa — system prompt enviado pra API tem `cache_control: ephemeral`.
- [ ] `make test-fast` verde — total >= 130 testes passando (109 anteriores + ~25 novos).

### Backend — verificáveis manualmente

- [ ] `make migrate` aplica migrations dos 3 apps novos sem erro.
- [ ] Admin Django mostra os 3 models novos.
- [ ] `make ingest-knowledge` (com `EMBEDDINGS_API_KEY` real) ingere os 4 docs novos de `knowledge_base/interviewing/`. `make knowledge-status` mostra 4 docs com `agents: ["interviewer"]`.

### Frontend — automatizáveis

- [ ] `make frontend-typecheck` verde.
- [ ] `make frontend-lint` verde.

### Frontend — verificáveis manualmente

- [ ] `make dev` sobe e abre `http://localhost:5173`.
- [ ] Login com superuser funciona (já existia).
- [ ] Nav do AppShell tem item "Chat" — clicar abre `/chat`.
- [ ] Página `/chat` mostra "Iniciar nova sessão" se nenhuma ativa.
- [ ] Clicar inicia sessão e mostra a primeira mensagem do entrevistador.
- [ ] Input funciona — usuário digita, envia, vê resposta do assistant em <10s.
- [ ] Indicador de fase atualiza visualmente quando o entrevistador chama `mark_phase_complete()`.
- [ ] Histórico de mensagens persiste em refresh (vem do backend).

### Comportamentais (verificáveis em smoke test end-to-end)

- [ ] Sessão completa de pelo menos **2 fases** (`personal_info` + `experience`) termina com `collected_data` JSON estruturado, contendo as keys das fases cobertas com dados não-vazios.
- [ ] `current_phase` avança automaticamente — não fica preso em `intro`.
- [ ] A partir do **2º turn**, `ChatMessage.usage.cache_read_input_tokens > 0` (prompt cache funcionando).
- [ ] `AgentRun` é criado pra cada turn — auditoria visível no admin.
- [ ] Quando usuário responde algo vago ("trabalhei em umas coisas"), entrevistador pergunta detalhe específico (via tool `request_clarification` ou diretamente em text).

## Verificação end-to-end

```bash
# 1. Pull mudanças, sync deps
make refresh-venv

# 2. Migrations
make migrate

# 3. Ingerir knowledge base nova (precisa EMBEDDINGS_API_KEY no .env)
make ingest-knowledge
make knowledge-status | jq '.data.documents | map(select(.agents | contains(["interviewer"]))) | length'
# Esperado: 4

# 4. Tests
make test-fast
# Esperado: 130+ passed, 0 failures

# 5. Smoke manual (precisa ANTHROPIC_API_KEY real)
make dev
# - login com superuser
# - /chat → iniciar nova sessão
# - conversar:
#   "Oi! Sou João, dev backend Python."
#   "Trabalhei na Acme de 2022 a 2024 como Backend Developer."
#   "Mexi com Django, PostgreSQL e Kafka."
#   "Construí API REST para processamento de pagamentos."
#   "Não, mais nada de experiência por enquanto."
# - verificar que entrevistador avança fase em algum momento
# - finalizar sessão
# - abrir admin /admin/chat/interviewsession/{id}/ e ver collected_data
```

## Riscos / armadilhas

- **Tool use loop infinito** — se o modelo entra em loop chamando a mesma tool repetidamente, o pipeline trava. Mitigação: hard cap de N=10 rounds no loop, lança `ApplicationError` se excede.
- **Prompts inconsistentes** — o entrevistador pode "esquecer" fase atual se o system prompt não for re-assemblado a cada turn. Sempre re-render o system com a fase corrente.
- **Cache invalidation surpresa** — qualquer mudança no system prompt invalida o cache. Mantenha o prompt template estável; injete fase/collected_data num bloco user message, não no system.
- **JSONField em filtro estrutural** — `agents__contains=[name]` funciona; cuidado com `agents__contains="name"` que filtra substring de string. Sempre lista.
- **CORS no dev** — frontend em `:5173`, backend em `:8000`. `CORS_ALLOWED_ORIGINS` já cobre, mas se aparecer header novo (ex: `X-Session-Token`), atualizar `CORS_ALLOW_HEADERS` em `settings/base.py`.
- **Custo de tokens** — sem cache, conversa de 30 turns gera ~30 chamadas com histórico crescente = boleta. Confirmar `cache_read_input_tokens > 0` cedo.
- **Frontend race** — usuário envia 2 mensagens rápido. Botão de submit deve desabilitar enquanto `useSendMessage.isPending`.

## Subagentes recomendados pra delegação

| Trabalho | Subagente | Por quê |
|---|---|---|
| App `accounts/` (model + signal + admin + API) | `django-core` | CRUD enxuto, padrão do template |
| Estender `integrations/llm/` com tool_use loop helper | `integrations-platform` | Owner de `integrations/`; conhece padrão httpx + retry + import lazy |
| Factories + tests de use cases e API | `qa-validation` | Owner de tests; conhece factory-boy + fixtures globais |
| Frontend domain `chat/` (atoms/molecules/page/hooks) | `frontend-core` | Owner de `frontend/src/` |
| App `chat/` (models + API), app `agents/` (use case + prompts), knowledge base real de `interviewing/`, wire URLs/settings, integração final | Orquestrador (você) | Coordenação cross-domain, decisão de prompt, validação end-to-end |

## Atualização do plano ao finalizar

Editar este arquivo:
1. Mudar status do header pra `✅ Done`.
2. Adicionar `**Entregue em:** YYYY-MM-DD`.
3. Adicionar seção "O que ficou pronto" resumindo o real (similar à Fase 0).
4. Tabela "Decisões tomadas (vs defaults)" se algo divergiu.
5. Seção "Verificação realizada" listando os números reais (X testes passando, etc).

Atualizar [`fases-implementacao.md`](../fases-implementacao.md): status da Fase 1 → `✅ Done`.
