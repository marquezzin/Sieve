# matching — aderência semântica currículo ↔ vaga

App que conecta o currículo (`resumes.ResumeVersion`) ao mercado: o usuário cola
uma descrição de vaga, o sistema extrai keywords (LLM), gera embedding (pgvector)
e calcula a aderência de uma versão do currículo à vaga.

> **Em conflito com `backend/CLAUDE.md`, esse arquivo perde.**
> Este app ingere a vaga e calcula a aderência (score + skills + recomendações
> honestas). Não reescreve currículo.

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
  - `recommendations` — `list[{"title": str, "detail": str, "category": str}]`,
    detalhadas e honestas. `category` ∈ `realce` (explicitar experiência real com
    o termo da vaga) / `enfase` (priorizar o que já existe) / `gap` (lacuna real a
    desenvolver — nunca a fabricar). É o entregável principal do produto.

## API (`/api/v1/matching/`)

Tudo escopado ao `request.user` (selectors com 404/403). `IsAuthenticated` default.

| Método | Rota | Ação |
|---|---|---|
| GET | `/jobs/` | lista vagas do user (sem `embedding`; com `top_score`) |
| POST | `/jobs/` | ingere vaga (`title`, `company`, `description`) → `JobPosting` |
| GET | `/jobs/{id}/` | detalhe da vaga |
| POST | `/analyze/` | body `{resume_version_id, job_posting_id}`, `?refresh=true` força recálculo → `MatchAnalysis` |

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
- **`top_score` anotado na LISTA** — `list_jobs_for_user` faz
  `annotate(top_score=Max("match_analyses__score"))` (evita N+1) e o
  `JobPostingSerializer` expõe `top_score` (float 0–1 ou `null`). Alimenta o widget
  "Aderência às últimas vagas" do dashboard sem precisar do detalhe por vaga. Em
  objetos sem a anotação (create/detail) o campo sai `null`.
- **Cache por par `(resume_version, job_posting)`** — match é caro (LLM); só
  recalcula sob `?refresh=true`.
- **Keyword "ausente"** = similaridade coseno keyword↔currículo `< ATS_GAP_THRESHOLD`
  (default `0.5`, via settings). É só sinal de sanidade — a verdade final é do LLM,
  que olha o conteúdo real do currículo.
- **Recomendações honestas** — o prompt do `matcher` proíbe sugerir adicionar/
  adquirir skill que o candidato não tem; no máximo aponta o gap real.

## NÃO faz

- Não reescreve nem "otimiza" currículo — o produto só mostra a análise honesta
  (score + skills + recomendações). Reescrita automática foi descartada por risco
  de fabricação.
- Não cria/lista vagas de terceiros — só do usuário autenticado.
- Não faz crawling de vaga — o usuário cola o texto.

## Settings

- `LLM_MODEL_KEYWORD_EXTRACTOR` (vazio = default do provider).
- `ATS_GAP_THRESHOLD` (default `0.5`).

## Knowledge base

Agente `"matcher"` consome `knowledge_base/ats/` (priority=always). Carregado via
`KnowledgeLoader.load_for_agent("matcher")`.
