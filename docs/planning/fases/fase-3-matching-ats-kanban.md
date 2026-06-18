# Fase 3 — Matching semântico + recomendações honestas + Kanban de candidaturas

**Status:** ✅ Done
**Entregue em:** 2026-06-17
**Pré-requisitos:** Fase 2 ✅ (precisa de `ResumeVersion` com `structured_data` pra calcular match)

## Entrega (2026-06-17)

Executada em **sub-fases** (3.1–3.7), com avaliação do usuário entre cada uma.

**Divergência principal — o otimizador ATS foi REMOVIDO** (ver
[ADR 0004](../../decisions/0004-remover-otimizador-curriculo.md)). Em teste real, o
otimizador **fabricou** skills/tech que o candidato não tinha; o guardrail post-hoc
só cobria identidade (empresas/cargos/instituições), não skills/bullets. Em vez de
entrar numa corrida gato-e-rato com o LLM, o produto passou a entregar só a
**análise honesta + recomendações detalhadas** como diferencial. Saíram:
`RunAtsOptimizer`, `OptimizeView`/`POST /matching/optimize/`, a chain Celery do
optimizer, o setting `LLM_MODEL_ATS_OPTIMIZER` e a v3 do João.

**O que ficou pronto:**

- **3.1 — Embedding de `ResumeVersion`**: `VectorField(1024)` + signal `pre_save`
  (recalcula só quando `structured_data` muda, via hash) + `DeterministicEmbeddingsClient`
  (fake offline) + mgmt command `backfill_resume_embeddings`.
- **3.2 — App `matching/`**: `JobPosting` (+ keywords via LLM + embedding) e
  `MatchAnalysis` (score coseno + matched/missing skills + recomendações). Use cases
  `IngestJobPosting` e `ComputeMatch` (cache por par, `?refresh=true`). Frontend
  `domains/matching/` (porte do `jobs.jsx`): análise + detalhe da vaga.
- **3.3 → revertido**: otimizador ATS (entregue e depois removido — ver ADR 0004).
- **Recomendações honestas e detalhadas**: contrato `list[{title, detail, category}]`
  (`realce`/`enfase`/`gap`) — o entregável principal, nunca manda fabricar.
- **3.4–3.6 — Kanban (`applications/`)**: backend (`Application` + `move`) e frontend
  `domains/applications/` (porte do `kanban.jsx`): board com 6 colunas,
  drag-and-drop via `@dnd-kit/core` + optimistic update, modal de criação (com
  "Usar exemplo" + `DatePickerInput`/`@mantine/dates`), modal de detalhe ao clicar,
  confirmação ao remover. Lista sem paginação (board inteiro). Seed de 25
  candidaturas de demo (`seed_applications`).
- **Polimento de UX (matching)**: `CompanyAvatar` (gradiente quente determinístico,
  promovido a átomo compartilhado), página única sem tabs com modal de análise,
  guia "3 passos", widget "Aderência às últimas vagas" no dashboard (`top_score`
  anotado na lista) e `Sparkline` nos StatCards (séries reais, ≥2 pontos).
- **3.7 — Testes**: 26 novos (matching ingest/compute/api, applications api, signal
  de embedding) + factories. Corrigido o isolamento de embeddings na suíte (a
  factory lê `decouple`, não settings Django → forçada a env var em `settings/test.py`
  pra não bater na Voyage real). Gate **`make test-fast` = 236 passed, 1 skipped**.

> O restante deste arquivo é o **plano original** da fase (pré-execução), mantido
> como referência histórica. Onde ele menciona o otimizador ATS, vale a entrega
> acima + o ADR 0004.

## Contexto

A Fase 2 entregou um currículo bem escrito, versionado e avaliado. Mas o currículo só é útil quando aplicado **a vagas específicas**. Esta fase conecta o currículo ao mercado: usuário cola descrição de vaga, sistema calcula score de aderência via embeddings (similaridade coseno entre `ResumeVersion.embedding` e `JobPosting.embedding`), identifica skills ausentes, e oferece otimização ATS-aware que reescreve o currículo enfatizando keywords da vaga — com guardrails fortes contra fabricação de experiência.

Além disso, o Kanban dá ao usuário um lugar pra acompanhar candidaturas (qual vaga, qual versão usada, em que estágio do funil).

É a fase onde validamos:
- pgvector em escala real (não só knowledge base — agora também resumes + jobs).
- LLM como extrator estruturado (keywords da vaga em JSON).
- Padrão de "agente que reescreve" (ATS optimizer) — similar a reviewer mas com input adicional (vaga).
- Frontend drag-and-drop sem framework pesado.

## Outcome esperado

Ao fim da fase:

1. Usuário em `/matching` cola uma descrição de vaga (textarea grande) + título + empresa.
2. `POST /api/v1/matching/jobs/` ingere a vaga: extrai keywords via LLM, gera embedding, persiste.
3. Usuário seleciona qual `ResumeVersion` quer comparar → `POST /matching/analyze/` retorna em <2s:
   - Score 0-100% (similaridade coseno × 100).
   - `matched_skills` (skills que aparecem em ambos).
   - `missing_skills` (skills da vaga ausentes no currículo).
   - `recommendations` (curtas, acionáveis).
4. Botão "Otimizar pra essa vaga" dispara `RunAtsOptimizer` → nova `ResumeVersion v3` com keywords injetadas em bullets existentes, **sem inventar experiência**. Re-roda `RunJudge` em v3.
5. Usuário cria card no Kanban: `POST /api/v1/applications/` (company, position, link, applied_at, notes, resume_version_id, status="applied").
6. Drag-and-drop entre colunas: `PATCH /applications/{id}/move/ {status: "screening"}`.

## Escopo

### Faz parte

- App `matching/` com:
  - `JobPosting(user FK, title, company, description, embedding VectorField, extracted_keywords JSONField)`
  - `MatchAnalysis(resume_version FK, job_posting FK, score, matched_skills JSONField, missing_skills JSONField, recommendations JSONField)`
- App `applications/` com:
  - `Application(user FK, job_posting FK nullable, company, position, link, status, applied_at, notes, resume_version FK nullable)`
- Estender `resumes/models.py` com `embedding VectorField(1024)` em `ResumeVersion` — migration de adição + backfill (recalcula pra versões existentes via mgmt command).
- Use cases:
  - `matching.use_cases.ingest_job_posting.IngestJobPosting` — recebe descrição crua, chama LLM pra extrair keywords (Haiku), gera embedding via `EmbeddingsClient`, persiste.
  - `matching.use_cases.compute_match.ComputeMatch` — calcula similaridade entre embeddings + chama LLM pra gerar `missing_skills` e `recommendations` baseado nos `extracted_keywords` e structured_data.
  - `agents.use_cases.run_ats_optimizer.RunAtsOptimizer` — reescreve `ResumeVersion` com keywords injetadas. **Critical**: guardrail forte pra não inventar experiências.
- Task Celery `agents.tasks.run_ats_optimizer_task` que dispara `RunAtsOptimizer` + `RunJudge` em chain.
- Knowledge base real em `knowledge_base/ats/`: `how_ats_works.md`, `keyword_extraction.md`, `formatting_rules.md`, `do_not_fabricate.md` (este último **crítico** — guardrail forte).
- API REST:
  - `POST /api/v1/matching/jobs/` (ingere vaga, retorna JobPosting)
  - `GET /api/v1/matching/jobs/` (lista vagas do user)
  - `GET /api/v1/matching/jobs/{id}/`
  - `POST /api/v1/matching/analyze/` (body: resume_version_id + job_posting_id, retorna MatchAnalysis criada/recuperada)
  - `POST /api/v1/matching/optimize/` (body: resume_version_id + job_posting_id, dispara task, retorna task_id)
  - `GET /api/v1/applications/` (lista cards do user)
  - `POST /api/v1/applications/`
  - `PATCH /api/v1/applications/{id}/`
  - `PATCH /api/v1/applications/{id}/move/` (atomic, atualiza status + atualiza `updated_at`)
  - `DELETE /api/v1/applications/{id}/`
- Frontend domains:
  - `matching/` com `JobAnalysisPage` (cola vaga + score visual + match/gap lists + botão otimizar)
  - `applications/` com `KanbanPage` (board drag-and-drop)
- Adicionar `@dnd-kit/sortable` ao frontend.
- Tests: factories, use cases (com `FakeLLMClient` + `FakeEmbeddingsClient`), API, teste crítico de não-fabricação do ATS optimizer.

### NÃO faz parte

- Foto profissional (Fase 4)
- Múltiplos currículos por vaga em paralelo (1 otimização por (resume_version, job) é suficiente)
- Sugestão de vagas (recommender) — fora de escopo, é só análise de vaga colada
- Crawling de LinkedIn/Glassdoor — não, usuário cola

## Decisões a tomar (com defaults sugeridos)

| Decisão | Default | Trade-off |
|---|---|---|
| Threshold de "skill ausente" | Cosine similarity entre skill da vaga e skills do currículo < 0.5 → ausente | Ajustar empiricamente após smoke real |
| Modelo extrator de keywords | Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) | Task simples, barato |
| Modelo ATS optimizer | Sonnet 4.6 | Precisão importa (guardrail anti-fabricação) |
| Embedding de `ResumeVersion` | Concatena `summary` + bullets de `experiences` + skills (lista) → 1 vetor | Capta o "shape" técnico do currículo |
| Quando recalcular embedding | Em todo `ResumeVersion.save()` via `pre_save` signal | Custo trivial; consistência garantida |
| Lib de drag-and-drop | `@dnd-kit/sortable` | Mais leve que react-beautiful-dnd; mantida ativa |
| Estágios do Kanban | `applied | screening | technical_interview | final_interview | offer | rejected` | Padrão; usuário pode customizar em fase futura |
| Recálculo de MatchAnalysis | Se já existe pro par (resume_version, job_posting), retorna existente; usuário força recálculo via param `?refresh=true` | Evita custo desnecessário |
| Política de "ATS optimizer vs RunReviewer" | Optimizer é separado; ele NÃO chama reviewer depois (e sim judge direto, pra medir trade-off entre legibilidade vs keyword stuffing) | Avaliar empiricamente; talvez na Fase 4 |

## Arquivos a criar / modificar

### Backend — apps novos

```
backend/src/matching/
├── __init__.py, apps.py, admin.py
├── models.py
│   # JobPosting(user FK, title, company, description, embedding VectorField(1024), extracted_keywords JSONField)
│   # MatchAnalysis(resume_version FK, job_posting FK, score Decimal, matched_skills JSONField, missing_skills JSONField, recommendations JSONField, unique_together)
├── migrations/0001_initial.py    # inclui CREATE EXTENSION se ainda não foi (já foi na Fase 0 — só usar VectorField)
├── selectors.py                  # get_job_for_user, get_match_analysis
├── use_cases/
│   ├── ingest_job_posting.py     # LLM extrai keywords → embed → persist
│   └── compute_match.py          # similarity + gap analysis via LLM
├── api/
│   ├── serializers.py            # JobPostingSerializer, MatchAnalysisSerializer
│   ├── views.py                  # JobViewSet, AnalyzeView, OptimizeView
│   └── urls.py
├── CLAUDE.md, AGENTS.md
└── tests/

backend/src/applications/
├── __init__.py, apps.py, admin.py
├── models.py                     # Application + Status TextChoices
├── migrations/0001_initial.py
├── selectors.py                  # list_applications_for_user
├── api/
│   ├── serializers.py
│   ├── views.py                  # ApplicationViewSet com action `move`
│   └── urls.py
├── CLAUDE.md, AGENTS.md
└── tests/
```

### Backend — apps estendidos

```
backend/src/resumes/migrations/000X_add_embedding.py
# AddField ResumeVersion.embedding (VectorField(1024)) + signal pre_save recalcula

backend/src/resumes/models.py
# Adicionar VectorField + método _build_embedding_text() + signal handler

backend/src/resumes/management/commands/backfill_resume_embeddings.py
# Pra versões existentes da Fase 2 — itera, recalcula, salva

backend/src/agents/
├── prompts/ats_optimizer_system.md   # guardrails fortes contra fabricação
├── use_cases/run_ats_optimizer.py    # ResumeVersion + JobPosting → ResumeVersion (otimizada)
├── tasks.py                          # adicionar run_ats_optimizer_pipeline chain (optimizer | judge)
└── tests/test_run_ats_optimizer.py
```

### Backend — config

| Arquivo | Mudança |
|---|---|
| `backend/pyproject.toml` | Adicionar `"matching", "applications"` em `known-first-party`. Nada de dep nova (pgvector e embeddings já existem). |
| `backend/config/settings/base.py` | Registrar `matching`, `applications`. `ANTHROPIC_MODEL_KEYWORD_EXTRACTOR` default Haiku. `ANTHROPIC_MODEL_ATS_OPTIMIZER` default Sonnet 4.6. `ATS_GAP_THRESHOLD = 0.5` (decouple). |
| `backend/config/urls.py` | Include `matching.api.urls` e `applications.api.urls`. |
| `backend/.env.example` | Documentar `ANTHROPIC_MODEL_KEYWORD_EXTRACTOR`, `ANTHROPIC_MODEL_ATS_OPTIMIZER`, `ATS_GAP_THRESHOLD`. |

### Knowledge base real

```
knowledge_base/ats/
├── how_ats_works.md          # priority=always, agents=[ats_optimizer, matcher]
├── keyword_extraction.md     # priority=always, agents=[matcher, ats_optimizer]
├── formatting_rules.md       # priority=always
└── do_not_fabricate.md       # priority=always — guardrail crítico, conteúdo forte
```

### Frontend

```
frontend/package.json         # + "@dnd-kit/core", "@dnd-kit/sortable"

frontend/src/domains/matching/
├── CLAUDE.md, index.ts
├── api/
│   ├── client.ts
│   ├── jobs.ts               # ingestJob, listJobs, getJob
│   └── analysis.ts           # analyze, optimize (retorna task_id pra polling)
├── hooks/
│   ├── useIngestJob.ts
│   ├── useAnalyze.ts
│   ├── useOptimize.ts        # disparar + polling em ResumeVersion novo
│   └── useJobList.ts
├── components/
│   ├── atoms/MatchScoreGauge/
│   ├── molecules/
│   │   ├── JobInputForm/     # cola descrição + título + empresa
│   │   ├── MatchResult/      # score + match/gap lists
│   │   └── OptimizeButton/
├── pages/
│   ├── JobAnalysisPage/      # cola vaga → vê score → otimiza
│   └── JobListPage/          # vagas ingeridas anteriormente
└── types/

frontend/src/domains/applications/
├── CLAUDE.md, index.ts
├── api/
│   ├── client.ts
│   ├── applications.ts       # list, create, update, delete, move
├── hooks/
│   ├── useApplications.ts
│   ├── useCreateApplication.ts
│   ├── useMoveApplication.ts # com optimistic update
├── components/
│   ├── atoms/StatusColumn/
│   ├── molecules/
│   │   ├── ApplicationCard/
│   │   ├── KanbanColumn/
│   │   └── CreateApplicationModal/
├── pages/
│   └── KanbanPage/           # usa @dnd-kit/sortable
└── types/

frontend/src/router.tsx       # +/matching, +/matching/jobs/:id, +/applications
frontend/src/components/templates/AppShellTemplate.tsx  # +nav "Vagas", "Candidaturas"
```

## Reuso (não criar — usar)

| Componente | Onde | Como usar |
|---|---|---|
| `EmbeddingsClient` | `integrations/embeddings/factory.py` | Injetar em `IngestJobPosting`; também em signal de `ResumeVersion.save` |
| `KnowledgeLoader` | `knowledge/services/loader.py` | Injetar em `ComputeMatch` e `RunAtsOptimizer` |
| `CosineDistance` | `pgvector.django` | Selectors de busca por similaridade |
| Helper `run_tool_use_loop` | `integrations/llm/client.py` | Tanto `IngestJobPosting` (extração de keywords) quanto `RunAtsOptimizer` |
| `ResumeVersion`, `Resume` | `resumes/models.py` (Fase 2) | FK em `MatchAnalysis` e `Application` |
| `AgentRun` | `agents/models.py` (Fase 1) | Auditoria do optimizer |
| `RunJudge` | `agents/use_cases/run_judge.py` (Fase 2) | Re-rodar em v3 após optimize |
| `apiClient` axios | `domains/auth/api/client.ts` | Todas as chamadas |
| `useResume` da Fase 2 | `domains/resume/hooks/useResume.ts` | Reusar pra mostrar versão otimizada após polling |

## Critérios de aceite

### Backend — automatizáveis

- [ ] `matching.tests.test_ingest_job_posting.test_extracts_keywords` — LLM mock retorna lista de keywords; persistidas em `extracted_keywords`.
- [ ] `matching.tests.test_ingest_job_posting.test_generates_embedding` — embedding salvo é vetor de dim correto.
- [ ] `matching.tests.test_ingest_job_posting.test_user_isolation` — vaga do user A não aparece pra B.
- [ ] `matching.tests.test_compute_match.test_score_in_range` — score retornado entre 0.0 e 1.0.
- [ ] `matching.tests.test_compute_match.test_identifies_missing_skills` — quando keyword da vaga não bate semanticamente com nenhuma skill do currículo, aparece em `missing_skills`.
- [ ] `matching.tests.test_compute_match.test_caches_analysis` — segunda chamada com mesmo par retorna sem chamar LLM/embeddings de novo.
- [ ] `matching.tests.test_compute_match.test_refresh_param_forces_recompute` — `?refresh=true` ignora cache.
- [ ] `matching.tests.test_api.test_analyze_returns_envelope` — endpoint retorna shape esperado.
- [ ] `applications.tests.test_api.test_create_application` — POST cria card.
- [ ] `applications.tests.test_api.test_move_updates_status` — PATCH `/move/` atualiza status e `updated_at`.
- [ ] `applications.tests.test_api.test_move_validates_status` — status inválido retorna 400.
- [ ] `applications.tests.test_api.test_user_isolation` — user A não vê cards de B.
- [ ] `resumes.tests.test_models.test_save_recalculates_embedding` — `version.save()` atualiza embedding quando structured_data muda.
- [ ] `agents.tests.test_run_ats_optimizer.test_increments_version_number` — output é `ResumeVersion` com `version_number > input.version_number`.
- [ ] **`agents.tests.test_run_ats_optimizer.test_does_not_fabricate_experiences`** — **TESTE CRÍTICO**: dado input com 2 experiências (companies: `["Acme", "Beta"]`), output tem **exatamente** as mesmas 2 companies (FakeLLMClient retorna structured_data otimizado; teste compara `set` de companies). Mesma assertion pra cargos, períodos, instituições de educação.
- [ ] `agents.tests.test_run_ats_optimizer.test_injects_keywords_from_job` — quando job tem keyword "Kafka" e currículo original menciona "mensageria", output deve mencionar "Kafka" em algum bullet existente.
- [ ] `agents.tests.test_tasks_optimize_pipeline.test_chain_runs_optimizer_then_judge` — task encadeia corretamente.
- [ ] `make test-fast` verde — >=210 testes passando (170 da Fase 2 + ~40 novos).

### Backend — verificáveis manualmente

- [ ] `make migrate` aplica migration de embedding em `ResumeVersion` sem erro.
- [ ] `python manage.py backfill_resume_embeddings` popula embedding pras versões existentes da Fase 2.
- [ ] `make ingest-knowledge` ingere os 4 docs de `ats/`. `make knowledge-status` mostra `agents` incluindo `ats_optimizer` e `matcher`.

### Frontend — automatizáveis

- [ ] `make frontend-typecheck` verde.
- [ ] `make frontend-lint` verde.

### Frontend — verificáveis manualmente

- [ ] `/matching` mostra form pra colar vaga.
- [ ] Após submit, mostra MatchResult com score + listas match/gap.
- [ ] Botão "Otimizar pra essa vaga" dispara, mostra spinner, redireciona pra nova versão quando pronta.
- [ ] `/applications` mostra Kanban com 6 colunas.
- [ ] Botão "Nova candidatura" abre modal — preencher e salvar cria card na coluna "applied".
- [ ] Arrastar card entre colunas atualiza status (visualmente + persiste no backend).
- [ ] Refresh mantém posição dos cards.

### Comportamentais (smoke test end-to-end)

- [ ] Match calculado em <2s (sem chamada de LLM no cache hit).
- [ ] ATS optimizer **nunca** inventa experiência — comparar `set(structured_data.experiences[].company)` antes/depois deve ser idêntico (teste manual com vaga inflada de keywords).
- [ ] Score sobe (em geral) após otimização — comparar `MatchAnalysis(v_optimized, job).score` > `MatchAnalysis(v_original, job).score`.
- [ ] Kanban suporta 50+ cards sem perda perceptível de performance no drag.

## Verificação end-to-end

```bash
make refresh-venv          # +deps frontend pelo container, ou pnpm install local
make migrate
make ingest-knowledge      # ingere 4 docs de ats/
docker compose exec backend uv run python manage.py backfill_resume_embeddings

make test-fast
# Esperado: 210+ passed

# Smoke
make dev
# - login
# - /matching → colar vaga (qualquer descrição real do LinkedIn) → analyze
# - inspecionar score + match/gap
# - clicar Otimizar → aguardar (~30s)
# - voltar pra /resumes/{id} → ver v3 com keywords injetadas
# - comparar v1 vs v3 → companies idênticas, bullets enriquecidos
# - /applications → criar card associado à vaga
# - arrastar entre colunas
```

## Riscos / armadilhas

- **Guardrail anti-fabricação falhar** — se o ATS optimizer inventar experiência, **invalida o produto inteiro academicamente**. O teste `test_does_not_fabricate_experiences` é o gate. Em produção, validação automática post-hoc no use case: comparar `set(companies/cargos/instituições)` antes/depois — se mudou, lançar `ApplicationError` e reverter.
- **Embedding ruim de skill solta** — "Kafka" como skill isolada produz embedding pobre. Sempre construir texto contextualizado pra embeddar (ex: "skill: Kafka — broker de mensagens").
- **Cache de MatchAnalysis stale** — se `ResumeVersion` muda mas analysis foi cacheada, score desatualiza. Mitigação: invalida cache em signal `post_save` de `ResumeVersion`.
- **Drag-and-drop flicker** — fazer optimistic update no `useMoveApplication` pra UX fluida. Se mutation falha, reverter visualmente.
- **JobPosting muito longo** — descrições de vaga podem ter 3000+ palavras. Embedding API tem limite. Truncar pra ~2000 palavras ou chunkar e fazer embedding ponderado.
- **Kanban virando lixeira** — usuário acumula 100+ cards "applied" que nunca avançam. Adicionar contador por coluna + (futura) opção de arquivar.
- **Custos de embeddings disparando** — toda `ResumeVersion.save()` recalcula. Mitigação: só recalcula se `structured_data` mudou (hash check no signal).

## Subagentes recomendados pra delegação

| Trabalho | Subagente | Por quê |
|---|---|---|
| Apps `matching/` e `applications/` (models + selectors + admin + API) | `django-core` | Padrão CRUD |
| Migration `add_embedding` em ResumeVersion + management command de backfill | `django-core` | Mexe em app já existente — mantenedor é django-core |
| `RunAtsOptimizer` use case + tasks Celery | Orquestrador (você) | Coordenação cross-domain, prompt crítico |
| Knowledge base `ats/` (especialmente `do_not_fabricate.md`) | Orquestrador (você) | Conteúdo de guardrail é decisão de produto |
| Frontend domains `matching/` e `applications/` (drag-and-drop) | `frontend-core` | Owner |
| Tests (especialmente `test_does_not_fabricate_experiences`) | `qa-validation` | Owner; gate crítico |

## Atualização do plano ao finalizar

Mesmo padrão das fases anteriores. Atualizar [`fases-implementacao.md`](../fases-implementacao.md).
