# Sieve

Produto Synapta. Clonado a partir do [`synapta-template`](https://github.com/Synaptha/synapta-template).

## Stack

- **Backend:** Django 6 + DRF + JWT + Celery/Redis + PostgreSQL 18 + MinIO, Python 3.14, `uv`, Ruff.
- **Frontend:** Vite + React 19 + TypeScript strict + Mantine v9 + TanStack Query v5 + React Router v7, pnpm.
- **Orquestração:** Docker Compose v2 + `Makefile` na raiz como interface única.
- **Arquitetura:** use cases + selectors + services no backend; atomic design + domains por intenção do usuário no frontend.
- **Agent-friendly:** `CLAUDE.md` hierárquico + `AGENTS.md` compatível com Codex + 7 subagentes especialistas em `.claude/agents/` e `.codex/agents/`.

Detalhe completo das decisões em [`docs/decisions/0001-stack-padrao.md`](docs/decisions/0001-stack-padrao.md).

## Quickstart

```bash
# 1. Clone e renomeie
git clone <url-deste-template> meu-produto
cd meu-produto

# 2. Configure env
cp .env.example .env
# (edite secrets em produção)

# 3. Sobe tudo
make build
make up
make migrate
make superuser    # cria admin pra logar

# 4. Acesse
# Backend: http://localhost:8000/api/v1/health/
# Frontend: http://localhost:5173
# Django admin: http://localhost:8000/admin/
# MinIO console: http://localhost:9001
```

## Como bootstrapar produto novo a partir deste template

1. **Clone** este repo com nome novo. Renomeie pasta + `git remote` pro repo destino.
2. **Edite `CLAUDE.md` raiz** com 1 parágrafo do que é o produto + mapping `backend ↔ frontend domain` específico.
3. **Apague o app exemplo `healthcheck/`** quando não precisar mais (backend `src/healthcheck/` + frontend `src/domains/healthcheck/`).
4. **Adicione apps de domínio** seguindo o padrão do `healthcheck` como referência viva. Cria `CLAUDE.md` do app **antes** do código.
5. **Adicione subagente por app** em `.claude/agents/<app>-<verbo>.md`. Copie o esqueleto do `healthcheck-monitoring.md`.
6. **Sincronize instruções de agente** quando criar ou mudar `CLAUDE.md`/`.claude/agents/*.md`:
   ```bash
   make sync-agents-md
   make sync-codex-agents
   ```
7. **Atualize `docs/decisions/`** com ADRs específicos do produto.

## Estrutura do repo

```
.
├── CLAUDE.md                         # entrypoint pra Claude Code
├── Makefile                          # única interface de comandos
├── .claude/agents/                   # 7 subagentes especialistas
├── .codex/agents/                    # espelho Codex gerado a partir de .claude/agents
├── scripts/                          # sync de AGENTS.md e agentes Codex
├── docker/                           # compose.yml + Dockerfiles
├── docs/                             # architecture, decisions (ADRs), prd, planning
├── backend/
│   ├── CLAUDE.md
│   ├── pyproject.toml
│   ├── conftest.py
│   ├── manage.py
│   ├── config/
│   │   ├── celery_app.py
│   │   ├── urls.py
│   │   └── settings/{base,local,test,production}.py
│   └── src/
│       ├── core/                     # BaseModel, errors, envelope, JWT, middleware
│       ├── integrations/             # clients externos (LLM, S3, etc)
│       └── healthcheck/              # ⭐ APP EXEMPLO — referência viva, apagar quando não precisar
└── frontend/
    ├── CLAUDE.md
    ├── package.json                  # pnpm
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── router.tsx
        ├── components/{atoms,molecules,templates}/
        ├── lib/
        └── domains/
            ├── auth/                 # login + JWT (todo produto tem)
            └── healthcheck/          # ⭐ DOMAIN EXEMPLO — apagar quando não precisar
```

## Comandos principais (Makefile)

| Comando | O que faz |
|---|---|
| `make dev` | ⭐ stack base + Vite **no host** (HMR confiável em Colima/macOS) |
| `make dev-up` | stack base sem o container do frontend (libera porta 5173 pro Vite host) |
| `make up` / `make down` | sobe/derruba todos os serviços (frontend dentro do container) |
| `make build` | rebuild de imagens (no-cache) |
| `make logs` | tail de todos os logs |
| `make migrate` / `make migrations` | rodar / criar migrations |
| `make shell` | `shell_plus` |
| `make superuser` | cria superuser Django |
| `make test` / `make test-fast` | suite verbose / paralelo (`-n auto --reuse-db`) |
| `make test-app APP=x` | pytest só de `src/x/tests/` (extras via `PYTEST_ARGS=...`) |
| `make lint` / `make fmt` | ruff check / format |
| `make restart-celery` | restart só do worker |
| `make frontend-lint` / `make frontend-typecheck` | lint / typecheck do frontend |
| `make refresh-venv` | recria `.venv` do backend (após mudar `pyproject.toml`/`uv.lock`) sem apagar o banco |
| `make refresh-node-modules` | recria `node_modules` do frontend (após mudar `package.json`) sem apagar o banco |
| `make sync-agents-md` | cria `AGENTS.md` symlink ao lado de cada `CLAUDE.md` |
| `make sync-codex-agents` | gera `.codex/agents/*.toml` a partir de `.claude/agents/*.md` |
| `make clear` | ⚠️ down -v: apaga **tudo** incluindo Postgres e MinIO |

## Padrão Synapta

Toda decisão arquitetural e de organização deste projeto segue o padrão Synapta. Resumo:

- **Backend:** lógica em `use_cases/` (1 classe, 1 método `execute`, ≤30 linhas), queries em `selectors.py` (read-only, kw-only), helpers em `services/` (stateless), tasks Celery thin em `tasks.py`. Views nunca capturam erro — `core.errors.custom_exception_handler` é global. Toda response passa pelo `EnvelopeRenderer`.
- **Frontend:** atomic design (`atoms`/`molecules`/`templates`) + `domains/` por intenção do usuário. Cross-domain import = proibido. `apiClient` único em `domains/auth/api/client.ts`. TanStack Query wrapped em hooks por domain. Mantine v9 com `rem()` e theme tokens.
- **Subagentes:** 1 por área de responsabilidade, com domínio e stop list. Orquestrador delega; subagentes executam.

## Healthcheck app — exemplo vivo

Mostra o caminho completo de uma feature: model → migration → selector → use case → view → serializer → tests + frontend api → types → hooks → page.

`ServiceCheck` model com campos `name, url, expected_status, interval_seconds, is_active, last_checked_at, last_status`. Use case `RunCheck` faz HTTP GET via httpx. Endpoint `POST /api/v1/healthcheck/checks/{id}/run/` dispara manualmente. Frontend lista os checks e dispara via botão.

**Apagar quando não precisar mais:**
```bash
rm -rf backend/src/healthcheck frontend/src/domains/healthcheck
# remover do INSTALLED_APPS, urls.py, router.tsx
```
