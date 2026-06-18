"""Renderiza uma `ResumeVersion` (HTML já materializado) em bytes de PDF.

Delega pra integração `integrations.pdf` (WeasyPrint ou outro provider). A
integração é opt-in: se a lib não estiver instalada, o factory levanta erro —
quem chama (a view de download) trata e devolve 503.
"""

from integrations.pdf.factory import get_pdf_renderer
from resumes.models import ResumeVersion
from resumes.use_cases.render_to_html import render_structured_data_to_html


def render_version_to_pdf(version: ResumeVersion) -> bytes:
    """Renderiza a versão em PDF (modelo ATS-safe sóbrio).

    Re-renderiza a partir do `structured_data` (fonte da verdade), NÃO do
    `html_rendered` congelado na geração — assim melhorias no template valem
    retroativamente pros currículos já gerados. O `html_rendered` segue como
    snapshot do writer, mas não alimenta mais o PDF.
    """
    renderer = get_pdf_renderer()
    html = render_structured_data_to_html(version.structured_data)
    return renderer.render(html)
