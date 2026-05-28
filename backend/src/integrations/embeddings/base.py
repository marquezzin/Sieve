"""Interface abstrata da categoria embeddings.

Define o contrato que toda implementação concreta (VoyageEmbeddingsClient,
futuramente OpenAIEmbeddingsClient) deve cumprir. Use cases dependem desta
interface, não da implementação.

Embeddings = vetorização de texto pra retrieval semântico (pgvector).
O cliente devolve listas de floats; quem chama persiste/consulta.
"""

from abc import ABC, abstractmethod
from typing import Literal

InputType = Literal["document", "query"]


class EmbeddingsError(Exception):
    """Erro genérico de embeddings externo. Implementações re-raise como esta."""


class EmbeddingsClient(ABC):
    """Interface abstrata para clientes de embeddings da camada integrations."""

    @abstractmethod
    def embed_batch(
        self,
        texts: list[str],
        *,
        input_type: InputType = "document",
    ) -> list[list[float]]:
        """Vetoriza uma lista de textos.

        Retorna lista de vetores na MESMA ordem dos textos de entrada.
        `input_type` distingue documento (indexação) de query (busca) — alguns
        modelos otimizam de forma diferente.
        """
        raise NotImplementedError

    def embed(
        self,
        text: str,
        *,
        input_type: InputType = "document",
    ) -> list[float]:
        """Helper: vetoriza um texto único. Wrapper sobre embed_batch."""
        vectors = self.embed_batch([text], input_type=input_type)
        if not vectors:
            raise EmbeddingsError("embed_batch retornou lista vazia para 1 texto")
        return vectors[0]
