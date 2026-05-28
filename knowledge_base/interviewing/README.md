---
# Esta subpasta é placeholder. Arquivos aqui sem frontmatter completo são pulados pelo ingest.
---

# `interviewing/` — conhecimento do agente entrevistador

Conteúdo consumido pelo agente que conversa com o estudante coletando dados pro currículo.

## O que vai aqui

- **`persona.md`** — tom, estilo, do/don't da conversa.
- **`questions_by_phase.md`** — perguntas-guia por fase (intro → education → experience → skills → projects → review).
- **`follow_up_patterns.md`** — como aprofundar quando resposta foi vaga.
- **`stop_signals.md`** — sinais de "fase completa, hora de avançar".

## Frontmatter típico

```yaml
---
category: interviewing
agents: [interviewer]
priority: always
tags: [persona, conversation]
---
```

Quase tudo aqui é `priority: always` — entrevistador é curto e o conhecimento precisa estar 100% presente no system prompt.
