# Conceitos fundamentais

Vocabulário e mecanismos centrais do Sieve. Leia isto antes de tocar em qualquer código de agente, knowledge base ou matching semântico.

## 1. Embeddings vetoriais

**O problema:** como o sistema sabe que "engenheiro de software backend Python" e "desenvolvedor servidor-side em Python" têm significado quase idêntico? Busca por palavra-chave (LIKE, full-text) não pega — as palavras são diferentes. Precisa medir **proximidade de significado**, não de letra.

**A ideia:** um **embedding** é um vetor (lista de N floats, tipicamente 1024 ou 1536 dimensões) que representa o "significado" de um texto. Um modelo de embeddings (Voyage AI, OpenAI embeddings, Anthropic embeddings) foi treinado em bilhões de textos pra produzir vetores onde:

- Textos com significado parecido → vetores próximos no espaço de N dimensões
- Textos com significado distante → vetores longe

Visualizando em 2D (a realidade é 1024D):

```
                     ↑
                     |
   "python"  ●       |
              ●  "django"
                 ●  "flask"
                     |
                     |          ● "react"
                     |       ● "vue"
                     |    ● "frontend"
                     |
─────────────────────┼─────────────────────→
                     |
       "cachorro" ●  |
                  ● "gato"
                ● "hamster"
                     |
```

Backend frameworks Python ficam juntos. Frontend frameworks ficam juntos. Animais ficam juntos. **Distância no espaço = distância semântica.**

## 2. Similaridade coseno

Métrica que mede o ângulo entre dois vetores — não a distância euclidiana.

| Ângulo | Similaridade | Significado |
|---|---|---|
| 0° (mesma direção) | **1.0** | textos quase idênticos em significado |
| 90° (perpendicular) | **0.0** | sem relação |
| 180° (oposto) | **-1.0** | significados opostos (raro na prática) |

Scores típicos no nosso domínio:

| Comparação | Similaridade aproximada |
|---|---|
| "dev backend python" vs "engenheiro software python" | ~0.85 |
| "dev backend python" vs "desenvolvedor servidor java" | ~0.65 |
| "dev backend python" vs "ux designer figma" | ~0.20 |
| "dev backend python" vs "receita bolo chocolate" | ~0.05 |

## 3. pgvector

Extensão do Postgres que adiciona:
- Tipo de coluna `VectorField(dim)` — armazena lista de N floats eficientemente, com índices otimizados (HNSW, IVFFlat) pra busca rápida
- Operadores SQL pra calcular distância direto no banco — sem precisar puxar tudo pra Python

Operadores principais:
- `<=>` distância coseno (usaremos este — recomendado pra texto)
- `<->` distância euclidiana
- `<#>` produto interno negativo

Query típica de retrieval:

```sql
SELECT content, 1 - (embedding <=> '[0.12, -0.45, ...]'::vector) AS similarity
FROM knowledge_chunk
WHERE 'writer' = ANY(document_agents)
ORDER BY embedding <=> '[0.12, -0.45, ...]'::vector
LIMIT 5;
```

`1 - distância = similaridade`. Retorna os 5 chunks mais próximos do vetor de consulta.

## 4. Chunking — por que dividir documentos

LLMs trabalham mal com "documento inteiro" quando precisam só de um trecho. Resposta de retrieval com chunk de 200 palavras é mais útil que com documento de 2000 palavras porque:
- Sinal não fica diluído por contexto irrelevante
- Custo de tokens menor por chamada
- Cabe espaço pra trazer múltiplos chunks de fontes diferentes

**Estratégia de chunking:** cortar em fronteiras naturais (headers `##`, parágrafos), tipicamente 200-500 palavras por chunk, com overlap leve (~50 palavras) entre chunks vizinhos pra não cortar contexto na fronteira.

## 5. Models `KnowledgeDocument` e `KnowledgeChunk` — relação 1-N

Um arquivo `.md` da knowledge base pode ter 100, 500 ou 5000 palavras. Por isso a divisão:

- **`KnowledgeDocument`** = 1 arquivo `.md` inteiro do `knowledge_base/`. É o "registro mestre" — sabe de onde veio, qual sua versão, qual seu hash.
- **`KnowledgeChunk`** = um pedaço daquele documento. É o que carrega o **embedding vetorial** e o que é recuperado em buscas.

Analogia: `KnowledgeDocument` é o livro, `KnowledgeChunk` é o parágrafo. Quando alguém pergunta "como quantificar bullet sobre liderança técnica?", você não responde mandando o livro — você pega o parágrafo certo.

**Campos do `KnowledgeDocument`:**

| Campo | Pra que serve |
|---|---|
| `source_path` | Caminho relativo do arquivo (`knowledge_base/writing/action_verbs.md`). Permite re-ingerir só o que mudou. |
| `category` | Lido do frontmatter YAML (`writing`, `ats`, `rubric`...). Usado pra agrupar/filtrar. |
| `agents` | Lista de agentes que consomem (`["writer", "reviewer"]`). Permite ao loader filtrar por agente. |
| `priority` | `always` (vai inteiro pro system prompt sempre) ou `retrieve` (só aparece via busca vetorial). |
| `content_md` | Texto puro do arquivo. Pra reconstruir, debugar, mostrar no admin. |
| `content_hash` | SHA do conteúdo. Se hash não mudou → ingest pula. Se mudou → re-chunka e re-embeda. Garante idempotência. |
| `updated_at` | Auditoria. |

**Campos do `KnowledgeChunk`:**

| Campo | Pra que serve |
|---|---|
| `document` (FK) | Aponta pro `KnowledgeDocument` pai. Cascade delete: documento sumiu → chunks somem. |
| `ordinal` | Ordem do chunk dentro do documento (0, 1, 2...). Permite reconstruir ordem original. |
| `content` | Texto do chunk em si (~300 palavras). É o que vai pro LLM. |
| `embedding` | Vetor de N dimensões — `VectorField(1024)` do pgvector. |
| `metadata` | JSON livre — `{"heading": "Bullet com métrica", "tags": [...]}`. Útil pra filtrar busca. |

## 6. Dois modos de consumo de knowledge base

| Modo | Quando usar | Mecânica |
|---|---|---|
| **Full-load (priority=always)** | Docs essenciais e pequenos: persona do agente, rubrica, regras ATS, regras de escrita. Total < ~30k tokens por agente. | `KnowledgeLoader.load_for_agent("writer")` concatena `content_md` de todos os docs `always` desse agente → vira parte do system prompt → envolvido em `cache_control` do Anthropic (10% do preço em re-leitura) |
| **Retrieval (priority=retrieve)** | Docs com muitos exemplos vastos: 30+ currículos canônicos, 50+ exemplos de scoring. Mandar tudo seria caro e diluiria sinal. | `retrieve_chunks(query=..., agents=["writer"], k=5)` busca via pgvector os k chunks mais próximos semanticamente do query → injetados no `user message` daquele turn específico |
