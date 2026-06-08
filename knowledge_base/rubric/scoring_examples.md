---
category: rubric
agents: [judge, reviewer]
priority: retrieve
tags: [rubric, scoring, examples, calibration]
---

# Exemplos de avaliação

Casos calibrados para o juiz imitar — cada um aplica a rubrica de
[`full_rubric.md`](full_rubric.md) com nota por critério e justificativa. Currículos
pseudonimizados e resumidos aos trechos que importam para a nota.

## Currículo ruim — score ~3.0

Trechos representativos:

> - Responsável por desenvolvimento de sistemas
> - Trabalhei com banco de dados
> - Proativo, dinâmico e bom em trabalho em equipe
> - Conhecimento em diversas linguagens
>
> *Layout em duas colunas, com foto e ícones.*

| Critério | Nota | Justificativa |
|---|---|---|
| Verbos de ação | 0 | "Responsável por", "Trabalhei" — forma passiva/espectador. |
| Métricas | 0 | Nenhum número em todo o documento. |
| Clichês | 0 | "Proativo, dinâmico, bom em trabalho em equipe". |
| Especificidade técnica | 2 | "Diversas linguagens", "banco de dados" — nada específico. |
| Concisão | 6 | Curto, mas vazio. |
| Formatação | 0 | Duas colunas + foto + ícones quebram ATS. |

**Score ≈ 1.4.** Falha crítica de formatação + zero métricas → **refazer**.

## Currículo mediano — score ~6.5

> - Desenvolvi APIs em Python para o time de pagamentos
> - Implementei testes automatizados no pipeline
> - Otimizei queries do relatório financeiro
> - **Stack:** Python, Django, PostgreSQL, Docker

| Critério | Nota | Justificativa |
|---|---|---|
| Verbos de ação | 9 | Todos os bullets abrem com verbo forte. |
| Métricas | 4 | Nenhum bullet quantifica o impacto ("otimizei" sem número). |
| Clichês | 10 | Nenhum clichê. |
| Especificidade técnica | 7 | Tecnologias certas, mas sem escala/contexto. |
| Concisão | 8 | Bullets curtos e claros. |
| Formatação | 8 | Estrutura limpa, compatível com ATS. |

**Score ≈ 7.0.** Revisar: faltam métricas — o maior peso da rubrica está subaproveitado.

## Currículo bom — score ~9.0

> - Otimizei queries SQL do relatório financeiro com window functions, reduzindo a geração
>   de 5 min para 30 s
> - Construí API REST em Django/DRF + Celery suportando 200 req/s sem degradar p95
> - Reduzi o tempo de deploy em 40% automatizando o CI/CD com GitHub Actions
> - **Backend:** Python (Django, FastAPI), PostgreSQL, Redis, AWS

| Critério | Nota | Justificativa |
|---|---|---|
| Verbos de ação | 10 | 100% dos bullets com verbo específico. |
| Métricas | 10 | Todos quantificam (tempo, throughput, %). |
| Clichês | 10 | Nenhum clichê. |
| Especificidade técnica | 9 | Tecnologias com contexto e escala. |
| Concisão | 9 | Bullets de 1–2 linhas, foco claro. |
| Formatação | 9 | Seções claras, ATS-safe. |

**Score ≈ 9.5.** Pronto para enviar.
