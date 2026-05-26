# healthcheck — app exemplo

App de referência viva do padrão Synapta. Monitora endpoints HTTP via
`integrations/fetcher/`. Mostra o caminho completo de uma feature: model →
selector → use case → serializer → viewset → admin → urls.

> **Em conflito com `backend/CLAUDE.md`, esse arquivo perde.**

## Responsabilidade

- Cadastrar/listar/editar/remover `ServiceCheck` (endpoint HTTP a monitorar).
- Disparar **manualmente** uma checagem (`POST .../{id}/run/`) que faz GET na
  URL e atualiza `last_status`, `last_status_code`, `last_checked_at`.
- **NÃO** faz scheduling automático — fica pra Celery beat numa rodada futura
  (`celery-orchestration` cuida disso quando chegar).

## Modelo: `ServiceCheck`

| Field              | Tipo                       | Default            | Obs                                  |
|--------------------|----------------------------|--------------------|--------------------------------------|
| `id`               | UUID v7 (de `BaseModel`)   | auto               | PK                                   |
| `created_at`       | DateTime (de `BaseModel`)  | auto               |                                      |
| `updated_at`       | DateTime (de `BaseModel`)  | auto               |                                      |
| `name`             | CharField(120)             | —                  | Rótulo humano                        |
| `url`              | URLField                   | —                  | Validado pelo Django                 |
| `expected_status`  | PositiveSmallIntegerField  | 200                | Validators: 100 ≤ x ≤ 599            |
| `interval_seconds` | PositiveIntegerField       | 300                | Lido pelo scheduler futuro           |
| `is_active`        | BooleanField               | True               | Run lança erro se `False`            |
| `last_checked_at`  | DateTimeField (null+blank) | None               | Atualizado por `RunCheck`            |
| `last_status`      | CharField(10) choices      | `unknown`          | `unknown` / `ok` / `fail`            |
| `last_status_code` | PositiveSmallIntegerField  | None               | HTTP code da última run              |
| `last_error`       | TextField (blank)          | `""`               | Mensagem da exceção em caso de FAIL  |

`__str__`: `"{name} ({url})"`. `Meta.ordering = ["-id"]` (UUID v7 cronológico).

## Endpoints

| Método | Path                                             | Ação                          |
|--------|--------------------------------------------------|-------------------------------|
| GET    | `/api/v1/healthcheck/checks/`                    | Lista (paginated)             |
| POST   | `/api/v1/healthcheck/checks/`                    | Cria                          |
| GET    | `/api/v1/healthcheck/checks/{id}/`               | Detalhe                       |
| PATCH  | `/api/v1/healthcheck/checks/{id}/`               | Atualiza                      |
| DELETE | `/api/v1/healthcheck/checks/{id}/`               | Remove                        |
| POST   | `/api/v1/healthcheck/checks/{id}/run/`           | Dispara `RunCheck` manual     |

Filtros (query params): `?is_active=true`, `?last_status=ok`, `?search=foo`,
`?ordering=-last_checked_at`.

## Use cases

- **`RunCheck.execute(*, check_id)`** — busca check ativo, faz GET via
  `Fetcher`, classifica OK/FAIL pela comparação `status_code == expected_status`,
  persiste com `update_fields`.

## Selectors

- `get_check_by_id(*, check_id)` → `ServiceCheck` (levanta `NotFoundError`).
- `list_active_checks()` → `QuerySet[ServiceCheck]`.

## Decisões

- **URL validada** no field (`URLField` do Django). Sem validação custom.
- **`expected_status`** restrito a HTTP válido (100–599) via
  `MinValueValidator`/`MaxValueValidator` — pega erro de digitação cedo.
- **`RunCheck` não roda check inativo** — levanta `ApplicationError` (400). A
  alternativa silenciosa esconde bug de cliente que tenta rodar check pausado.
- **HTTP via `integrations/fetcher/`**, nunca `httpx` direto. Permite trocar
  pra `PlaywrightFetcher` no futuro sem mexer no use case.
- **Sem método `is_currently_failing()` no model** — lógica fica em selector
  ou use case (regra dura do `backend/CLAUDE.md`).
