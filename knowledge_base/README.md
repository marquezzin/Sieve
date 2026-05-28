# `knowledge_base/` — insumo de treinamento dos agentes

Este diretório guarda o **conhecimento curado** que treina os agentes de IA do Sieve. Tudo aqui é versionado em git, escrito em Markdown, e ingerido para o Postgres via `make ingest-knowledge`.

> **Importante:** os agentes não são "fine-tunados" com esse conteúdo. Eles consomem em runtime: ou no system prompt (full-load) ou via busca semântica (retrieval com pgvector). Mudou um arquivo → roda `make ingest-knowledge` → próxima chamada já enxerga.

Leia também [`docs/conceitos-fundamentais.md`](../docs/conceitos-fundamentais.md) pra entender embeddings, pgvector, chunking e os dois modos de consumo.

## Como adicionar conteúdo

1. Escolha (ou crie) a subpasta da categoria — `interviewing/`, `writing/`, `ats/`, `rubric/`, `templates/`.
2. Crie um arquivo `.md` com nome descritivo em kebab-case (ex: `bullet-quantificacao.md`).
3. Comece com **frontmatter YAML** (obrigatório) seguido pelo conteúdo em Markdown:

```markdown
---
category: writing
agents: [writer, reviewer]
priority: always   # always | retrieve
tags: [bullets, quantification]
---

# Como quantificar bullets

Conteúdo em Markdown comum...

## Subseções viram fronteiras naturais de chunk

...
```

4. Rode `make ingest-knowledge` — verá `NEW`, `UPDATED` ou `unchanged` por arquivo.

## Frontmatter — campos obrigatórios

| Campo | Tipo | Valores |
|---|---|---|
| `category` | string | `interviewing`, `writing`, `ats`, `rubric`, `templates` (ou novo) |
| `agents` | lista | quais agentes consomem este doc: `interviewer`, `writer`, `reviewer`, `judge`, `ats_optimizer` |
| `priority` | string | `always` (full-load no system prompt) ou `retrieve` (busca via pgvector) |
| `tags` | lista | tags livres pra filtros (opcional mas recomendado) |

## Os dois modos de consumo — em uma frase cada

- **`priority: always`** → o conteúdo inteiro do arquivo vai pro system prompt do agente, em toda chamada. Use pra docs curtos e essenciais (persona, regras duras, rubrica). Cachado pelo Anthropic — re-leitura custa 10% do preço normal.
- **`priority: retrieve`** → o arquivo é chunked e embedado. Só os top-k chunks mais relevantes à query atual aparecem no user message. Use pra coleções grandes de exemplos (currículos canônicos, casos de scoring).

## Categorias e quem as consome

| Categoria | Agente principal | Conteúdo esperado |
|---|---|---|
| `interviewing/` | entrevistador | persona, perguntas-guia por fase, padrões de follow-up, sinais de quando avançar |
| `writing/` | redator, revisor | verbos de ação, estrutura de bullet, padrões de quantificação, exemplos bons/ruins |
| `ats/` | ATS optimizer, matcher | como ATS funciona, regras de formatação, extração de keywords, guardrails contra fabricação |
| `rubric/` | juiz, revisor | rubrica formal, exemplos de scoring, padrões de falha crítica |
| `templates/` | redator | currículos modelo por papel/nível/indústria |

Cada subpasta tem um `README.md` com mais detalhe.

## Boas práticas

- **Headers `##` são fronteiras de chunk.** Use seções pequenas e focadas — cada `##` vira ~1 chunk no índice vetorial.
- **Exemplos > regras abstratas.** Modelos aprendem melhor com "veja este bullet" do que com "siga a regra X".
- **Não duplique conteúdo entre arquivos.** Retrieval pode retornar 2 versões competindo. Se algo é universal, faz 1 arquivo `always` e referencia.
- **Tags devem ser úteis pra filtro.** `[bullets, quantification, junior]` é melhor que `[escrita, currículo]` (genérico demais).

## Workflow de PR

Mudou knowledge base → PR descreve qual agente é afetado e como você validou. Idealmente:

1. Adiciona/edita arquivo.
2. Roda `make ingest-knowledge` localmente.
3. Roda `make knowledge-status` pra confirmar o doc apareceu.
4. Faz uma chamada manual no shell pra confirmar que o agente afetado responde melhor:
   ```bash
   make shell
   >>> from knowledge.selectors import retrieve_chunks
   >>> retrieve_chunks(query="seu caso de teste", agents=["writer"], k=3)
   ```
