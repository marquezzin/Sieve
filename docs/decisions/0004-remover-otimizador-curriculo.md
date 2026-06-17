# ADR 0004 — Remover o otimizador automático de currículo (ATS), manter só análise + recomendações honestas

**Status:** Accepted
**Data:** 2026-06-17
**Decisores:** Gabriel (produto)

## Contexto

A Fase 3 previa, além da análise de aderência currículo ↔ vaga, um **otimizador
automático** (`RunAtsOptimizer`): um agente que reescrevia o currículo
"ATS-aware" pra uma vaga específica, disparado por um botão "Otimizar currículo".
O guardrail anti-fabricação seria o "núcleo defensável" do projeto.

Na prática, ao testar com um currículo real (João Almeida, dev no Nubank) contra
uma vaga de backend sênior, o otimizador **fabricou**: adicionou às `skills` e ao
`tech_stack` tecnologias que o candidato não tinha (`Django`, `FastAPI`,
`RabbitMQ`, `Datadog`, `Prometheus`) — exatamente as que faltavam na vaga — e
ainda **removeu** skills reais (`MongoDB`, `Node.js`, `React`, `WebSockets`) pra
abrir espaço. O guardrail post-hoc só validava **identidade** (empresas, cargos,
instituições, contagens), não `skills`/`tech_stack`/bullets — então passou batido.

Reforçar o guardrail viraria um gato-e-rato com o LLM (bullets em prosa são
difíceis de validar de forma confiável), e o valor *honesto* do otimizador —
realçar, com o vocabulário da vaga, o que o candidato **de fato** tem — já é
entregue pela **recomendação**. Para um produto cuja tese é "nunca mentir", o
risco residual de fabricação superou o ganho.

## Decisão

**Removida a otimização automática de currículo.** Saem: o botão "Otimizar
currículo", o use case `RunAtsOptimizer`, o prompt `ats_optimizer_system.md`, a
chain Celery `run_ats_optimizer_pipeline`/`_task`, o endpoint
`POST /api/v1/matching/optimize/` (`OptimizeView`) e o setting
`LLM_MODEL_ATS_OPTIMIZER`.

**Mantida e fortalecida a análise.** O produto de matching agora é: colar a vaga →
score de aderência + skills que batem/faltam + **recomendações detalhadas,
honestas e categorizadas** (`realce` = explicitar experiência real com o termo da
vaga; `enfase` = priorizar o que já existe; `gap` = lacuna real a desenvolver, sem
fabricar). A recomendação passa a ser o entregável principal — orienta o candidato
sem reescrever nem inventar.

### Alternativas consideradas

- **Reforçar o guardrail pra cobrir skills/tech/bullets** — descartada: vira
  gato-e-rato com o LLM; bullets em prosa não são verificáveis com confiança; risco
  residual de fabricação é inaceitável pra tese do produto.
- **Manter o otimizador só "sugerindo" sem aplicar** — descartada: isso é
  exatamente a recomendação; o botão de aplicar vira redundante.

## Consequências

### Positivas

- **Honesto por construção** — não existe mais nenhum caminho no produto que
  reescreva ou fabrique conteúdo do currículo.
- UX mais simples e direta (uma tela de análise, sem fluxo assíncrono de geração).
- A recomendação vira o diferencial real — detalhada e ancorada no currículo.

### Negativas

- Perde-se o "núcleo defensável" originalmente planejado (pipeline de reescrita
  multi-agente aplicado a vagas).
- Menos efeito "uau" de automação na demo.

### Neutras (efeitos colaterais)

- A infraestrutura de versões + diff da Fase 2 continua existindo, mas agora só
  com `writer → reviewer` (não há mais versão `ats_optimizer`).
- O embedding de `ResumeVersion` (Fase 3.1) e a base de conhecimento `ats/`
  seguem em uso pela **análise** (`matcher`).

## Sinais de fracasso

- Usuários pedindo recorrentemente "aplique as recomendações automaticamente pra
  mim" — sinal de que a automação tinha valor percebido e talvez valha revisitar,
  agora com guardrail de vocabulário (skills/tech como subconjunto do original).
- Recomendações percebidas como rasas ou genéricas (mitigado: prompt exige citar a
  experiência real e categorizar).

## Referências

- [ADR 0002 — multi-agente sem framework](0002-multi-agent-sem-framework.md)
- [Fase 3 — matching/ATS/Kanban](../planning/fases/fase-3-matching-ats-kanban.md)
