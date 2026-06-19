# `domains/profile/` — Perfil do candidato

## Responsabilidade

- Ler e **editar** o `CandidateProfile` do usuário autenticado (`/me/`).
- A `ProfilePage` é um **porte fiel do protótipo** (`prototipo/src/profile.jsx`,
  `ProfileScreen`): eyebrow "Sua conta" + título "Perfil", grid responsivo de 2
  colunas, card de dados editável (esquerda) e card de foto profissional
  (direita).
- A foto profissional (`PhotoStudio`) é **funcional**: upload de selfie base,
  disparo da geração assíncrona (server-side/Celery) e polling do resultado, com
  as fases upload → preview → generating → result → failed derivadas do estado
  real (`PhotoState`).

A geração/edição do currículo não é aqui — isso é outro domain.

## Endpoints consumidos

| Verbo | Path | Função |
|---|---|---|
| GET | `/v1/accounts/me/` | `getMe()` — perfil do `request.user`. |
| PATCH | `/v1/accounts/me/` | `updateMe(payload)` — atualiza os campos editáveis. |
| POST | `/v1/accounts/me/photo/` | `uploadBasePhoto(file)` — multipart, campo `photo`. |
| POST | `/v1/accounts/me/photo/generate/` | `generatePhoto()` — dispara a geração. |
| GET | `/v1/accounts/me/photo/status/` | `getPhotoStatus()` — alvo do polling. |

As URLs `/media/...` do `PhotoState` são servidas pelo backend e usadas direto em
`<Image src>`. O proxy do Vite encaminha `/media` (além de `/api`) ao backend.

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

Hooks da foto (consumidos pelo `PhotoStudio`, não exportados no barrel):

- `usePhotoStatus()` — `useQuery`, key `['profile','photo']` (`PROFILE_PHOTO_KEY`).
  **Polling** enquanto `photo_status === 'generating'`
  (`isGeneratingPhoto(q.state.data?.photo_status) ? 2500 : false`) — espelha o
  `useResume`. NUNCA expira por conta própria (geração server-side pode demorar no
  cold start da API externa).
- `useUploadBasePhoto()` — `useMutation(File)`; no sucesso `setQueryData` no
  cache da foto + toast verde `Foto enviada`; erro → toast vermelho.
- `useGeneratePhoto()` — `useMutation`; no sucesso `setQueryData` (status vira
  `generating`, o `usePhotoStatus` assume o polling) + invalida a key. **Sem
  toast de sucesso** (sucesso real é virar `ready`); erro → toast vermelho.

## Decisões

- **Editável (form)** — `@mantine/form` (`mode: 'uncontrolled'`), nunca
  react-hook-form. Botão "Salvar alterações" só habilita quando o form está
  `dirty`; vira "Salvando…" com `loading` durante o PATCH. Após sucesso,
  `resetDirty` recoloca o botão em estado limpo.
- **Remount por `updated_at`** — o `ProfileForm` recebe `key={profile.updated_at}`
  para recalibrar `initialValues`/dirty quando o servidor devolve um perfil novo,
  evitando `useEffect` de sincronização.
- **Foto profissional** — `PhotoStudio` deriva a fase do `PhotoState` real (não
  de `useState` desconectado): sem `base_photo_url` → upload (dropzone
  drag-and-drop + `<input type=file accept=image/*>`); com base + `idle`/`failed`
  → preview (foto base + "Trocar foto"/"Gerar foto profissional", alerta discreto
  no `failed`); `generating` → spinner + copy de cold-start + `Progress` animated,
  sem botões; `ready` + `professional_photo_url` → grid Antes/Depois + "Gerar de
  novo"/"Baixar". Validação client antes de subir (≤ 5 MB, `image/*`); o backend
  revalida. Download via `<a download>` a partir da `professional_photo_url`.
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
│   ├── index.ts                          ← getMe, updateMe
│   └── photo.ts                          ← uploadBasePhoto, generatePhoto, getPhotoStatus
├── components/
│   ├── ProfileAvatar/                    ← iniciais + gradiente terracota
│   └── PhotoStudio/                      ← upload → preview → generating → result → failed
├── hooks/
│   ├── queryKeys.ts                      ← PROFILE_ME_KEY, PROFILE_PHOTO_KEY
│   ├── useMe.ts
│   ├── useUpdateMe.ts                    ← PATCH + notificação
│   ├── usePhotoStatus.ts                 ← polling enquanto generating
│   ├── useUploadBasePhoto.ts             ← upload + notificação
│   └── useGeneratePhoto.ts               ← dispara geração
├── pages/
│   └── ProfilePage/
│       ├── ProfilePage.tsx               ← header + grid + form editável + placeholder
│       └── index.ts
└── types/
    └── index.ts                          ← CandidateProfile, CandidateProfileUpdate,
                                             PhotoState, PhotoStatus, isGeneratingPhoto
```
