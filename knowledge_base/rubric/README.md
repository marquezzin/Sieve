---
# Esta subpasta é placeholder. Arquivos aqui sem frontmatter completo são pulados pelo ingest.
---

# `rubric/` — rubrica formal de avaliação (juiz)

Conteúdo consumido pelo agente juiz (LLM-as-a-judge) que pontua qualidade do currículo.

## O que vai aqui

- **`full_rubric.md`** — rubrica formal: critérios, pesos, escala 0–10, descrição de cada nota.
- **`scoring_examples.md`** — currículos exemplo com nota e justificativa por critério.
- **`critical_failures.md`** — padrões que **zeram** o critério (ex: fabricação detectada → 0 em "honestidade").

## Critérios canônicos da rubrica

1. Uso de verbos de ação no início de cada bullet
2. Presença de métricas quantificáveis
3. Ausência de clichês ("proativo", "dinâmico", "bom em trabalho em equipe")
4. Especificidade técnica (tecnologias, frameworks, contextos)
5. Concisão e clareza textual
6. Formatação e estrutura

Cada critério recebe nota 0–10, pesos definidos em `full_rubric.md`.

## Frontmatter típico

```yaml
---
category: rubric
agents: [judge, reviewer]
priority: always
tags: [rubric, scoring]
---
```

`full_rubric.md` e `critical_failures.md` são `always`. `scoring_examples.md` pode ser `retrieve` se ficar grande (50+ exemplos).
