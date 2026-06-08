---
category: rubric
agents: [judge, reviewer]
priority: always
tags: [rubric, scoring, weights]
---

# Rubrica de avaliação de currículo

Sistema de pontuação **0–10 por critério**, pesos somam 1.0. Score final é a média
ponderada. Notas abaixo de 5 disparam alerta crítico no breakdown. Falhas que zeram um
critério inteiro estão em [`critical_failures.md`](critical_failures.md).

## 1. Uso de verbos de ação (peso 0.15)

Todo bullet deve começar com verbo de ação específico no passado.

- **10**: 100% dos bullets começam com verbo de ação específico.
- **7**: 80%+ ok; 1–2 começam com "trabalhei", "ajudei".
- **5**: Metade dos bullets é genérica.
- **0**: Bullets em forma de descrição substantiva ("Responsável por...").

## 2. Presença de métricas (peso 0.20)

Impacto quantificado — número, percentual, escala, frequência ou faixa.

- **10**: ≥70% dos bullets têm métrica.
- **7**: ~50% têm métrica.
- **5**: Métricas só em projeto pessoal ou seção isolada.
- **0**: Nenhuma métrica em todo o currículo.

## 3. Ausência de clichês (peso 0.15)

Lista de bloqueio em [`../writing/cliches_to_avoid.md`](../writing/cliches_to_avoid.md):
"proativo", "dinâmico", "comunicativo", "bom em trabalho em equipe", "facilidade pra
aprender", "apaixonado por tecnologia", "hands-on".

- **10**: Zero clichês.
- **7**: 1 clichê isolado em soft skills.
- **5**: 2–3 clichês.
- **0**: 4+ clichês ou seção inteira de soft skills genéricas.

## 4. Especificidade técnica (peso 0.20)

- **10**: Tecnologias mencionadas com contexto (versão, escala, problema resolvido).
- **7**: Tecnologias listadas mas contexto vago.
- **5**: Lista de tecnologias soltas sem indicação de profundidade.
- **0**: Nenhuma tecnologia específica mencionada.

## 5. Concisão e clareza (peso 0.15)

- **10**: Cada bullet ≤ 2 linhas, foco claro, sem redundância.
- **7**: Maioria ok, 1–2 bullets prolixos.
- **5**: ~30% dos bullets passam de 3 linhas.
- **0**: Bullets viraram parágrafos.

## 6. Formatação e estrutura (peso 0.15)

Compatibilidade com ATS — ver [`../ats/formatting_rules.md`](../ats/formatting_rules.md).

- **10**: Seções claras, hierarquia visual, sem elementos que quebram ATS.
- **7**: Estrutura ok, problema menor (fonte exótica, header muito grande).
- **5**: Layout dificulta scan rápido.
- **0**: Layout em colunas, tabelas aninhadas ou imagens essenciais — quebra ATS.

## Cálculo do score final

```
score_final = (
    0.15 * verbos +
    0.20 * metricas +
    0.15 * clichês +
    0.20 * especificidade +
    0.15 * concisao +
    0.15 * formatacao
)
```

Faixas:
- **8.5–10.0**: pronto para enviar
- **7.0–8.4**: revisar 2–3 pontos
- **5.0–6.9**: revisão profunda necessária
- **< 5.0**: refazer

> Os dois critérios de maior peso (métricas e especificidade técnica, 0.20 cada) refletem o
> que recrutadores de tech mais escaneiam: impacto mensurável e profundidade técnica real.
