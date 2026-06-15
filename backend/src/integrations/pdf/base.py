"""Interface abstrata da categoria pdf.

Define o contrato de render HTML → PDF que toda implementação concreta
(WeasyPrintRenderer, futuramente outras) deve cumprir. Use cases dependem
desta interface, não da implementação.
"""

from abc import ABC, abstractmethod


class PdfRenderError(Exception):
    """Erro de render de PDF. Implementações devem re-raise como esta."""


class PdfRenderer(ABC):
    """Interface abstrata para renderizadores HTML → PDF da camada integrations."""

    @abstractmethod
    def render(self, html: str, *, base_url: str | None = None) -> bytes:
        """Renderiza `html` num PDF e devolve os bytes do arquivo.

        `base_url` resolve recursos relativos (imagens, CSS) no HTML.
        """
        raise NotImplementedError
