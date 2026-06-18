# Fase 5 — Criar currículo a partir de um existente (chat "top-up")

**Status:** 🔲 Pendente
**Pré-requisitos:** Fase 1 ✅ (chat + entrevistador), Fase 2 ✅ (Resume/ResumeVersion + pipeline writer/reviewer/judge)
**Independente da Fase 4** — não há dependência técnica entre elas; pode ser executada antes ou depois do wrap-up (foto/relatório/apresentação). Inserida como Fase 5 só pra não renumerar a Fase 4, cujo label ("Em breve · Fase 4") está cravado em placeholders de UI.

## Contexto

Hoje só existe **uma** porta de entrada pro currículo: a entrevista do zero
([`SessionViewSet.create`](../../backend/src/chat/api/views.py) → sessão vazia →
chat percorre todas as fases → `finalize` → writer). Para quem **já tem um
currículo** no Sieve, refazer a entrevista inteira é fricção desnecessária.

A feature: na aba de Currículos, oferecer **"Criar a partir deste currículo"** —
abre um chat que **já conhece o candidato** (carrega `experiences`, `education`,
`skills`, `personal_info` do currículo escolhido) e só conversa pra **acrescentar
ou ajustar** o que o usuário falar, gerando um **novo `Resume`** sem reentrevistar.

### Por que é barato

`InterviewSession.collected_data` (entrevista) e `ResumeVersion.structured_data`
(currículo) são **JSONs irmãos**: compartilham as chaves `personal_info`,
`experiences`, `education`, `projects`, `skills`. Logo, **semear** uma nova sessão
com o `structured_data` de uma versão existente é quase uma cópia direta — e todo
o resto (chat, `finalize`, pipeline writer/reviewer/judge, models) é reaproveitado
sem mudança.

## Outcome esperado

1. Na aba `/resumes` (lista) e/ou no detalhe `/resumes/{id}`, botão **"Criar a
   partir deste"**.
2. `POST /api/v1/chat/sessions/` com `from_version_id` (ou `from_resume_id`) cria
   uma sessão **semeada**: `collected_data` ← `structured_data` da versão; fase
   inicial pula direto pro modo de complemento.
3. O entrevistador abre em **modo top-up**: cumprimenta reconhecendo os dados que
   já tem ("Vi que você tem experiência no Nubank e na Acme…") e pergunta **o que
   o usuário quer adicionar/mudar** — sem reperguntar o que já sabe.
4. Usuário conversa (ex.: "adiciona um projeto pessoal de X", "atualiza meu cargo
   atual para Sênior"). O agente incorpora ao `collected_data`.
5. `finalize` → `create_resume_for_session` → writer gera um **novo `Resume`** com
   o `structured_data` enriquecido. Reviewer/judge rodam normalmente.

## Escopo

### Faz parte

- **Backend — adapter `structured_data → collected_data`** (`agents/` ou
  `resumes/`): passthrough das chaves compartilhadas (`personal_info`,
  `experiences`, `education`, `projects`, `skills`), descartando campos derivados
  pelo writer que não fazem parte do "coletado" (ex.: `summary` é re-gerado pelo
  writer; pode ser semeado como contexto opcional). Idempotente e testado.
- **Backend — criação de sessão semeada**: estender `SessionViewSet.create` pra
  aceitar `from_version_id` opcional. Quando presente: valida ownership da versão
  (selector `resumes`), semeia `collected_data`, marca `current_phase` num estágio
  de complemento (ex.: `review` ou uma nova fase `augment`), e roda o 1º turno do
  entrevistador em modo top-up.
- **Agents — modo "top-up" do entrevistador**: um **prompt de sistema variante**
  (`agents/prompts/interviewer_topup_system.md`) que recebe o `collected_data`
  semeado no contexto e instrui: (a) reconhecer o que já existe, (b) **não**
  reperguntar dados conhecidos, (c) coletar só deltas, (d) chamar
  `mark_phase_complete`/finalizar quando o usuário não tiver mais ajustes.
  `RunInterviewerTurn` ganha um seletor de prompt (entrevista normal vs top-up),
  derivado de um flag na sessão (ex.: `mode`/`seeded`) ou da presença de
  `collected_data` não-vazio na criação.
- **Frontend — botão + wiring**: na lista/detalhe de currículos
  (`domains/resume/`), CTA "Criar a partir deste". Chama a criação semeada e
  **navega pra tela de chat existente** (`/chat/{id}`). Reusa 100% da UI de chat.
- **Tests**: adapter (mapeamento de chaves), criação semeada (collected_data
  povoado + ownership), seleção de prompt top-up, e2e (sessão semeada → finalize →
  novo Resume com os dados originais preservados + o delta adicionado).

### NÃO faz parte

- **Agregar dados de múltiplas fontes** (todos os currículos + sessões do usuário
  num "perfil mestre") — começamos por **uma versão específica**. Agregação fica
  pra evolução futura.
- **Gerar nova *versão* do mesmo Resume** — o resultado é um **Resume novo**
  (bate com "criar um novo currículo"). Versionar-no-lugar é outra feature.
- **Editor estruturado** (formulário campo a campo do currículo) — aqui a porta de
  entrada continua conversacional, só que semeada.
- Mudanças no pipeline writer/reviewer/judge.

## Decisões (com defaults sugeridos)

| Decisão | Default | Trade-off |
|---|---|---|
| Fonte dos dados | Uma `ResumeVersion` existente (a mais recente do Resume escolhido) | Concreto e já validado; agregação multi-fonte é fuzzy → fica pra depois |
| Resultado | **Novo `Resume`** | Mais simples; "nova versão" exigiria ligar à árvore de versões existente |
| Onde semear | `collected_data` da nova sessão = `structured_data` da versão (passthrough das chaves compartilhadas) | Schemas são irmãos; adapter trivial |
| Distinguir modo | Flag na sessão (`mode="topup"` ou `seeded=True`) define o prompt | Explícito > inferir por `collected_data` não-vazio |
| Fase inicial | `review` (ou nova `augment`) — pula intro/coleta sequencial | Evita a máquina de fases reperguntar tudo |
| Prompt | **Arquivo novo** `interviewer_topup_system.md` (não ramificar o prompt atual com `if`) | Mantém os dois fluxos legíveis e testáveis isolados |
| Re-gerar `summary` | Writer re-gera a partir do conteúdo final | Consistência; o summary é derivado, não coletado |

## Arquivos a criar / modificar

### Backend

```
backend/src/agents/
├── prompts/interviewer_topup_system.md        # NOVO — prompt do modo top-up
├── use_cases/run_interviewer_turn.py          # seleção de prompt (normal vs topup)
└── (adapter structured_data→collected_data)   # NOVO — em agents/ ou resumes/use_cases/

backend/src/chat/
├── models.py                                  # + campo de modo na InterviewSession (ex.: mode/seeded)
├── migrations/000X_session_mode.py            # AddField
├── api/views.py                               # create aceita from_version_id → sessão semeada
└── api/serializers.py                         # valida from_version_id (ownership)

backend/src/resumes/selectors.py               # get_version_for_user já existe (reusar)
```

### Frontend

```
frontend/src/domains/resume/
├── api/                # POST de criação semeada (ou expõe no domain chat)
├── hooks/              # useCreateResumeFromExisting (mutation → navega /chat/{id})
├── components/         # botão/CTA "Criar a partir deste" (lista + detalhe)
└── pages/              # ResumeListPage / ResumeDetailPage — inserir o CTA
```

> Atenção cross-domain: criar a sessão é responsabilidade do **chat**. Se o botão
> mora em `domains/resume`, ele deve chamar um endpoint (não importar
> `domains/chat`). Avaliar expor a criação semeada via uma função fina no próprio
> `resume` que bate no `POST /chat/sessions/`, ou um wiring mínimo no nível de app
> (como o `finalize→/resumes/{id}` já faz). Decidir na implementação.

## Reuso (não criar — usar)

| Componente | Onde | Como |
|---|---|---|
| `RunInterviewerTurn` | `agents/use_cases/` | Ganha seleção de prompt; resto intacto |
| Máquina de fases + `mark_phase_complete` | `chat` + prompt | Modo top-up começa em fase de complemento |
| `create_resume_for_session` + pipeline | `resumes` + `agents/tasks` | `finalize` gera o novo Resume sem mudança |
| `get_version_for_user` | `resumes/selectors.py` | Ownership da versão-fonte |
| Tela de chat | `domains/chat/` | Reusada 100% — a sessão semeada só "começa adiantada" |
| `structured_data` ↔ `collected_data` (chaves irmãs) | — | Base do adapter |

## Critérios de aceite

### Backend — automatizáveis

- [ ] `test_seed_adapter` — `structured_data → collected_data` preserva
  `personal_info`/`experiences`/`education`/`projects`/`skills` (set de companies,
  instituições e skills idêntico).
- [ ] `test_create_seeded_session` — `POST /chat/sessions/` com `from_version_id`
  cria sessão com `collected_data` povoado e `mode=topup`.
- [ ] `test_seeded_session_ownership` — `from_version_id` de outro usuário → 403/404.
- [ ] `test_interviewer_uses_topup_prompt` — sessão semeada usa o prompt top-up
  (assert no system prompt enviado ao LLM, via `FakeLLMClient`).
- [ ] `test_topup_preserves_and_augments` — partindo de uma versão com 2
  experiências, após um turno que adiciona 1 projeto, o `collected_data` mantém as
  2 experiências e ganha o projeto (sem perda).
- [ ] `make test-fast` verde.

### Frontend — automatizáveis

- [ ] `make frontend-typecheck` + `make frontend-lint` verdes.

### Verificáveis manualmente

- [ ] Em `/resumes`, "Criar a partir deste" abre o chat já reconhecendo os dados.
- [ ] O agente **não** repergunta nome/experiência/skills já conhecidos.
- [ ] Adicionar um projeto na conversa + finalizar gera um **novo** Resume com os
  dados originais **+** o projeto novo.
- [ ] As experiências/empresas do currículo original aparecem idênticas no novo
  (nada fabricado, nada perdido) — coerente com a tese de honestidade (ADR 0004).

## Verificação end-to-end

```bash
make migrate            # campo de modo na InterviewSession
make test-fast          # backend verde
# Smoke:
make dev
# - login (João Almeida tem currículo)
# - /resumes → "Criar a partir deste"
# - chat abre reconhecendo João; pedir "adiciona um projeto pessoal de API de pagamentos"
# - finalizar → novo Resume com experiências originais + projeto novo
```

## Riscos / armadilhas

- **Agente reentrevistar mesmo no modo top-up** — é o ponto sensível. Mitigação:
  prompt dedicado + fase inicial de complemento + teste que valida o prompt usado.
- **Drift de schema `structured_data` × `collected_data`** — se as formas
  divergirem (ex.: nomes de campos de data `start/end` vs outro), o adapter perde
  dados. Mitigação: adapter explícito + teste de igualdade de conjuntos.
- **Honestidade** — o writer NÃO deve "completar" o que o usuário não falou. O
  guardrail de não-fabricação (espírito do ADR 0004) vale: top-up só incorpora o
  que veio do currículo-fonte + o que o usuário disse.
- **Cross-domain no front** — botão em `resume` que cria sessão de `chat`: resolver
  via endpoint/wiring de app, nunca import cross-domain.
- **Perda silenciosa** — se o finalize partir de `collected_data` mal-semeado,
  gera currículo incompleto. Teste e2e cobre preservação.

## Subagentes recomendados pra delegação

| Trabalho | Subagente | Por quê |
|---|---|---|
| Prompt top-up + `RunInterviewerTurn` (seleção) + adapter | Orquestrador (você) | Prompt é decisão de produto; coordenação cross-app |
| Campo `mode` + migration na `InterviewSession` + API de criação semeada | `django-core` | Model/serializer/migration padrão |
| Frontend (CTA + hook + wiring) | `frontend-core` | Owner do `frontend/` |
| Tests (adapter, seeded session, prompt, e2e) | `qa-validation` | Owner; gate |

## Atualização do plano ao finalizar

Mesmo padrão das fases anteriores: status → `✅ Done`, `**Entregue em:**`, resumo
do real (com divergências), e atualizar o índice [`fases-implementacao.md`](../fases-implementacao.md).
