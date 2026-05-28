# Fase 0 — Fundação: knowledge base + pgvector + embeddings

**Status:** ✅ Done
**Entregue em:** 2026-05-27

## Contexto

Antes de qualquer agente de IA fazer sentido no Sieve, era preciso ter o mecanismo que **alimenta** esses agentes com conhecimento curado: knowledge base versionada em Markdown, ingestão para Postgres com pgvector, e um `KnowledgeLoader` com 2 modos de consumo (full-load no system prompt + retrieval semântico via similaridade coseno). Esta fase entregou esse alicerce — todas as fases seguintes se apoiam aqui.

## Outcome entregue

- Arquivos `.md` em `knowledge_base/` (raiz do repo) são ingeridos via `make ingest-knowledge` para `KnowledgeDocument` + `KnowledgeChunk` (com `VectorField(1024)`).
- Ingest **idempotente** via `content_hash` SHA-256: rodar N vezes com mesmo conteúdo = 0 mudanças. Hash diferente = re-chunk + re-embed só desse arquivo.
- `KnowledgeLoader.load_for_agent(agent_name)` concatena docs `priority=always` do agente — string pronta pra ir no system prompt com `cache_control`.
- `KnowledgeLoader.retrieve_chunks(query, agents, k, min_similarity, filters)` faz busca semântica via pgvector com filtros opcionais.
- Endpoint debug `GET /api/v1/knowledge/status/` (IsAdminUser) lista docs ingeridos.
- Estrutura `knowledge_base/` com README mestre + 5 subpastas (interviewing/writing/ats/rubric/templates) com READMEs explicando frontmatter por categoria + 2 samples reais com frontmatter completo.

## O que ficou pronto

### Backend

- App `backend/src/knowledge/`:
  - `models.py` — `KnowledgeDocument` (source_path, category, agents, priority, tags, metadata, content_md, content_hash) e `KnowledgeChunk` (document FK, ordinal, content, embedding, metadata).
  - `migrations/0001_initial.py` — `RunSQL("CREATE EXTENSION IF NOT EXISTS vector;")` + tabelas (substitui `pgvector.django.VectorExtension()` que é incompat com Django 6).
  - `services/frontmatter.py` — parser YAML + validação dos campos obrigatórios.
  - `services/chunker.py` — split por headers `##+` + overlap por palavras.
  - `services/ingest.py` — orquestra: discover → diff hash → chunk → embed batch → upsert. Detecta deletes (arquivo sumiu → CASCADE).
  - `services/loader.py` — `KnowledgeLoader` com `load_for_agent` + `retrieve_chunks`.
  - `selectors.py`, `admin.py` (read-only), `api/views.py` (`KnowledgeStatusView`), `management/commands/ingest_knowledge.py`.
  - `CLAUDE.md` + `AGENTS.md`, 39 testes.
- Integration `backend/src/integrations/embeddings/`:
  - `base.py` (`EmbeddingsClient` ABC + `EmbeddingsError`).
  - `voyage_client.py` (httpx, retry de 5xx + transport-level pra conexão).
  - `factory.py` (`get_embeddings_client()` via `EMBEDDINGS_PROVIDER`).
  - `CLAUDE.md` + `AGENTS.md`, 12 testes.

### Infra

- `docker/compose.yml` usa `pgvector/pgvector:pg18` com mount em `/var/lib/postgresql` (padrão Postgres 18+); mount `../knowledge_base:/knowledge_base` em backend + celery_worker.
- `backend/pyproject.toml` com `pgvector ^0.3` e `python-frontmatter ^1.1`. `knowledge` em `[tool.ruff.lint.isort].known-first-party`.
- `Makefile` alvos: `ingest-knowledge`, `ingest-knowledge-force`, `knowledge-status`.
- `.env.example` com bloco `EMBEDDINGS_*` (provider, api_key, model, dim).
- `backend/config/settings/base.py`: app registrado, `KNOWLEDGE_BASE_DIR = BASE_DIR.parent / "knowledge_base"`, `KNOWLEDGE_CHUNK_SIZE=300`, `KNOWLEDGE_CHUNK_OVERLAP=50`, `EMBEDDINGS_*` via `decouple.config`.
- `backend/config/urls.py` inclui `knowledge.api.urls` em `/api/v1/knowledge/`.

### Knowledge base inicial

```
knowledge_base/
├── README.md (mestre — frontmatter + categorias + workflow)
├── interviewing/README.md
├── writing/README.md + _sample_action_verbs.md (real)
├── ats/README.md
├── rubric/README.md + _sample_rubric.md (real)
└── templates/README.md
```

### Documentação

- [`docs/conceitos-fundamentais.md`](../../conceitos-fundamentais.md) — embeddings, pgvector, chunking, KnowledgeDocument/Chunk, dois modos.
- [`docs/decisions/0002-multi-agent-sem-framework.md`](../../decisions/0002-multi-agent-sem-framework.md) — por que use cases dedicados + tool use nativo, não LangGraph.
- [`docs/decisions/0003-knowledge-base-format.md`](../../decisions/0003-knowledge-base-format.md) — por que MD + frontmatter, ingest idempotente, dois modos de consumo, Voyage AI.

## Decisões tomadas (vs defaults planejados)

| Decisão | Default planejado | Decidido | Motivo |
|---|---|---|---|
| Provider de embeddings | Voyage AI | Voyage AI | Qualidade pra texto técnico justifica |
| Tamanho dos chunks | 300 palavras com overlap 50 | Mesmo | OK |
| Índice pgvector | Sem índice (sequential scan) | Sem índice | Volume baixo (<10k chunks); HNSW vira otimização futura |
| Modelagem (genérica vs N models por categoria) | Genérica | Genérica via MD + frontmatter | ADR 0003 |
| Migration pra ativar pgvector | `VectorExtension()` da pgvector-python | `migrations.RunSQL("CREATE EXTENSION ...")` | `VectorExtension` é incompat com Django 6 (falta `hints` attribute) |
| Mount do Postgres no Docker | `/var/lib/postgresql/data` | `/var/lib/postgresql` | Postgres 18+ recomenda mount no diretório pai; `/data` dispara erro "unused mount/volume" |

## Verificação realizada

- `make migrate` ✅ ativa extensão `vector` + cria tabelas
- `make test-fast` ✅ 109 passed, 1 skipped, 0 failures em 6.5s
- `make ingest-knowledge` (com `FakeEmbeddingsClient` injetado via shell): 8 descobertos → 6 placeholders pulados → 2 novos com 12 chunks
- 2ª rodada idempotente: 0 new, 0 updated, 2 unchanged ✅
- `KnowledgeLoader.load_for_agent("writer")` retorna 2070 chars; `load_for_agent("judge")` retorna 2294 chars; `load_for_agent("inexistente")` retorna string vazia ✅
- `GET /api/v1/knowledge/status/` retorna 401 sem auth ✅

## Reuso disponibilizado pras fases seguintes

Todos os agentes futuros devem consumir via:

```python
# Em qualquer use case de agente
from knowledge.services.loader import KnowledgeLoader

class RunSomeAgent:
    def __init__(self, llm_client=None, knowledge=None):
        self.llm = llm_client or AnthropicClient()
        self.knowledge = knowledge or KnowledgeLoader()

    def execute(self, ...):
        # Full-load (priority=always) — vai pro system prompt
        kb_block = self.knowledge.load_for_agent("writer")

        # Retrieval (priority=retrieve) — top-k chunks pra few-shot
        chunks = self.knowledge.retrieve_chunks(
            query="...",
            agents=["writer"],
            k=3,
            min_similarity=0.5,
        )
```

DI via `__init__` é o padrão — testes substituem por `FakeEmbeddingsClient` (já existe em `knowledge/tests/conftest.py`) sem mock de pgvector.
