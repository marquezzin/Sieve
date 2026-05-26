## Resumo

<!-- 1-3 linhas: o quê e por quê. Diff mostra o como. -->

## Tipo

<!-- Marque o que se aplica. -->

- [ ] feat — nova funcionalidade
- [ ] fix — bug fix
- [ ] refactor — sem mudança de comportamento
- [ ] perf — performance
- [ ] docs — só documentação
- [ ] test — só testes
- [ ] chore — deps, config, build
- [ ] ci — pipeline

## Checklist

- [ ] **Tests** passam localmente (`make test-fast`).
- [ ] **Lint** passa (`make lint` + `make frontend-lint` quando aplicável).
- [ ] **Typecheck** passa quando frontend mudou (`make frontend-typecheck`).
- [ ] **CLAUDE.md** atualizado se mudou padrão, layout ou contrato de algum nível.
- [ ] **Migrations** geradas via `make migrations` (não editadas à mão) quando model mudou.
- [ ] **`.env.example`** atualizado se var de ambiente nova foi introduzida.
- [ ] **ADR** criado em `docs/decisions/` se a mudança é decisão arquitetural durável (novo padrão, biblioteca core, deprecation).
- [ ] **Subagente** apropriado consultado/atualizado se a mudança redefine domínio dele em `.claude/agents/`.
- [ ] **Stop list** revisada — nada quebrou regra dura do `backend/CLAUDE.md` ou `frontend/CLAUDE.md`.
- [ ] **Conventional Commits** nos commits desta PR (`feat:`, `fix:`, `chore:`, etc).

## Como testar

<!-- Passos pra reviewer reproduzir. Inclua URLs, comandos curl, queries SQL relevantes. -->

```bash
# exemplo:
make build && make up && make migrate
curl http://localhost:8000/api/v1/<endpoint>/
```

## Risco / blast radius

<!-- O que pode quebrar? Migration destrutiva? Mudança de API consumida por terceiros? Performance? -->

- [ ] Sem risco — mudança isolada, com tests.
- [ ] Risco médio — mudança em camada compartilhada (`core/`, `integrations/`, atomic). Listar:
- [ ] Risco alto — migration irreversível, mudança de contrato, deprecation. Listar:

## Screenshots / output (quando UI ou response shape mudou)

<!-- Cole imagens ou JSON antes/depois. -->

## Decisões registradas

<!-- Decisões não-óbvias tomadas durante o PR que merecem registro pro futuro. Linka pra ADR se houver. -->
