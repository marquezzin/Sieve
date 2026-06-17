# Fase 2 — Pipeline multi-agente (writer/reviewer/judge) + Resume/versões + PDF

**Status:** ✅ Done
**Entregue em:** 2026-06-17
**Pré-requisitos:** Fase 1 ✅ (precisa do `collected_data` da entrevista pra alimentar o writer)

## O que ficou pronto

Entregue ao longo dos commits `1570fcd` (backend Resume init), `1af676a` (pipeline writer/reviewer/judge + prompts + Celery chain + trigger `finalize` + testes), `b1cb855` (telas iniciais de currículo) e correções/polish posteriores (`7eab37c`, `4edca1d`, `bf7e5a5`, `e013cc4`). O status do doc só foi virado pra `✅ Done` em 2026-06-17 após verificação do gate.

**Backend**
- App [`resumes/`](../../../backend/src/resumes/) com `Resume`, `ResumeVersion`, `ResumeScore`, selectors, API REST, templates HTML e `CLAUDE.md` documentando o schema de `structured_data`.
- App `agents/` estendido com [`run_writer.py`](../../../backend/src/agents/use_cases/run_writer.py), [`run_reviewer.py`](../../../backend/src/agents/use_cases/run_reviewer.py), [`run_judge.py`](../../../backend/src/agents/use_cases/run_judge.py) + prompts e `tasks.py` com a chain `generate_resume_pipeline`.
- Trigger no `chat/api/views.py:finalize` dispara o pipeline.
- Integration [`integrations/pdf/`](../../../backend/src/integrations/pdf/) com WeasyPrint wrapper.
- Knowledge base real em `knowledge_base/writing/`, `knowledge_base/rubric/`, `knowledge_base/templates/`.

**Frontend**
- Domain [`resume/`](../../../frontend/src/domains/resume/) com API client, hooks (polling), componentes e páginas de lista/detalhe/diff.

**Verificação realizada**
- `make test-fast` → **210 passed, 1 skipped** (meta do spec era ≥170).

## Contexto

A Fase 1 entregou o agente que coleta dados estruturados via conversa. Esta fase fecha o **núcleo defensável academicamente** do projeto: pipeline multi-agente onde 3 agentes especializados (writer, reviewer, judge) colaboram pra produzir um currículo bem escrito, revisado e auto-avaliado. Versionamento + export PDF tornam o output útil pro usuário real.

É a fase onde validamos:
- O padrão de pipeline Celery chain entre use cases dedicados (em vez de framework de orquestração — ADR 0002).
- Versionamento estruturado de `Resume` (cada agente cria nova `ResumeVersion`).
- LLM-as-a-judge com rubrica formal carregada da knowledge base.
- Render HTML → PDF com WeasyPrint mantendo compatibilidade ATS.

## Outcome esperado

Ao fim da fase:

1. Quando o usuário clica "Finalizar" na sessão de chat (já existe da Fase 1), dispara Celery chain.
2. Pipeline em sequência:
   - `RunWriter` consome `session.collected_data` → cria `ResumeVersion v1` com `structured_data` (seções normalizadas) + `html_rendered`.
   - `RunReviewer` consome `v1` → cria `ResumeVersion v2` com bullets revisados (verbos de ação, métricas adicionadas onde inferíveis, clichês removidos) + comentários do que mudou.
   - `RunJudge` consome `v2` → cria `ResumeScore` com nota geral 0–10 + breakdown por critério da rubrica + feedback acionável.
3. Frontend faz polling em `GET /api/v1/resumes/{id}/` até `status="ready"`, depois mostra:
   - Preview HTML do currículo (renderiza o `html_rendered`).
   - Score visual (gauge ou cards por critério).
   - Botão "Exportar PDF" → baixa.
   - Lista de versões — clicar v1 vs v2 abre página de diff lado-a-lado.
4. Toda a knowledge base de `writing/`, `rubric/` e `templates/` está preenchida com conteúdo real (não placeholders).

## Escopo

### Faz parte

- App `resumes/` com `Resume`, `ResumeVersion`, `ResumeScore`.
- App `agents/` **estendido** com use cases `RunWriter`, `RunReviewer`, `RunJudge` em `agents/use_cases/`.
- Prompts em `agents/prompts/`: `writer_system.md`, `reviewer_system.md`, `judge_system.md`.
- Tasks Celery em `agents/tasks.py`: `generate_resume_pipeline` (chain `run_writer.s | run_reviewer.s | run_judge.s`).
- Trigger: `chat/api/views.py:finalize` (já existe da Fase 1) dispara `generate_resume_pipeline.delay(session_id)` em vez de só marcar completed.
- Integration nova `backend/src/integrations/pdf/` com WeasyPrint wrapper.
- Templates HTML do currículo em `resumes/templates/resume/default.html`.
- Knowledge base real em `knowledge_base/writing/` (verbos, padrões de bullet, quantificação, exemplos bons/ruins), `knowledge_base/rubric/` (rubrica formal + critical failures + alguns scoring examples), `knowledge_base/templates/` (5+ currículos canônicos com frontmatter rico — level, target_role, success_score).
- API REST em `/api/v1/resumes/`:
  - `GET /` → lista resumes do user
  - `GET /{id}/` → detalhe (latest version + score + status)
  - `GET /{id}/versions/` → todas as versões
  - `GET /{id}/versions/{n}/` → versão específica
  - `GET /{id}/versions/{n}/pdf/` → download binário (Content-Type application/pdf)
  - `GET /{id}/versions/{n1}/diff/{n2}/` → diff estruturado entre versões (JSON com adds/removes/changes por seção)
- Frontend domain `frontend/src/domains/resume/`:
  - `ResumeListPage` (lista currículos do user)
  - `ResumeDetailPage` (preview + score + versões + botão PDF)
  - `VersionDiffPage` (diff lado-a-lado)
- Tests: factories pros novos models; tests dos 3 use cases com `FakeLLMClient` injetado; tests de API; smoke test do PDF render (WeasyPrint roda, retorna bytes não-vazios).

### NÃO faz parte

- Matching com vaga (Fase 3)
- ATS optimizer (Fase 3) — embora compartilhe padrão com reviewer/judge, é uma nova versão otimizada *pra uma vaga*, fica na Fase 3.
- Kanban (Fase 3)
- Foto profissional (Fase 4)
- Edição manual de currículo pelo usuário (não é o produto)
- Múltiplos templates de PDF — 1 só nesta fase, customização vira Fase 4

## Decisões a tomar (com defaults sugeridos)

| Decisão | Default | Trade-off |
|---|---|---|
| Modelo do writer | Claude Sonnet 4.6 | Qualidade textual importa; Haiku perde nuance |
| Modelo do reviewer | Sonnet 4.6 | Idem |
| Modelo do juiz | Sonnet 4.6 | Idem; especialmente importante pra calibrar notas |
| Template PDF | 1 template enxuto ATS-safe (sans-serif, sem tabelas, sem colunas) | Customização vira Fase 4 |
| Diff entre versões | Estruturado (compara campos de `structured_data` por path JSON) | Diff textual cru perde semântica |
| Polling frontend | TanStack Query `refetchInterval: 2000` enquanto `status="generating"`, para em `ready` ou `failed` | Streaming SSE custaria mais; polling é simples e robusto |
| Storage do PDF | Gerar on-demand a cada GET (sem cache) | Cachear no MinIO vira otimização se aparecer dor de performance |
| Trigger do pipeline | `finalize` do chat dispara `.delay()` | Síncrono não cabe (pipeline ~30-60s) |
| Estrutura de `structured_data` | Dict com keys `personal_info`, `summary`, `experiences[]`, `education[]`, `skills{}`, `projects[]` | Documentar como schema interno em `resumes/CLAUDE.md` |
| Granularidade do `AgentRun` | 1 por agente (não 1 por turn — esses agentes são single-shot, não conversacionais) | Auditoria fica leve |

## Arquivos a criar / modificar

### Backend — app novo `resumes/`

```
backend/src/resumes/
├── __init__.py
├── apps.py
├── models.py
│   # Resume(user FK, title, target_role, status)
│   # ResumeVersion(resume FK, version_number, structured_data JSONField, html_rendered TextField, generated_by_agent CharField)
│   # ResumeScore(resume_version OneToOne, overall DecimalField, criteria JSONField, feedback JSONField)
├── admin.py
├── migrations/0001_initial.py
├── selectors.py                # get_resume_for_user, get_latest_version, list_versions
├── use_cases/
│   ├── __init__.py
│   ├── render_to_pdf.py        # ResumeVersion → bytes (chama integrations/pdf)
│   ├── render_to_html.py       # structured_data → html_rendered string (template Django)
│   └── compute_diff.py         # v1.structured_data vs v2.structured_data → list[Change]
├── templates/
│   └── resume/
│       └── default.html        # Django template ATS-safe
├── api/
│   ├── __init__.py
│   ├── serializers.py          # ResumeSerializer, ResumeVersionSerializer, ResumeScoreSerializer, DiffSerializer
│   ├── views.py                # ResumeViewSet, ResumeVersionView, ResumeVersionPdfView, DiffView
│   └── urls.py
├── CLAUDE.md                   # documenta schema de structured_data
├── AGENTS.md
└── tests/
    ├── __init__.py
    ├── factories.py
    ├── test_render_to_html.py
    ├── test_render_to_pdf.py   # smoke: bytes não-vazios + começa com %PDF
    ├── test_compute_diff.py
    └── test_api.py
```

### Backend — app `agents/` estendido

```
backend/src/agents/
├── prompts/
│   ├── writer_system.md        # template com placeholders {kb}, {collected_data}
│   ├── reviewer_system.md      # {kb}, {previous_version}
│   └── judge_system.md         # {kb}, {version_to_score}
├── use_cases/
│   ├── run_writer.py           # collected_data → structured_data → ResumeVersion v1
│   ├── run_reviewer.py         # ResumeVersion vN → ResumeVersion vN+1 revisada
│   └── run_judge.py            # ResumeVersion → ResumeScore
├── tasks.py
│   # @shared_task generate_resume_pipeline(session_id):
│   #     chain(run_writer.s(session_id), run_reviewer.s(), run_judge.s()).apply_async()
│   # @shared_task run_writer_task(session_id) -> resume_version_id
│   # @shared_task run_reviewer_task(resume_version_id) -> new_resume_version_id
│   # @shared_task run_judge_task(resume_version_id) -> resume_score_id
└── tests/
    ├── test_run_writer.py
    ├── test_run_reviewer.py
    ├── test_run_judge.py
    └── test_tasks_pipeline.py  # com CELERY_TASK_ALWAYS_EAGER (já default em test settings)
```

### Backend — integration nova `pdf/`

```
backend/src/integrations/pdf/
├── __init__.py
├── base.py                     # PdfRenderer ABC + PdfRenderError
├── weasyprint_client.py        # WeasyPrintRenderer.render(html: str, *, base_url: str = None) -> bytes
├── factory.py                  # get_pdf_renderer()
├── CLAUDE.md
├── AGENTS.md
└── tests/
    ├── __init__.py
    └── test_weasyprint_client.py  # smoke: HTML simples vira PDF válido
```

### Backend — config

| Arquivo | Mudança |
|---|---|
| `backend/pyproject.toml` | Adicionar `weasyprint>=63,<64`. Adicionar `"resumes"` em `known-first-party`. |
| `backend/config/settings/base.py` | Registrar `resumes.apps.ResumesConfig` em `LOCAL_APPS`. Adicionar `ANTHROPIC_MODEL_WRITER`, `ANTHROPIC_MODEL_REVIEWER`, `ANTHROPIC_MODEL_JUDGE` (todos default `claude-sonnet-4-6-20250929` — confirmar ID). |
| `backend/config/urls.py` | `include("resumes.api.urls")` em `/api/v1/resumes/`. |
| `backend/.env.example` | Documentar `ANTHROPIC_MODEL_WRITER/REVIEWER/JUDGE`. |
| `backend/src/chat/api/views.py` | Estender `finalize` endpoint pra disparar `generate_resume_pipeline.delay(session.id)` (em vez de só `status="completed"`). |
| `docker/Dockerfile.backend` | Adicionar deps de sistema do WeasyPrint (libpango, libcairo, etc) se ainda não tiver. |

### Knowledge base real

```
knowledge_base/writing/
├── action_verbs.md             # priority=always, agents=[writer, reviewer]
├── bullet_structure.md         # priority=always
├── quantification_patterns.md  # priority=always
├── good_bullets_examples.md    # priority=always (até ~2k palavras) ou retrieve (se virar grande)
└── bad_bullets_examples.md     # priority=always

knowledge_base/rubric/
├── full_rubric.md              # priority=always, agents=[judge, reviewer]
├── critical_failures.md        # priority=always
└── scoring_examples.md         # priority=retrieve (vai crescer)

knowledge_base/templates/
├── junior_backend_python.md    # priority=retrieve, agents=[writer], metadata: level, target_role, success_score
├── junior_frontend_react.md
├── pleno_data_engineer.md
├── senior_fullstack.md
└── estagiario_cs.md
```

### Frontend

```
frontend/src/domains/resume/
├── CLAUDE.md
├── index.ts
├── api/
│   ├── client.ts
│   ├── resumes.ts              # listResumes, getResume, getVersion, getDiff
│   └── pdf.ts                  # downloadPdf (axios responseType blob)
├── hooks/
│   ├── useResume.ts            # useQuery + refetchInterval enquanto status=generating
│   ├── useResumeVersion.ts
│   ├── useDownloadPdf.ts
│   └── useVersionDiff.ts
├── components/
│   ├── atoms/
│   │   ├── ScoreGauge/         # render score 0-10 visual
│   │   └── StatusBadge/        # generating | ready | failed
│   ├── molecules/
│   │   ├── ScoreBreakdown/     # 6 critérios em cards
│   │   ├── ResumePreview/      # render html_rendered em iframe sandboxed
│   │   ├── VersionList/
│   │   └── DiffViewer/         # side-by-side
├── pages/
│   ├── ResumeListPage/
│   ├── ResumeDetailPage/
│   └── VersionDiffPage/
└── types/
    └── index.ts

frontend/src/router.tsx         # adicionar /resumes, /resumes/:id, /resumes/:id/diff/:v1/:v2
frontend/src/components/templates/AppShellTemplate.tsx  # nav item "Currículos"
```

## Reuso (não criar — usar)

| Componente | Onde | Como usar |
|---|---|---|
| `BaseModel` | `core/models/base.py` | Resume, ResumeVersion, ResumeScore |
| `KnowledgeLoader` | `knowledge/services/loader.py` | Injetar em cada `RunWriter/Reviewer/Judge.__init__` |
| Helper `run_tool_use_loop` | `integrations/llm/client.py` (criado na Fase 1) | Reusar nos 3 agentes |
| `InterviewSession.collected_data` | `chat/models.py` (Fase 1) | Input do `RunWriter` |
| `AgentRun` | `agents/models.py` (Fase 1) | Cada use case persiste 1 |
| Trigger `finalize` | `chat/api/views.py` (Fase 1) | Estender pra disparar pipeline |
| `EnvelopeRenderer` | `core/api/renderers.py` | Default — não montar envelope manual |
| Celery config | `config/celery_app.py` | `chain()` + `apply_async()` |
| `CELERY_TASK_ALWAYS_EAGER` em test | `config/settings/test.py` | Pipeline roda síncrono em testes |
| `apiClient` axios | `domains/auth/api/client.ts` | PDF via responseType: 'blob' |
| `useChat`/`useSession` da Fase 1 | `domains/chat/hooks/` | Trigger redirect pra `/resumes/:id` após finalize |

## Critérios de aceite

### Backend — automatizáveis

- [ ] `resumes.tests.test_render_to_html.test_renders_all_sections` — template Django produz HTML com `<section>` por área (personal, experiences, education, skills, projects).
- [ ] `resumes.tests.test_render_to_pdf.test_produces_valid_pdf_bytes` — output começa com `b"%PDF-"` e tem >1KB.
- [ ] `resumes.tests.test_compute_diff.test_detects_bullet_changes` — v1 vs v2 com 2 bullets diferentes retorna 2 changes.
- [ ] `resumes.tests.test_compute_diff.test_detects_added_section` — adicionar uma experience nova é detectado.
- [ ] `resumes.tests.test_api.test_list_returns_user_resumes_only` — user A não vê resumes de B.
- [ ] `resumes.tests.test_api.test_get_pdf_returns_binary` — endpoint retorna 200 com `Content-Type: application/pdf`.
- [ ] `resumes.tests.test_api.test_diff_endpoint` — GET diff entre v1 e v2 retorna JSON estruturado.
- [ ] `agents.tests.test_run_writer.test_consumes_collected_data` — FakeLLMClient recebe `collected_data` no user message.
- [ ] `agents.tests.test_run_writer.test_creates_resume_version_v1` — execução cria `ResumeVersion(version_number=1)` com structured_data populado.
- [ ] `agents.tests.test_run_writer.test_loads_knowledge_for_writer` — system prompt contém docs `writing/` carregados via `KnowledgeLoader`.
- [ ] `agents.tests.test_run_writer.test_retrieves_canonical_examples_by_target_role` — quando `target_role="backend-python"`, `retrieve_chunks` é chamado com filtro relevante.
- [ ] `agents.tests.test_run_reviewer.test_creates_resume_version_v2_higher` — version_number incrementa.
- [ ] `agents.tests.test_run_reviewer.test_modifies_at_least_30pct_bullets` — quando FakeLLMClient retorna versão "melhorada", >=30% dos bullets de v2 são diferentes de v1.
- [ ] `agents.tests.test_run_judge.test_creates_resume_score_with_all_criteria` — `ResumeScore.criteria` tem 6 keys (verbos, métricas, clichês, especificidade, concisão, formatação).
- [ ] `agents.tests.test_run_judge.test_overall_is_weighted_average` — overall calculado conforme pesos da rubrica carregada.
- [ ] `agents.tests.test_tasks_pipeline.test_chain_runs_in_order` — `generate_resume_pipeline(session_id)` executa writer → reviewer → judge e ao fim existe v1, v2, score.
- [ ] `agents.tests.test_tasks_pipeline.test_writer_failure_stops_chain` — exceção no writer não chama reviewer/judge.
- [ ] `integrations.pdf.tests.test_weasyprint_client.test_renders_simple_html` — `WeasyPrintRenderer().render("<h1>oi</h1>")` retorna bytes válidos.
- [ ] `make test-fast` verde — >=170 testes passando (130 da Fase 1 + ~40 novos).

### Backend — verificáveis manualmente

- [ ] `make migrate` aplica migration nova do `resumes` sem erro.
- [ ] `make ingest-knowledge` ingere os ~13 docs novos. `make knowledge-status` mostra docs com `agents` incluindo writer/reviewer/judge corretamente.
- [ ] WeasyPrint instalado no container — `make shell` + `from integrations.pdf.factory import get_pdf_renderer; get_pdf_renderer().render("<h1>oi</h1>")` retorna bytes.

### Frontend — automatizáveis

- [ ] `make frontend-typecheck` verde.
- [ ] `make frontend-lint` verde.

### Frontend — verificáveis manualmente

- [ ] Após finalizar chat (Fase 1), frontend redireciona pra `/resumes/{id}`.
- [ ] Página mostra spinner enquanto `status="generating"`.
- [ ] Quando vira `ready`, mostra preview HTML + score + breakdown + lista de versões.
- [ ] Botão "Exportar PDF" baixa arquivo `.pdf` que abre num leitor padrão.
- [ ] Clicar v1 → v2 abre `/resumes/{id}/diff/1/2` com bullets adicionados/removidos/modificados destacados.

### Comportamentais (smoke test end-to-end)

- [ ] Pipeline completo (chat → writer → reviewer → judge) executa em ≤90s com Sonnet 4.6.
- [ ] `ResumeScore.overall` entre 0.0 e 10.0; `breakdown` tem 6 critérios.
- [ ] v2.structured_data tem >=30% dos bullets modificados vs v1 (reviewer fez trabalho real).
- [ ] PDF gerado não usa tabela, imagem, ou layout em coluna (compatibilidade ATS — inspecionar via `pdftotext` ou ferramenta de teste ATS online).
- [ ] Knowledge base de `templates/` tem ao menos 1 currículo no `target_role` testado — `retrieve_chunks` retorna match relevante (verificar via shell ou logs estruturados).

## Verificação end-to-end

```bash
make refresh-venv        # nova dep weasyprint
make migrate
make ingest-knowledge    # ingere ~13 docs novos
make knowledge-status | jq '.data.totals'
# Esperado: documents >= 17 (4 da Fase 1 + 13 novos), chunks proporcionais

make test-fast
# Esperado: 170+ passed, 0 failures

# Smoke manual
make dev
# - login
# - /chat → finalizar sessão de pelo menos 2 fases
# - redirect /resumes/{id}, aguardar (~60s)
# - inspecionar preview + score + breakdown
# - Exportar PDF → abrir
# - Voltar, ver versões, clicar diff v1↔v2 → ver mudanças destacadas
```

## Riscos / armadilhas

- **WeasyPrint deps de sistema** — em Debian/Alpine precisa de `libpango`, `libcairo`, `libffi-dev`, `shared-mime-info`. Dockerfile pode precisar de `apt-get install`. Verificar logs do build.
- **Custo de Sonnet 4.6** — 3 chamadas por currículo, prompts grandes (knowledge base full-load). Cachear system prompt é crítico. Medir `cache_read_input_tokens` no `AgentRun.usage`.
- **Reviewer "demais" ou "de menos"** — sem prompt firme, reviewer pode reescrever 100% (perdendo conteúdo do user) ou nada (=inútil). Calibrar via temperature baixa (0.3) e exemplos na knowledge base.
- **Juiz inflando notas** — LLM tende a dar 8+. Rubrica na knowledge base precisa de `critical_failures.md` claro + `scoring_examples.md` com notas baixas pra ancorar.
- **PDF que não bate com preview** — preview usa CSS do browser, PDF usa CSS do WeasyPrint. Manter CSS conservador (sans-serif padrão, sem flexbox complexo, sem grid).
- **Pipeline com falha parcial** — se writer ok mas reviewer falha, ficamos com v1 + sem score. Frontend mostra estado intermediário. Definir status: `generating` → `writer_done` → `reviewer_done` → `ready` → `failed`.
- **JSONField path traversal no diff** — algoritmo de diff precisa lidar com arrays (experiences[]) por id estável, não por índice — senão "adicionou uma experience no meio" vira "modificou tudo a partir do meio".
- **Race no polling** — se 2 abas abertas, ambas polling. TanStack Query dedupe ajuda mas confirmar.

## Subagentes recomendados pra delegação

| Trabalho | Subagente | Por quê |
|---|---|---|
| App `resumes/` (models + selectors + API + templates HTML) | `django-core` | Padrão CRUD do template |
| Pipeline Celery (tasks, chain, retry policy) | `celery-orchestration` | Owner de `tasks.py` |
| Integration `pdf/` (WeasyPrint wrapper + deps Docker) | `integrations-platform` (cliente) + `devops-deploy` (Dockerfile) | Conhecem cada parte |
| Factories + tests dos 3 use cases + tests de pipeline | `qa-validation` | Owner de tests |
| Frontend domain `resume/` | `frontend-core` | Owner |
| Use cases `RunWriter/Reviewer/Judge`, prompts, knowledge base real de `writing/`/`rubric/`/`templates/`, integração final | Orquestrador (você) | Coordenação cross-domain, calibração de prompt, validação end-to-end |

## Atualização do plano ao finalizar

Mesmo formato da Fase 1:
1. Status → `✅ Done`, `**Entregue em:** YYYY-MM-DD`.
2. Seção "O que ficou pronto" com o real.
3. Decisões divergentes documentadas.
4. Verificação realizada com números.

Atualizar [`fases-implementacao.md`](../fases-implementacao.md).
