"""Renderizador HTML → PDF via WeasyPrint.

Ative com `uv add weasyprint` no produto que precisar — a lib NÃO está no
pyproject default do template porque render de PDF é opt-in por produto.

Padrões importantes:
- import lazy do `weasyprint` dentro do método (não quebra import estático
  enquanto a dep não estiver instalada).
- qualquer exceção do WeasyPrint (incl. ImportError) vira `PdfRenderError`,
  sem swallowing (regra da camada).
"""

from .base import PdfRenderer, PdfRenderError


class WeasyPrintRenderer(PdfRenderer):
    """Implementação de PdfRenderer baseada em WeasyPrint."""

    def render(self, html: str, *, base_url: str | None = None) -> bytes:
        try:
            # Import lazy — weasyprint NÃO está no pyproject default.
            # Ative com `uv add weasyprint` no produto que consumir esse client.
            from weasyprint import HTML
        except ImportError as exc:
            raise PdfRenderError(
                "weasyprint não instalado — uv add weasyprint"
            ) from exc

        try:
            return HTML(string=html, base_url=base_url).write_pdf()
        except Exception as exc:  # noqa: BLE001 — re-raise como erro do módulo
            raise PdfRenderError(f"WeasyPrint render falhou: {exc}") from exc
