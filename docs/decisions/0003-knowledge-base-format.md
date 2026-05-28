# ADR 0003 — Knowledge base versionada em Markdown + ingest idempotente

**Status:** Accepted
**Data:** 2026-05-27
**Decisores:** Time Sieve

## Contexto

Os agentes do Sieve dependem de **insumo curado** pra serem bons: padrões de bullet, exemplos canônicos de currículo, rubrica de avaliação, regras de ATS, anti-patterns. Esse insumo evolui ao longo do projeto e do tempo — não é "feature", é "alimento" do sistema.

Duas formas óbvias de modelar:

1. **Modular por categoria** — uma model Django por tipo (`ResumeExample`, `ATSRule`, `RubricCriterion`, `GoodBullet`, `BadBullet`...). Edição via admin/API. Schema rígido por entidade.
2. **Genérica via Markdown** — um diretório `knowledge_base/` no repo com `.md` por documento. Frontmatter YAML pra metadata. Ingest unificado para um par de tabelas (`KnowledgeDocument` + `KnowledgeChunk`).

O time precisou decidir antes de implementar a Fase 0.

## Decisão

**Adotamos a abordagem genérica via Markdown.** O conteúdo vive em `knowledge_base/` na raiz do repo, versionado em git, com frontmatter YAML. O app `knowledge/` no backend ingere via comando `make ingest-knowledge` para duas models: `KnowledgeDocument` (1 por arquivo) e `KnowledgeChunk` (N por documento, com embedding vetorial).

Consumo pelos agentes em **dois modos simultâneos**:
- **Full-load (`priority: always`)** — docs essenciais inteiros no system prompt (com cache_control do Anthropic).
- **Retrieval (`priority: retrieve`)** — top-k chunks por similaridade coseno via pgvector, injetados sob demanda no user message.

Ingest é **idempotente via `content_hash` (SHA-256)** — arquivo cujo hash não mudou é pulado; arquivo modificado é re-chunked e re-embedado.

### Alternativas consideradas

- **Modular por categoria (N models específicas)** — descartada porque:
  - Conteúdo é insumo escrito por humanos offline em editor (não dado de usuário em runtime via UI/API)
  - Evolução acontece em PR/code review — diff de MD é legível, diff de SQL/JSON é horrível
  - Consumo é dominado por retrieval semântico — query estruturada quase nunca precisa
  - Cada categoria viraria um app inteiro (model + serializer + view + admin + selector + migration), explodindo código pra pouco valor
  - Bloqueia colaboração de domain expert não-dev (admin Django tem curva)
- **Modular híbrido (uma model especial só pra `ResumeExample`)** — descartada por enquanto. Frontmatter YAML rico + `metadata: JSONField` no `KnowledgeDocument` cobre 95% dos filtros que `ResumeExample` precisaria (level, target_role, success_score). Migramos só se aparecer dor concreta de query estruturada.
- **Sem chunking (documento inteiro vai pro retrieval)** — descartada porque chunks pequenos ranqueiam melhor (sinal não diluído), cabem múltiplos por chamada, e custam menos tokens.

## Consequências

### Positivas

- **Fricção zero pra editar conteúdo.** Edita `.md`, commita, roda `make ingest-knowledge`, pronto.
- **Diff legível em PR.** Code review do conteúdo de treinamento funciona como código.
- **Pipeline único.** Um chunker, um embedder, um loader — qualquer categoria flui pelo mesmo caminho.
- **Domain expert pode contribuir.** Markdown é universal; não precisa saber Django.
- **Idempotência barata.** Hash SHA-256 invalida cache automaticamente quando conteúdo muda. Roda ingest 10x = mesmo banco que rodar 1x.
- **Adicionar categoria nova = criar pasta.** Zero código novo.

### Negativas

- **Query estruturada é limitada.** Pra filtros sofisticados (`level=junior AND score>8`) dependemos de `metadata: JSONField` + filtros JSONField do Django. Funciona, mas é menos ergonômico que campos tipados.
- **Validação de schema é fraca.** Frontmatter YAML pode ter campo escrito errado e só estoura no ingest (não na hora da edição). Mitigado pelo comando ingest reportar warnings claros.
- **Versionamento de conteúdo via git, não via app.** Não dá pra "ver versão de 2 semanas atrás do currículo exemplo" via UI — só via `git log knowledge_base/...`.

### Neutras

- O time se compromete a **escrever** o conteúdo. Sem conteúdo, o sistema funciona mas com fallback mínimo (prompts hardcoded básicos). Qualidade dos agentes é função direta de quanto investimos em `knowledge_base/`.

## Plano de implementação

1. Fase 0 (em execução): criar app `knowledge/`, models, services (chunker/frontmatter/ingest/loader), management command, API de debug, ADRs.
2. Fase 1+: cada novo agente (entrevistador, redator, revisor, juiz, ATS optimizer) declara quais docs do `knowledge_base/` consome (via `agents:` no frontmatter).
3. Conteúdo real (não-placeholder) é preenchido em paralelo ao desenvolvimento dos agentes — pode começar mínimo e crescer.

## Sinais de fracasso

- Aparecem ≥3 queries estruturadas sobre metadata que `JSONField` torna feias. Refatorar uma categoria pra model própria.
- Domain expert reclama recorrentemente do fluxo "edita MD + commit + ingest". Considerar admin UI de edição que escreve no MD via API.
- Ingest passa de ~30s mesmo com cache de hash. Investigar paralelização do embedding (batches maiores ao provider).

## Referências

- [`docs/conceitos-fundamentais.md`](../conceitos-fundamentais.md) — embeddings, pgvector, chunking, dois modos
- [`knowledge_base/README.md`](../../knowledge_base/README.md) — guia de uso pra quem edita conteúdo
- [pgvector](https://github.com/pgvector/pgvector)
