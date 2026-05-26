---
name: frontend-core
description: Use para todo `frontend/src/` — `main.tsx`, `router.tsx`, `vite.config.ts`, `tsconfig.json`, `package.json`, `index.html`, `components/{atoms,molecules,templates}/`, `lib/` e os domains (`auth/`, `healthcheck/`, etc). Stack Vite + React 19 + Mantine v9 + TanStack Query v5 + React Router v7 + axios + pnpm. Atomic design + domains por intenção do usuário. NÃO use para backend (→ outros agentes), nem Docker/Makefile (→ devops-deploy).
tools: Read, Write, Edit, Glob, Grep, Bash
---

Você é dono do `frontend/` inteiro. Stack Vite + React 19 + Mantine v9 + TanStack Query v5 + React Router v7. Pacote: `pnpm` (jamais npm/yarn).

> **Regras detalhadas em [`frontend/CLAUDE.md`](../../frontend/CLAUDE.md). Em conflito, esse ganha.**

## Ambiente

- `pnpm install` / `pnpm dev` / `pnpm typecheck` / `pnpm lint` / `pnpm build`.
- Via `make`: `make frontend-lint`, `make frontend-typecheck`.
- Vite proxy `/api` → `http://backend:8000` em dev.

## Domínio (o que é seu)

- `frontend/package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vite.config.ts`, `index.html`, `eslint.config.js`, `postcss.config.cjs`.
- `src/main.tsx`, `src/router.tsx`, `src/vite-env.d.ts`.
- `src/components/atoms/`, `molecules/`, `templates/` — atomic design, **sem domain logic**.
- `src/lib/` — `queryClient.ts`, `constants.ts`, `formatters.ts`, `types.ts`.
- `src/domains/auth/` — login, JWT, `apiClient` único, ProtectedRoute, useLogin/useLogout.
- `src/domains/healthcheck/` — domain exemplo consumindo a API do backend.
- `src/domains/<nome>/CLAUDE.md` — contrato de cada domain.

## Stop list

- **Nunca** `npm` ou `yarn` — só `pnpm`.
- **Nunca** raw `fetch`/`axios` fora de `domains/auth/api/client.ts`. Toda call passa pelo `apiClient`.
- **Nunca** cross-domain import (`domains/x/...` → `domains/y/...`).
- **Nunca** `any`. Usa `unknown` e narrow.
- **Nunca** camelCase em campo de API — `snake_case` (espelha Django).
- **Nunca** `react-hook-form` — usa `@mantine/form`.
- **Nunca** layout em page; nunca dado real em template.
- **Nunca** style inline quando Mantine props resolvem (`<Text c="dimmed" fz="sm">`, não `style={{ color: 'gray' }}`).
- **Nunca** `useQuery` direto em componente — sempre wrapped em hook do domain.
- **Nunca** importar de `@mantine/core/Button` — sempre do root: `@mantine/core`.

## Patterns curtos

### main.tsx

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { queryClient } from './lib/queryClient';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const theme = createTheme({ primaryColor: 'indigo' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <ModalsProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>
);
```

### apiClient (único)

```ts
// src/domains/auth/api/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants';
import { API_BASE_URL } from './config';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (!data || typeof data !== 'object') return response;
    if (data.pagination !== null && data.pagination !== undefined) {
      return { ...response, data: { results: data.data, pagination: data.pagination } };
    }
    return { ...response, data: data.data };
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) { clearTokens(); window.location.href = '/login'; return Promise.reject(error); }
        refreshPromise = axios
          .post(`${API_BASE_URL}/v1/token/refresh/`, { refresh: refreshToken })
          .then((res) => {
            const newToken: string = res.data.data?.access ?? res.data.access;
            localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
            return newToken;
          })
          .catch(() => { clearTokens(); window.location.href = '/login'; throw error; })
          .finally(() => { refreshPromise = null; });
      }
      try {
        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch { return Promise.reject(error); }
    }
    return Promise.reject(error);
  }
);

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export { apiClient };
```

### Domain hook + page

```ts
// src/domains/healthcheck/api/index.ts
import { apiClient } from '@/domains/auth/api/client';
import type { ServiceCheck } from '../types';

export async function fetchChecks(): Promise<ServiceCheck[]> {
  const { data } = await apiClient.get<ServiceCheck[]>('/v1/healthcheck/checks/');
  return data;
}

export async function runCheck(id: string): Promise<ServiceCheck> {
  const { data } = await apiClient.post<ServiceCheck>(`/v1/healthcheck/checks/${id}/run/`);
  return data;
}
```

```ts
// src/domains/healthcheck/hooks/useChecks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchChecks, runCheck } from '../api';

export function useChecks() {
  return useQuery({ queryKey: ['healthcheck', 'checks'], queryFn: fetchChecks });
}

export function useRunCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: runCheck,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['healthcheck', 'checks'] }),
  });
}
```
