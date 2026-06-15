"""Renderiza `structured_data` em HTML ATS-safe.

ATS-safe = sans-serif, sem tabelas, sem colunas, sem imagens; hierarquia só por
headings. O CSS vai inline num `<style>` no template (conservador o bastante pra
funcionar tanto no browser quanto no WeasyPrint na hora de virar PDF). Seções
vazias são omitidas pelo próprio template (cada `{% if %}` vira uma `<section>`).
"""

from django.template.loader import render_to_string


def render_structured_data_to_html(structured_data: dict) -> str:
    data = structured_data or {}
    context = {
        "personal_info": data.get("personal_info") or {},
        "summary": (data.get("summary") or "").strip(),
        "experiences": data.get("experiences") or [],
        "education": data.get("education") or [],
        "projects": data.get("projects") or [],
        "skills": data.get("skills") or [],
    }
    return render_to_string("resume/default.html", context)
