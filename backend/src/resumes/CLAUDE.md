# resumes — currículo gerado (writer → reviewer → judge)

App que materializa o currículo do candidato a partir do `collected_data` de uma
`chat.InterviewSession`. Guarda o **histórico imutável de versões** (cada passo do
pipeline multi-agente emite uma versão), o HTML ATS-safe renderizado, e o score
do agente juiz. Expõe leitura, diff entre versões e export de PDF on-demand.

> **Em conflito com `backend/CLAUDE.md`, esse arquivo perde.**
> A geração em si (chamadas LLM writer/reviewer/judge) é orquestrada pelo app de
> agentes — este app só guarda o resultado e serve via API.

## Models

- **`Resume`** — o currículo. `user` (FK), `session` (FK nullable → origem),
  `title`, `target_role`, `status`, `error`.
  - `status` (TextChoices) tem **estados intermediários** pra UI acompanhar o
    pipeline: `generating` → `writer_done` → `reviewer_done` → `ready`, ou
    `failed` (com `error` preenchido). Default `generating`.
- **`ResumeVersion`** — snapshot imutável. `version_number`
  (`unique_together` com `resume`), `structured_data` (JSON, schema abaixo),
  `html_rendered`, `generated_by_agent` (`"writer"` | `"reviewer"`).
- **`ResumeScore`** — veredito do juiz, 1:1 (`OneToOneField`) com uma versão.
  `overall` (Decimal 0.00–10.00), `criteria` (6 keys exatas), `feedback`
  (lista de `{tone, text}` com tone green/yellow/red).

## Schema de `structured_data`

```jsonc
{
  "personal_info": {           // todas as strings opcionais
    "name", "email", "phone", "location", "linkedin_url", "github_url"
  },
  "summary": "str",            // resumo profissional 2-4 frases
  "experiences": [
    { "id": "slug(company-role)",   // ESTÁVEL — chave do diff
      "role", "company",
      "start", "end",               // "2022", "2022-03", "Atual"
      "location",                   // opcional
      "bullets": ["str", ...],
      "tech_stack": ["str", ...] }
  ],
  "education": [
    { "id", "course", "institution", "start", "end", "status" }
  ],
  "projects": [
    { "id", "name", "description", "bullets": [...], "tech_stack": [...] }
  ],
  "skills": ["str", ...]        // FLAT list — ver decisão abaixo
}
```

## API (`/api/v1/resumes/`)

Tudo escopado ao `request.user` (selector `get_resume_for_user`: 404 se não
existe, 403 se de outro usuário). `IsAuthenticated` default.

| Método | Rota | Ação |
|---|---|---|
| GET | `/` | lista currículos (id, title, target_role, status, latest_version_number, latest_score, versions_count, timestamps) |
| GET | `/{id}/` | detalhe: meta + `latest_version` completa (com score) + lista resumida de versões |
| GET | `/{id}/versions/` | todas as versões completas |
| GET | `/{id}/versions/{n}/` | versão específica completa |
| GET | `/{id}/versions/{n}/pdf/` | **download binário** (`application/pdf`, attachment) — não passa pelo envelope |
| GET | `/{id}/versions/{n1}/diff/{n2}/` | `{from, to, changes:[...]}` (envelope normal) |

## Use cases

- `render_to_html.render_structured_data_to_html(structured_data) -> str` —
  template `resume/default.html`. UMA `<section>` por área presente; seções
  vazias omitidas. ATS-safe: sans-serif, sem tabelas/colunas/imagens, hierarquia
  por headings, CSS inline conservador (browser + WeasyPrint).
- `compute_diff.compute_diff(old, new) -> list[Change]` — diff semântico por
  seção. `Change = {type: add|rem|mod, section, before, after}`. Entradas casadas
  por `id` estável; bullets alinhados por índice. Skills por diferença de
  conjunto.
- `render_to_pdf.render_version_to_pdf(version) -> bytes` — delega pra
  `integrations.pdf.factory.get_pdf_renderer().render(html)`. PDF é **on-demand,
  sem cache** (não persiste bytes; regenera a cada download).

## Decisões

- **`skills` é FLAT list** (`["Python", "Django", ...]`), não `{categoria: [...]}`.
  Divergência deliberada do spec original: lista plana é ATS-friendly (parsers de
  ATS leem keywords corridas; categorização vira ruído). Quem precisar agrupar
  visualmente agrupa no frontend.
- **`status` com estados intermediários** (`generating`/`writer_done`/
  `reviewer_done`/`ready`/`failed`) — a UI mostra o progresso do pipeline em
  tempo real, não só "pronto/falhou".
- **Diff por `id` estável** (slug company-role) em vez de posição na lista — uma
  experiência não-modificada que mudou de ordem não polui o diff; um bullet
  reescrito vira `mod`, não `rem`+`add`.
- **PDF on-demand sem cache** — currículo muda pouco, regenerar é barato, e cache
  de binário invalidaria a cada nova versão. Endpoint devolve 503 (não 500)
  quando a stack de PDF (lib opt-in WeasyPrint) não está disponível.

## NÃO faz

- Não gera currículo (não chama LLM) — isso é o app de agentes. Aqui só persiste
  o resultado e serve via API.
- Não cria/lista currículos de terceiros — só do usuário autenticado.
