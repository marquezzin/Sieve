COMPOSE = docker compose --env-file .env -f docker/compose.yml

# Porta do backend no host, lida do .env (remapeável pra rodar lado a lado com
# outro stack). Default 8000 quando não setado. Usada pelos alvos que fazem curl.
BACKEND_HOST_PORT := $(shell grep -sE '^BACKEND_HOST_PORT=' .env | tail -1 | cut -d= -f2)
API_BASE := http://localhost:$(if $(BACKEND_HOST_PORT),$(BACKEND_HOST_PORT),8000)

.PHONY: help up down restart restart-celery build rebuild logs ps \
        dev dev-up \
        migrate migrations shell superuser seed \
        test test-fast test-app lint fmt \
        frontend-lint frontend-typecheck frontend-install \
        sync-agents-md sync-codex-agents \
        clear bash frontend-bash \
        refresh-venv refresh-node-modules \
        ingest-knowledge ingest-knowledge-force knowledge-status \
        swagger

help:
	@echo "Targets disponíveis:"
	@echo "  dev              - ⭐ sobe stack base + Vite no host (HMR confiável em Colima)"
	@echo "  dev-up           - sobe stack base sem o container do frontend"
	@echo "  up               - sobe a stack em background (frontend no container)"
	@echo "  down             - derruba a stack"
	@echo "  restart          - reinicia todos os services"
	@echo "  restart-celery   - reinicia só o celery_worker"
	@echo "  build            - build das imagens (sem cache)"
	@echo "  rebuild          - down + build + up"
	@echo "  logs             - tail -f de todos os logs"
	@echo "  ps               - status dos services"
	@echo "  migrate          - aplica migrations"
	@echo "  migrations       - gera novas migrations"
	@echo "  shell            - shell_plus no backend"
	@echo "  superuser        - cria superuser Django"
	@echo "  seed             - seed inicial (manage.py seed)"
	@echo "  test             - pytest verbose"
	@echo "  test-fast        - pytest paralelo + reuse-db"
	@echo "  test-app APP=x   - pytest só do app x (ex: make test-app APP=healthcheck)"
	@echo "  lint             - ruff check"
	@echo "  fmt              - ruff format"
	@echo "  frontend-lint    - pnpm lint"
	@echo "  frontend-typecheck - pnpm typecheck"
	@echo "  frontend-install - pnpm install no container frontend"
	@echo "  sync-agents-md   - cria AGENTS.md ao lado de cada CLAUDE.md"
	@echo "  sync-codex-agents - gera .codex/agents/*.toml a partir de .claude/agents/*.md"
	@echo "  bash             - bash dentro do backend"
	@echo "  frontend-bash    - sh dentro do frontend"
	@echo "  refresh-venv     - recria venv backend (use após mudar pyproject.toml/uv.lock)"
	@echo "  refresh-node-modules - recria node_modules frontend (use após mudar package.json)"
	@echo "  ingest-knowledge - ingere knowledge base (idempotente, pula hashes iguais)"
	@echo "  ingest-knowledge-force - força re-ingest de tudo (ignora hash cache)"
	@echo "  knowledge-status - GET /api/v1/knowledge/status/ (counts + última ingestão)"
	@echo "  swagger          - imprime/abre as URLs do Swagger UI, Redoc e schema OpenAPI"
	@echo "  clear            - down -v --remove-orphans (apaga TUDO incluindo o banco)"

# ─── Lifecycle ────────────────────────────────────────────────────────────────

up:
	$(COMPOSE) up -d

# Stack base sem o container do frontend — pra rodar Vite no host (Colima/macOS).
# Sobe backend/postgres/redis/minio/celery; para o container do frontend caso
# esteja rodando (libera a porta 5173 pro Vite host).
dev-up:
	$(COMPOSE) up -d --scale frontend=0
	@$(COMPOSE) stop frontend 2>/dev/null || true

# Atalho de dev em uma única chamada:
#   1. sobe stack base sem o frontend container
#   2. instala deps do frontend se faltarem (1ª vez)
#   3. inicia Vite no host (HMR via inotify nativo do macOS)
# Ctrl+C derruba só o Vite — o backend continua up.
dev: dev-up
	@cd frontend && [ -d node_modules ] || pnpm install
	@echo "→ Vite iniciando no host. Ctrl+C pra parar (backend continua up)."
	@cd frontend && pnpm dev

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

restart-celery:
	$(COMPOSE) restart celery_worker

build:
	$(COMPOSE) build --no-cache

rebuild: down build up

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

# ─── Django ───────────────────────────────────────────────────────────────────

migrate:
	$(COMPOSE) exec backend uv run python manage.py migrate

migrations:
	$(COMPOSE) exec backend uv run python manage.py makemigrations

shell:
	$(COMPOSE) exec backend uv run python manage.py shell_plus

superuser:
	$(COMPOSE) exec backend uv run python manage.py createsuperuser

seed:
	$(COMPOSE) exec backend uv run python manage.py seed

bash:
	$(COMPOSE) exec backend bash

# ─── Quality (backend) ────────────────────────────────────────────────────────

test:
	$(COMPOSE) exec backend uv run pytest -v

test-fast:
	$(COMPOSE) exec backend uv run pytest -n auto --reuse-db -q

# Rodar a suíte de um app só. Aceita extras de pytest via PYTEST_ARGS.
# Exemplos:
#   make test-app APP=healthcheck
#   make test-app APP=healthcheck PYTEST_ARGS='-k run_check -v'
#   make test-app APP=healthcheck PYTEST_ARGS='tests/test_views.py::test_list'
test-app:
	@if [ -z "$(APP)" ]; then echo "Uso: make test-app APP=<nome>  (ex: make test-app APP=healthcheck)"; exit 1; fi
	$(COMPOSE) exec backend uv run pytest -n auto --reuse-db src/$(APP)/tests/ $(PYTEST_ARGS)

lint:
	$(COMPOSE) exec backend uv run ruff check .

fmt:
	$(COMPOSE) exec backend uv run ruff format .

# ─── Quality (frontend) ───────────────────────────────────────────────────────

frontend-lint:
	$(COMPOSE) exec frontend pnpm lint

frontend-typecheck:
	$(COMPOSE) exec frontend pnpm typecheck

frontend-install:
	$(COMPOSE) exec frontend pnpm install

frontend-bash:
	$(COMPOSE) exec frontend sh

# ─── Agent Tooling ───────────────────────────────────────────────────────────

sync-agents-md:
	uv run python scripts/sync_agents_symlinks.py .

sync-codex-agents:
	uv run python scripts/sync_codex_agents.py .

# ─── Refresh seletivo de volumes ──────────────────────────────────────────────
# Use estes alvos quando trocou dependências e o container precisa reinstalar.
# Eles preservam dados (banco Postgres, MinIO) — só apagam o volume da linguagem.
#
# Quando usar refresh-venv:
#   - Editou backend/pyproject.toml (adicionou/removeu/atualizou dep Python)
#   - Editou backend/uv.lock manualmente ou via `uv lock`
#   - O container backend reclama de ImportError numa lib que você acabou de adicionar
#
# Quando usar refresh-node-modules:
#   - Editou frontend/package.json (adicionou/removeu/atualizou dep JS)
#   - Editou frontend/pnpm-lock.yaml ou rodou pnpm add no host
#   - O container frontend reclama de "Cannot find module" numa lib nova
#
# O que NÃO fazer: rodar `make clear` só pra atualizar deps — `clear` apaga o
# banco também. Use `clear` apenas quando quiser zerar o ambiente inteiro.

refresh-venv:
	$(COMPOSE) stop backend celery_worker celery_beat
	$(COMPOSE) rm -f backend celery_worker celery_beat
	docker volume rm sieve_backend_venv
	$(COMPOSE) up -d backend celery_worker celery_beat

refresh-node-modules:
	$(COMPOSE) stop frontend
	$(COMPOSE) rm -f frontend
	docker volume rm sieve_frontend_node_modules
	$(COMPOSE) up -d frontend

# ─── Knowledge base ───────────────────────────────────────────────────────────
# Ingestão da knowledge base (markdown + frontmatter) pra busca semântica.
# `ingest-knowledge` é idempotente — calcula hash de cada doc e pula se igual.
# Use `ingest-knowledge-force` quando trocou o modelo de embeddings ou quer
# refazer tudo do zero.

ingest-knowledge:
	$(COMPOSE) exec backend uv run python manage.py ingest_knowledge

ingest-knowledge-force:
	$(COMPOSE) exec backend uv run python manage.py ingest_knowledge --force

# Status da knowledge base: counts por tipo + última ingestão. Tenta `jq`
# primeiro pra output colorido; cai pra `python -m json.tool` se não tiver.
knowledge-status:
	@curl -s $(API_BASE)/api/v1/knowledge/status/ | (jq . 2>/dev/null || python -m json.tool)

# ─── API docs (OpenAPI / Swagger via drf-spectacular) ─────────────────────────
# Swagger UI interativo + Redoc + schema cru. Porta vem do .env (API_BASE).
swagger:
	@echo "Swagger UI: $(API_BASE)/api/v1/docs/"
	@echo "Redoc:      $(API_BASE)/api/v1/redoc/"
	@echo "Schema:     $(API_BASE)/api/v1/schema/"
	@command -v open >/dev/null 2>&1 && open "$(API_BASE)/api/v1/docs/" || true

# ─── Nuke ─────────────────────────────────────────────────────────────────────
# ⚠️  APAGA TUDO incluindo pgdata (banco) e miniodata (uploads).
#     Para refresh seletivo de venv ou node_modules, use os alvos refresh-* acima.

clear:
	$(COMPOSE) down -v --remove-orphans
