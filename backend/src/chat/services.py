"""Verdade de fase derivada do `collected_data` da entrevista.

A fase da entrevista não pode depender só de o LLM lembrar de chamar
`mark_phase_complete` — modelos fracos esquecem e a entrevista trava. Estas
funções calculam, de forma determinística, em que ponto a coleta REALMENTE está,
a partir do que já foi gravado. Servem a dois propósitos:

1. Reconciliar `current_phase` no fim de cada turn (piso que nunca regride).
2. Montar o checklist de estado vivo injetado no system prompt.

Os mínimos por seção espelham a tabela de `knowledge_base/interviewing/stop_signals.md`.
Funções puras (sem DB) — recebem o `collected_data` (dict) e devolvem dados.
"""

from chat.models import InterviewSession

Phase = InterviewSession.Phase

# Seções de dados, na ordem do fluxo (intro/review/done não são seções de dados).
# Cada entrada: (chave no collected_data, fase correspondente).
_DATA_SECTIONS: tuple[tuple[str, str], ...] = (
    ("personal_info", Phase.PERSONAL_INFO),
    ("education", Phase.EDUCATION),
    ("experiences", Phase.EXPERIENCE),
    ("projects", Phase.PROJECTS),
    ("skills", Phase.SKILLS),
)

# Ordem completa das fases, pra comparar índices (nunca regredir).
_PHASE_ORDER: list[str] = list(Phase.values)


def phase_index(phase: str) -> int:
    """Índice da fase no fluxo; -1 se desconhecida (trata como 'antes de tudo')."""
    try:
        return _PHASE_ORDER.index(phase)
    except ValueError:
        return -1


def _nonempty(value: object) -> bool:
    return value not in (None, "", [], {})


def _has_min_personal_info(data: dict) -> bool:
    info = data.get("personal_info")
    if not isinstance(info, dict):
        return False
    return all(_nonempty(info.get(f)) for f in ("name", "email", "phone", "location"))


def _has_min_education(data: dict) -> bool:
    items = data.get("education")
    if not isinstance(items, list):
        return False
    return any(
        isinstance(e, dict) and _nonempty(e.get("institution")) and _nonempty(e.get("course"))
        for e in items
    )


def _has_min_experience(data: dict) -> bool:
    items = data.get("experiences")
    if not isinstance(items, list):
        return False
    return any(
        isinstance(e, dict)
        and _nonempty(e.get("company"))
        and _nonempty(e.get("role"))
        and _nonempty(e.get("bullets"))
        for e in items
    )


def _has_min_projects(data: dict) -> bool:
    items = data.get("projects")
    if not isinstance(items, list):
        return False
    return any(isinstance(p, dict) and _nonempty(p.get("name")) for p in items)


def _has_min_skills(data: dict) -> bool:
    skills = data.get("skills")
    return isinstance(skills, list) and len(skills) > 0


_MIN_CHECKS = {
    Phase.PERSONAL_INFO: _has_min_personal_info,
    Phase.EDUCATION: _has_min_education,
    Phase.EXPERIENCE: _has_min_experience,
    Phase.PROJECTS: _has_min_projects,
    Phase.SKILLS: _has_min_skills,
}


def section_status(collected_data: dict) -> dict[str, bool]:
    """Por seção de dados, se o mínimo de coleta foi atingido.

    Chaves devolvidas usam os valores de fase (`personal_info`, `education`,
    `experience`, `projects`, `skills`).
    """
    data = collected_data or {}
    return {phase: check(data) for phase, check in _MIN_CHECKS.items()}


def derive_phase_floor(collected_data: dict) -> str:
    """Fase mais avançada cujo mínimo já foi coletado (piso determinístico).

    Caminha as seções de dados na ordem e devolve a fase de MAIOR índice que está
    satisfeita — projetos vazios (legítimos) são pulados se `skills` já existe.
    Teto = `skills`: `review`/`done` não são deriváveis de dados (dependem do LLM
    confirmar a revisão ou do usuário finalizar). Sem nada coletado → `intro`.
    """
    status = section_status(collected_data)
    floor = Phase.INTRO
    for _key, phase in _DATA_SECTIONS:
        if status.get(phase) and phase_index(phase) > phase_index(floor):
            floor = phase
    return str(floor)
