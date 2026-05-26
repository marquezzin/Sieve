# `domains/healthcheck/` — Service checks (exemplo)

## Responsabilidade

- Listar `ServiceCheck`s vindos do backend (`GET /api/v1/healthcheck/checks/`).
- Criar novo check via modal (`POST /api/v1/healthcheck/checks/`).
- Disparar run manual (`POST /api/v1/healthcheck/checks/{id}/run/`) — útil pra validar URL/status sem esperar o intervalo.
- Excluir check com confirmação (`DELETE /api/v1/healthcheck/checks/{id}/`).

Domain de **exemplo**: serve de referência pra novos domains. Pode ser apagado quando o template virar produto real.

## Endpoints consumidos

| Verbo | Path | Função |
|---|---|---|
| GET | `/v1/healthcheck/checks/` | `fetchChecks()` — paginated; o interceptor desembrulha pra `{ results, pagination }` e devolvemos só `results`. |
| POST | `/v1/healthcheck/checks/` | `createCheck(payload)` |
| POST | `/v1/healthcheck/checks/{id}/run/` | `runCheck(id)` — dispara run síncrona, devolve `ServiceCheck` atualizado. |
| DELETE | `/v1/healthcheck/checks/{id}/` | `deleteCheck(id)` |

Toda chamada passa pelo `apiClient` (`@/domains/auth/api/client`). NÃO duplicar axios.

## Hooks públicos (via `index.ts`)

- `useChecks()` — `useQuery` com queryKey `HEALTHCHECK_QUERY_KEY` (`['healthcheck', 'checks']`).
- `useRunCheck()` — `useMutation` que recebe um `ServiceCheck` (precisa do `name` pra notification). Invalida a lista no sucesso.
- `useCreateCheck()` — `useMutation` que recebe `CreateServiceCheckPayload`. Invalida + notification.
- `useDeleteCheck()` — `useMutation` que recebe `ServiceCheck` (mesmo motivo: nome na notification). Invalida + notification.

Toda mutation usa `notifications.show` (Mantine) — verde no sucesso, vermelho no erro.

## Decisões

- **Status → cor**: `STATUS_COLORS` em `@/lib/constants` (`ok: green`, `fail: red`, `unknown: gray`). Mantido lá pra outros domains poderem reusar a mesma paleta de status.
- **Labels pt-BR**: `STATUS_LABELS` mora local em `StatusBadge.tsx` — não vale poluir o `lib/` global enquanto for único consumidor.
- **Mutation recebe entity, não id**: `useRunCheck`/`useDeleteCheck` aceitam `ServiceCheck` inteiro pra ter `name` na notification sem precisar refazer lookup. Se virar problema (entity grande), trocar por `{ id, name }`.
- **Modal de criação não navega** — fecha em sucesso; lista atualiza via `invalidateQueries`. Sem redirect cheio.
- **Paginação**: por enquanto consumimos só `.results` (lista flat). Quando volume justificar, migrar pra `useInfiniteQuery` e expor `pagination` no hook.
- **Confirmação de delete**: `modals.openConfirmModal` (Mantine modals manager) — não rola um custom.

## Layout

```
healthcheck/
├── CLAUDE.md
├── index.ts                                ← barrel
├── api/
│   └── index.ts                            ← fetchChecks, createCheck, runCheck, deleteCheck
├── components/
│   ├── StatusBadge/
│   │   └── StatusBadge.tsx                 ← Badge colorido por status
│   └── CheckFormModal/
│       └── CheckFormModal.tsx              ← modal de criação
├── hooks/
│   ├── useChecks.ts                        ← useQuery + HEALTHCHECK_QUERY_KEY
│   ├── useRunCheck.ts                      ← mutation
│   ├── useCreateCheck.ts                   ← mutation
│   └── useDeleteCheck.ts                   ← mutation
├── pages/
│   └── HealthcheckListPage/
│       └── HealthcheckListPage.tsx         ← lista + ações + modal
└── types/
    └── index.ts                            ← ServiceCheck, ServiceCheckStatus, payload
```
