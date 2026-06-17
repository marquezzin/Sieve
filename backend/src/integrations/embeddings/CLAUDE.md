# `integrations/embeddings/` — vetorização de texto

Responsável por transformar texto em vetores numéricos (embeddings) usados
pra retrieval semântico via pgvector. **Não persiste, não consulta DB, não
sabe nada do domínio** — só fala HTTP com o provider e devolve `list[float]`.

> Regras gerais em [`backend/CLAUDE.md`](../../../CLAUDE.md) e
> [`integrations/CLAUDE.md`](../CLAUDE.md). Em conflito, esses ganham.

## Providers suportados

| Provider | Default model | Dim | Quando usar |
|---|---|---|---|
| `voyage` (default) | `voyage-3` | 1024 | Texto técnico em geral (escolha do Sieve) |
| `fake` | determinístico (hash de tokens) | `EMBEDDINGS_DIM` | Offline/sem credencial — teste e o signal de embedding do `ResumeVersion` (`EMBEDDINGS_PROVIDER=fake`) |
| `openai` (TODO) | — | — | Custo menor; ainda não implementado |

Pra adicionar provider novo: ver header de `factory.py`.

## Env vars

| Var | Default | Descrição |
|---|---|---|
| `EMBEDDINGS_PROVIDER` | `voyage` | Qual implementação carregar |
| `EMBEDDINGS_API_KEY` | — | Credencial do provider escolhido (obrigatório) |
| `EMBEDDINGS_MODEL` | depende | Nome do modelo no provider |
| `EMBEDDINGS_TIMEOUT` | `30.0` | Timeout HTTP (segundos) — batches grandes precisam folga |
| `EMBEDDINGS_MAX_RETRIES` | `3` | Tentativas em 5xx/erro de conexão |

## Uso

```python
from integrations.embeddings.factory import get_embeddings_client

client = get_embeddings_client()

# Documento (indexação)
vec = client.embed("conteudo do chunk")  # list[float] de N dimensões
vectors = client.embed_batch(["chunk 1", "chunk 2"])  # list[list[float]]

# Query (busca semântica) — alguns modelos otimizam diferente
query_vec = client.embed("como começar bullet com verbo", input_type="query")
```

Em use cases, injete o cliente no `__init__` pra facilitar teste:

```python
class IngestKnowledgeUseCase:
    def __init__(self, embeddings=None):
        self._embeddings = embeddings or get_embeddings_client()
```

## Regras duras

- **HTTP só com `httpx`.** Sem `requests`, sem SDK próprio do Voyage (API é simples).
- **Sem persistência.** Não importe Django models. Quem chama persiste os vetores.
- **Sem `rest_framework`.** Não é HTTP-aware.
- **Sem domain knowledge.** Não importe de `knowledge/`, `chat/`, etc.
- **Re-raise como `EmbeddingsError`.** Capturou `httpx.HTTPError`/`KeyError`/`ValueError`?
  Embrulha e re-raise — nunca propaga exceção de baixo nível pro caller.
- **Retry sem `time.sleep`.** Conexão usa `httpx.HTTPTransport(retries=N)`.
  5xx usa loop imediato (rede tem latência natural). Tenacity não está na stack.
- **Ordem dos vetores = ordem dos textos.** `embed_batch(["a","b","c"])` devolve
  `[vec_a, vec_b, vec_c]`. Voyage retorna `index` em cada item — ordenamos no parse.

## Stop list

- Loop `for _ in range(N): time.sleep(2 ** i)` — proibido.
- `except Exception: pass` — proibido. Sempre re-raise como `EmbeddingsError`.
- Persistir vetor em DB dentro do cliente — proibido. Cliente devolve, caller salva.
- Hardcode de API key — proibido. Sempre via `decouple.config` (no factory).
