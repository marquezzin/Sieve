# `domains/chat/` — Entrevistador Sieve

## Responsabilidade

- Conduzir a entrevista conversacional que coleta os dados pro currículo.
- Abrir/retomar uma sessão `active`; iniciar uma nova quando não houver.
- Enviar a resposta do usuário e exibir o turno do assistant (inclui pedidos de esclarecimento).
- Mostrar o progresso por **fases** (stepper) e finalizar quando houver dados suficientes.

A geração do currículo em si é **Fase 2** — aqui só finalizamos e notificamos.

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
- **Sessão concluída** vira estado read-only: badge "concluída" + composer desabilitado. Sem tela de currículos ainda (Fase 2).
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
│   ├── InterviewerAvatar/                  ← avatar gradient + Sparkles inline
│   ├── MessageBubble/                      ← bolha assistant/user
│   ├── PhaseStepper/                       ← Mantine Stepper das 7 fases
│   ├── TypingIndicator/                    ← três pontinhos animados (CSS module)
│   ├── ChatComposer/                       ← Textarea autosize + enviar (Enter envia)
│   └── ChatEmptyState/                     ← "Pronta para começar?"
├── hooks/
│   ├── queryKeys.ts                        ← CHAT_SESSIONS_KEY, chatSessionKey
│   ├── useSessions.ts
│   ├── useSession.ts
│   ├── useCreateSession.ts
│   ├── useSendMessage.ts                   ← optimistic update
│   └── useFinalizeSession.ts
├── pages/
│   └── ChatPage/
│       └── ChatPage.tsx                    ← compõe header + stepper + lista + composer
└── types/
    └── index.ts                            ← Session, Message, Phase, PHASE_LABELS, helpers
```
