"""Interface abstrata da categoria headshot.

Define o contrato que toda implementação concreta (RenderHeadshotClient,
FakeHeadshotClient) deve cumprir. Use cases dependem desta interface, não da
implementação.

Headshot = geração de foto profissional a partir de uma foto base. O cliente
recebe bytes e devolve bytes; quem chama persiste/serve o resultado.
"""

from abc import ABC, abstractmethod


class HeadshotError(Exception):
    """Erro genérico da categoria headshot. Implementações re-raise como esta."""


class HeadshotClient(ABC):
    @abstractmethod
    def generate(
        self,
        image_bytes: bytes,
        *,
        filename: str = "photo.png",
        content_type: str = "image/png",
    ) -> bytes:
        """Recebe os bytes da foto base e devolve os bytes do PNG do headshot
        profissional gerado. Erros viram HeadshotError."""
        raise NotImplementedError
