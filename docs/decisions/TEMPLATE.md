# ADR NNNN — <título curto e ativo>

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXXX
**Data:** YYYY-MM-DD
**Decisores:** <quem bateu a decisão — nomes ou squads>

## Contexto

<!--
1-3 parágrafos. O que motivou a decisão? Qual era a dor, oportunidade ou
restrição? Qual o estado atual e por que ele não serve?

Foque em fatos verificáveis. Cite incidentes, métricas, requisitos. Evite
suposições não-marcadas — se for inferência, marque com (inferido).
-->

## Decisão

<!--
O que foi decidido. Direto. Pode ter sub-seções pra cada componente da decisão.

Exemplo: "Adotamos PostgreSQL 18 como banco padrão. Schema-per-tenant via
django-tenants. Migrations rodam via `make migrate` no deploy."

Quando há múltiplas alternativas consideradas, lista elas brevemente abaixo
da decisão final com o motivo de cada uma ter sido descartada.
-->

### Alternativas consideradas

- **<Alt 1>** — descartada porque <motivo>.
- **<Alt 2>** — descartada porque <motivo>.

## Consequências

### Positivas

- <ganho 1>
- <ganho 2>

### Negativas

- <custo 1>
- <custo 2>

### Neutras (efeitos colaterais)

- <coisa que muda mas não é boa nem ruim — só registra>

## Plano de implementação (opcional)

<!--
Se a decisão exige migração ou rollout em fases, liste aqui. Senão, omita
esta seção.
-->

1. <fase 1>
2. <fase 2>

## Sinais de fracasso

<!--
Como saber que a decisão foi errada e precisa ser revisitada? Métrica,
incidente, complaint recorrente. Sem isso a decisão vira dogma.
-->

- <sinal 1>
- <sinal 2>

## Referências

<!-- Links pra docs externos, RFCs, threads, papers, ADRs relacionados. -->

- [<título>](<url>)
