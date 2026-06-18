"""Render de uma `ResumeVersion` → bytes de PDF.

Não depende de WeasyPrint/GTK (não instalado): faz mock do `get_pdf_renderer`
no módulo do use case por um fake cujo `.render(html)` devolve bytes canned. A
validação de %PDF real vive em `integrations/pdf/tests` (skip-guarded) — aqui só
checamos a delegação.
"""

import pytest

from resumes.tests.factories import ResumeVersionFactory
from resumes.use_cases.render_to_pdf import render_version_to_pdf

FAKE_PDF = b"%PDF-1.7\n" + b"0" * 1100  # > 1KB


class FakeRenderer:
    def __init__(self):
        self.render_calls = []

    def render(self, html, *, base_url=None):
        self.render_calls.append(html)
        return FAKE_PDF


@pytest.mark.django_db
def test_produces_valid_pdf_bytes(monkeypatch):
    fake = FakeRenderer()
    monkeypatch.setattr(
        "resumes.use_cases.render_to_pdf.get_pdf_renderer",
        lambda: fake,
    )
    version = ResumeVersionFactory(html_rendered="<html><body>cv</body></html>")

    pdf = render_version_to_pdf(version)

    assert pdf == FAKE_PDF
    assert pdf.startswith(b"%PDF")
    assert len(pdf) > 1024


@pytest.mark.django_db
def test_rerenders_from_structured_data_not_frozen_html(monkeypatch):
    # O PDF re-renderiza do structured_data (template atual), NÃO usa o
    # html_rendered congelado — melhorias no template valem retroativamente.
    from resumes.tests.factories import SAMPLE_STRUCTURED

    fake = FakeRenderer()
    monkeypatch.setattr(
        "resumes.use_cases.render_to_pdf.get_pdf_renderer",
        lambda: fake,
    )
    version = ResumeVersionFactory(
        html_rendered="<html><body>HTML CONGELADO</body></html>",
        structured_data=dict(SAMPLE_STRUCTURED),
    )

    render_version_to_pdf(version)

    rendered_html = fake.render_calls[0]
    assert rendered_html != version.html_rendered
    assert "HTML CONGELADO" not in rendered_html
    assert SAMPLE_STRUCTURED["personal_info"]["name"] in rendered_html
