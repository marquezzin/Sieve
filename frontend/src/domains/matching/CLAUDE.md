# `domains/matching/` — Análise de aderência currículo ↔ vaga

## Responsabilidade

A `JobAnalysisPage` é uma **página única** (sem tabs): o bloco "Analisar vaga" no
topo e a lista "Vagas analisadas" logo abaixo.

- **Analisar** uma vaga (bloco de topo): o usuário cola título + empresa +
  descrição e escolhe contra qual currículo comparar. O fluxo ingere a vaga
  (`POST /jobs/`), resolve a última versão do currículo escolhido e calcula a
  aderência (`POST /analyze/`). O resultado aparece ao lado, via `MatchResult`.
- **Exibir o resultado** (`MatchResult`): gauge de aderência, skills que batem,
  skills que faltam (crítica vs. neutra) e **recomendações detalhadas** — cada uma
  com título acionável + explicação ancorada no currículo + tag de categoria
  (`Realce` / `Ênfase` / `Gap real`, via `RECOMMENDATION_META`). É o entregável
  principal do produto, então é o foco visual, não um bullet de uma linha.
- **Listar + abrir** as vagas já analisadas (`AnalyzedJobItem`): clicar num item
  **abre um modal** (`JobAnalysisModal`) com a análise completa — não navega. O
  header do modal (avatar + título + empresa) vem na hora do `job` da lista; o
  corpo carrega o detalhe sob demanda (`GET /jobs/{id}/`) e renderiza a análise
  mais recente via `MatchResult`.
- **Detalhar** uma vaga por URL direta (`JobDetailPage`, rota `/matching/jobs/:id`):
  header com eyebrow "VAGA ANALISADA · HÁ X", título como H1, empresa em destaque
  (avatar + nome) + a análise mais recente via `MatchResult`. É **deep-link only**
  — a lista usa expansão inline, mas a rota segue válida (ex.: link externo).

> O domain **só analisa** aderência — não há mais reescrita/otimização de
> currículo (feature removida por risco de fabricação).

Telas são **porte fiel do protótipo** `prototipo/src/jobs.jsx`
(`JobsScreen` / `JobAnalyzer` / `MatchResult` / `JobsAnalyzed`) para Mantine v9,
com a paleta `terracotta` do tema no lugar do índigo do protótipo.

## O score é FLOAT 0.0–1.0

`MatchAnalysis.score` vem **0.0–1.0** do backend (similaridade coseno). Sempre
converta pra percentual com `scorePercent(score)` (`= Math.round(score*100)`)
antes de exibir. `matchTone(percent)` dá a faixa (verde ≥ 75, amarelo ≥ 50,
vermelho); `MATCH_TONE_COLOR` mapeia pra cor Mantine; `matchLabel(percent)` dá o
rótulo do badge.

## Endpoints consumidos (`/api/v1/matching/`)

| Verbo | Path | Função |
|---|---|---|
| POST | `/v1/matching/jobs/` | `ingestJob({title, company, description})` → `JobPosting`. |
| GET | `/v1/matching/jobs/` | `listJobs()` — ARRAY direto. Cada item traz `top_score` (0–1 ou `null`). |
| GET | `/v1/matching/jobs/{id}/` | `getJob(id)` → `JobPostingDetail` (a vaga + `analyses`, mais recente primeiro). |
| POST | `/v1/matching/analyze/` | `analyze({resume_version_id, job_posting_id}, refresh?)` → `MatchAnalysis`. `refresh` vira `?refresh=true`. |

Toda chamada passa pelo `apiClient` (re-exportado em `api/client.ts` de
`@/domains/auth/api/client`). NÃO duplicar axios.

## Seleção da versão do currículo (sem cross-domain import)

`analyze` precisa de `resume_version_id`. Importar de `domains/resume` seria
cross-domain (proibido), então o domain tem o seu próprio acesso mínimo ao
endpoint de currículos em `api/resumes.ts`:

- `listResumesForSelect()` → `GET /v1/resumes/` — popula o `Select` do form. A
  lista expõe `latest_version_number`, mas **NÃO** o `id` da última versão.
- `getResumeLatestVersion(resumeId)` → `GET /v1/resumes/{id}/` e devolve
  `latest_version` (`{id, version_number}`). É daqui que sai o `resume_version_id`.

## Hooks públicos (via `hooks/`)

- `useResumesForSelect()` — `useQuery`, key `['matching','resume-select']`.
- `useJobList()` — `useQuery`, key `['matching','jobs']`.
- `useJob(id)` — `useQuery`, key `['matching','job',id]`, `enabled` quando há id.
  Detalhe da vaga (`JobPostingDetail`) com as `analyses` embutidas.
- `useRunAnalysis()` — `useMutation` que orquestra o fluxo: resolve a última
  versão do currículo → ingere a vaga → calcula o match. Devolve
  `{job, analysis, resume_version_id}`. Invalida a lista de vagas no sucesso.
- `useIngestJob()` / `useAnalyze()` — mutations atômicas (disponíveis, mas o page
  usa `useRunAnalysis` pro caminho completo).

NUNCA `useQuery` direto no page — sempre via hook do domain.

## Decisões

- **Gauge próprio** (`MatchScoreGauge`) — porte SVG do `ScoreGauge` do protótipo na
  variante `max=100` (numeral + sufixo `%`). NÃO importa o `ScoreGauge` do
  `domains/resume` (seria cross-domain).
- **Cor de acento** `terracotta` (IDV do produto) onde o protótipo usava índigo.
- **Orquestração num único mutation** (`useRunAnalysis`) — mantém o page livre da
  sequência de chamadas crus e do `useQuery` imperativo.
- **Página única, sem tabs** — "Analisar vaga" (form + resultado) no topo e "Vagas
  analisadas" (lista) abaixo, na mesma rota `/matching`. A troca por tabs foi
  removida a pedido do produto: ver tudo numa página só.
- **Lista "Vagas analisadas"** vem de `GET /jobs/`. A barra de score por vaga do
  protótipo dependia de um match salvo por vaga (não exposto pela LISTA), então o
  item mostra as `extracted_keywords` (o sinal que a lista carrega). Clicar **abre
  o `JobAnalysisModal`** (estado `openJob` na page) → `GET /jobs/{id}/` sob demanda
  → `MatchResult` da análise mais recente. Optei por modal em vez de expansão
  inline: o Mantine `Collapse` media altura 0 quando o conteúdo é montado junto com
  a abertura, e o modal dá mais respiro pra análise completa.
- **`JobDetailPage` reusa `MatchResult`** — recebe `analyses[0]`. Hoje é
  **deep-link only** (a lista expande inline); a rota segue válida. O header NÃO
  mostra os chips de `extracted_keywords`: a empresa é a âncora visual (avatar +
  nome em peso forte) sob o título. Vaga sem `analyses` mostra EmptyState com CTA.
- **`CompanyAvatar`** (átomo do domain) — avatar quadrado com iniciais e gradiente
  quente **determinístico por empresa** (hash djb2 do nome → paleta da IDV). Mesma
  empresa, mesma cor na lista e no detalhe. Aceita `size` (42 lista / 52 detalhe).
- **`JobAdherenceList`** (exportado no barrel) — widget "Aderência às últimas vagas"
  do dashboard: consome `useJobList` e mostra as vagas com `top_score` (barra + %),
  ordenadas pela mais recente. Self-contained; o `DashboardPage` (transversal, pode
  importar de domains) só renderiza `<JobAdherenceList />`. Sem vagas analisadas →
  estado vazio honesto com CTA "Analisar".
- **Page sem template** — `ProtectedRoute` já dá o `AppShellTemplate`. O page usa o
  container `Box maw={1160} mx="auto" px={{base:'sm', lg:'lg'}} py="md"`.
- **Forms via `@mantine/form`** (`JobInputForm`).

## Layout

```
matching/
├── CLAUDE.md
├── index.ts                              ← barrel (page + tipos públicos)
├── api/
│   ├── client.ts                         ← re-export do apiClient único
│   ├── jobs.ts                           ← ingestJob, listJobs, getJob
│   ├── analysis.ts                       ← analyze
│   └── resumes.ts                        ← listResumesForSelect, getResumeLatestVersion
├── components/
│   ├── MatchScoreGauge/                  ← (atom) anel SVG % próprio
│   ├── CompanyAvatar/                    ← (atom) iniciais + gradiente quente por empresa
│   ├── JobInputForm/                     ← (molecule) form da vaga + seletor de currículo
│   ├── MatchResult/                      ← (molecule) gauge + skills + recs
│   ├── AnalyzedJobItem/                  ← (molecule) item da lista, abre o modal
│   ├── JobAnalysisModal/                 ← (molecule) modal com a análise completa
│   └── JobAdherenceList/                 ← (molecule) widget do dashboard (top_score por vaga)
├── hooks/
│   ├── queryKeys.ts
│   ├── useResumesForSelect.ts
│   ├── useJobList.ts
│   ├── useIngestJob.ts
│   ├── useAnalyze.ts
│   ├── useRunAnalysis.ts                 ← orquestra ingest → versão → analyze
│   └── useJob.ts                         ← detalhe da vaga (com analyses)
├── pages/
│   ├── JobAnalysisPage/                  ← tabs Analisar | Analisadas
│   └── JobDetailPage/                    ← /matching/jobs/:id — detalhe + análise
└── types/
    └── index.ts                          ← JobPosting, JobPostingDetail, MatchAnalysis,
                                            MissingSkill, scorePercent, matchTone…
```
