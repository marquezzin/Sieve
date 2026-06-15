# `domains/chat/` — Entrevistador Sieve

## Responsabilidade

- Conduzir a entrevista conversacional que coleta os dados pro currículo.
- **Listar o histórico de entrevistas** (ativas + concluídas) e abrir qualquer uma.
- Abrir/retomar uma sessão `active`; iniciar uma nova quando o usuário pedir.
- Enviar a resposta do usuário e exibir o turno do assistant (inclui pedidos de esclarecimento).
- Mostrar o progresso por **fases** (stepper) e finalizar quando houver dados suficientes.
- **Mostrar o recap de conclusão** de uma sessão `completed` (banner + contagens do `collected_data` + transcrição read-only).

A geração do currículo em si é **Fase 2** — aqui só finalizamos e notificamos.

## Navegação (estado da page)

`ChatPage` tem um único estado: `selectedId: string | null`.

- `null` → **lista de entrevistas** (`SessionHistoryList`). Estado inicial e o
  estado após reload — é o que conserta o bug do "sumiço": a sessão concluída
  reaparece na lista em vez de desaparecer.
- `selectedId` setado → **`SessionView`** daquela sessão:
  - `status === 'active'` → entrevista ao vivo (retomável), com header + stepper +
    composer + botão "voltar" (seta) que reseta `selectedId` pra `null`.
  - `status === 'completed'` → **`CompletionPanel`** (recap read-only).
- Pós-finalize: o `selectedId` continua apontando pra mesma sessão, que vira
  `completed` → o usuário cai direto no recap. "Voltar" volta pra lista; ao
  recarregar, a lista mostra a entrevista concluída.

A sessão `active` fica **fixada no topo** da lista com botão "Continuar".

## Recap de `collected_data`

`summarizeCollectedData(data)` (em `types/`) normaliza o `collected_data`
(`Record<string, unknown>`) num `CollectedSummary` tipado — narrow seguro
(`Array.isArray` → `.length`, objeto não-vazio pra `personal_info`), **sem `any`**:

```ts
{ hasPersonalInfo: boolean; experiences: number; education: number; projects: number; skills: number }
```

`summaryLine(summary)` gera a linha curta dos cards ("3 experiências · 2 formações · 8 skills").

### Parsers tipados (detalhe do recap)

Além das contagens, `types/` expõe parsers que normalizam o `collected_data`
em estruturas tipadas (narrow seguro, **sem `any`** — `asRecord`/`asString`/
`asStringArray`/`asRecordArray`; entradas malformadas ou vazias são descartadas):

- `parsePersonalInfo(data) → PersonalInfo | null` — campos opcionais
  (`name/email/phone/location/linkedin_url/github_url`); `null` se nada coletado.
- `parseExperiences(data) → ExperienceItem[]` — `role/company/start/end/location`
  + `bullets: string[]` + `tech_stack: string[]`.
- `parseEducation(data) → EducationItem[]` — `course/institution/start/end` +
  `status?: 'in_progress' | 'done'`.
- `parseProjects(data) → ProjectItem[]` — `name/description/result` + `tech_stack`.
- `parseSkills(data) → string[]`.
- `EDUCATION_STATUS_LABELS` — rótulos pt-BR ("Em andamento" / "Concluída").

`InterviewSummary` é o recap rico: cada categoria é uma **linha-cabeçalho
expansível** (chip de contagem clicável + chevron). Ao expandir, revela o
conteúdo read-only via `<Collapse expanded>` (Mantine v9 usa `expanded`, não
`in`): dados pessoais como linhas rotuladas (links em `Anchor`), experiências/
formações/projetos como cards (`Paper withBorder radius`) com período (ícone
calendário), bullets e `tech_stack` em `Badge color="terracotta"`, status da
formação em badge (verde p/ concluída), e skills como wrap de badges. Ordem fixa:
Dados pessoais → Experiência → Formações → Projetos → Skills. `hideEmpty` (passado
pelo `CompletionPanel`) some com categorias vazias. Ícones extras
(Calendar/MapPin/Mail/Phone/Linkedin/Github) ficam em `components/icons.tsx`.

## Endpoints consumidos

| Verbo | Path | Função |
|---|---|---|
| POST | `/v1/chat/sessions/` | `createSession()` — sem body; volta com a 1ª msg do assistant. |
| GET | `/v1/chat/sessions/{id}/` | `getSession(id)` — inclui `messages`. |
| GET | `/v1/chat/sessions/` | `listSessions()` — ARRAY direto (não paginado). |
| POST | `/v1/chat/sessions/{id}/messages/` | `sendMessage(id, text)` — volta a msg do assistant. |
| POST | `/v1/chat/sessions/{id}/finalize/` | `finalizeSession(id)`. |
| GET | `/v1/chat/sessions/{id}/messages/` | `listMessages(id)` — PAGINADO (opcional). |

Toda chamada passa pelo `apiClient` (`@/domains/auth/api/client`). NÃO duplicar axios.

## Hooks públicos (via `index.ts`)

- `useSessions()` — `useQuery`, key `['chat','sessions']`.
- `useSession(id)` — `useQuery`, key `['chat','session',id]`, `enabled` quando há id.
- `useCreateSession()` — `useMutation`; semeia a cache da sessão nova + invalida sessions.
- `useSendMessage(sessionId)` — `useMutation` com **optimistic update** (msg do usuário entra na cache na hora). `onSettled` invalida o detalhe da sessão (o turno pode gerar msgs extras e mudar a fase). Composer fica desabilitado enquanto `isPending`.
- `useFinalizeSession(id)` — `useMutation`; invalida + notifica sucesso.

## Decisões

- **Fonte de mensagens é `getSession`**, não `listMessages`. O detalhe já traz `messages` filtradas pelo backend; evita uma query a mais e mantém `current_phase`/`messages` coerentes num só refetch.
- **Optimistic só na msg do usuário** — `current_phase` não muda otimisticamente; só após o servidor confirmar (em `onSettled`/refetch).
- **Finalizar habilitado a partir de `skills`** — `canFinalize(phase)` em `types/index.ts` (`phaseIndex >= phaseIndex('skills')`).
- **Sessão concluída** vira a experiência de recap (`CompletionPanel`): banner de conclusão (check + data via `formatDate`/`formatRelative`), recap rico expansível do `collected_data` (`InterviewSummary` — chips de contagem que abrem o detalhe de cada categoria), nota inerte "Em breve · Fase 2" (sem botão falso), CTAs "Nova entrevista" / "Voltar", e a transcrição read-only num toggle "Ver conversa". Sem tela de currículos ainda (Fase 2).
- **Histórico** (`SessionHistoryList` + `SessionHistoryCard`) é o estado de landing quando `selectedId === null`. Construído de `useSessions()`, ordenado por `updated_at` desc, com a sessão `active` fixada no topo. Zero sessões → mantém o `ChatEmptyState` amigável.
- **Ícones do recap/histórico** centralizados em `components/icons.tsx` e `components/sparkles.tsx` (SVG inline reaproveitado por avatar/empty/list) — segue a decisão de não adicionar lib de ícones.
- **Fases** centralizadas em `types/`: `PHASE_STEPS` (7 passos visíveis), `PHASE_LABELS` (rótulos pt-BR), `phaseIndex`, `canFinalize`. `done` = todas concluídas (índice após o último passo).
- **Ícones inline** (SVG) em vez de lib de ícones — o template não tem `@tabler/icons-react` e não vale adicionar dependência por um Sparkles/Send.
- **Cor de acento**: paleta `terracotta` do tema (IDV do produto, definida no `main.tsx`).

## Layout

```
chat/
├── CLAUDE.md
├── index.ts                                ← barrel
├── api/
│   └── index.ts                            ← createSession, getSession, listSessions, sendMessage, finalizeSession, listMessages
├── components/
│   ├── icons.tsx                           ← SVG inline (Check, setas, User, Briefcase…)
│   ├── sparkles.tsx                        ← SparklesIcon compartilhado
│   ├── InterviewerAvatar/                  ← avatar gradient + Sparkles inline
│   ├── MessageBubble/                      ← bolha assistant/user
│   ├── PhaseStepper/                       ← Mantine Stepper das 7 fases
│   ├── TypingIndicator/                    ← três pontinhos animados (CSS module)
│   ├── ChatComposer/                       ← Textarea autosize + enviar (Enter envia)
│   ├── ChatEmptyState/                     ← "Pronta para começar?" (zero sessões)
│   ├── SessionHistoryList/                 ← "Suas entrevistas" (landing) + CTA nova
│   ├── SessionHistoryCard/                 ← card de uma entrevista (badge + recap line)
│   ├── InterviewSummary/                   ← recap rico: chips de contagem expansíveis → detalhe read-only de cada categoria
│   └── CompletionPanel/                    ← recap de sessão concluída + transcrição toggle
├── hooks/
│   ├── queryKeys.ts                        ← CHAT_SESSIONS_KEY, chatSessionKey
│   ├── useSessions.ts
│   ├── useSession.ts
│   ├── useCreateSession.ts
│   ├── useSendMessage.ts                   ← optimistic update
│   └── useFinalizeSession.ts
├── pages/
│   └── ChatPage/
│       └── ChatPage.tsx                    ← selectedId → lista | SessionView (ativa|recap)
└── types/
    └── index.ts                            ← Session, Message, Phase, PHASE_LABELS,
                                              helpers + summarizeCollectedData / summaryLine
```
