# matching — aderência semântica currículo ↔ vaga

App que conecta o currículo (`resumes.ResumeVersion`) ao mercado: o usuário cola
uma descrição de vaga, o sistema extrai keywords (LLM), gera embedding (pgvector)
e calcula a aderência de uma versão do currículo à vaga.

> **Em conflito com `backend/CLAUDE.md`, esse arquivo perde.**
> A reescrita ATS-aware do currículo (`RunAtsOptimizer`) **não** mora aqui — é do
> app de agentes. Este app ingere vaga, calcula match e dispara o optimizer.

## Models

- **`JobPosting`** — vaga colada pelo usuário. `user` (FK), `title`, `company`,
  `description`, `embedding` (`VectorField`, vetor da descrição), `extracted_keywords`
  (JSON `list[str]`, via LLM). Ordenado por `-id` (UUID v7 cronológico).
- **`MatchAnalysis`** — veredito de aderência de uma versão a uma vaga.
  `unique_together = (resume_version, job_posting)` → **cacheado por par**.
  - `score` — `Decimal(4,3)` em **[0.000, 1.000]** (similaridade coseno). A API
    expõe como **float 0.0–1.0**; o frontend multiplica por 100 pra exibir %.
  - `matched_skills` — `list[str]`.
  - `missing_skills` — `list[{"skill": str, "critical": bool}]`.
  - `recommendations` — `list[str]` curtas e acionáveis.

## API (`/api/v1/matching/`)

Tudo escopado ao `request.user` (selectors com 404/403). `IsAuthenticated` default.

| Método | Rota | Ação |
|---|---|---|
| GET | `/jobs/` | lista vagas do user (sem `embedding`) |
| POST | `/jobs/` | ingere vaga (`title`, `company`, `description`) → `JobPosting` |
| GET | `/jobs/{id}/` | detalhe da vaga |
| POST | `/analyze/` | body `{resume_version_id, job_posting_id}`, `?refresh=true` força recálculo → `MatchAnalysis` |
| POST | `/optimize/` | body `{resume_version_id, job_posting_id}` → dispara `agents.tasks.run_ats_optimizer_pipeline` (Celery), retorna `{task_id}` (202) |

## Use cases

- `ingest_job_posting.IngestJobPosting` — extrai keywords via LLM (agente
  `"matcher"`, tool `submit_keywords`), gera embedding da descrição (truncada a
  ~2000 palavras), persiste o `JobPosting`. DI: `llm_client`, `embeddings_client`,
  `knowledge`.
- `compute_match.ComputeMatch` — coseno entre embeddings → `score`; sinal de
  sanidade por embedding de keyword (`ATS_GAP_THRESHOLD`); LLM (`submit_match`)
  produz a saída legível. **Cache**: se já existe análise pro par e não veio
  `refresh=True`, retorna a existente sem tocar LLM/embeddings.

## Decisões

- **`score` em [0,1] no backend**, % no frontend — mantém o campo numérico puro
  e deixa a apresentação no cliente.
- **Cache por par `(resume_version, job_posting)`** — match é caro (LLM); só
  recalcula sob `?refresh=true`.
- **Keyword "ausente"** = similaridade coseno keyword↔currículo `< ATS_GAP_THRESHOLD`
  (default `0.5`, via settings). É só sinal de sanidade — a verdade final é do LLM,
  que olha o conteúdo real do currículo.
- **`optimize` referencia a task por nome** (import lazy dentro da view) pra não
  acoplar `matching` ao app de agentes em tempo de carga.

## NÃO faz

- Não reescreve currículo (isso é `agents.RunAtsOptimizer`) — só dispara.
- Não cria/lista vagas de terceiros — só do usuário autenticado.
- Não faz crawling de vaga — o usuário cola o texto.

## Settings

- `LLM_MODEL_KEYWORD_EXTRACTOR` (vazio = default do provider).
- `ATS_GAP_THRESHOLD` (default `0.5`).

## Knowledge base

Agente `"matcher"` consome `knowledge_base/ats/` (priority=always). Carregado via
`KnowledgeLoader.load_for_agent("matcher")`.
