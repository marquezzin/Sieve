# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What is this?

**Sieve** — produto Synapta. Clonado de [`synapta-template`](https://github.com/Synaptha/synapta-template).
Stack: Django 6 + DRF + Celery + PostgreSQL 18 (backend) e Vite + React 19 + Mantine v9 (frontend).

> TODO: substituir esta seção por 1 parágrafo do que é o Sieve assim que o
> produto ganhar forma.

## CLAUDE.md hierarchy

Cada nível tem o seu CLAUDE.md. Comece pelo mais próximo do `cwd`:

```
CLAUDE.md                                  ← você está aqui (overview + navegação)
├── backend/CLAUDE.md                      ← stack, comandos make, convenções Django-wide
│   └── src/core/CLAUDE.md                 ← BaseModel, auth, envelope, errors
│   └── src/healthcheck/CLAUDE.md          ← app exemplo (apagar quando não precisar)
└── frontend/CLAUDE.md                     ← Vite + React, atomic design, domains, Mantine
    └── src/domains/auth/CLAUDE.md         ← login, JWT, apiClient base
    └── src/domains/chat/CLAUDE.md         ← entrevistador + histórico de sessões
    └── src/domains/profile/CLAUDE.md      ← perfil do candidato (porte do protótipo)
```

## Backend ↔ Frontend domain mapping

Frontend domains são modelados por **intenção do usuário**, não 1:1 com Django app.

| Django app | Frontend domain | O que o usuário vê |
|---|---|---|
| `core` | `auth` | login, JWT, refresh |
| `accounts` | `profile` | ver/editar perfil do candidato (`/me/`) |
| `chat` + `agents` | `chat` | entrevista conversacional + histórico de sessões |
| `matching` | `matching` | colar vaga → score de aderência + skills + recomendações |
| `applications` | `applications` | Kanban de candidaturas (arrastar entre estágios) |

Adicionar linhas conforme apps novos forem criados.

> O `healthcheck` permanece como **app de exemplo no backend** (`src/healthcheck/`),
> mas **não tem mais domain no frontend** — removido por não ser usado no produto.

## Subagentes especialistas

`.claude/agents/` tem 7 subagentes:

- **`django-core`** — `backend/config/`, `backend/src/core/` (BaseModel, errors, envelope, JWT, middleware)
- **`celery-orchestration`** — `tasks.py` de qualquer app, `config/celery_app.py`, beat schedule
- **`devops-deploy`** — `Makefile`, `docker/`, `.env.example`, CI/CD
- **`qa-validation`** — tests, factories, fixtures, gate `make test-fast`
- **`integrations-platform`** — `backend/src/integrations/` (clients externos)
- **`healthcheck-monitoring`** — `backend/src/healthcheck/` (app exemplo)
- **`frontend-core`** — `frontend/src/` inteiro (atomic design + domains + Mantine)

Regra: **trabalho que cai claramente num agente, delegar.** Orquestrador (você) consolida.

## Authoritative context

Antes de mudar arquitetura ou scaffoldar módulo novo, leia:

- [`docs/decisions/0001-stack-padrao.md`](docs/decisions/0001-stack-padrao.md) — ADR da stack padrão Synapta.
- [`docs/decisions/0002-multi-agent-sem-framework.md`](docs/decisions/0002-multi-agent-sem-framework.md) — por que use cases dedicados + tool use nativo, sem LangGraph/CrewAI.
- [`docs/decisions/0003-knowledge-base-format.md`](docs/decisions/0003-knowledge-base-format.md) — formato MD + frontmatter, ingest idempotente, dois modos de consumo (full-load + retrieval).
- [`docs/decisions/TEMPLATE.md`](docs/decisions/TEMPLATE.md) — template pra ADR novo (decisão durável merece ADR).
- [`docs/conceitos-fundamentais.md`](docs/conceitos-fundamentais.md) — embeddings, pgvector, chunking, KnowledgeDocument/Chunk, dois modos de consumo. Leitura obrigatória antes de tocar em agentes ou knowledge base.
- `backend/CLAUDE.md` — todas as convenções Django/DRF/Celery.
- `frontend/CLAUDE.md` — todas as convenções React/Mantine/TanStack.
- [`prototipo/`](prototipo/) — **protótipo de alta fidelidade: referência visual canônica.**
  Toda tela nova é construída como porte fiel da tela equivalente em
  `prototipo/src/` para Mantine v9. Ver a seção "Fidelidade ao protótipo" em
  `frontend/CLAUDE.md`. Na construção inicial, obedecer o protótipo fielmente;
  refatorar só depois, de forma deliberada.

## Plano de implementação por fases

O desenvolvimento do sistema é organizado em **fases sequenciais**, cada uma com escopo, critérios de aceite testáveis e verificação end-to-end documentados:

- **Índice e status:** [`docs/planning/fases-implementacao.md`](docs/planning/fases-implementacao.md)
- **Spec de cada fase:** [`docs/planning/fases/`](docs/planning/fases/)

Quando o usuário pedir **"faça a próxima fase de implementação"** (ou similar), siga o workflow descrito no índice:

1. Abrir o índice, identificar a primeira fase com status `🔲 Pendente`.
2. Abrir o arquivo `fases/fase-N-tema.md` correspondente.
3. Reler os contextos obrigatórios listados no topo da fase (este `CLAUDE.md`, `backend/CLAUDE.md`, `frontend/CLAUDE.md`, conceitos fundamentais, ADRs ativos) **e o protótipo da(s) tela(s) da fase em [`prototipo/src/`](prototipo/src/)** — telas novas portam o protótipo fielmente (ver "Fidelidade ao protótipo" em `frontend/CLAUDE.md`).
4. Executar contra **todos** os critérios de aceite da fase.
5. Atualizar o spec da fase (status + entrega + decisões divergentes) e o índice ao fim.

Fora desse fluxo: não invente fases novas, não pule fases, não misture escopo de fases diferentes na mesma PR. Se aparecer trabalho fora do roadmap, criar nova fase explícita seguindo o template visual das existentes.

## Convenções de colaboração

- **Conventional Commits** obrigatório (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `perf:`, `chore:`, `ci:`). Ative o template: `git config commit.template .gitmessage` (1× por clone).
- **PRs** seguem o template em `.github/pull_request_template.md` — checklist cobre tests, lint, CLAUDE.md, migrations, ADR, stop list.
- **Decisão durável** (novo padrão, lib core nova, deprecation, mudança de contrato) → criar ADR em `docs/decisions/NNNN-titulo.md` antes de implementar.

## Celery worker reminder

Mudou Celery task ou código que o worker roda? `make restart-celery`. `runserver` reload **não** atualiza worker.

## Comandos rápidos

| Comando | O que faz |
|---|---|
| `make up` / `make down` | sobe/derruba serviços |
| `make migrate` | roda migrations |
| `make test-fast` | gate de teste (paralelo, `--reuse-db`) |
| `make lint` / `make fmt` | ruff |
| `make superuser` | cria admin Django |

Lista completa: ver `Makefile` ou README.md.
