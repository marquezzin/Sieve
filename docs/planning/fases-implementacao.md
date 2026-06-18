# Fases de implementação — Sieve

Índice de navegação. Cada fase é um arquivo auto-contido em [`fases/`](fases/) com spec completo: outcome, escopo, critérios de aceite testáveis, verificação end-to-end, subagentes recomendados, riscos.

## Workflow

Quando o usuário disser **"faça a próxima fase de implementação"**:

1. Abrir este arquivo, identificar a primeira fase com status `🔲 Pendente` na tabela abaixo.
2. Abrir o arquivo correspondente em `fases/`.
3. Reler obrigatoriamente:
   - [`CLAUDE.md`](../../CLAUDE.md) raiz — overview e navegação de subagentes
   - [`backend/CLAUDE.md`](../../backend/CLAUDE.md) — convenções Django/DRF/Celery duras
   - [`frontend/CLAUDE.md`](../../frontend/CLAUDE.md) — atomic design, domains, Mantine, **fidelidade ao protótipo**
   - [`prototipo/src/`](../../prototipo/) — **protótipo de alta fidelidade**: abrir a(s) tela(s) da fase e portar fielmente para Mantine (ver "Fidelidade ao protótipo" no `frontend/CLAUDE.md`)
   - [`docs/conceitos-fundamentais.md`](../conceitos-fundamentais.md) — embeddings, pgvector, knowledge base
   - [`docs/decisions/`](../decisions/) — ADRs ativos (0001 stack, 0002 multi-agente sem framework, 0003 knowledge base)
4. Executar a fase seguindo o spec — usar `TodoWrite` pra rastreio, delegar pros subagentes especialistas indicados.
5. Validar contra **todos** os critérios de aceite listados.
6. Rodar a verificação end-to-end e confirmar que passa.
7. Atualizar a fase: status → `✅ Done`, adicionar campo `**Entregue em:** YYYY-MM-DD`, resumir o que ficou pronto (pode divergir do planejado — registrar o real), documentar decisões que divergiram do default.
8. Atualizar este índice (status na tabela).

## Convenções globais

- **Fidelidade ao protótipo** — toda tela nova é um **porte fiel** da tela equivalente em [`prototipo/src/`](../../prototipo/) para Mantine v9 (layout, hierarquia, espaçamento, tipografia, estados). A IDV já está no tema (`frontend/src/main.tsx`). Construção inicial obedece o protótipo; refatoração vem depois, deliberada. Parte de tela que pertence a fase futura → placeholder inerte marcado "Em breve · Fase N". Detalhes: "Fidelidade ao protótipo" em `frontend/CLAUDE.md`.
- **Subagentes especialistas** — delegar trabalho que cai claramente num domínio. Os agentes recomendados estão na seção "Subagentes" de cada fase. Lista completa: `.claude/agents/`.
- **`make test-fast` é gate obrigatório** — toda fase termina verde.
- **Conventional Commits** — `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `perf:`, `chore:`, `ci:`.
- **ADR novo** quando a fase introduzir padrão durável (lib core nova, mudança de contrato, deprecation). Template em `docs/decisions/TEMPLATE.md`.
- **CLAUDE.md em todo app novo** — contrato de responsabilidade, regras, exemplos de uso.

## Tabela de fases

| # | Tema | Status | Arquivo |
|---|---|---|---|
| 0 | Fundação: knowledge base + pgvector + embeddings | ✅ Done | [fase-0-fundacao.md](fases/fase-0-fundacao.md) |
| 1 | Accounts + Chat conversacional + agente entrevistador (MVP draft) | ✅ Done | [fase-1-accounts-chat-entrevistador.md](fases/fase-1-accounts-chat-entrevistador.md) |
| 2 | Pipeline multi-agente (writer/reviewer/judge) + Resume/versões + PDF | ✅ Done | [fase-2-pipeline-multiagente-pdf.md](fases/fase-2-pipeline-multiagente-pdf.md) |
| 3 | Matching semântico + recomendações honestas + Kanban de candidaturas | ✅ Done | [fase-3-matching-ats-kanban.md](fases/fase-3-matching-ats-kanban.md) |
| 4 | Foto profissional + polimento UI + relatório acadêmico + apresentação | 🔲 Pendente | [fase-4-foto-polish-relatorio.md](fases/fase-4-foto-polish-relatorio.md) |

## Adicionar fase nova

Se aparecer escopo não previsto:
1. Criar `fases/fase-N-tema.md` seguindo o template visual das fases existentes (Contexto → Outcome → Escopo → Pré-requisitos → Decisões → Arquivos → Reuso → Critérios de aceite → Verificação → Riscos → Subagentes).
2. Inserir linha na tabela acima na posição correta.
3. Atualizar pré-requisitos de fases posteriores se necessário.
