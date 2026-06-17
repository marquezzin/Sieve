# matching — guia rápido p/ agentes

App de aderência semântica currículo ↔ vaga: `JobPosting` (vaga + keywords +
embedding) e `MatchAnalysis` (score 0–1 + skills batidas/ausentes + recs,
cacheado por par). Ingere vaga, calcula match e **dispara** o ATS optimizer;
**não** reescreve currículo.

## Layout

- `models.py` — JobPosting / MatchAnalysis (`BaseModel`, UUID v7). `score` 0.000–1.000.
- `selectors.py` — leituras escopadas ao user (404/403). Versão do currículo vem
  de `resumes.selectors.get_version_for_user` (não reimplementar).
- `use_cases/` — `IngestJobPosting`, `ComputeMatch`. DI de LLM/embeddings/knowledge. Sem DRF.
- `prompts/tools.py` — tools `submit_keywords` / `submit_match` (formato Anthropic).
- `api/` — views finas + serializers + urls. `Response` plain (envelope normal).

## Regras

- Lógica em `use_cases/`, queries em `selectors.py`. Views só orquestram.
- **Nunca** `from rest_framework` em `use_cases/selectors`.
- `score` é 0–1 no backend (% é no frontend). `missing_skills` = `[{skill, critical}]`.
- ATS optimizer é do app de agentes — aqui só dispara via task (import lazy).
- Schema, endpoints e decisões: ver `CLAUDE.md`.

## Validar

```
uv run python manage.py makemigrations matching
uv run ruff check src/matching
```
