# backend/src/core/CLAUDE.md

App `core` — **infra transversal**. Sem regra de negócio, sem modelos de
domínio. Tudo aqui é consumido por todos os outros apps.

## O que mora aqui

- `apps.py` — `CoreConfig`.
- `models/base.py` — **`BaseModel`**: PK UUID v7, `created_at`, `updated_at`,
  `Meta.abstract = True`, `ordering = ["-id"]`. Herde sempre.
- `errors.py` — `ApplicationError` + `NotFoundError(404)` +
  `PermissionDeniedError(403)` + `custom_exception_handler`. Use cases lançam,
  o handler mapeia.
- `permissions.py` — DRF custom permissions: `HasRole(role)`,
  `HasAnyRole(*roles)` (factories que retornam classe parametrizada),
  `IsObjectOwner` (checa `owner`/`created_by`/`user`, ou `view.owner_field`),
  `ReadOnly` (só métodos seguros). Composáveis com `&`/`|`. Roles são
  `django.contrib.auth.Group` — sem model custom.
- `middleware.py` — `RequestIDMiddleware`: gera/propaga `X-Request-ID` (UUID v7),
  expõe `request.request_id`.
- `api/renderers.py` — **`EnvelopeRenderer`**: envolve toda response em
  `{success, data, meta, pagination, errors, warnings}`.
- `api/pagination.py` — `StandardPagination`: 20/página, `?page_size=N` (max 200).
- `api/responses.py` — helpers `build_envelope` / `error_envelope` (raros — o
  renderer faz o trabalho normal).
- `api/views.py` — vazio por padrão (extensão futura); o healthcheck mora
  em `observability/health.py`.
- `api/urls.py` — só pra extensão futura; `config/urls.py` já aponta direto.
- `logging.py` — `configure_logging()` (loguru sink + `InterceptHandler`
  pra absorver o `logging` stdlib). Chamado de `settings/base.py`.
- `observability/sentry.py` — `init_sentry()` opt-in (DSN vazio = no-op).
  Redige `Authorization`/`X-API-Key` no `before_send`.
- `observability/health.py` — `health_view` (GET `/api/v1/health/`,
  público) com `_check_db` + `_check_redis` + `_check_minio`. Retorna
  JSON plano (não envelope) pra probes externos.

## JWT

Endpoints montados em `config/urls.py`:
- `POST /api/v1/token/` — obtain (username + password)
- `POST /api/v1/token/refresh/` — refresh

Lifetime configurável via `JWT_ACCESS_LIFETIME_MINUTES` (default 60) e
`JWT_REFRESH_LIFETIME_DAYS` (default 7) no `.env`.

## Stop list

- **Nunca** lógica de negócio em `core/`. Helper de domínio mora em
  `<app>/services/` ou `<app>/use_cases/`.
- **Nunca** importar de `core/` algo que não seja infra (BaseModel, errors,
  envelope helpers, etc).
- **Nunca** quebrar o envelope: views devolvem `Response(data)`, não montam.
- **Nunca** index em `created_at` — UUID v7 já ordena.
- **Nunca** `from __future__ import annotations` (Python 3.14).

## Patterns

### Modelo de domínio (qualquer outro app)

```python
from core.models import BaseModel
from django.db import models

class Service(BaseModel):
    name = models.CharField(max_length=120)
    # id (UUID v7), created_at, updated_at já vêm do BaseModel
```

### Erro de domínio

```python
from core.errors import ApplicationError, NotFoundError

class QuotaExceeded(ApplicationError):
    status_code = 429

# em use case:
if usage > limit:
    raise QuotaExceeded("Cota mensal excedida.", extra={"limit": limit, "used": usage})
```

### View thin

```python
from rest_framework.response import Response
from rest_framework import status

class ServiceCreateView(APIView):
    def post(self, request):
        serializer = ServiceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = CreateServiceUseCase().execute(serializer.validated_data)
        return Response(ServiceSerializer(service).data, status=status.HTTP_201_CREATED)
```

## Healthcheck — infra interna vs serviços externos

- **`/api/v1/health/` (este app, `core/observability/health.py`):**
  readiness de infra interna do backend — Postgres + Redis + MinIO. Cada
  check retorna `{status, error|reason}`. Agregação: qualquer `fail` →
  HTTP 503; `skipped` (dep não configurada) segue 200. JSON plano (sem
  envelope) — shape canônico pra Uptime Kuma / K8s liveness/readiness.
- **`/api/v1/healthcheck/...` (app `healthcheck`):** monitoramento de
  serviços externos definidos em runtime (URLs cadastradas via admin).
  Mantido por `healthcheck-monitoring`.
