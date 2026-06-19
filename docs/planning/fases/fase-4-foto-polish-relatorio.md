# Fase 4 — Foto profissional (API externa) + polimento de UI

**Status:** ✅ Done
**Entregue em:** 2026-06-19
**Pré-requisitos:** Fases 1, 2, 3 ✅ (todo o produto core funcional)

> **O que ficou pronto.** Foto profissional via API externa (integration
> `headshot/` com wake-up de cold-start, task Celery, endpoints upload/generate/
> status, storage padrão do Django) + PhotoStudio no frontend (upload → preview →
> generating sem expirar → antes/depois) + polimento de UI cross-domain (helper
> `lib/notifications.ts`, átomo `EmptyState`, `onError` faltante no matching,
> padronização de notificações). Gates: `make test-fast` **257 passed, 1
> skipped**; frontend `typecheck` + `lint` limpos. **Pendente (manual, exige a
> stack + worker rodando):** smoke ponta-a-ponta real contra o Render no
> `/profile`. A auditoria de UX achou os 5 domains já majoritariamente em
> conformidade com os 5 "must" — só lacunas reais foram tocadas.

> **Mudança de escopo (2026-06-19).** Esta fase foi reduzida e redirecionada a
> pedido do usuário:
> - A foto profissional **não é mais gerada do zero** (OpenAI gpt-image-1 /
>   Replicate). Passa a consumir uma **API externa dedicada** já pronta
>   (`curriculo-headshot-api`, hospedada no Render) — ver [`../../../api_foto.md`](../../../api_foto.md).
> - **MinIO removido do escopo.** A foto base e a gerada são salvas com o
>   **storage padrão do Django** (filesystem / `MEDIA_ROOT`), servidas via
>   `/media/`. Sem bucket, sem signed URL.
> - **Relatório acadêmico e apresentação saíram do escopo** desta fase (movidos
>   para "NÃO faz parte"). Entrega = **foto profissional + polimento de UI**.

## Contexto

As 3 fases anteriores entregaram o produto. Esta fase entrega:
- O **extra** previsto no PDF original (foto profissional), agora via integração
  com uma API externa de headshot.
- **Polimento** da UI cross-domain — loading states, empty states, error
  messages, notificações consistentes em pt-BR.

## A API externa de headshot

Documentação completa em [`api_foto.md`](../../../api_foto.md). Resumo do contrato:

- Base URL: `https://curriculo-headshot-api.onrender.com`
- `GET /health` → `{"status":"ok"}` (sem auth).
- `POST /generate-headshot` — header `x-api-key`, body `multipart/form-data`
  campo `photo` (até 10MB). Sucesso `200`:
  `{ "image": { "mimeType": "image/png", "data": "<base64>" } }`.
- Erros: `400` (sem photo / não-imagem / >10MB), `401` (x-api-key), `502` (falha
  na geração).

**Premissa crítica — cold-start do Render.** O tier free "dorme" após
inatividade; a primeira chamada pode levar 30-50s. O requisito do usuário é que
a experiência **fique carregando até realmente devolver**, sem degradar. Solução
implementada:
- A geração roda **server-side numa task Celery** (não bloqueia o request HTTP).
- O client **acorda o servidor** via `GET /health` (timeout longo, com backoff)
  antes do `POST /generate-headshot`.
- O frontend faz **polling do status** enquanto `photo_status === 'generating'`
  e **nunca expira** — o estado "Gerando…" fica visível o tempo inteiro.

## Outcome esperado

Ao fim da fase:

1. Usuário em `/profile` faz upload de uma foto base (selfie JPG/PNG até 5MB).
2. Clica em "Gerar foto profissional" → dispara a task Celery.
3. O backend acorda a API externa (se dormindo) e gera o headshot; a foto é
   salva com o storage padrão do Django e servida via `/media/`.
4. Frontend mostra **antes/depois** lado-a-lado.
5. **UX cross-domain** revisado: skeletons no loading inicial, empty states com
   CTA em listas vazias, notificações de sucesso/erro consistentes via Mantine
   `notifications`, botões de mutation com `loading`.

## Escopo

### Faz parte

- Integration nova `backend/src/integrations/headshot/` — client httpx para a API
  externa, com wake-up via `/health`, retry em 5xx/rede, provider `fake` offline
  pra testes.
- Estender `backend/src/accounts/`:
  - Campos `base_photo` (ImageField), `professional_photo` (ImageField) e
    `photo_status` (`idle|generating|ready|failed`) em `CandidateProfile`.
  - Use cases `accounts.use_cases.upload_base_photo.UploadBasePhoto` e
    `accounts.use_cases.generate_professional_photo.GenerateProfessionalPhoto`.
  - Task Celery `accounts.tasks.generate_professional_photo_task` (async — a
    chamada externa + cold-start pode levar minutos).
  - Endpoints `POST /api/v1/accounts/me/photo/` (upload base) +
    `POST /api/v1/accounts/me/photo/generate/` (dispara task, 202) +
    `GET /api/v1/accounts/me/photo/status/` (polling).
- Storage: **default do Django** (`MEDIA_ROOT` / filesystem). `MEDIA_URL=/media/`
  servido em DEBUG via `static(...)`; `/media` adicionado ao proxy do Vite.
- Frontend domain `frontend/src/domains/profile/`:
  - `PhotoStudio` (substitui o placeholder): upload (drag-and-drop) → preview →
    generating → result (antes/depois) → error, derivado do estado real.
  - Hooks `usePhotoStatus` (polling), `useUploadBasePhoto`, `useGeneratePhoto`.
- **Polimento UI cross-domain**:
  - Helper `frontend/src/lib/notifications.ts` (`notifySuccess/notifyError/notifyInfo`).
  - Átomo `EmptyState` reutilizável (porte do protótipo).
  - Auditoria de chat, resume, matching, applications, profile: skeletons em
    loading inicial, empty states com CTA, erros/sucessos via notifications,
    botões de mutation com `loading`.

### NÃO faz parte

- **Geração de imagem do zero** (OpenAI gpt-image-1 / Replicate) — substituída
  pela API externa.
- **MinIO / signed URLs** — storage padrão do Django.
- **Relatório acadêmico** (`docs/relatorio-academico.md`) e **apresentação**
  (`docs/apresentacao/`, slides, roteiro de demo, screenshots) — fora do escopo
  desta entrega.
- Trabalhos futuros documentados (não implementados): streaming SSE, autocrítica
  iterativa do reviewer, múltiplos templates de PDF, LinkedIn integration,
  sugestão automática de vagas, multi-language, SSO.

## Decisões tomadas

| Decisão | Escolha | Observação |
|---|---|---|
| Geração da foto | **API externa** `curriculo-headshot-api` (Render) | Pronta; preserva identidade; terno + fundo neutro + estúdio. |
| Cold-start do Render | Wake via `GET /health` no client + task Celery + polling sem expiração no front | "Fica carregando até devolver" sem travar o request HTTP. |
| Storage | **Default do Django** (filesystem `MEDIA_ROOT`) | Sem MinIO. `MEDIA_URL=/media/`, servido em DEBUG, proxiado pelo Vite. |
| Formato/tamanho da foto base | JPG/PNG/WEBP, max 5MB | Validado no use case + no client (UX imediata). |
| Redimensionamento | **Não** redimensiona no backend | A API externa já devolve 1024×1024. |
| Polling de status | TanStack `refetchInterval: 2500` enquanto `generating` | Espelha `useResume` da Fase 2. |
| Retry | 1 retry em 5xx/rede no client; depois marca `failed` | Imagem custa $; não martelar. |
| Provider em teste | `fake` (PNG mínimo, offline) via `os.environ` no `test.py` + DI nos testes | Nunca bate na API real. |

## Arquivos criados / modificados

### Backend

```
backend/src/integrations/headshot/
├── __init__.py
├── base.py                         # HeadshotClient ABC + HeadshotError
├── render_client.py                # RenderHeadshotClient (wake /health + POST + retry)
├── fake_client.py                  # FakeHeadshotClient + MINIMAL_PNG_BYTES
├── factory.py                      # get_headshot_client() por HEADSHOT_* (decouple)
├── CLAUDE.md
└── tests/
    ├── __init__.py
    ├── conftest.py                 # no-op do autouse _clear_cache (igual embeddings)
    └── test_render_client.py       # httpx.MockTransport — wake/generate/401/5xx/parse

backend/src/accounts/
├── models.py                       # + base_photo, professional_photo, photo_status
├── migrations/0003_candidateprofile_base_photo_and_more.py
├── use_cases/upload_base_photo.py
├── use_cases/generate_professional_photo.py
├── tasks.py                        # generate_professional_photo_task (soft_time_limit=480)
├── api/serializers.py              # PhotoStatusSerializer + campos no CandidateProfileSerializer
├── api/views.py                    # PhotoUploadView, PhotoGenerateView, PhotoStatusView
├── api/urls.py                     # me/photo/, me/photo/generate/, me/photo/status/
└── tests/
    ├── test_upload_base_photo.py
    ├── test_generate_professional_photo.py
    └── test_photo_api.py

backend/config/settings/base.py     # + HEADSHOT_*; MEDIA_URL "media/" → "/media/"
backend/config/settings/test.py     # os.environ HEADSHOT_PROVIDER=fake; MEDIA_ROOT tmpdir
backend/config/urls.py              # static(MEDIA_URL, ...) em DEBUG
backend/pyproject.toml              # + pillow>=11,<12 (já transitivo do weasyprint)
.env / .env.example                 # bloco HEADSHOT_*
```

### Frontend

```
frontend/src/domains/profile/
├── api/photo.ts                    # uploadBasePhoto, generatePhoto, getPhotoStatus
├── hooks/usePhotoStatus.ts         # refetchInterval enquanto generating
├── hooks/useUploadBasePhoto.ts
├── hooks/useGeneratePhoto.ts
├── components/PhotoStudio/PhotoStudio.tsx   # substitui PhotoStudioPlaceholder
├── types/index.ts                  # + PhotoState, PhotoStatus, isGeneratingPhoto
├── hooks/queryKeys.ts              # + PROFILE_PHOTO_KEY
└── pages/ProfilePage/ProfilePage.tsx

frontend/vite.config.ts             # + proxy /media
frontend/src/lib/notifications.ts   # notifySuccess/notifyError/notifyInfo (polimento)
frontend/src/components/molecules/EmptyState/  # átomo de empty state (polimento)
frontend/src/domains/{chat,resume,matching,applications}/  # auditoria de UX (polimento)
```

## Critérios de aceite

### Backend — automatizáveis

- [x] `accounts.tests.test_upload_base_photo` — valida tamanho (>5MB), formato
  (não-imagem), persistência da base, reset da profissional ao trocar a base.
- [x] `accounts.tests.test_generate_professional_photo` — chama o client e
  persiste; `photo_status="ready"` no sucesso; `HeadshotError` → `failed` +
  re-raise; sem base → `ApplicationError`.
- [x] `accounts.tests.test_photo_api` — endpoints de upload/generate/status.
- [x] `integrations.headshot.tests.test_render_client` — wake+generate, 401,
  retry em 5xx, parse malformado.
- [x] `make test-fast` verde — **257 passed, 1 skipped** (33 testes novos).

### Backend — verificáveis manualmente

- [x] `make migrate` aplica a migration de photo fields.
- [ ] Geração real ponta-a-ponta contra a API do Render (smoke com a stack
  rodando) — opcional; a API já foi validada isoladamente (ver `api_foto.md`).

### Frontend — automatizáveis

- [x] `pnpm typecheck` verde.
- [x] `pnpm lint` verde.

### Frontend — verificáveis manualmente

- [ ] `/profile` mostra upload + preview + botão "Gerar foto profissional".
- [ ] Upload aceita drag-and-drop e click.
- [ ] "Gerar" dispara, mostra estado de carregamento e **não expira** durante o
  cold-start; ao ficar pronto, mostra antes/depois.
- [ ] **Polimento** em chat/resume/matching/applications/profile: skeletons,
  empty states com CTA, notificações consistentes, botões com `loading`.

## Riscos / armadilhas

- **Cold-start do Render** — primeira geração do dia pode levar minutos. Mitigado
  por wake via `/health` + polling sem expiração. Chamar `/health` antes de uma
  demo pra pré-aquecer.
- **API externa fora do ar / 502** — o use case marca `photo_status="failed"`; o
  front mostra erro com CTA pra tentar de novo.
- **Mídia em dev** — `/media` precisa do proxy do Vite e do `static(...)` em
  DEBUG; sem isso o browser não carrega a foto salva no filesystem.
- **Rosto não detectável** — a API pode falhar; tratar como erro claro no front.
- **Polish nunca acaba** — escopo travado nos 5 "must" (skeleton, empty state,
  erro, sucesso, botão loading). Resto é nice-to-have documentado.

## Subagentes usados

| Trabalho | Subagente |
|---|---|
| Integration `headshot/` | `integrations-platform` |
| Model + migration + use cases + API + settings | `django-core` |
| Task Celery | `celery-orchestration` |
| Testes | `qa-validation` |
| Frontend (foto + polimento) | `frontend-core` |

## Atualização do plano ao finalizar

1. Status → `✅ Done`, `**Entregue em:** YYYY-MM-DD`.
2. Resumo do que ficou pronto + decisões divergentes (registradas acima).
3. Atualizar [`fases-implementacao.md`](../fases-implementacao.md).
