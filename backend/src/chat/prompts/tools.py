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
            "souber qualquer um destes campos. Campos omitidos não são alterados. "
            "Registrar = chamar esta tool, não escrever no texto."
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
            "start/end com o que o candidato disse. Registrar = chamar esta tool, "
            "não escrever no texto."
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
            "XYZ/STAR e tecnologias usadas. Nunca invente dados não ditos. "
            "Registrar = chamar esta tool, não escrever no texto."
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
        "description": (
            "Registra um projeto pessoal/acadêmico do candidato. Chame SEMPRE que o "
            "candidato descrever um projeto, ANTES de confirmar que anotou. Registrar "
            "= chamar esta tool, não escrever no texto: nunca afirme que registrou um "
            "projeto sem ter chamado esta tool no mesmo turno."
        ),
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
            "experiências e projetos já coletados. Substitui a lista anterior. "
            "Registrar = chamar esta tool, não escrever no texto."
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
        "name": "mark_section_empty",
        "description": (
            "Marque uma seção como genuinamente VAZIA quando o candidato declarar "
            "que não tem aquilo (ex.: primeiro emprego, sem experiência; nenhum "
            "projeto; sem formação acadêmica formal). Só chame DEPOIS de confirmar "
            "com o candidato. NÃO use para pular uma seção que você ainda não "
            "coletou ou que esqueceu de registrar — só quando o candidato REALMENTE "
            "não tem. Isso libera o avanço de fase sem inventar dados. Seções "
            "puláveis: 'education', 'experience', 'projects'."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "section": {
                    "type": "string",
                    "enum": ["education", "experience", "projects"],
                    "description": "A seção que o candidato declarou não ter.",
                },
            },
            "required": ["section"],
        },
    },
    {
        "name": "mark_phase_complete",
        "description": (
            "Avança a entrevista para a próxima fase quando a fase atual foi "
            "coletada o suficiente. O sistema NÃO avança a fase a partir do seu "
            "texto — só esta chamada avança. Chame-a ANTES de fazer a primeira "
            "pergunta da próxima seção. Use os valores válidos de fase. "
            "IMPORTANTE: esta chamada é REJEITADA se alguma seção anterior ainda "
            "tiver dado pendente — ou seja, o candidato te contou algo mas você não "
            "chamou a `record_*` correspondente. Nesse caso registre via `record_*` "
            "(ou `mark_section_empty` se ele genuinamente não tem) e tente de novo."
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
