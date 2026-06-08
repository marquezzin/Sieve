---
category: ats
agents: [ats_optimizer, matcher]
priority: always
tags: [ats, parsing, scoring, keywords]
---

# Como o ATS funciona

Um ATS (Applicant Tracking System) é o software que recrutadores usam para receber,
filtrar e ranquear candidatos. Antes de qualquer humano ler o currículo, o ATS faz a
primeira triagem — e quem não passa por ela nunca chega ao recrutador, por mais
qualificado que seja. Otimizar para ATS é garantir que o sistema consiga **extrair** o
texto, **mapear** as seções e **encontrar** as competências que a vaga pede.

## O que o ATS faz com o currículo

O fluxo é sempre o mesmo, em três etapas:

1. **Parsing** — o ATS converte o arquivo em dados estruturados: nome, e-mail, telefone,
   histórico de empregos (cargo, empresa, datas), educação e habilidades. Layouts limpos
   são mapeados corretamente; layouts complexos confundem o parser e perdem informação.
2. **Scoring** — compara o conteúdo extraído com os requisitos da vaga. ATS modernos usam
   NLP treinado em milhões de vagas e entendem que "Python development", "Python scripting"
   e "Python programming" são a mesma competência. Ainda assim, a presença literal das
   keywords certas continua sendo o sinal mais forte.
3. **Ranking** — ordena os candidatos por aderência. Recrutador vê os melhores primeiro;
   muitos nunca olham além da primeira página de resultados.

## Triagem por skills, não só por título

A maior mudança recente é a triagem **baseada em habilidades**. Boa parte das equipes de
recrutamento filtra candidatos por skills específicas exigidas *antes* de olhar o histórico.
Em várias plataformas, a seção de habilidades é a primeira que o parser mapeia para os
critérios da vaga. Consequência prática: as tecnologias centrais da vaga precisam aparecer
de forma visível e em contexto real de experiência — não só numa lista solta.

## Por que tantos currículos falham

- O parser não consegue extrair texto de imagens, ícones, gráficos ou tabelas.
- Layout em colunas embaralha a ordem de leitura.
- Keywords da vaga simplesmente não aparecem no currículo.
- O título dos cargos anteriores não mapeia para o nível/título da vaga.

Detalhes de formatação em [`formatting_rules.md`](formatting_rules.md); como achar e
inserir keywords em [`keyword_extraction.md`](keyword_extraction.md) e
[`keyword_insertion.md`](keyword_insertion.md).

## Teste rápido de legibilidade

Abra o PDF e use **CTRL+F** para buscar as principais keywords da vaga. Se a busca não
encontra a palavra, o ATS também não encontra. É o teste mais barato de compatibilidade —
faça antes de enviar qualquer currículo.
