"""`KnowledgeLoader` — interface que os agentes (futuros) usam pra consumir a knowledge base.

Dois modos, descritos em detalhes em `docs/conceitos-fundamentais.md`:

1. **Full-load** (`load_for_agent`): concatena `content_md` de todos os docs
   `priority=always` daquele agente. Vai pro system prompt, com `cache_control`
   do Anthropic SDK (responsabilidade do caller).
2. **Retrieval** (`retrieve_chunks`): busca top-k chunks `priority=retrieve` por
   similaridade coseno via pgvector. Aceita threshold de similaridade pra evitar
   injetar exemplo ruim.

DI via construtor: agentes injetam `Loader` no `__init__` — testes substituem
por `FakeKnowledgeLoader` sem precisar mock de pgvector.
"""
from dataclasses import dataclass

from django.conf import settings
from pgvector.django import CosineDistance

from core.errors import ApplicationError
from integrations.embeddings.base import EmbeddingsClient
from integrations.embeddings.factory import get_embeddings_client

from ..models import KnowledgeChunk, KnowledgeDocument


@dataclass(frozen=True)
class RetrievedChunk:
    """Resultado de `retrieve_chunks` — chunk + distância coseno + similaridade."""

    chunk_id: str
    document_path: str
    ordinal: int
    content: str
    distance: float

    @property
    def similarity(self) -> float:
        # pgvector retorna distância coseno em [0, 2]. Similaridade = 1 - distância.
        return 1.0 - self.distance


class KnowledgeLoader:
    """Interface única dos agentes pra consumir a knowledge base.

    Não cacheia em memória — a verdade está no banco, e o cache do prompt do
    Anthropic já cobre re-leitura de system prompt assemblado.
    """

    def __init__(self, embeddings_client: EmbeddingsClient | None = None) -> None:
        self._embeddings_client = embeddings_client

    @property
    def embeddings(self) -> EmbeddingsClient:
        # Lazy: só instancia quando precisa (retrieval). full-load não chama API externa.
        if self._embeddings_client is None:
            self._embeddings_client = get_embeddings_client()
        return self._embeddings_client

    def load_for_agent(self, agent: str) -> str:
        """Concatena `content_md` de todos os docs `priority=always` do agente.

        Retorna string única pronta pra ir no system prompt (separada por `\\n\\n---\\n\\n`
        entre docs pra o LLM enxergar a fronteira). String vazia se agente não
        tem docs `always` ainda — caller decide se loga warning ou ignora.
        """
        docs = (
            KnowledgeDocument.objects
            .filter(priority=KnowledgeDocument.Priority.ALWAYS, agents__contains=[agent])
            .order_by("category", "source_path")
        )
        parts = [
            f"<!-- source: {d.source_path} -->\n{d.content_md.strip()}"
            for d in docs
        ]
        return "\n\n---\n\n".join(parts)

    def retrieve_chunks(
        self,
        query: str,
        agents: list[str],
        k: int = 5,
        min_similarity: float | None = None,
        filters: dict | None = None,
    ) -> list[RetrievedChunk]:
        """Top-k chunks `priority=retrieve` mais próximos do `query` semanticamente.

        - `agents`: filtra chunks cujo documento pai tem qualquer um destes agentes.
        - `k`: quantidade a retornar (default 5).
        - `min_similarity`: se passado, descarta chunks com similaridade abaixo
          do threshold (recomendado: 0.5). Top-k sempre retorna k, mesmo que
          todos sejam ruins; threshold filtra "nenhum chunk bom" vs "k chunks ok".
        - `filters`: filtros adicionais em `document__metadata__<chave>=valor`
          (ex: `{"level": "junior"}` filtra docs com `metadata.level == "junior"`).
        """
        if not query.strip():
            raise ApplicationError("query vazia em retrieve_chunks")
        if not agents:
            raise ApplicationError("agents vazio em retrieve_chunks")

        query_vector = self.embeddings.embed(query, input_type="query")

        qs = KnowledgeChunk.objects.filter(
            document__priority=KnowledgeDocument.Priority.RETRIEVE,
        )
        # Match em qualquer agente da lista (OR via Q seria mais limpo, mas
        # JSONField__contains com lista pequena é equivalente prático).
        from django.db.models import Q
        agent_q = Q()
        for a in agents:
            agent_q |= Q(document__agents__contains=[a])
        qs = qs.filter(agent_q)

        if filters:
            for key, value in filters.items():
                qs = qs.filter(**{f"document__metadata__{key}": value})

        qs = qs.annotate(distance=CosineDistance("embedding", query_vector)).order_by("distance")[:k]

        results = [
            RetrievedChunk(
                chunk_id=str(c.id),
                document_path=c.document.source_path,
                ordinal=c.ordinal,
                content=c.content,
                distance=float(c.distance),
            )
            for c in qs
        ]

        if min_similarity is not None:
            results = [r for r in results if r.similarity >= min_similarity]

        return results
