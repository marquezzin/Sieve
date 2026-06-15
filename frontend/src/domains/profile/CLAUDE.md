# `domains/profile/` — Perfil do candidato

## Responsabilidade

- Ler e **editar** o `CandidateProfile` do usuário autenticado (`/me/`).
- A `ProfilePage` é um **porte fiel do protótipo** (`prototipo/src/profile.jsx`,
  `ProfileScreen`): eyebrow "Sua conta" + título "Perfil", grid responsivo de 2
  colunas, card de dados editável (esquerda) e card de foto profissional
  (direita).
- A foto profissional é um **placeholder de Fase 4** (inerte) — não há upload nem
  geração de imagem ainda.

A geração/edição do currículo não é aqui — isso é outro domain.

## Endpoints consumidos

| Verbo | Path | Função |
|---|---|---|
| GET | `/v1/accounts/me/` | `getMe()` — perfil do `request.user`. |
| PATCH | `/v1/accounts/me/` | `updateMe(payload)` — atualiza os campos editáveis. |

Toda chamada passa pelo `apiClient` (`@/domains/auth/api/client`). NÃO duplicar axios.
O backend devolve o envelope `{ success, data }`; o `apiClient` desembrulha.

## Campos

- **Somente leitura (display):** `email`, `full_name` — usados no header/avatar do
  card de dados. Não vão no PATCH.
- **Editáveis (PATCH):** `headline`, `location`, `phone`, `linkedin_url`,
  `github_url` (`CandidateProfileUpdate`).

## Hooks públicos (via `index.ts`)

- `useMe()` — `useQuery`, key `['profile','me']` (`PROFILE_ME_KEY`).
- `useUpdateMe()` — `useMutation`; no sucesso semeia/invalida `PROFILE_ME_KEY` e
  dispara a notificação `Perfil salvo` / `Suas informações foram atualizadas.`.

## Decisões

- **Editável (form)** — `@mantine/form` (`mode: 'uncontrolled'`), nunca
  react-hook-form. Botão "Salvar alterações" só habilita quando o form está
  `dirty`; vira "Salvando…" com `loading` durante o PATCH. Após sucesso,
  `resetDirty` recoloca o botão em estado limpo.
- **Remount por `updated_at`** — o `ProfileForm` recebe `key={profile.updated_at}`
  para recalibrar `initialValues`/dirty quando o servidor devolve um perfil novo,
  evitando `useEffect` de sincronização.
- **Foto profissional = Fase 4** — `PhotoStudioPlaceholder` replica o chrome do
  `PhotoStudio` (estado `upload`: dropzone tracejada + ícone) mas é inerte, com
  badge "Em breve · Fase 4".
- **Page sem template** — `ProtectedRoute` já envolve com `AppShellTemplate`; a
  page renderiza só o conteúdo (mesmo padrão do `ChatPage`).
- **Ícones inline** via `@/components/atoms/Icon` (sem lib de ícones extra).
  Adicionados `Check`, `Camera`, `MapPin` ao set.
- **Avatar** com iniciais + gradiente `linear-gradient(135deg,#e07c52,#b8451f)`
  (único hex hardcoded, espelha o `Avatar` do protótipo).
- **Cor de acento** `terracotta` (IDV do produto, tema do `main.tsx`).

## Layout

```
profile/
├── CLAUDE.md
├── index.ts                              ← barrel
├── api/
│   └── index.ts                          ← getMe, updateMe
├── components/
│   ├── ProfileAvatar/                    ← iniciais + gradiente terracota
│   └── PhotoStudioPlaceholder/           ← placeholder inerte (Fase 4)
├── hooks/
│   ├── queryKeys.ts                      ← PROFILE_ME_KEY
│   ├── useMe.ts
│   └── useUpdateMe.ts                    ← PATCH + notificação
├── pages/
│   └── ProfilePage/
│       ├── ProfilePage.tsx               ← header + grid + form editável + placeholder
│       └── index.ts
└── types/
    └── index.ts                          ← CandidateProfile, CandidateProfileUpdate
```
