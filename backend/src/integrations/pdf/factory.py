"""Factory de PdfRenderer.

Hoje sempre devolve WeasyPrintRenderer. Quando houver outro provider (ex:
serviço externo de PDF), esta função decide com base em config qual usar.
"""

from .base import PdfRenderer
from .weasyprint_client import WeasyPrintRenderer


def get_pdf_renderer() -> PdfRenderer:
    """Retorna a implementação default de PdfRenderer (WeasyPrint)."""
    return WeasyPrintRenderer()
