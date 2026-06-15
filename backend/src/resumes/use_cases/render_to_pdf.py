"""Renderiza uma `ResumeVersion` (HTML já materializado) em bytes de PDF.

Delega pra integração `integrations.pdf` (WeasyPrint ou outro provider). A
integração é opt-in: se a lib não estiver instalada, o factory levanta erro —
quem chama (a view de download) trata e devolve 503.
"""

from integrations.pdf.factory import get_pdf_renderer
from resumes.models import ResumeVersion


def render_version_to_pdf(version: ResumeVersion) -> bytes:
    renderer = get_pdf_renderer()
    return renderer.render(version.html_rendered)
