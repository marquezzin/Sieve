# applications — Kanban de candidaturas

App do funil de candidaturas: cada `Application` é um card (empresa, cargo, link,
notas, estágio) que o usuário move entre colunas. Liga opcionalmente à vaga
(`matching.JobPosting`) e à versão do currículo usada (`resumes.ResumeVersion`).

> **Em conflito com `backend/CLAUDE.md`, esse arquivo perde.**

## Model

- **`Application`** — `user` (FK CASCADE), `company`, `position`, `link` (opcional),
  `notes` (opcional), `applied_at` (DateField nullable), `status` (TextChoices),
  `job_posting`/`resume_version` (FK `SET_NULL` — apagar a vaga/versão não apaga o
  histórico da candidatura). Ordenado por `-id` (UUID v7 cronológico).
- **`Status`** (6 estágios do funil): `applied`, `screening`, `technical_interview`,
  `final_interview`, `offer`, `rejected`. Default `applied`.

## API (`/api/v1/applications/`)

Tudo escopado ao `request.user` via `get_queryset` (isolamento). `IsAuthenticated`.

| Método | Rota | Ação |
|---|---|---|
| GET | `/` | lista cards do user |
| POST | `/` | cria card (`company`, `position` obrigatórios) |
| PATCH | `/{id}/` | edita card (partial) |
| PATCH | `/{id}/move/` | muda só o `status` (validação de choice → 400) |
| DELETE | `/{id}/` | remove card |

## Decisões

- **FK por id, com ownership validado no serializer** — `job_posting_id` e
  `resume_version_id` no `ApplicationCreateSerializer` são validados contra o
  `request.user` (`validate_*_id`). Impede attach de vaga/versão de outro usuário
  e evita FK inexistente virar `IntegrityError` 500 (vira 400).
- **`SET_NULL` nas FKs** — o card é histórico do candidato; sobrevive a deleção
  da vaga ou da versão de currículo.
- **`move` separado do update** — mudar de coluna é a ação mais frequente do
  Kanban; endpoint dedicado e atômico (`update_fields=["status", "updated_at"]`),
  alvo do optimistic update no frontend.

## NÃO faz

- Não cria/lista candidaturas de terceiros — só do usuário autenticado.
- Não dispara matching/optimize — isso é o app `matching`. Aqui só referencia.
