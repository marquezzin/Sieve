"""Verdade de fase derivada do `collected_data` da entrevista.

A fase da entrevista não pode depender só de o LLM lembrar de chamar
`mark_phase_complete` — modelos fracos esquecem e a entrevista trava. Estas
funções calculam, de forma determinística, em que ponto a coleta REALMENTE está,
a partir do que já foi gravado. Servem a três propósitos:

1. Reconciliar `current_phase` no fim de cada turn (piso que nunca regride).
2. Montar o checklist de estado vivo injetado no system prompt.
3. Gatear `mark_phase_complete` — não deixa avançar por cima de uma seção que
   ainda tem dado pendente (não gravado e não marcado como vazio). Isso pega o
   modelo que ALUCINA "registrei X" no texto sem chamar a tool `record_*`.

Uma seção está **resolvida** quando o mínimo foi coletado OU quando o candidato
declarou genuinamente não ter aquilo (`mark_section_empty` → `_skipped`). O piso
e o gate trabalham sobre "resolvido", não sobre "coletado" — assim um candidato
de primeiro emprego (sem experiência) ou sem projetos não trava, mas uma seção
pendente de verdade (dado existe mas não foi gravado) bloqueia o avanço.

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

# Seções que o candidato pode genuinamente NÃO ter — puláveis via
# `mark_section_empty` quando ele declarar que não tem (primeiro emprego sem
# experiência, nenhum projeto, sem formação formal). `personal_info` e `skills`
# nunca são puláveis — são o núcleo irredutível do currículo.
SKIPPABLE_PHASES: frozenset[str] = frozenset(
    {Phase.EDUCATION, Phase.EXPERIENCE, Phase.PROJECTS}
)

# Chave de controle no `collected_data` com a lista de seções marcadas como
# vazias de propósito. Prefixo `_` sinaliza metadado interno (não é dado de CV).
SKIPPED_KEY = "_skipped"

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


def skipped_sections(collected_data: dict) -> set[str]:
    """Seções marcadas como genuinamente vazias pelo candidato (via
    `mark_section_empty`). Filtra pra só fases puláveis — um valor inválido em
    `_skipped` é ignorado, nunca burla uma seção obrigatória."""
    raw = (collected_data or {}).get(SKIPPED_KEY) or []
    return {s for s in raw if s in SKIPPABLE_PHASES}


def section_resolved(collected_data: dict) -> dict[str, bool]:
    """Por seção: resolvida = mínimo coletado OU marcada como vazia.

    É sobre "resolvido" (não "coletado") que o piso e o gate de fase trabalham.
    """
    status = section_status(collected_data)
    skipped = skipped_sections(collected_data)
    return {phase: (status.get(phase, False) or phase in skipped) for _k, phase in _DATA_SECTIONS}


def missing_sections_before(collected_data: dict, next_phase: str) -> list[str]:
    """Seções de dados anteriores a `next_phase` que ainda NÃO estão resolvidas
    (nem coletadas, nem marcadas vazias). Lista vazia = pode avançar para
    `next_phase`. É a checagem que o gate de `mark_phase_complete` usa pra barrar
    um avanço por cima de dado pendente."""
    resolved = section_resolved(collected_data)
    limit = phase_index(next_phase)
    return [
        phase
        for _key, phase in _DATA_SECTIONS
        if phase_index(phase) < limit and not resolved.get(phase)
    ]


def derive_phase_floor(collected_data: dict) -> str:
    """Fase mais avançada alcançada por seções resolvidas CONTÍGUAS (piso honesto).

    Caminha as seções na ordem e PARA no primeiro buraco real (seção nem coletada
    nem marcada vazia) — não pula gaps. Assim a fase reflete a verdade: se a
    experiência tem dado pendente, o piso fica em `education` e o sistema não
    mascara o furo avançando pra `skills`. Seções legitimamente vazias
    (`mark_section_empty`) contam como resolvidas e o piso flui por elas.

    Teto = `skills`: `review`/`done` não são deriváveis de dados (dependem do LLM
    confirmar a revisão ou do usuário finalizar). Sem nada resolvido → `intro`.
    """
    resolved = section_resolved(collected_data)
    floor = Phase.INTRO
    for _key, phase in _DATA_SECTIONS:
        if not resolved.get(phase):
            break
        floor = phase
    return str(floor)
