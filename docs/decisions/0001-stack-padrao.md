# ADR 0001 — Stack padrão Synapta

**Status:** Accepted
**Data:** 2026-04-29
**Decisores:** Synapta engineering

## Contexto

Synapta tem múltiplos produtos sob a holding Byline (Bynews, Byimage, SyOS, futuros). Sem stack padronizada, cada produto reinventa decisões básicas (auth, settings, error handling, layout de app, organização do frontend), o que (a) atrasa onboarding de engenheiros novos, (b) dificulta migração de gente entre produtos, (c) impede reuso de subagentes Claude Code.

## Decisão

Adotar a stack abaixo como **default** para todo produto novo Synapta. Exceção exige ADR registrando o porquê.

### Backend

- **Linguagem:** Python 3.14+
- **Framework:** Django 6.0.4+ + Django REST Framework 3.17.1+
- **Auth:** JWT via `djangorestframework-simplejwt` 5.5+
- **Tasks assíncronas:** Celery 5.6.3+ + Redis + `django-celery-beat`
- **Database:** PostgreSQL 18 (UUID v7 nativo)
- **Storage:** MinIO (S3-compatible) — substituível por AWS S3 em prod
- **Validação:** Pydantic 2.12.5+ (em integrations/services, não em models DRF)
- **HTTP client:** `httpx` 0.28+ (sync ou async). **Nunca** `requests`
- **Settings:** `python-decouple` 3.8+ — toda var em `.env.example`
- **Linter:** Ruff 0.15+ (line-length 120, rules `E,F,I,UP,B,SIM`)
- **Test:** pytest + pytest-django + factory-boy + faker(`pt_BR`)
- **Pkg manager:** `uv`

### Frontend

- **Bundler:** Vite 8.0+
- **Framework:** React 19.2+ + TypeScript strict
- **Design system:** Mantine v9 (`@mantine/core`, `/form`, `/hooks`, `/modals`, `/notifications`)
- **Routing:** React Router v7 (`createBrowserRouter`)
- **Server state:** TanStack Query v5
- **Forms:** `@mantine/form` (não react-hook-form)
- **HTTP:** Axios 1.15+ — instância única em `domains/auth/api/client.ts`
- **Pkg manager:** `pnpm` 10+ (jamais npm/yarn)

### Arquitetura backend

- **Use cases** (`use_cases/<verbo_objeto>.py`): 1 classe, 1 método público `execute`, ≤30 linhas. Lógica de negócio mora aqui.
- **Selectors** (`selectors.py`): queries read-only, kw-only args, sem side effect, raise `NotFoundError` quando faltar.
- **Services** (`services/`): helpers stateless. Services nunca importam de use_cases.
- **Tasks Celery** (`tasks.py`): thin — 1 chamada `UseCase().execute()`.
- **Views**: thin — sem try/except. `core.errors.custom_exception_handler` é global.
- **Envelope** padrão `{success, data, meta, pagination, errors, warnings}` via `EnvelopeRenderer`.
- **BaseModel** com UUID v7 PK + timestamps.

### Arquitetura frontend

- **Atomic Design** (`components/{atoms,molecules,templates}/`) — sem domain logic.
- **Domains** (`domains/<nome>/{api,types,hooks,components,pages,index.ts}`) por **intenção do usuário**, não 1:1 com Django app.
- **Cross-domain import = proibido.**
- **`apiClient` único** em `domains/auth/api/client.ts`. Toda call passa por ele.
- **TanStack Query** wrapped em hook do domain. Mutations sempre `invalidateQueries`.
- **Mantine v9**: `rem()` em vez de px raw, theme tokens, props sobre style inline.

### Orquestração

- **`Makefile`** raiz é a única interface de comandos.
- **Docker Compose v2** em `docker/compose.yml`. Dockerfiles em `docker/`.
- Toda ação backend roda dentro do container. **Nunca `uv run` direto na máquina.**

### Repo Claude-friendly

- **CLAUDE.md hierárquico** (root → backend/frontend → app/domain).
- **`.claude/agents/`** com 7+ subagentes especialistas (1 por área de responsabilidade).
- Trabalho passa por orquestrador (Claude na raiz) → subagente especialista → consolidação.

## Consequências

**Positivas:**
- Onboarding de engenheiro novo cai pra horas, não dias.
- Engenheiro migra entre produtos sem retrabalho mental.
- Subagentes Claude Code são reusáveis entre produtos.
- Decisões batidas uma vez param de aparecer em todo PR.

**Negativas:**
- Produto com requisitos extremos (latência sub-ms, edge computing) pode pedir stack diferente — exigirá ADR de exceção.
- Time precisa aprender o padrão antes de produzir. Mitigado pelo template `synapta-template` + healthcheck app exemplo.

## Referências

- Repo template: `synapta-template`
- App exemplo end-to-end: `backend/src/healthcheck/` + `frontend/src/domains/healthcheck/`
- Subagentes: `.claude/agents/`
