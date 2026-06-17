"""Schemas das tools dos agentes de matching (formato canônico Anthropic
`{name, description, input_schema}`; o adapter da OpenAI traduz).

Dois agentes single-shot:
- extrator de keywords (`submit_keywords`) — usado por `IngestJobPosting`.
- analista de match (`submit_match`) — usado por `ComputeMatch`.

Ambos chamam UMA tool de submissão e o use case captura o `input` via
`agents.use_cases.structured.run_structured_agent`.
"""

_STRING = {"type": "string"}
_STRING_LIST = {"type": "array", "items": {"type": "string"}}

KEYWORDS_TOOL = {
    "name": "submit_keywords",
    "description": (
        "Submete as keywords técnicas e de competência extraídas da descrição da "
        "vaga: tecnologias, ferramentas, metodologias e hard skills relevantes "
        "que um ATS procuraria. Não invente termos que não estão na vaga."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "keywords": {
                **_STRING_LIST,
                "description": "Lista de keywords/competências da vaga (ex: 'Kafka', 'Django', 'CI/CD').",
            },
        },
        "required": ["keywords"],
    },
}

_MISSING_SKILL_ITEM = {
    "type": "object",
    "properties": {
        "skill": {"type": "string", "description": "Skill da vaga ausente no currículo."},
        "critical": {
            "type": "boolean",
            "description": "True se a skill é central pra vaga (provável requisito eliminatório).",
        },
    },
    "required": ["skill", "critical"],
}

MATCH_TOOL = {
    "name": "submit_match",
    "description": (
        "Submete a análise de aderência do currículo à vaga: skills que aparecem "
        "em ambos (`matched_skills`), skills da vaga ausentes no currículo "
        "(`missing_skills`, com flag `critical`) e recomendações curtas e "
        "acionáveis (`recommendations`). Baseie-se SOMENTE nas keywords da vaga e "
        "no conteúdo real do currículo — não invente experiência do candidato."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "matched_skills": {
                **_STRING_LIST,
                "description": "Skills da vaga presentes no currículo.",
            },
            "missing_skills": {
                "type": "array",
                "items": _MISSING_SKILL_ITEM,
                "description": "Skills da vaga ausentes no currículo, com flag de criticidade.",
            },
            "recommendations": {
                "type": "array",
                "description": (
                    "3 a 5 recomendações DETALHADAS, ESPECÍFICAS e HONESTAS — o produto "
                    "vive disto, então não seja genérico. Cada uma cita a experiência/"
                    "projeto REAL do candidato (por nome) e diz exatamente o que fazer e "
                    "por que importa PARA ESTA VAGA. NUNCA recomende adicionar/adquirir/"
                    "inventar uma skill que o candidato não tem."
                ),
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "Ação concreta em uma frase (headline acionável).",
                        },
                        "detail": {
                            "type": "string",
                            "description": (
                                "2 a 4 frases. Explique POR QUE importa pra esta vaga e "
                                "COMO/ONDE aplicar no currículo, citando a experiência, "
                                "projeto ou tecnologia REAL do candidato. Concreto e "
                                "personalizado — nunca genérico, nunca fabricado."
                            ),
                        },
                        "category": {
                            "type": "string",
                            "enum": ["realce", "enfase", "gap"],
                            "description": (
                                "'realce' = explicitar/renomear experiência real com o "
                                "vocabulário da vaga; 'enfase' = priorizar/destacar o que "
                                "já existe; 'gap' = lacuna REAL a desenvolver no futuro "
                                "(jamais a inventar no currículo agora)."
                            ),
                        },
                    },
                    "required": ["title", "detail", "category"],
                },
            },
        },
        "required": ["matched_skills", "missing_skills", "recommendations"],
    },
}
