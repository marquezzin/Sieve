"""Render de `structured_data` → HTML ATS-safe.

Contrato: UMA `<section>` por área presente (personal/summary, experiences,
education, skills, projects). O template `resume/default.html` agrupa
personal_info + summary numa única `<section>` (o cabeçalho).
"""

from resumes.tests.factories import SAMPLE_STRUCTURED
from resumes.use_cases.render_to_html import render_structured_data_to_html


def test_renders_all_sections():
    html = render_structured_data_to_html(SAMPLE_STRUCTURED)

    # Cabeçalho (personal_info + summary) numa section + experiences + education
    # + skills + projects = 5 sections quando todas as áreas estão presentes.
    assert html.count("<section>") == 5

    # Conteúdo das áreas aparece no HTML.
    assert SAMPLE_STRUCTURED["personal_info"]["name"] in html
    assert SAMPLE_STRUCTURED["summary"] in html
    assert "Experiência Profissional" in html
    assert "Nubank" in html
    assert "Formação" in html
    assert "USP" in html
    assert "Habilidades" in html
    assert "Python" in html
    assert "Projetos" in html
    assert "devkit" in html


def test_omits_empty_sections():
    # Só personal_info + summary → uma única section (o cabeçalho).
    minimal = {"personal_info": {"name": "Ana"}, "summary": "Resumo."}
    html = render_structured_data_to_html(minimal)
    assert html.count("<section>") == 1
    assert "Experiência Profissional" not in html
    assert "Formação" not in html
