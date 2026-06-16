# `domains/resume/` — Currículo gerado

## Responsabilidade

- **Listar** os currículos do usuário (`ResumeListPage`) com status, score e versão.
- **Detalhar** um currículo (`ResumeDetailPage`): preview do documento + score
  (gauge + breakdown + feedback) + lista de versões + exportar PDF. Cobre os três
  estados do pipeline: `ready`, geração em andamento e `failed`.
- **Comparar** duas versões (`VersionDiffPage`): diff side-by-side add/rem/mod.

Todas as telas são **porte fiel do protótipo** `prototipo/src/resumes.jsx`
(`ResumesList` / `ResumeDetail` / `A4Preview` / `DetailReady` /
`DetailGenerating` / `DetailFailed` / `ResumeDiff`) para Mantine v9.

A geração em si roda no backend (pipeline redator → revisor → juiz); aqui só
consumimos, fazemos polling enquanto gera e exibimos o resultado.

## Endpoints consumidos (`/api/v1/resumes/`)

| Verbo | Path | Função |
|---|---|---|
| GET | `/v1/resumes/` | `listResumes()` — ARRAY direto. |
| GET | `/v1/resumes/{id}/` | `getResume(id)` — `ResumeDetail` (latest_version + versions). |
| GET | `/v1/resumes/{id}/versions/{n}/` | `getVersion(id, n)`. |
| GET | `/v1/resumes/{id}/versions/{from}/diff/{to}/` | `getDiff(id, from, to)`. |
| GET | `/v1/resumes/{id}/versions/{n}/pdf/` | `downloadVersionPdf(id, n)` — **binário**. |

Toda chamada passa pelo `apiClient` (`@/domains/auth/api/client`). NÃO duplicar axios.

## Decimais vêm como STRING

DRF serializa `DecimalField` como string (`overall: "8.44"`, `latest_score`).
Sempre converta com `parseScore(value)` (`types/`), que faz `Number()` + narrow
e devolve `number | null`. Nunca compare a string crua.

## Gotcha do PDF (binário vs envelope)

O interceptor de resposta do `apiClient` desembrulha todo response como envelope
`{ success, data }`. Um Blob quebraria isso. O guard no início do interceptor —
`if (response.config.responseType === 'blob') return response;` — devolve a
resposta binária crua. `downloadVersionPdf` faz `apiClient.get(url, {
responseType: 'blob' })`, monta um object URL, dispara `<a download>` com
filename `resume-{id}-v{n}.pdf` e revoga o URL no `finally`.

## Hooks públicos (via `index.ts`)

- `useResumes()` — `useQuery`, key `['resume','list']`.
- `useResume(id)` — `useQuery`, key `['resume','detail',id]`, `enabled` quando há
  id. **Polling**: `refetchInterval` retorna 2500ms enquanto o status está em
  geração (`generating` / `writer_done` / `reviewer_done`) e `false` quando vira
  `ready`/`failed` — `isGenerating(query.state.data?.status) ? 2500 : false`.
- `useVersionDiff(id, from, to)` — `useQuery`, key `['resume','diff',id,from,to]`,
  `enabled` quando id + ambos os números existem.
- `useDownloadPdf()` — `useMutation` que baixa o blob e notifica sucesso/erro.

## Decisões

- **Preview vem do `structured_data`**, não do `html_rendered`. `ResumePreview`
  monta o documento campo a campo (porte do `A4Preview`) — controle visual,
  fidelidade ao tema (terracotta) e ao A4. O `html_rendered` é reservado pro PDF
  (gerado no backend), evitando iframe e `dangerouslySetInnerHTML`.
- **Estados do detalhe** derivam de `status`: `failed` → `DetailFailed` (retry =
  `refetch`); `isGenerating` → `DetailGenerating` (skeleton + pipeline de 3
  passos, passo ativo mapeado de generating/writer_done/reviewer_done); senão →
  `DetailReady`.
- **ScoreGauge** é porte SVG fiel do protótipo (gradiente + numeral mono + `/10`),
  não `RingProgress`, pra reproduzir o gradiente e o drop-shadow. Cor por faixa:
  verde ≥ 7.5, amarelo ≥ 5, vermelho — `scoreTone()`.
- **StatusBadge** mapeia `writer_done`/`reviewer_done` para o visual "Gerando"
  (amarelo); `ready` verde, `failed` vermelho.
- **Comparar** só aparece com ≥ 2 versões; abre `/resumes/{id}/diff/{n-1}/{n}`.
- **Cor de acento** `terracotta` (IDV do produto). Onde o protótipo usava índigo
  (accent do A4, badge "atual", links), portamos pra terracotta.
- **Ícones inline** via `@/components/atoms/Icon` — adicionados `Download`,
  `Refresh`, `ChevronRight`, `ArrowRight`, `PenLine`, `Stars`, `CheckCircle`,
  `Lightbulb`, `Alert`.
- **Page sem template** — `ProtectedRoute` já dá o `AppShellTemplate`. As pages
  full usam o container do protótipo: `Box maw={1160} mx="auto" px={{base:'sm',
  lg:'lg'}} py="md"` (igual `ProfilePage`).

## Integração com o chat (finalize → currículo)

O `finalize` do backend devolve `resume_id` no payload da sessão. O `SessionView`
do chat (ponto de wiring de app, aceitável como cross-domain mínimo) navega pra
`/resumes/{resume_id}` no sucesso quando `resume_id` está presente. Sessões
concluídas vindas do histórico NÃO têm `resume_id` → o `CompletionPanel` segue
intacto. A page de detalhe abre direto no estado de geração e faz polling até
ficar `ready`.

## Layout

```
resume/
├── CLAUDE.md
├── index.ts                         ← barrel (pages + hooks públicos)
├── api/
│   ├── resumes.ts                   ← listResumes, getResume, getVersion, getDiff
│   └── pdf.ts                       ← downloadVersionPdf (blob → download)
├── components/
│   ├── ScoreGauge/                  ← anel SVG + numeral mono
│   ├── StatusBadge/                 ← ready/generating/failed
│   ├── ScoreBreakdown/              ← 6 critérios em barras
│   ├── ResumePreview/               ← documento do structured_data (porte A4Preview)
│   ├── VersionList/                 ← lista de versões + "atual"
│   └── DiffViewer/                  ← side-by-side add/rem/mod
├── hooks/
│   ├── queryKeys.ts
│   ├── useResumes.ts
│   ├── useResume.ts                 ← polling enquanto gera
│   ├── useVersionDiff.ts
│   └── useDownloadPdf.ts
├── pages/
│   ├── ResumeListPage/
│   ├── ResumeDetailPage/            ← ready | generating | failed
│   └── VersionDiffPage/
└── types/
    └── index.ts                     ← Resume, ResumeDetail, ResumeVersion, Score,
                                        StructuredData, Change, parseScore, scoreTone…
```
