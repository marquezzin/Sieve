"""Schemas das tools dos agentes do pipeline de currículo (formato canônico
Anthropic `{name, description, input_schema}`; o adapter da OpenAI traduz).

Writer e reviewer submetem o MESMO shape (`structured_data` — ver
`resumes/CLAUDE.md`) via `submit_resume`. O juiz submete as 6 notas + feedback via
`submit_score`. Esses agentes são single-shot: chamam UMA tool de submissão e o
use case captura o `input` (ver `agents/use_cases/structured.py`).
"""

_STRING = {"type": "string"}
_STRING_LIST = {"type": "array", "items": {"type": "string"}}

# Schema de uma entrada de experiência/projeto/formação — `id` estável p/ o diff.
_EXPERIENCE_ITEM = {
    "type": "object",
    "properties": {
        "id": {"type": "string", "description": "slug estável, ex: 'nubank-backend-pleno'"},
        "role": _STRING,
        "company": _STRING,
        "start": {"type": "string", "description": "ex: '2022', '2022-03'"},
        "end": {"type": "string", "description": "ex: '2024', 'Atual'"},
        "location": _STRING,
        "bullets": _STRING_LIST,
        "tech_stack": _STRING_LIST,
    },
    "required": ["id", "role", "company", "bullets"],
}

_EDUCATION_ITEM = {
    "type": "object",
    "properties": {
        "id": _STRING,
        "course": _STRING,
        "institution": _STRING,
        "start": _STRING,
        "end": _STRING,
        "status": {"type": "string", "description": "'in_progress' | 'done' (ou vazio)"},
    },
    "required": ["id", "course", "institution"],
}

_PROJECT_ITEM = {
    "type": "object",
    "properties": {
        "id": _STRING,
        "name": _STRING,
        "description": _STRING,
        "bullets": _STRING_LIST,
        "tech_stack": _STRING_LIST,
    },
    "required": ["id", "name"],
}

RESUME_INPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "personal_info": {
            "type": "object",
            "properties": {
                "name": _STRING,
                "email": _STRING,
                "phone": _STRING,
                "location": _STRING,
                "linkedin_url": _STRING,
                "github_url": _STRING,
            },
        },
        "summary": {
            "type": "string",
            "description": (
                "Resumo profissional, 2-4 frases, em PRIMEIRA PESSOA do singular "
                "('Sou...', 'Desenvolvi...') — nunca terceira pessoa."
            ),
        },
        "experiences": {"type": "array", "items": _EXPERIENCE_ITEM},
        "education": {"type": "array", "items": _EDUCATION_ITEM},
        "projects": {"type": "array", "items": _PROJECT_ITEM},
        "skills": _STRING_LIST,
    },
    "required": ["personal_info", "summary", "experiences", "skills"],
}


def build_resume_tool(*, name: str = "submit_resume", description: str) -> dict:
    """Tool de submissão do currículo estruturado (writer e reviewer)."""
    return {"name": name, "description": description, "input_schema": RESUME_INPUT_SCHEMA}


# Os 6 critérios da rubrica (`knowledge_base/rubric/full_rubric.md`). As keys são
# o contrato de `ResumeScore.criteria`; os pesos vivem em `run_judge.RUBRIC_WEIGHTS`.
SCORE_CRITERIA = (
    "action_verbs",
    "metrics",
    "cliches",
    "specificity",
    "conciseness",
    "formatting",
)

_SCORE_FIELD = {"type": "number", "description": "Nota 0–10 (uma casa decimal)."}

SUBMIT_SCORE_TOOL = {
    "name": "submit_score",
    "description": (
        "Submete a avaliação do currículo: nota 0–10 para cada um dos 6 critérios "
        "da rubrica + feedback acionável. NÃO calcule a média geral — o sistema "
        "computa a média ponderada a partir dos critérios."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "criteria": {
                "type": "object",
                "properties": {k: _SCORE_FIELD for k in SCORE_CRITERIA},
                "required": list(SCORE_CRITERIA),
            },
            "feedback": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "tone": {"type": "string", "description": "'green' | 'yellow' | 'red'"},
                        "text": {"type": "string"},
                    },
                    "required": ["tone", "text"],
                },
            },
        },
        "required": ["criteria", "feedback"],
    },
}
