"""Renderiza `structured_data` em HTML ATS-safe.

ATS-safe = sans-serif, sem tabelas, sem colunas, sem imagens; hierarquia só por
headings. O CSS vai inline num `<style>` no template (conservador o bastante pra
funcionar tanto no browser quanto no WeasyPrint na hora de virar PDF). Seções
vazias são omitidas pelo próprio template (cada `{% if %}` vira uma `<section>`).
"""

from django.template.loader import render_to_string

# Rótulo exibível do `status` da formação. O dado guarda o valor de máquina
# ('done'/'in_progress'); no PDF mostramos o texto em português. Valor
# desconhecido/vazio → sem rótulo (não vaza o valor cru no currículo).
_EDUCATION_STATUS_LABELS = {
    "done": "Concluído",
    "in_progress": "Em andamento",
}


def _education_for_template(education: list) -> list:
    """Copia cada formação adicionando `status_label` (status traduzido). Não muta
    a entrada original — o template consome `status_label`, nunca o `status` cru."""
    result = []
    for edu in education or []:
        entry = dict(edu)
        entry["status_label"] = _EDUCATION_STATUS_LABELS.get(entry.get("status"), "")
        result.append(entry)
    return result


def render_structured_data_to_html(structured_data: dict) -> str:
    data = structured_data or {}
    context = {
        "personal_info": data.get("personal_info") or {},
        "summary": (data.get("summary") or "").strip(),
        "experiences": data.get("experiences") or [],
        "education": _education_for_template(data.get("education")),
        "projects": data.get("projects") or [],
        "skills": data.get("skills") or [],
    }
    return render_to_string("resume/default.html", context)
