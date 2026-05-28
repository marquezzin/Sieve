# `knowledge/` — base de conhecimento dos agentes

Dono único da knowledge base. Ingere arquivos `.md` de `knowledge_base/` (raiz do repo) para o Postgres (com pgvector) e expõe a interface `KnowledgeLoader` que os agentes consomem.

> **Em conflito com `backend/CLAUDE.md`, esse perde.** Conceitos cobertos em [`docs/conceitos-fundamentais.md`](../../../docs/conceitos-fundamentais.md). Decisão arquitetural em [`docs/decisions/0003-knowledge-base-format.md`](../../../docs/decisions/0003-knowledge-base-format.md).

## Responsabilidade

- Ingerir arquivos `.md` (frontmatter YAML + corpo MD) em duas tabelas: `KnowledgeDocument` (1 por arquivo) e `KnowledgeChunk` (N por documento, com embedding pgvector).
- Garantir **idempotência** via `content_hash` SHA-256 — rodar `make ingest-knowledge` N vezes com mesmo conteúdo = 0 mudanças.
- Oferecer `KnowledgeLoader` com 2 modos: `load_for_agent(name)` (full-load) e `retrieve_chunks(query, agents, k)` (RAG via pgvector).
- Expor endpoint de debug `/api/v1/knowledge/status/` listando docs ingeridos.

**NÃO faz parte:** ingest automático em background (decisão do usuário rodar via `make`), edição de conteúdo via UI (knowledge base mora no git, edita no editor), modelos por categoria (`ResumeExample`, `ATSRule`, etc — ADR 0003 explica por que não).

## Models

### `KnowledgeDocument`

| Field | Tipo | Obs |
|---|---|---|
| `id` | UUID v7 (BaseModel) | PK |
| `source_path` | CharField(512) unique | `knowledge_base/<sub>/<file>.md` relativo à raiz do repo |
| `category` | CharField(64) | do frontmatter |
| `agents` | JSONField list | quais agentes consomem |
| `priority` | choices: `always` / `retrieve` | modo de consumo |
| `tags` | JSONField list | livre, pra filtros |
| `metadata` | JSONField dict | campos extras do frontmatter (level, target_role, score, ...) |
| `content_md` | TextField | conteúdo MD sem o frontmatter |
| `content_hash` | CharField(64) | SHA-256 do raw — chave de cache do ingest |

Indexes: `category`, `priority`. Ordering: `category, source_path`.

### `KnowledgeChunk`

| Field | Tipo | Obs |
|---|---|---|
| `id` | UUID v7 (BaseModel) | PK |
| `document` | FK CASCADE | doc pai |
| `ordinal` | PositiveIntegerField | 0, 1, 2... — preserva ordem original |
| `content` | TextField | texto do chunk (~300 palavras) |
| `embedding` | VectorField(EMBEDDINGS_DIM) | vetor pgvector |
| `metadata` | JSONField | `{"heading": "..."}` quando vier de subseção |

Unique constraint: `(document, ordinal)`. Ordering: `document_id, ordinal`.

## Services

| Arquivo | Função |
|---|---|
| `services/frontmatter.py` | `parse_file(path) -> ParsedDocument | None` — valida frontmatter YAML, retorna `None` se ausente (READMEs placeholder). |
| `services/chunker.py` | `chunk_markdown(md, max_words, overlap_words) -> list[Chunk]` — quebra em headers `##+` e parágrafos. |
| `services/ingest.py` | `run_ingest(*, knowledge_dir=None, embeddings_client=None, force=False) -> IngestReport` — pipeline completo. |
| `services/loader.py` | `KnowledgeLoader.load_for_agent(agent)` + `retrieve_chunks(query, agents, k, min_similarity, filters)`. |

## Selectors

- `list_documents()` — annotated com `chunk_count`.
- `list_documents_for_agent(agent)`.
- `count_chunks()`, `count_documents()`.

## Endpoint

| Método | Path | Permissão | Ação |
|---|---|---|---|
| GET | `/api/v1/knowledge/status/` | `IsAdminUser` | Lista docs ingeridos, totais, config de embeddings |

## Como agentes futuros consomem

```python
# Em um use case de agente (futuro app `agents/`)
from knowledge.services.loader import KnowledgeLoader

class RunWriter:
    def __init__(self, llm_client=None, knowledge=None):
        self.llm = llm_client or AnthropicClient()
        self.knowledge = knowledge or KnowledgeLoader()

    def execute(self, session):
        # Full-load — vai pro system prompt, cached
        kb_block = self.knowledge.load_for_agent("writer")

        # Retrieval — top-k chunks pra few-shot, sob demanda
        examples = self.knowledge.retrieve_chunks(
            query=f"exemplos de bullets pra {session.target_role}",
            agents=["writer"],
            k=3,
            min_similarity=0.5,
        )
        # ...
```

## Stop list

- **Nunca** modelar entidades por categoria (`ResumeExample`, `ATSRule`...). Frontmatter YAML + `JSONField metadata` cobre — ADR 0003.
- **Nunca** cachear `KnowledgeLoader` em memória do processo. Verdade é o banco; ingest re-popula; cache de prompt do Anthropic cobre re-leitura.
- **Nunca** injetar embedding no LLM. Embedding é índice de busca interno. LLM recebe texto.
- **Nunca** fazer CRUD de `KnowledgeDocument` via admin/API — knowledge base é alimentada por `make ingest-knowledge`. Admin é read-only.
- **Nunca** rodar ingest dentro de request HTTP — é operação síncrona com chamada externa de embeddings, vai pra `make` ou Celery task isolada se virar necessário.

## Testes

Fixtures em `tests/factories.py`. Mock do `EmbeddingsClient` injetado via `__init__` em `KnowledgeLoader` e via parâmetro em `run_ingest(embeddings_client=...)`. Não há mock de pgvector — testes de retrieval rodam no Postgres real (gate `make test-fast` usa `--reuse-db`).
