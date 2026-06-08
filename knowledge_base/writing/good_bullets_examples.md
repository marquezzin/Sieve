---
category: writing
agents: [writer, reviewer]
priority: retrieve
tags: [bullets, examples, few-shot, xyz, star]
---

# Exemplos de bullets bons (e por que funcionam)

Coleção few-shot para o redator imitar. Cada bullet começa com verbo de ação, traz contexto
e tecnologia, e fecha com métrica ou resultado. Cobertura ampla de áreas — backend,
frontend, dados, DevOps, mobile, QA.

## Backend

- "Otimizei queries SQL em pipeline de relatórios financeiros aplicando window functions e
  reestruturação de group by, reduzindo o tempo de geração de 5 minutos para 30 segundos."
  → *contexto (relatórios financeiros) + técnica (window functions) + impacto (10x).*
- "Reduzi a latência de processamento de pagamentos em 35% e elevei a taxa de conclusão de
  checkout em 12% migrando o serviço de monolito para microsserviços em Go e gRPC."
- "Construí API REST em Django/DRF integrada ao Celery para processamento assíncrono,
  suportando 200 req/s em produção sem degradação de p95."

## Dados

- "Construí pipeline ETL em Airflow processando 2M de registros/dia de PostgreSQL para
  Snowflake, com testes de qualidade que cortaram incidentes de dados em 60%."
- "Diagnostiquei contention de locks em queries de relatório, reduzindo p99 de 8s para 800ms
  via reindex + materialized view."

## Frontend

- "Elevei o performance score do app mobile de 45 para 92 otimizando carregamento de imagens
  e implementando lazy rendering, resultando em 500k usuários ativos mensais a mais."
- "Reduzi o bundle JavaScript em 40% (1.2MB → 720KB) com code splitting e tree shaking no
  Vite, cortando o tempo de first load em 1.8s."

## DevOps / Infra

- "Reduzi o tempo de deploy em 40% automatizando o pipeline de CI/CD com GitHub Actions e
  cache de dependências."
- "Estabilizei sistema legado que causava 3h de downtime semanal: refatorei módulos críticos
  e adicionei monitoramento com Datadog, levando o downtime a zero em 8 semanas." *(STAR)*

## Mobile / QA

- "Implementei testes E2E com Detox cobrindo os 12 fluxos críticos do app, reduzindo
  regressões em produção de ~5 por release para menos de 1."

## Liderança / contexto acadêmico

- "Liderei a frente técnica de autenticação em projeto de 4 devs, entregando SSO com OAuth2
  duas semanas antes do prazo."
- "Graduado como melhor da turma de 50 alunos com média 9,85/10."

## Por que esses funcionam

Todos seguem o mesmo padrão: **verbo forte + escopo/tecnologia concreta + número**. O leitor
entende em segundos o que foi feito e qual foi o impacto — exatamente o que um recrutador
escaneia.
