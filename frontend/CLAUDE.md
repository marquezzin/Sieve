# `frontend/` — Vite + React 19 + Mantine v9

App SPA do Sieve. Stack segue o [ADR 0001](../docs/decisions/0001-stack-padrao.md) (padrão Synapta).

## Stack

- **Vite 8** — bundler/dev server (HMR).
- **React 19.2** — runtime.
- **TypeScript 6** strict — sem `any`, `unknown` + narrow.
- **Mantine v9** — UI lib (core + form + hooks + modals + notifications). Imports SEMPRE do root: `from '@mantine/core'`. Nunca subpath.
- **TanStack Query v5** — server state (cache, refetch, mutations).
- **React Router v7** — `createBrowserRouter` + `RouterProvider`. `React.lazy` em todas as pages.
- **axios 1.15** — HTTP client. Toda call passa pelo `apiClient` único em `domains/auth/api/client.ts`.
- **pnpm 10** — package manager. Jamais npm/yarn.

## Comandos

```bash
# direto
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # tsc -b && vite build → dist/
pnpm preview
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint --max-warnings 0

# via Make (root do repo)
make frontend-typecheck
make frontend-lint
```

Vite proxy em dev: `/api` → `http://backend:8000` (compose service `backend`). Em produção, sirva via nginx proxy ou aponte `VITE_API_BASE_URL`.

## Layout

```
src/
├── main.tsx                    ← bootstrap: providers + RouterProvider
├── router.tsx                  ← createBrowserRouter + lazy routes
├── vite-env.d.ts
├── lib/
│   ├── queryClient.ts          ← QueryClient (staleTime 60s, retry 1)
│   ├── constants.ts            ← chaves storage, mapas de cor
│   ├── formatters.ts           ← formatDate / formatRelative pt-BR
│   └── types.ts                ← PaginatedResponse, Pagination
├── components/
│   ├── atoms/                  ← Button, Badge wrappers etc — SEM domain logic
│   ├── molecules/              ← compostos visuais — SEM domain logic
│   └── templates/              ← AppShellTemplate (chrome do app autenticado)
├── pages/                      ← pages NÃO atreladas a domain (Dashboard, 404)
└── domains/
    ├── auth/                   ← login, JWT, apiClient único, ProtectedRoute
    │   ├── CLAUDE.md
    │   ├── index.ts            ← barrel público
    │   ├── api/{client,config,index}.ts
    │   ├── components/ProtectedRoute/
    │   ├── hooks/{useLogin,useLogout}.ts
    │   ├── pages/LoginPage/
    │   └── types/index.ts
    └── <novo-domain>/          ← seguir mesmo layout (api/, hooks/, components/, pages/, types/)
```

## Fidelidade ao protótipo (REGRA DE CONSTRUÇÃO)

**Toda tela nova é construída como um porte fiel do protótipo em [`../prototipo/`](../prototipo/).**
O protótipo é a referência visual canônica (handoff `sieve-v2`, exportado do
Claude Design). Antes de criar/alterar qualquer page ou componente visual:

1. Abra a tela equivalente em `prototipo/src/` (`login.jsx`, `dashboard.jsx`,
   `chat.jsx`, `resumes.jsx`, `jobs.jsx`, `kanban.jsx`, `profile.jsx`) e os
   átomos compartilhados em `prototipo/src/ui.jsx` (`Page`, `PageHeader`, `Card`,
   `Button`, `Avatar`, `Field`, `Input`, `SectionLabel`, `Badge`, `Modal`,
   `Tabs`, `EmptyState`, `ScoreGauge`…) + `prototipo/src/icons.jsx`.
2. **Porte para Mantine v9** — o protótipo é HTML/Tailwind; não copie classes.
   Reproduza layout, hierarquia, espaçamento, tipografia e os estados (loading /
   vazio / erro / sucesso) usando componentes e props Mantine. Mapeamento usual:
   `Card`→`Paper withBorder radius`, `Field`→`TextInput`/`Textarea` com label,
   `Button`→`Button color="terracotta"`, `Badge`→`Badge`, `Page`→conteúdo direto
   (o `AppShellTemplate` via `ProtectedRoute` já dá o chrome).
3. **A IDV já está no tema** (`src/main.tsx`): paleta `terracotta` (`#cf5530`),
   `gray` neutra quente, fontes Bricolage Grotesque / Hanken Grotesk / JetBrains
   Mono. Use os tokens do tema — **não** hardcode hex (exceto gradientes que o
   protótipo usa explicitamente, ex. o gradiente do avatar).
4. **Ícones**: porte de `prototipo/src/icons.jsx` para `@/components/atoms/Icon`
   (SVG inline). Nunca adicione lib de ícones por causa de um ícone só.
5. Referência viva já portada: `domains/chat/` e `domains/profile/` — siga o
   mesmo idioma de porte.

Regra do escopo: **na construção inicial, obedeça o protótipo fielmente.**
Refatoração/melhoria vem depois, deliberada — não improvise um layout diferente
"porque ficou mais fácil". Se uma parte da tela pertence a uma fase futura (ex.:
a foto profissional do `profile.jsx` é Fase 4), renderize um **placeholder claro
e inerte** com o chrome do protótipo, marcado "Em breve · Fase N" — mantém a
fidelidade do layout sem puxar escopo de outra fase.

## Atomic design (curto)

- **atoms** — primitivo visual sem lógica de negócio (`StatusBadge`, `IconButton`).
- **molecules** — combinação de atoms (`SearchBar`, `StatCard`).
- **templates** — layout de página (`AppShellTemplate`). Recebe `children`, **nunca** dado real.
- **pages** — vivem em `domains/<x>/pages/` (page do domain) ou `src/pages/` (page transversal). Compõem template + dados via hooks.

## Domains por intenção

Um Django app pode virar 1, 2 ou 0 domains. Critério: **o que o usuário quer fazer**, não o modelo Django. Mapping atual no [`CLAUDE.md` raiz](../CLAUDE.md).

Layout obrigatório de cada domain:

```
<domain>/
├── CLAUDE.md             ← contrato (responsabilidade, regras, hooks públicos)
├── index.ts              ← barrel — só o que é público
├── api/                  ← funções que falam com backend (usa apiClient)
├── components/           ← visuais específicos do domain
├── hooks/                ← useQuery/useMutation wrappers (NUNCA usar em page direto)
├── pages/                ← pages do domain
└── types/                ← interfaces/tipos do domain
```

## API contract

- Backend devolve envelope `{ success, data, pagination? }`. O `apiClient` desembrulha:
  - sem `pagination` → response.data = `data`
  - com `pagination` → response.data = `{ results: data, pagination }`
- Use `PaginatedResponse<T>` (`@/lib/types`) pra listagens.
- Campos JSON em `snake_case` (espelha Django/DRF). Nunca camelCase em DTO.

## Auth/JWT

- Tokens em `localStorage` — `syn_access` + `syn_refresh`.
- `apiClient` injeta `Authorization: Bearer` em toda request.
- 401 → refresh silencioso via `/api/v1/token/refresh/`. `refreshPromise` singleton evita race.
- Falha no refresh → limpa storage + redirect `/login`.
- **Login NÃO usa apiClient** — `axios.post` cru pra evitar loop com interceptor (ver `domains/auth/CLAUDE.md`).

## Routing

- `createBrowserRouter` em `src/router.tsx`.
- `React.lazy` em toda page + `<Suspense>` com `<Loader />` Mantine.
- Rotas autenticadas ficam dentro do element `<ProtectedRoute />`. Subárvore renderiza `<AppShellTemplate><Outlet /></AppShellTemplate>`.
- `/login` é fora do guard.

## Mantine

- Provider com `createTheme({ primaryColor: 'indigo' })`.
- Notifications + Modals provider montados no `main.tsx`.
- CSS imports em `main.tsx`: `@mantine/core/styles.css`, `@mantine/notifications/styles.css`.
- Forms: **`@mantine/form`** sempre. Nunca `react-hook-form`.
- Style: usar Mantine props (`<Text c="dimmed" fz="sm">`), não `style={{}}`. Pra px → `rem()` da Mantine.

## TypeScript strict

- `strict: true` + `noUnusedLocals` + `noUnusedParameters` + `noFallthroughCasesInSwitch`.
- Path alias `@/*` → `src/*` (config em `tsconfig.app.json`).
- Sem `any`. Use `unknown` e narrow.
- Sem campos camelCase em DTO de API.

## Stop list

- **Nunca** `npm`/`yarn` — só `pnpm`.
- **Nunca** raw `fetch`/`axios` fora de `domains/auth/api/` (login é a única exceção documentada).
- **Nunca** cross-domain import (`domains/x` → `domains/y`).
- **Nunca** `useQuery` direto numa page — sempre via hook do domain.
- **Nunca** subpath import Mantine (`@mantine/core/Button`).
- **Nunca** layout em page; nunca dado real em template.
- **Nunca** `any`.
