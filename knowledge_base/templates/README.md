---
# Esta subpasta é placeholder. Arquivos aqui sem frontmatter completo são pulados pelo ingest.
---

# `templates/` — currículos modelo

Coleção de currículos canônicos, segmentados por papel/nível/indústria. Servem como few-shot examples para o redator.

## O que vai aqui

- `junior_backend_python.md`
- `junior_frontend_react.md`
- `pleno_data_engineer.md`
- `senior_fullstack.md`
- `estagiario_cs.md`
- ... (1 arquivo por papel/nível)

Cada arquivo é um currículo completo (ou as seções mais ilustrativas), com frontmatter rico que permite filtrar via metadata.

## Frontmatter típico

```yaml
---
category: templates
agents: [writer]
priority: retrieve              # quase sempre retrieve — coleção grande
level: junior                   # junior | pleno | senior | estagiario
target_role: backend-python     # role normalizado em kebab-case
industries: [fintech, saas]
success_score: 8.5              # nota da rubrica (pra filtrar exemplos bons)
technologies: [python, postgres, django, kafka]
tags: [backend, junior, api-rest]
---
```

Esses campos extras viram metadata do `KnowledgeDocument` e podem ser filtrados antes da busca vetorial:

```python
retrieve_chunks(
    query="exemplos de bullets pra backend dev junior",
    agents=["writer"],
    k=3,
    filters={"level": "junior", "target_role": "backend-python", "min_score": 8.0},
)
```

## Boas práticas

- **Só inclua currículos exemplares.** Currículo ruim como exemplo ensina o redator a fazer ruim.
- **Cobertura ampla > volume profundo.** Melhor ter 1 exemplo bom de cada papel comum do que 10 do mesmo papel.
- **Pseudonimize.** Não use nomes, e-mails ou empresas reais. Use placeholders convencionais.
