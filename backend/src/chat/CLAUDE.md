# chat — conversa do entrevistador

App da sessão de entrevista conversacional. O candidato troca mensagens com o
agente entrevistador (app `agents`), que coleta dados pro currículo.

> **Em conflito com `backend/CLAUDE.md`, esse arquivo perde.**

## Models

- **`InterviewSession`** — uma conversa. `user` (FK), `status` (active/completed),
  `current_phase` (intro→…→done), `collected_data` (JSON populado pelas tools).
- **`ChatMessage`** — turn conversacional. `role` (user/assistant), `content`
  (blocos estilo Anthropic), `is_visible` (kickoff inicial é invisível),
  `usage` (tokens, em mensagens do assistant). Ordenado por `id` (cronológico).

> O rastro de tool_use intermediário **não** vira `ChatMessage` — o loop roda
> transiente no use case `RunInterviewerTurn` e só o texto final é persistido. A
> auditoria completa fica em `agents.AgentRun`.

## API (`/api/v1/chat/`)

| Método | Rota | Ação |
|---|---|---|
| POST | `/sessions/` | cria sessão + roda 1º turn (devolve saudação do assistant) |
| GET | `/sessions/` | lista sessões do usuário |
| GET | `/sessions/{id}/` | detalhe + mensagens visíveis |
| POST | `/sessions/{id}/finalize/` | marca completed, devolve `collected_data` |
| GET | `/sessions/{id}/messages/` | mensagens visíveis (paginado) |
| POST | `/sessions/{id}/messages/` | envia mensagem → resposta do assistant |

Sessão é sempre escopada ao `request.user` (selector `get_session_for_user`:
404 se não existe, 403 se de outro usuário).

## Patterns

- Views finas → use case `agents.use_cases.RunInterviewerTurn`. A chamada do LLM
  é **síncrona** (gpt-4o-mini responde rápido); vira Celery se passar de ~10s.
- Schemas das tools em `chat/prompts/tools.py` (formato canônico Anthropic).
- **NÃO** gera currículo — só coleta. Geração é Fase 2.
