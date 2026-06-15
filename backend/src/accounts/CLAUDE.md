# accounts — perfil do candidato

App do cadastro básico do candidato. `CandidateProfile` é 1:1 com o `User`
(Django auth padrão) e nasce automaticamente via signal `post_save` no User.

> **Em conflito com `backend/CLAUDE.md`, esse arquivo perde.**

## Responsabilidade

- Manter `CandidateProfile` (headline, location, phone, linkedin_url,
  github_url) — um por User, criado por signal.
- Expor `/api/v1/accounts/me/`: **GET** (lê o perfil do `request.user`) e
  **PATCH** (atualização parcial). `user` nunca é exposto/editável — é o
  `request.user`. O serializer espelha `email` + `full_name` do User como
  campos **read-only** (cabeçalho/avatar do perfil no frontend); editáveis são
  só headline/location/phone/linkedin_url/github_url.

## Serviços

- **`services.py: sync_profile_from_personal_info(user, personal_info)`** —
  espelha os dados de contato coletados pelo entrevistador. `accounts` é o dono
  da escrita do perfil: o app `agents` chama este serviço em vez de tocar nos
  models. Regras:
  - **Perfil** (location/phone/linkedin_url/github_url): sobrescreve só com
    valores não-vazios.
  - **`name`** → `first_name`/`last_name` do User, **só se ainda não houver nome**
    (não clobbera nome já definido).
  - **`email`**: NUNCA sincronizado — é identidade de login (única, usada no auth).
  - Headline e dados em massa (experiências/educação/…) não entram aqui (seguem
    no `collected_data` até a Fase 2).

## NÃO faz

- **Nada de currículo / experiências / educação** — isso é a Fase 2, outro app.
- Não cria/lista perfis de terceiros. Só o do usuário autenticado (`/me/`).
- Sem signup/registro de User aqui (auth fica no `core`).

## Modelo: `CandidateProfile`

1:1 `user` (`related_name="candidate_profile"`, `on_delete=CASCADE`). Demais
campos são `blank=True, default=""`. Herda `id` (UUID v7) + timestamps do
`BaseModel`. `__str__`: `Profile<{user}>`.

## Patterns

- Signal garante o perfil → o selector `get_profile_for_user` raramente
  levanta `NotFoundError`, mas mantém o contrato.
- View fina: selector → `Response(data)`; o `EnvelopeRenderer` envolve.
  Permissão default `IsAuthenticated`.
