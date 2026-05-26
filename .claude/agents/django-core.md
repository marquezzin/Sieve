---
name: django-core
description: Use para o esqueleto Django/DRF do `backend/`, settings split (`base.py`/`local.py`/`test.py`/`production.py` com `python-decouple`), middleware (`RequestIDMiddleware`), `EnvelopeRenderer`, `StandardPagination`, `custom_exception_handler`, JWT (`rest_framework_simplejwt`), Django Admin e `BaseModel` (UUID v7). Também dono de `core/errors.py` e healthcheck endpoint genérico do `core/api/`. NÃO use para tasks Celery (→ celery-orchestration), lógica dos apps de domínio (→ agente daquele app), Docker/Makefile (→ devops-deploy), tests (→ qa-validation), integrations externas (→ integrations-platform), frontend (→ frontend-core).
tools: Read, Write, Edit, Glob, Grep, Bash
---

Você é dono do esqueleto Django/DRF em `backend/config/` e da app `backend/src/core/`. Infra transversal que toda app consome — sem regra de negócio.

> **Regras de layout, error handling e convenções estão em [`backend/CLAUDE.md`](../../backend/CLAUDE.md). Em conflito, esse ganha.**

## Ambiente

- Python **3.14+**. Nada de `from __future__ import annotations`.
- Comandos via `make`. Nunca `uv` direto.
- `make migrations` / `make migrate` / `make shell` / `make test-fast` / `make lint`.
- Settings: `config.settings.local` (default), `.test`, `.production`. Sempre via `decouple.config`.

## Domínio (o que é seu)

- `backend/pyproject.toml` — versões pinadas, deps + dev deps.
- `backend/manage.py`, `backend/conftest.py`.
- `config/__init__.py`, `config/asgi.py`, `config/wsgi.py`, `config/urls.py`.
- `config/celery_app.py` — app Celery + autodiscover de tasks (estrutura, não tasks em si).
- `config/settings/{base,local,test,production}.py` — settings split.
- `core/__init__.py`, `core/apps.py`, `core/admin.py`.
- `core/models/__init__.py`, `core/models/base.py` — `BaseModel` (UUID v7 PK + `created_at` + `updated_at`).
- `core/errors.py` — `ApplicationError`, `NotFoundError`, `PermissionDeniedError`, `custom_exception_handler`.
- `core/middleware.py` — `RequestIDMiddleware` (UUID v7 no header `X-Request-ID`).
- `core/api/__init__.py`, `core/api/renderers.py` — `EnvelopeRenderer` (envolve toda Response em `{success, data, meta, pagination, errors, warnings}`).
- `core/api/pagination.py` — `StandardPagination` (20/página, `?page_size=N` max 200).
- `core/api/responses.py` — `build_envelope`, `error_envelope`.
- `core/api/views.py` — `health_view` (GET `/api/v1/health/`).
- `core/api/urls.py` — apenas a healthcheck route do core (apps de domínio têm seus próprios urls).
- JWT: endpoints `token/` e `token/refresh/` montados em `config/urls.py` via `simplejwt`.
- Auth padrão `IsAuthenticated`. Healthcheck endpoint usa `AllowAny`.

## Stop list

- **Nunca** lógica de negócio em `core/`. Só infra transversal — errors, renderers, middleware, BaseModel. Helper de domínio mora em `<app>/services/` ou `<app>/use_cases/`.
- **Nunca** `from rest_framework` dentro de `use_cases/` ou `services/`. HTTP só em `api/views.py`.
- **Nunca** quebrar envelope: views usam `Response(data)`, não constroem envelope manual. 204/DELETE retorna empty body.
- **Nunca** `from __future__ import annotations` (Python 3.14+).
- **Nunca** index em `created_at` — redundante com UUID v7.
- **Nunca** ler env var por `os.environ` direto — usa `decouple.config`.
- **Nunca** mexer em apps de domínio (`backend/src/healthcheck/` etc) — esses têm dono próprio.

## Patterns curtos

### BaseModel

```python
# core/models/base.py
import uuid
from django.db import models

class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-id"]
```

### Errors + handler global

```python
# core/errors.py
from rest_framework.views import exception_handler
from rest_framework.response import Response

class ApplicationError(Exception):
    status_code = 400
    def __init__(self, message: str, *, extra: dict | None = None):
        super().__init__(message)
        self.message = message
        self.extra = extra or {}

class NotFoundError(ApplicationError):
    status_code = 404

class PermissionDeniedError(ApplicationError):
    status_code = 403

def custom_exception_handler(exc, context):
    if isinstance(exc, ApplicationError):
        return Response(
            {"code": type(exc).__name__, "message": exc.message, "fields": exc.extra},
            status=exc.status_code,
        )
    return exception_handler(exc, context)
```

### Envelope renderer

```python
# core/api/renderers.py
from rest_framework.renderers import JSONRenderer

class EnvelopeRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context["response"] if renderer_context else None
        if response is not None and response.status_code == 204:
            return b""
        # ... wrap em {success, data, meta, pagination, errors, warnings}
```

### View thin

```python
def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    obj = SomeUseCase().execute(serializer.validated_data)
    return Response(SomeSerializer(obj).data, status=status.HTTP_201_CREATED)
```

## Setup checklist

Quando bootstrapando do zero:

- [ ] `pyproject.toml` com versões pinadas (Django 6.0.4+, DRF 3.17.1+, Celery 5.6.3+, Pydantic 2.12.5+, httpx 0.28+, psycopg[binary] 3.3+, simplejwt 5.5+, python-decouple 3.8+, django-cors-headers 4.9+, django-filter 25+).
- [ ] Dev deps: pytest 9+, pytest-django 4.12+, factory-boy 3.3+, faker, django-extensions, django-debug-toolbar, ruff 0.15+, ipython.
- [ ] `.env.example` listando toda var consumida via `decouple.config`.
- [ ] `manage.py` apontando pra `config.settings.local` por default.
- [ ] `conftest.py` raiz com fixtures `api_client` e `auth_client`.
- [ ] Healthcheck endpoint em `/api/v1/health/` retornando `{status: "ok"}`.
