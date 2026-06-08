---
category: writing
agents: [writer, reviewer]
priority: retrieve
tags: [bullets, anti-patterns, before-after]
---

# Exemplos de bullets ruins (e como corrigir)

Anti-patterns para o revisor reconhecer e o redator nunca produzir. Cada caso traz o bullet
ruim, o diagnóstico e a versão corrigida. O erro mais comum e mais prejudicial é a
**descrição vaga sem métrica e sem detalhe do que foi feito**.

## Vago, sem contexto nem impacto

- ❌ "Refatorei queries deixando mais rápido."
  - **Problema:** não diz o contexto (relatórios financeiros), nem a técnica (window
    functions, tuning), nem o impacto (de 5min para 30s). Desperdiça uma conquista real.
  - ✅ "Otimizei queries SQL em pipeline de relatórios financeiros aplicando window functions
    e reestruturação de group by, reduzindo o tempo de geração de 5 minutos para 30 segundos."

- ❌ "Trabalhei com Airflow processando dados."
  - **Problema:** verbo fraco ("trabalhei"), sem escala, sem resultado.
  - ✅ "Construí pipeline ETL em Airflow processando 2M de registros/dia de PostgreSQL para
    Snowflake."

- ❌ "Desenvolvi backend para o time de pagamentos."
  - **Problema:** sem impacto nem tecnologia específica.
  - ✅ "Reduzi a latência de pagamentos em 35% migrando o serviço para microsserviços em Go e
    gRPC."

## Verbo de espectador

- ❌ "Fui responsável por manter a aplicação no ar."
  - **Problema:** "responsável por" é forma substantiva passiva; não diz o que a pessoa fez.
  - ✅ "Mantive 99,9% de uptime em produção implementando health checks e auto-scaling no
    Kubernetes."

- ❌ "Ajudei na migração do sistema."
  - **Problema:** "ajudei" apaga o protagonismo e a contribuição concreta.
  - ✅ "Migrei 18 serviços de EC2 para ECS Fargate, reduzindo custo de infra em 25%."

## Soft skill genérica em vez de evidência

- ❌ "Boa comunicação e proatividade."
  - **Problema:** clichê puro; não prova nada (ver
    [`cliches_to_avoid.md`](cliches_to_avoid.md)).
  - ✅ "Apresentei resultados técnicos mensalmente para stakeholders não-técnicos."

## Lista de tecnologia sem profundidade

- ❌ "Conhecimento em Python, Java, C++, Go, Rust, JavaScript, SQL, NoSQL."
  - **Problema:** lista solta e ampla demais sinaliza superfície, não profundidade; e
    nenhuma aparece em contexto de experiência real.
  - ✅ Agrupar por domínio e mostrar uso real: "**Backend:** Python (Django, FastAPI),
    PostgreSQL" + a tecnologia aparecendo nos bullets de experiência.
