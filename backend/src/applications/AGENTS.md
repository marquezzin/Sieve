# applications — guia rápido p/ agentes

Kanban de candidaturas: `Application` (card com empresa/cargo/estágio + FKs
opcionais SET_NULL pra vaga e versão de currículo). CRUD + action `move`.

## Layout

- `models.py` — Application (`BaseModel`, UUID v7). `Status` TextChoices (6 estágios).
- `selectors.py` — leituras escopadas ao user (404/403).
- `api/` — `ApplicationViewSet` (ModelViewSet, `get_queryset` filtra por user) +
  action `move`. Serializers: leitura, create (com `validate_*_id` de ownership),
  move (ChoiceField → 400 em status inválido).

## Regras

- Isolamento de user é via `get_queryset` — nunca listar/editar card de terceiro.
- `job_posting_id`/`resume_version_id` são validados contra o user no serializer.
- Sem `from rest_framework` em selectors. Views finas.
- Endpoints, status e decisões: ver `CLAUDE.md`.

## Validar

```
uv run python manage.py makemigrations applications
uv run ruff check src/applications
```
