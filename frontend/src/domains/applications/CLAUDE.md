# `domains/applications/` — Kanban de candidaturas

## Responsabilidade

- **Acompanhar candidaturas** num board Kanban (`KanbanPage`, rota `/applications`):
  6 colunas (funil), cards arrastáveis entre elas, criar e remover card.
- **Criar candidatura** (`CreateApplicationModal`): empresa + cargo obrigatórios;
  link, data, currículo usado e notas opcionais. O currículo escolhido é resolvido
  pra sua última versão (`resume_version_id`) no submit.
- **Ver detalhe** (`ApplicationDetailModal`): clicar no card (sem arrastar) abre um
  modal read-only com estágio, data, link, currículo vinculado e notas.
- **Remover com confirmação** — o botão de excluir abre um `openConfirmModal`
  (`@mantine/modals`); só remove após confirmar.

Telas são **porte fiel do protótipo** `prototipo/src/kanban.jsx`
(`KanbanScreen` / `KanbanCard` / `NewApplicationModal`) para Mantine v9, com a
paleta quente da IDV no lugar do índigo do protótipo.

## As 6 colunas (estágios do funil)

`KANBAN_COLUMNS` (em `types/`) espelha `Application.Status` do backend, na ordem:
`applied` (Aplicada) · `screening` (Triagem) · `technical_interview` (Entrevista
técnica) · `final_interview` (Entrevista final) · `offer` (Oferta) · `rejected`
(Recusada). Cada coluna tem uma cor de acento (`tone`, hex).

## Drag-and-drop com `@dnd-kit/core`

- **`@dnd-kit/core`** (não `sortable` — não há reordenação DENTRO da coluna no
  escopo, só mover ENTRE colunas).
- `KanbanColumn` é `useDroppable({ id: status })`; `ApplicationCard` é
  `useDraggable({ id })`. O `DndContext` na page liga tudo.
- **`PointerSensor` com `activationConstraint.distance = 6`** — o drag só começa
  após mover 6px, então clicar nos botões do card (abrir link / excluir) não
  inicia arraste. Os botões ainda fazem `stopPropagation` no `onPointerDown`.
- **`DragOverlay`** renderiza um `ApplicationCardView` "flutuante" seguindo o
  cursor; o card de origem fica com opacidade reduzida (`isDragging`).
- `onDragEnd`: `over.id` é o `status` da coluna alvo → se mudou, dispara o move.

## Endpoints consumidos (`/api/v1/applications/`)

| Verbo | Path | Função |
|---|---|---|
| GET | `/v1/applications/` | `listApplications()` — ARRAY direto. |
| POST | `/v1/applications/` | `createApplication(input)` — entra em `applied`. |
| PATCH | `/v1/applications/{id}/move/` | `moveApplication(id, status)` — muda só o estágio. |
| DELETE | `/v1/applications/{id}/` | `deleteApplication(id)`. |

Toda chamada passa pelo `apiClient` (re-export em `api/client.ts`). NÃO duplicar axios.

## Seleção do currículo (sem cross-domain import)

`createApplication` aceita `resume_version_id` opcional. Importar de
`domains/resume` seria cross-domain (proibido), então o domain tem acesso mínimo
próprio em `api/resumes.ts` (`listResumesForSelect` + `getResumeLatestVersion`) —
mesmo padrão de `domains/matching`. O modal escolhe o currículo (Resume) e resolve
a última versão no submit.

## Hooks públicos (via `hooks/`)

- `useApplications()` — `useQuery`, key `['applications','list']`. Exportado no
  barrel (o dashboard consome pra contar candidaturas ativas).
- `useCreateApplication()` — `useMutation`, invalida a lista + notifica.
- `useMoveApplication()` — `useMutation` com **optimistic update**: muda o status
  no cache na hora; em erro reverte (`onMutate`/`onError`/`onSettled`). Mantém o
  drag fluido.
- `useDeleteApplication()` — `useMutation`, invalida a lista + notifica.
- `useResumesForSelect()` — currículos pro seletor do modal.

NUNCA `useQuery` direto numa page — sempre via hook do domain.

## Decisões

- **`CompanyAvatar` é átomo compartilhado** (`@/components/atoms/CompanyAvatar`) —
  o mesmo de `domains/matching` (gradiente quente determinístico por empresa).
  Promovido a átomo pra reuso sem cross-domain.
- **`move` separado do update** — endpoint atômico dedicado, alvo do optimistic
  update. Arrastar é a ação mais frequente do board.
- **Card só pelo id da versão** — a lista não traz o número da versão; o card
  mostra um badge "CV" quando há `resume_version`, sem inventar "v2".
- **Page sem template** — `ProtectedRoute` já dá o `AppShellTemplate`. A page usa
  largura total (`Box px py`, sem `maw`) pro board rolar horizontalmente.
- **Forms via `@mantine/form`** (`CreateApplicationModal`). A data usa
  `DatePickerInput` do `@mantine/dates` (calendário tematizado em terracota, locale
  pt-BR via `DatesProvider` no `main.tsx`) — NÃO o `<input type="date">` nativo, que
  não é estilizável. Valor é string ISO `YYYY-MM-DD`.

## Layout

```
applications/
├── CLAUDE.md
├── index.ts                              ← barrel (page + hook + tipos públicos)
├── api/
│   ├── client.ts                         ← re-export do apiClient único
│   ├── applications.ts                   ← list, create, move, delete
│   └── resumes.ts                        ← acesso mínimo p/ o seletor de currículo
├── components/
│   ├── ApplicationCard/                  ← card arrastável + view puro (DragOverlay)
│   ├── KanbanColumn/                     ← coluna droppable (header + cards/vazio)
│   ├── CreateApplicationModal/           ← modal "Nova candidatura"
│   └── ApplicationDetailModal/           ← modal read-only com os detalhes do card
├── hooks/
│   ├── queryKeys.ts
│   ├── useApplications.ts
│   ├── useCreateApplication.ts
│   ├── useMoveApplication.ts             ← optimistic update
│   ├── useDeleteApplication.ts
│   └── useResumesForSelect.ts
├── pages/
│   └── KanbanPage/                       ← DndContext + colunas + DragOverlay + modal
└── types/
    └── index.ts                          ← Application, ApplicationStatus,
                                            CreateApplicationInput, KANBAN_COLUMNS
```
