# Fase 4 — Foto profissional + polimento UI + relatório acadêmico + apresentação

**Status:** 🔲 Pendente
**Pré-requisitos:** Fases 1, 2, 3 ✅ (todo o produto core funcional)

## Contexto

As 3 fases anteriores entregaram o produto. Esta fase entrega:
- O **extra** previsto no PDF original (foto profissional gerada por IA — primeira coisa na lista de corte se atrasar).
- **Polimento** da UI cross-domain — loading states, empty states, error messages, animações suaves, mensagens em pt-BR consistentes.
- **Entregáveis acadêmicos** — relatório técnico cobrindo problema, arquitetura multi-agente, escolha de modelos, métricas, limitações, trabalhos futuros + roteiro de demo + slides.

É a fase onde o projeto deixa de ser código funcional e vira **projeto demonstrável e defensável**. Sem ela, o trabalho técnico fica desperdiçado na apresentação.

## Outcome esperado

Ao fim da fase:

1. Usuário em `/profile` faz upload de uma foto base (selfie, qualquer formato JPG/PNG até 5MB).
2. Sistema redimensiona pra 1024x1024, envia pra API de geração de imagem com prompt "professional headshot, business suit, neutral background, LinkedIn style".
3. Foto gerada salva no MinIO, retornada via URL assinada (TTL 1h).
4. Frontend mostra antes/depois lado-a-lado.
5. **UX cross-domain** revisado: spinners em toda chamada async, mensagens de erro claras em pt-BR, empty states em listas vazias, skeletons em loading inicial, notificações de sucesso/erro consistentes via Mantine `notifications`.
6. **Documentação acadêmica** completa em `docs/relatorio-academico.md` + `docs/apresentacao/`.

## Escopo

### Faz parte

- Integration nova `backend/src/integrations/image/` com cliente pra OpenAI gpt-image-1 (default) ou Replicate (alternativa).
- Estender `backend/src/accounts/`:
  - Campo `professional_photo` (FileField com storage MinIO) e `base_photo` (FileField) em `CandidateProfile`.
  - Use case `accounts.use_cases.generate_professional_photo.GenerateProfessionalPhoto`.
  - Task Celery `accounts.tasks.generate_professional_photo_task` — async porque imagem leva ~15-30s.
  - Endpoint `POST /api/v1/accounts/me/photo/` (upload base) + `POST /api/v1/accounts/me/photo/generate/` (dispara task, retorna task_id) + `GET /api/v1/accounts/me/photo/status/` (polling).
- Setup MinIO bucket `sieve-artifacts` (já em `.env.example` da Fase 0) — criar via `integrations/storage/` se ainda não estiver inicializado em runtime.
- Frontend domain `frontend/src/domains/profile/`:
  - `ProfilePage` com upload + preview side-by-side + status (polling).
- **Polimento UI cross-domain**:
  - Auditoria de toda página (chat, resume, matching, applications, profile).
  - Adicionar Mantine `LoadingOverlay` em chamadas async demoradas.
  - Adicionar `Skeleton` em listas em loading inicial.
  - Adicionar empty states com CTA (ex: "Nenhum currículo ainda. Inicie uma conversa!").
  - Padronizar notificações de erro/sucesso via `notifications.show()`.
  - Revisar mensagens em pt-BR (sem chamada hardcoded em inglês).
- **README atualizado** com screenshots de cada feature principal (criar pasta `docs/screenshots/` se necessário).
- **Relatório acadêmico** em `docs/relatorio-academico.md` (~10-15 páginas A4 markdown), cobrindo:
  1. Problema e motivação
  2. Stack e justificativa
  3. Arquitetura multi-agente (referenciar ADR 0002)
  4. Knowledge base como insumo de treinamento (referenciar ADR 0003 + conceitos-fundamentais)
  5. Embeddings e retrieval semântico
  6. Pipeline Celery (writer → reviewer → judge)
  7. Matching ATS e guardrails contra fabricação
  8. Métricas: tokens consumidos, cache hit rate, latência por fase, scores médios da rubrica em N runs
  9. Limitações conhecidas
  10. Trabalhos futuros
- **Apresentação** em `docs/apresentacao/`:
  - `roteiro-demo.md` — sequência de cliques pra demo de 5min cobrindo: login → chat → geração → preview/score → PDF → match → otimização → kanban → foto.
  - `slides.md` (ou link Google Slides + checked-in PDF) — 15-20 slides.

### NÃO faz parte

- Tudo que sobrou pra "trabalhos futuros" no relatório (vai documentado, não implementado):
  - Streaming SSE token-a-token
  - Autocrítica iterativa do reviewer (loop com judge até score > X)
  - Múltiplos templates de PDF customizáveis
  - LinkedIn integration (importar perfil)
  - Sugestão automática de vagas
  - Multi-language (en-US além de pt-BR)
  - SSO

## Decisões a tomar (com defaults sugeridos)

| Decisão | Default | Trade-off |
|---|---|---|
| Provider de imagem | OpenAI gpt-image-1 | Acesso mais simples (1 API key); Replicate tem mais variedade mas mais setup |
| Formato aceito de foto base | JPG/PNG, max 5MB | Validar via DRF serializer + Pillow |
| Redimensionamento | 1024x1024, center crop | Standard pra APIs de imagem |
| Storage MinIO | Bucket `sieve-artifacts`, subpath `professional-photos/{user_id}/{photo_id}.png` | Mantém isolation por user |
| URL assinada | TTL 1h | Suficiente pra usuário ver/baixar |
| Polling de status | TanStack `refetchInterval: 3000` enquanto status=`generating` | Imagem demora 15-30s |
| Política de retentativa | 1 retry em caso de erro da API; depois desiste e mostra erro | Imagem custa $; não vale martelar |
| Slides format | Markdown convertido pra PDF via reveal-md ou similar | Versionável em git |
| Relatório length | ~10-15 páginas A4 — markdown convertido pra PDF via pandoc na entrega | Padrão acadêmico |

## Arquivos a criar / modificar

### Backend

```
backend/src/integrations/image/
├── __init__.py
├── base.py                       # ImageGenerator ABC + ImageGenError
├── openai_client.py              # OpenAIImageClient.generate(base_image_bytes, prompt) -> bytes
├── factory.py                    # get_image_generator() por settings
├── CLAUDE.md, AGENTS.md
└── tests/
    └── test_openai_client.py     # mock httpx

backend/src/accounts/
├── models.py
│   # Adicionar: base_photo = FileField, professional_photo = FileField, photo_status = CharField (idle|generating|ready|failed)
├── migrations/000X_add_photo_fields.py
├── use_cases/
│   ├── __init__.py
│   ├── upload_base_photo.py      # valida + redimensiona via Pillow + storage MinIO
│   └── generate_professional_photo.py  # chama image API + salva no MinIO
├── tasks.py                      # generate_professional_photo_task
├── api/views.py                  # adicionar PhotoUploadView, PhotoGenerateView, PhotoStatusView
└── tests/
    ├── test_upload_base_photo.py
    └── test_generate_professional_photo.py

backend/src/integrations/storage/
# Já existe — só usar. Se signed URL não estiver implementado, adicionar método get_signed_url(key, ttl)

backend/pyproject.toml             # +Pillow>=11,<12
backend/config/settings/base.py    # +IMAGE_PROVIDER, IMAGE_API_KEY, IMAGE_MODEL
backend/.env.example               # documentar IMAGE_*
```

### Frontend

```
frontend/src/domains/profile/
├── CLAUDE.md, index.ts
├── api/
│   ├── client.ts
│   └── photo.ts                  # uploadBase, generatePhoto, getStatus
├── hooks/
│   ├── useProfile.ts             # GET /me/
│   ├── useUploadBasePhoto.ts
│   ├── useGeneratePhoto.ts       # dispara + polling
├── components/
│   ├── molecules/
│   │   ├── PhotoUploader/        # drag-and-drop
│   │   ├── PhotoPreview/         # antes/depois side-by-side
│   │   └── ProfileForm/          # PATCH /me/
├── pages/
│   └── ProfilePage/
└── types/

frontend/src/router.tsx           # +/profile

# Polimento — passar em todos os domains existentes:
frontend/src/domains/chat/        # auditar empty states, skeletons, notifications
frontend/src/domains/resume/      # idem
frontend/src/domains/matching/    # idem
frontend/src/domains/applications/ # idem
frontend/src/lib/notifications.ts # helper centralizado wrap em mantine notifications (success/error/info)
```

### Documentação

```
docs/
├── relatorio-academico.md        # principal, ~10-15 páginas
├── apresentacao/
│   ├── roteiro-demo.md           # passo-a-passo de 5min
│   ├── slides.md                 # source dos slides
│   └── slides.pdf                # output renderizado
├── screenshots/                  # imagens pra README e relatório
│   ├── chat.png
│   ├── resume.png
│   ├── score.png
│   ├── match.png
│   ├── kanban.png
│   └── photo.png
└── README.md (raiz)              # atualizar com screenshots + link pro relatório
```

## Reuso (não criar — usar)

| Componente | Onde | Como usar |
|---|---|---|
| `CandidateProfile` | `accounts/models.py` (Fase 1) | Adicionar fields |
| `integrations/storage/` | `backend/src/integrations/storage/` | Já existe pra MinIO; possivelmente adicionar `get_signed_url` |
| `KnowledgeLoader` | — | Não aplicável nesta fase (sem agente novo) |
| Mantine `notifications`, `LoadingOverlay`, `Skeleton`, `Empty` (custom) | `@mantine/notifications`, `@mantine/core` | Padronizar em `frontend/src/lib/notifications.ts` |
| TanStack Query polling | TanStack v5 | `useGeneratePhoto` segue mesmo padrão de `useResume` (Fase 2) e `useOptimize` (Fase 3) |
| `apiClient` axios | `domains/auth/api/client.ts` | Upload com `Content-Type: multipart/form-data` |

## Critérios de aceite

### Backend — automatizáveis

- [ ] `accounts.tests.test_upload_base_photo.test_validates_size` — foto > 5MB retorna erro.
- [ ] `accounts.tests.test_upload_base_photo.test_validates_format` — formato não-imagem retorna erro.
- [ ] `accounts.tests.test_upload_base_photo.test_resizes_to_1024` — após upload, file salvo é 1024x1024.
- [ ] `accounts.tests.test_upload_base_photo.test_persists_in_storage` — `professional_photo` field aponta pra key no MinIO.
- [ ] `accounts.tests.test_generate_professional_photo.test_calls_image_api` — mock retorna bytes; persistidos no storage.
- [ ] `accounts.tests.test_generate_professional_photo.test_updates_status_to_ready` — após task, `photo_status="ready"`.
- [ ] `accounts.tests.test_generate_professional_photo.test_api_error_marks_failed` — exception da API → `photo_status="failed"`.
- [ ] `accounts.tests.test_generate_professional_photo.test_one_retry_on_failure` — primeiro 5xx → retry → sucesso.
- [ ] `integrations.image.tests.test_openai_client.test_generates_bytes` — smoke do client com mock.
- [ ] `make test-fast` verde — >=235 testes passando (210 da Fase 3 + ~25 novos).

### Backend — verificáveis manualmente

- [ ] `make migrate` aplica migration de photo fields.
- [ ] Bucket `sieve-artifacts` existe no MinIO (`http://localhost:9001` console).
- [ ] `make ingest-knowledge` continua passando.

### Frontend — automatizáveis

- [ ] `make frontend-typecheck` verde.
- [ ] `make frontend-lint` verde.

### Frontend — verificáveis manualmente

- [ ] `/profile` mostra form de upload + preview da foto base atual + botão "Gerar foto profissional".
- [ ] Upload aceita drag-and-drop e click pra escolher.
- [ ] Após upload, foto base aparece no preview.
- [ ] Botão "Gerar" dispara, mostra spinner, aguarda ~30s.
- [ ] Após pronto, foto profissional aparece ao lado da foto base.
- [ ] **Polimento**: em todas as páginas (chat, resume, matching, applications, profile):
  - Loading inicial mostra `Skeleton` (não tela vazia).
  - Lista vazia mostra empty state com CTA.
  - Erros mostram `notifications.show({color: "red", ...})` consistente.
  - Sucessos mostram `notifications.show({color: "green", ...})` em ações relevantes.
  - Botões em mutation mostram `loading` prop (não permitem double-click).

### Documentação — verificáveis manualmente

- [ ] `docs/relatorio-academico.md` existe e cobre as 10 seções listadas no escopo.
- [ ] Relatório tem >= 8 páginas A4 quando renderizado (pandoc smoke check).
- [ ] `docs/apresentacao/roteiro-demo.md` tem passo-a-passo numerado pra demo de 5min.
- [ ] `docs/apresentacao/slides.md` tem 15-20 slides (separados por `---` se markdown puro).
- [ ] `docs/screenshots/` tem pelo menos 6 PNGs com as telas principais.
- [ ] README raiz atualizado com:
  - Descrição do produto (substituir TODO do template)
  - Screenshots
  - Link pro relatório acadêmico

### Comportamentais (smoke test end-to-end final)

- [ ] Demo de 5min completa sem bugs: login → chat (5 turns, 2 fases) → finalize → aguarda pipeline → preview/score/PDF → match com vaga → otimização → kanban com 2 cards → upload foto base → gerar foto profissional → side-by-side visível.
- [ ] Nenhum erro 500 no console do browser durante a demo.
- [ ] Nenhum erro de tipo no `tsc --noEmit`.

## Verificação end-to-end

```bash
make refresh-venv
make migrate
make test-fast               # 235+ passing

# Smoke completo (demo dry-run)
make dev
# Passar pelo roteiro completo:
# 1. Login → dashboard
# 2. /chat → nova sessão → 5+ turns → finalize
# 3. Espera ~60s → /resumes/{id} visível com score + preview
# 4. Exportar PDF, abrir
# 5. /matching → colar vaga real (LinkedIn) → analyze → optimize
# 6. Volta /resumes/{id} → v3 com keywords
# 7. /applications → criar card → arrastar
# 8. /profile → upload selfie → gerar → ver antes/depois

# Renderizar relatório pra checar paginação
cd docs && pandoc relatorio-academico.md -o relatorio-academico.pdf

# Renderizar slides
# (depende do tooling escolhido: reveal-md, marp, etc)
```

## Riscos / armadilhas

- **API de imagem cara** — gpt-image-1 é >$0.04/imagem. Limitar a 1 geração por minuto por user (rate limit). Documentar custo no relatório como "limitação conhecida".
- **MinIO signed URL** — se `integrations/storage/` ainda não tem helper, precisa adicionar. Sem isso, frontend não consegue ler a foto (bucket privado).
- **Foto base com rosto não detectável** — API pode falhar silenciosamente ou gerar imagem genérica. Fallback: mostrar erro claro "rosto não detectado, tente outra foto".
- **Pillow dependency** — não está no pyproject. Adicionar e `refresh-venv`.
- **Demo trava na hora** — sempre rodar o roteiro completo 1x antes da apresentação. Ter um screencast como backup.
- **Relatório virando filler** — focar nas decisões interessantes (multi-agente sem framework, knowledge base versionada, guardrails) — não ficar descrevendo CRUD óbvio.
- **Polish nunca acaba** — definir hoje quais empty states e error messages são "must" e quais são "nice". Não cair na espiral.
- **Screenshots desatualizando** — tirar todos na mesma sessão, depois de já estar tudo polido. Re-tirar se mudar UI antes da entrega.

## Subagentes recomendados pra delegação

| Trabalho | Subagente | Por quê |
|---|---|---|
| Integration `image/` (OpenAI client) | `integrations-platform` | Padrão httpx + retry |
| Migration + fields novos em `accounts/CandidateProfile`, use case de upload | `django-core` | Owner do app de Fase 1 |
| Task Celery `generate_professional_photo_task` | `celery-orchestration` | Owner de `tasks.py` |
| Tests dos use cases novos | `qa-validation` | Owner de tests |
| Frontend domain `profile/` + polimento UX cross-domain | `frontend-core` | Owner; polimento é trabalho extenso de UX |
| Relatório acadêmico + apresentação + roteiro de demo + screenshots | Orquestrador (você) | Trabalho de comunicação, não de código — concentrar |

## Atualização do plano ao finalizar

Esta é a **última fase**. Ao finalizar:
1. Status → `✅ Done`, `**Entregue em:** YYYY-MM-DD`.
2. Seção "O que ficou pronto" + decisões divergentes + verificação realizada.
3. Atualizar [`fases-implementacao.md`](../fases-implementacao.md): última linha vira `✅ Done`.
4. Considerar marcar este arquivo + os outros como "arquivo histórico" — `docs/planning/fases/` vira referência permanente do que foi feito.
5. Atualizar [`README.md`](../../../README.md) raiz com link pro relatório acadêmico e screenshots — é o que o avaliador acadêmico vai ler primeiro.
