# backend/CLAUDE.md

Convenções do backend Django/DRF/Celery do Sieve, seguindo o padrão Synapta.
**Em conflito com qualquer subagente, este arquivo ganha.**

## Stack

- Python **3.14+**.
- Django **6.0.4+**, DRF **3.17.1+**, simplejwt **5.5+**.
- Celery **5.6.3+** + django-celery-beat **2.7+** (Redis broker).
- PostgreSQL 18 via `psycopg[binary] 3.3+`.
- Pydantic **2.12.5+** (DTOs), httpx **0.28+** (clients externos).
- Settings via `python-decouple 3.8+` (nunca `os.environ` direto).
- Lint/format: ruff **0.15.11+**, line-length 120, rules `E,F,I,UP,B,SIM`.
- Test: pytest **9+**, pytest-django **4.12+**, factory-boy **3.3+**.

## Layout

```
backend/
├── pyproject.toml           # deps + ruff + pytest
├── manage.py                # default settings: config.settings.local
├── conftest.py              # fixtures globais (api_client, auth_client, superuser_client)
├── config/
│   ├── __init__.py          # exporta celery_app
│   ├── asgi.py / wsgi.py
│   ├── celery_app.py        # Celery("config") + autodiscover
│   ├── urls.py              # admin + /api/v1/health/ + /api/v1/token/{,refresh/}
│   └── settings/
│       ├── base.py          # tudo que é comum
│       ├── local.py         # DEBUG, debug_toolbar, django_extensions
│       ├── test.py          # CELERY eager, MD5 hasher
│       └── production.py    # SECURE_*, HSTS
└── src/                     # PYTHONPATH inclui isto
    ├── core/                # infra transversal — django-core
    │   ├── apps.py
    │   ├── models/base.py   # BaseModel (UUID v7 + created_at + updated_at)
    │   ├── errors.py        # ApplicationError + custom_exception_handler
    │   ├── middleware.py    # RequestIDMiddleware
    │   └── api/
    │       ├── pagination.py    # StandardPagination (20/page, max 200)
    │       ├── renderers.py     # EnvelopeRenderer
    │       ├── responses.py     # build_envelope, error_envelope
    │       ├── views.py         # health_view
    │       └── urls.py
    ├── healthcheck/         # app exemplo (quando existir)
    └── integrations/        # clients externos (quando existirem)
```

## Comandos `make`

> Comandos `make` ainda serão criados pelo agente `devops-deploy`.
> Por ora, `uv run python manage.py ...` resolve.

| Comando            | O que faz                                  |
|--------------------|--------------------------------------------|
| `make up`/`down`   | sobe/derruba serviços (postgres, redis…)   |
| `make migrations`  | `makemigrations`                            |
| `make migrate`     | `migrate`                                   |
| `make shell`       | `shell_plus` (django-extensions)            |
| `make test-fast`   | pytest paralelo + `--reuse-db` (gate de PR) |
| `make lint`        | `ruff check`                                |
| `make fmt`         | `ruff format` + `ruff check --fix`          |
| `make superuser`   | cria admin                                  |
| `make restart-celery` | restart worker (pós-mudança em task)     |

## Regras duras

### Models
- Todo modelo de domínio herda de `core.models.BaseModel`. PK é UUID v7.
- **Nunca** index em `created_at` — UUID v7 já é cronologicamente ordenado.
- Migrations sempre **dentro** do app: `<app>/migrations/`.

### Use cases / services / selectors
- **Lógica de negócio mora em `<app>/use_cases/` ou `<app>/services/`.** Nunca
  em views, nunca em `core/`.
- Selectors (queries puras) em `<app>/selectors/`.
- **Nunca** `from rest_framework import ...` dentro de `use_cases/services/selectors`.
  HTTP é responsabilidade exclusiva de `<app>/api/views.py`.
- Erros de domínio: `raise ApplicationError(...)` (ou subclasse). Nunca
  `Response(...)` fora de view.

### API
- Views são finas: validam input via serializer → chamam use case → devolvem
  `Response(payload)`. Sem regra de negócio.
- `Response(data)` plain — **nunca** monte envelope manual; o
  `EnvelopeRenderer` faz.
- 204/DELETE retorna body vazio.
- Auth padrão: `IsAuthenticated`. `AllowAny` só onde for explícito (healthcheck,
  token, signup público).

### Permissions

- **Default `IsAuthenticated`.** Override pra `AllowAny` apenas em endpoints
  públicos explícitos (login, healthcheck, signup).
- **Roles via `django.contrib.auth.Group`** — sem model custom. Cada produto
  cria seus grupos via migration de seed (ex:
  `<app>/migrations/000N_seed_groups.py` com `RunPython` chamando
  `Group.objects.get_or_create(name="admin")`). Nomes em lowercase
  (`"admin"`, `"gestor"`, `"membro"`).
- **Custom permissions vivem em `core.permissions`:**
  - `HasRole("admin")` — exige um grupo específico.
  - `HasAnyRole("admin", "gestor")` — aceita lista.
  - `IsObjectOwner` — checa `obj.owner` / `created_by` / `user` (ou
    `view.owner_field` se a view tiver outro nome).
  - `ReadOnly` — só métodos seguros (GET/HEAD/OPTIONS).
- **Compor com `&` (AND) e `|` (OR) do DRF:**
  ```python
  from rest_framework.permissions import IsAuthenticated
  from core.permissions import HasRole, IsObjectOwner

  class ServiceViewSet(viewsets.ModelViewSet):
      permission_classes = [
          IsAuthenticated & (HasRole("admin") | IsObjectOwner)
      ]
  ```
- **Stop:** **nunca** check de role inline na view
  (`if request.user.groups.filter(name="admin").exists(): ...`). Sempre
  via permission class — o gate fica explícito, testável e composável.

### Errors
- Use cases lançam `ApplicationError`, `NotFoundError`, `PermissionDeniedError`
  de `core.errors`. O `custom_exception_handler` mapeia pro envelope.
- Para criar tipos novos de erro, herde de `ApplicationError` e defina
  `status_code`.

### Settings
- **Nunca** `os.environ[...]` direto — sempre `decouple.config(...)`.
- Toda nova var: documentar em `.env.example`.
- `base.py` é a fonte; `local/test/production` só ajustam.

### CORS
- `django-cors-headers` já está nas deps + middleware. Origens liberadas via
  `CORS_ALLOWED_ORIGINS` no `.env` (lista CSV).
- **Em dev:** `http://localhost:5173,http://localhost:8080` cobre Vite + admin.
- **Em staging/prod:** liberar **só** o domínio real do frontend
  (`https://app.<produto>.synaptha.com`). Nunca `CORS_ALLOW_ALL_ORIGINS=True`
  fora de hack local de 5min.
- Header novo (ex: `X-Tenant-ID`) precisa entrar em
  `CORS_ALLOW_HEADERS` no `base.py` — senão browser bloqueia silencioso.
- Cookies cross-origin? Setar `CORS_ALLOW_CREDENTIALS=True` **e**
  `SESSION_COOKIE_SAMESITE="None"` + `SESSION_COOKIE_SECURE=True`.
- Preflight failing? Cheque `CORS_ALLOWED_ORIGINS` exato (case-sensitive,
  sem trailing slash, com schema).

### Management commands
- Convenção Django padrão: `<app>/management/commands/<verbo>.py` com classe
  `Command(BaseCommand)`. Roda via `make shell`-equivalente:
  `docker compose exec backend uv run python manage.py <verbo>`.
- Verbo no infinitivo curto (`seed`, `import_users`, `recompute_stats`).
  Múltiplas palavras com underscore.
- Comando que vai virar rotineiro (executado N vezes na vida do produto):
  adicionar target no `Makefile` chamando ele — assim entra na "interface
  única" de comandos do repo.
- Comando one-shot (migração de dados, fix manual): cria, roda, **deleta na
  mesma PR**. Não vira museu de scripts antigos.
- Side effect destrutivo (apaga registro, refaz cache caro)? `--dry-run`
  default + `--apply` pra executar de fato.

### Observabilidade
- **Logs estruturados via loguru.** `core/logging.py` configura sink único.
  Em DEBUG → `pretty` (texto colorido). Senão → `json` (1 linha/evento,
  ingestível em Loki/Grafana/Datadog). `LOG_LEVEL` e `LOG_MODE` via env.
- O `RequestIDMiddleware` faz `logger.contextualize(request_id=...)` em
  volta do request — todo log emitido durante o ciclo carrega o id.
- **Sentry é opt-in.** `SENTRY_DSN` vazio (default) = no-op total. Populado
  = inicializa com integrations Django + Celery + Logging. `send_default_pii=False`
  por padrão (LGPD); `before_send` redige `Authorization`/`X-API-Key`.
- **Healthcheck rico** em `/api/v1/health/` — checa db (obrigatório),
  redis e minio. Cada check retorna `{status, error|reason}`. Agregação:
  qualquer `fail` → HTTP 503; `skipped` puro segue 200. Endpoint retorna
  JSON plano (não envelope) pra probes externos consumirem o shape canônico.

### Testing
- Fixtures globais: `api_client`, `auth_client`, `superuser_client` (no
  `conftest.py` raiz).
- Testes do app vivem em `<app>/tests/`. Factories em `<app>/tests/factories.py`.

## Stop list

- Lógica de negócio em `core/` — não. Só infra transversal (BaseModel,
  envelope, errors, middleware).
- `from __future__ import annotations` — proibido (Python 3.14).
- `os.environ[...]` direto — usa `decouple`.
- Construção manual de envelope na view — quebra contrato.
- Index em `created_at` — redundante.
- Mexer em apps de domínio que não são seus (cada app tem dono).
- **`print()` em código de produção** — sempre `from loguru import logger` e
  `logger.info(...)`. `print` quebra log estruturado e some em prod.
- **Capturar exception silencioso** (`except Exception: pass`) — sempre
  `logger.exception(...)` antes de re-raise, ou tratar com mensagem clara.
  Erro engolido em prod = horas de debugging.

## Setup checklist

Pra subir do zero localmente:

1. `cd backend && uv sync`
2. Copiar `.env.example` → `.env` (ou exportar vars).
3. Subir Postgres + Redis (docker compose, devops-deploy faz).
4. `uv run python manage.py migrate`
5. `uv run python manage.py runserver`
6. `curl http://localhost:8000/api/v1/health/` → `{"status": "ok", "checks": {"db": {...}, "redis": {...}, "minio": {...}}}`

## Subagentes

| Agente                     | Domínio                                                  |
|----------------------------|----------------------------------------------------------|
| `django-core` (este)       | `config/`, `src/core/`                                   |
| `celery-orchestration`     | `tasks.py` de qualquer app, beat schedule                |
| `qa-validation`            | `<app>/tests/`, factories                                |
| `integrations-platform`    | `src/integrations/` (clients httpx)                      |
| `healthcheck-monitoring`   | `src/healthcheck/`                                       |
| `devops-deploy`            | `Makefile`, `docker/`, `.env.example`, CI                |

Trabalho que cai claramente num agente — delegue.
