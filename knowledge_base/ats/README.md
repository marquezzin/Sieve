---
# Esta subpasta é placeholder. Arquivos aqui sem frontmatter completo são pulados pelo ingest.
---

# `ats/` — conhecimento sobre Applicant Tracking Systems

Conteúdo sobre como ATSs funcionam, o que quebra parsing, como extrair keywords de vagas, e — **crítico** — guardrails contra fabricação de conteúdo.

## O que vai aqui

- **`how_ats_works.md`** — explicação técnica de parsing, scoring, blacklists.
- **`keyword_extraction.md`** — como identificar keywords reais numa descrição de vaga (vs. ruído).
- **`formatting_rules.md`** — o que quebra ATS (tabelas, imagens, fontes exóticas, headers/footers).
- **`do_not_fabricate.md`** — guardrails fortes: o sistema **nunca** inventa experiência pra encaixar keyword.

## Frontmatter típico

```yaml
---
category: ats
agents: [ats_optimizer, matcher]
priority: always
tags: [ats, keywords, guardrails]
---
```

`do_not_fabricate.md` é o doc mais importante deste diretório — `priority: always` em todos os agentes que tocam o currículo.
