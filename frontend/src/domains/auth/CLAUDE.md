# `domains/auth/` — Autenticação JWT

## Responsabilidade

- Login (username + password) → recebe `{ access, refresh }` do endpoint `/api/v1/token/`.
- Persistir tokens em `localStorage` (`syn_access`, `syn_refresh`).
- Expor o **único** `apiClient` axios usado pelo app inteiro.
- Refresh silencioso de access token via `/api/v1/token/refresh/`.
- `<ProtectedRoute />` que protege subárvore de rotas autenticadas.
- `useLogout()` que limpa tokens, invalida queries e redireciona pro `/login`.

## O que fica fora

- Cadastro de usuário (não escopado nesse template).
- Recuperação de senha (idem).
- Permissions/RBAC granular (cada domain consome sua API; backend valida).

## Layout

```
auth/
├── CLAUDE.md                            ← este arquivo
├── index.ts                             ← barrel: ProtectedRoute, useLogin, useLogout, types
├── api/
│   ├── client.ts                        ← apiClient único (NÃO duplicar em outro domain)
│   ├── config.ts                        ← API_BASE_URL
│   └── index.ts                         ← login(), logout(), getMe()
├── components/
│   └── ProtectedRoute/
│       └── ProtectedRoute.tsx           ← guard + AppShellTemplate
├── hooks/
│   ├── useLogin.ts                      ← useMutation wrapper
│   └── useLogout.ts                     ← hook que limpa tokens + redirect
├── pages/
│   └── LoginPage/
│       └── LoginPage.tsx                ← form Mantine + useLogin
└── types/
    └── index.ts                         ← LoginCredentials, TokenResponse, AuthUser
```

## Regras duras

- **`apiClient` é singleton** — só `auth/api/client.ts` cria. Todos os outros domains importam de `@/domains/auth/api/client`.
- **Login NÃO usa `apiClient`** — faz `axios.post` cru direto pra `/api/v1/token/`. Motivo: `apiClient` interceptors esperam access token e tratam 401 como "refresh"; numa request de login isso causa loop.
- **Tokens em `localStorage`** — chave `syn_access` e `syn_refresh` (constantes em `@/lib/constants`). Trocar pra cookies httpOnly é mudança de arquitetura, não de domain.
- **Refresh é singleton** (`refreshPromise`) — múltiplos 401s simultâneos compartilham o mesmo refresh em voo.
- **Falha no refresh** → limpa storage + redirect `/login`. Sem retry de retry.
- **Envelope da API**: response interceptor desembrulha `{ success, data, pagination }`. Se `pagination` presente, expõe `{ results, pagination }`. Caso contrário, expõe só `data`.

## Hooks públicos

- `useLogin()` → `useMutation` que recebe `{ username, password }`, salva tokens e navega pro `/`.
- `useLogout()` → função (não query). Limpa tokens, `queryClient.clear()`, navega pro `/login`.

## Por que `ProtectedRoute` está em `components/` e não no router?

`ProtectedRoute` é um componente de **layout autenticado** — cobre auth + chrome (`AppShellTemplate`). O router só compõe rotas; quem decide "tá logado?" é o domain `auth`.
