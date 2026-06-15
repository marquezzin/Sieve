"""Schemas das tools do entrevistador (formato canônico Anthropic:
`{name, description, input_schema}`). O adapter da OpenAI traduz pro formato
`function` automaticamente.

Cada tool `record_*` popula `InterviewSession.collected_data`. `mark_phase_complete`
avança `current_phase`. `request_clarification` emite uma pergunta visível quando o
candidato foi vago.
"""

from chat.models import InterviewSession

_PHASE_VALUES = [p.value for p in InterviewSession.Phase]


INTERVIEWER_TOOLS = [
    {
        "name": "record_personal_info",
        "description": (
            "Registra/atualiza os dados de contato do candidato. Chame quando "
            "souber qualquer um destes campos. Campos omitidos não são alterados."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Nome completo"},
                "email": {"type": "string"},
                "phone": {"type": "string"},
                "location": {"type": "string", "description": "Cidade/estado (nunca endereço completo)"},
                "linkedin_url": {"type": "string"},
                "github_url": {"type": "string"},
            },
        },
    },
    {
        "name": "record_education",
        "description": (
            "Registra uma formação acadêmica do candidato. Chame UMA vez por "
            "formação (não repita a mesma). Nunca invente datas: só preencha "
            "start/end com o que o candidato disse."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "institution": {"type": "string"},
                "course": {"type": "string"},
                "start": {
                    "type": "string",
                    "description": (
                        "mês/ano de início (ex: 02/2021). Só se informado — "
                        "omita se o candidato não disse; nunca invente."
                    ),
                },
                "end": {
                    "type": "string",
                    "description": (
                        "mês/ano de fim ou previsão de conclusão. Se em andamento, "
                        "é uma data futura ou vazio — nunca uma data no passado."
                    ),
                },
                "status": {"type": "string", "enum": ["in_progress", "done"]},
            },
            "required": ["institution", "course"],
        },
    },
    {
        "name": "record_experience",
        "description": (
            "Registra uma experiência profissional, com bullets já no formato "
            "XYZ/STAR e tecnologias usadas. Nunca invente dados não ditos."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "company": {"type": "string"},
                "role": {"type": "string"},
                "start": {
                    "type": "string",
                    "description": "mês/ano de início. Só se informado — nunca invente; omita se não souber.",
                },
                "end": {
                    "type": "string",
                    "description": "mês/ano de fim. Se ainda trabalha lá, deixe vazio — nunca uma data no passado.",
                },
                "location": {"type": "string"},
                "bullets": {"type": "array", "items": {"type": "string"}},
                "tech_stack": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["company", "role"],
        },
    },
    {
        "name": "record_project",
        "description": "Registra um projeto pessoal/acadêmico do candidato.",
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "description": {"type": "string"},
                "tech_stack": {"type": "array", "items": {"type": "string"}},
                "result": {"type": "string", "description": "Resultado ou aprendizado principal"},
            },
            "required": ["name"],
        },
    },
    {
        "name": "record_skills",
        "description": (
            "Define a lista consolidada de habilidades técnicas, extraídas das "
            "experiências e projetos já coletados. Substitui a lista anterior."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "skills": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["skills"],
        },
    },
    {
        "name": "mark_phase_complete",
        "description": (
            "Avança a entrevista para a próxima fase quando a fase atual foi "
            "coletada o suficiente. Use os valores válidos de fase."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "next_phase": {"type": "string", "enum": _PHASE_VALUES},
            },
            "required": ["next_phase"],
        },
    },
    {
        "name": "request_clarification",
        "description": (
            "Faz uma pergunta de esclarecimento ao candidato quando a resposta foi "
            "vaga ou faltou informação. O texto da pergunta é exibido a ele."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "question": {"type": "string"},
            },
            "required": ["question"],
        },
    },
]
