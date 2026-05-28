---
# Esta subpasta é placeholder. Arquivos aqui sem frontmatter completo são pulados pelo ingest.
---

# `writing/` — conhecimento dos agentes redator e revisor

Conteúdo sobre **como escrever bullets de currículo** que sejam claros, quantificados e livres de clichês.

## O que vai aqui

- **`action_verbs.md`** — verbos de ação em pt-BR e en-US, agrupados por categoria (construção, liderança, análise).
- **`quantification_patterns.md`** — como adicionar métricas sem inventar (use proxies, faixas, contagens reais).
- **`bullet_structure.md`** — fórmula: `<verbo de ação> + <contexto/escopo> + <métrica ou resultado>`.
- **`good_bullets_examples.md`** — exemplos few-shot que o redator pode imitar.
- **`bad_bullets_examples.md`** — anti-patterns, clichês ("proativo", "dinâmico"), antes/depois.

## Frontmatter típico

```yaml
---
category: writing
agents: [writer, reviewer]
priority: always
tags: [bullets, action-verbs]
---
```

Regras de escrita são `always` (sempre presente no prompt). Coleção grande de exemplos pode ser `retrieve` se passar de ~5k palavras.
