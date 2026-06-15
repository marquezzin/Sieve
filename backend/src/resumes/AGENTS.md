# resumes — guia rápido p/ agentes

App de currículo gerado: `Resume` + `ResumeVersion` (snapshots imutáveis) +
`ResumeScore` (veredito do juiz). Guarda e serve; **não** chama LLM.

## Layout

- `models.py` — Resume / ResumeVersion / ResumeScore (todos `BaseModel`, UUID v7).
- `selectors.py` — leituras escopadas ao user (404/403 como `chat/selectors.py`).
- `use_cases/` — `render_to_html`, `compute_diff`, `render_to_pdf`. Sem DRF aqui.
- `api/` — views finas + serializers + urls. PDF usa `HttpResponse` cru (sem
  envelope). Diff usa `Response` plain (envelope normal).
- `templates/resume/default.html` — HTML ATS-safe (sem tabela/coluna/imagem).

## Regras

- Lógica de negócio em `use_cases/`, queries em `selectors.py`. Views só orquestram.
- **Nunca** `from rest_framework` em `use_cases/selectors`.
- Geração (writer/reviewer/judge) é do app de agentes — não implemente aqui.
- Schema de `structured_data`, endpoints e decisões: ver `CLAUDE.md`.

## Validar

```
uv run python manage.py makemigrations resumes
uv run ruff check src/resumes
```
