---
category: ats
agents: [ats_optimizer, writer]
priority: always
tags: [ats, keywords, placement, stuffing]
---

# Como inserir keywords no currículo

Identificada a lista de keywords da vaga (ver [`keyword_extraction.md`](keyword_extraction.md)),
o passo seguinte é distribuí-las pelo currículo de forma que reforce o sinal para o ATS
**sem** soar artificial para o recrutador humano que vai ler depois.

## Onde as keywords devem aparecer

Keywords podem e devem aparecer em múltiplos lugares — aparecer em mais de um reforça o
sinal:

- **Profile summary** (resumo no topo)
- **Bullets de experiência** profissional
- **Seção de habilidades técnicas**
- **Tech stack** de cada emprego

## Frequência por importância

Nem toda keyword tem o mesmo peso. Primeiro elenque o que é mais crítico na vaga. Numa vaga
que pede Django, React, AWS, Git e Docker, Django provavelmente é o mais crítico.

- **Keywords principais** (tecnologia central): **3 a 5 vezes** no currículo.
- **Keywords secundárias** (ferramentas de suporte, metodologias): **1 a 2 vezes**.

## Como inserir de forma natural

A keyword deve aparecer **dentro de contexto real de experiência** — nunca solta ou
forçada:

- No bullet: "Desenvolvi API REST em **Django** integrada ao Celery para processamento
  assíncrono."
- No tech stack do emprego: "**Tech stack:** Django, PostgreSQL, Redis, AWS EC2."
- Na seção de habilidades: "**Backend:** Python, **Django**, DRF, FastAPI."
- No profile summary: "Engenheiro backend com 3 anos de experiência em **Django** e AWS."

## Keyword stuffing — o que evitar

Inserir a mesma keyword dezenas de vezes, de forma repetitiva e sem contexto, é
contraproducente: ATS modernos penalizam o padrão, e o texto fica ilegível para o humano.
A regra de 3–5x (principal) e 1–2x (secundária) já satura o sinal — passar disso só
prejudica.

> Inserir keyword nunca justifica inventar experiência. Se a tecnologia não foi usada de
> verdade, ela não entra. Ver [`do_not_fabricate.md`](do_not_fabricate.md).
