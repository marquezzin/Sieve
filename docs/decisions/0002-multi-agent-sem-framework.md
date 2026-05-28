# ADR 0002 — Multi-agente sem framework de orquestração

**Status:** Accepted
**Data:** 2026-05-27
**Decisores:** Time Sieve

## Contexto

O Sieve é um sistema multi-agente: entrevistador (coleta dados via conversa), redator (gera currículo), revisor (critica e melhora), juiz (avalia via rubrica), ATS optimizer (reescreve pra vaga específica). Cada agente tem persona, prompt e modelo próprio, e o fluxo entre eles é principalmente sequencial (entrevista → redação → revisão → avaliação).

A primeira tentação foi adotar um framework de orquestração de agentes (LangGraph, CrewAI, AutoGen) — esses frameworks oferecem grafos de estado, checkpointing, streaming, tool-use abstraído. O time avaliou se valeria a pena dada a janela curta de 4 semanas e o escopo acadêmico do projeto.

## Decisão

**Não usamos framework de orquestração.** Cada agente é um **use case dedicado** em `backend/src/agents/use_cases/` que:

1. Recebe input estruturado via `__init__` (LLM client, knowledge loader — injetados pra testabilidade).
2. Monta o system prompt assemblando knowledge base + persona base.
3. Chama a API do Anthropic SDK diretamente (`client.messages.create(...)`) com `tools=[...]` quando precisa de function calling.
4. Implementa o loop de `tool_use` em Python puro (`while response.stop_reason == "tool_use"`).
5. Persiste resultado em models do Django (`AgentRun`, `ResumeVersion`, etc).

A orquestração entre agentes é uma **Celery chain**:
```python
generate_resume_pipeline = chain(
    run_writer.s(session_id),
    run_reviewer.s(),
    run_judge.s(),
)
```

### Alternativas consideradas

- **LangGraph** — descartada porque o fluxo é quase linear (não há grafo dinâmico), e o framework adiciona dependência pesada do ecossistema LangChain (com seus próprios bugs e breaking changes), camada de abstração que esconde o prompt cru (dificulta debug) e DSL nova para aprender. Tempo perdido > benefício pra este escopo.
- **CrewAI** — descartada pelos mesmos motivos do LangGraph, mais o fato de a abstração de "crews" e "tasks" não casar bem com a separação por use case do padrão Synapta.
- **AutoGen** — descartada porque foca em agentes que conversam entre si, e o que precisamos é pipeline determinístico.

## Consequências

### Positivas

- **Transparência total do prompt.** Logamos a string exata enviada pra API, facilitando debug e iteração.
- **Testabilidade clara.** Cada use case é testado com `Fake LLMClient` injetado via `__init__` — sem mock de framework.
- **Sem deps extras.** Anthropic SDK puro + httpx + Celery (que já temos).
- **Padrão Synapta intacto.** Use case dedicado é a unidade de trabalho do template; novos devs reconhecem o shape.
- **Tool use nativo da API.** A inteligência de escolher tool mora no LLM, não no framework. Qualidade depende de: descrição da tool + system prompt + modelo capaz.

### Negativas

- **Streaming token-a-token** custa mais código se quisermos (SSE direto do SDK, ~30 linhas extras).
- **Loops complexos de auto-crítica iterativa** (revisor → redator → revisor → ... até score X) requerem código manual. Aceitável: se aparecer, viramos pra LangGraph nesse use case específico.
- **Checkpointing avançado** (pausar pipeline dias, retomar com input externo) precisa ser feito à mão. Não temos esse caso de uso.

### Neutras

- Time precisa entender bem a API do Anthropic SDK (tool use, cache_control, messages format). É conhecimento "permanente" — útil além deste projeto.

## Sinais de fracasso

- Use cases dos agentes começam a duplicar lógica de loop de tool_use em ≥3 lugares (extrair pra helper interno antes de cogitar framework).
- Aparece necessidade de fluxo com ≥3 branches dinâmicos não-determinísticos por execução.
- Pipeline cresce além de 5 agentes sequenciais e o `chain` Celery fica frágil.

## Referências

- [`docs/conceitos-fundamentais.md`](../conceitos-fundamentais.md) — seção sobre tool use nativo
- [Anthropic API — Tool use](https://docs.claude.com/en/docs/build-with-claude/tool-use)
- [ADR 0001](0001-stack-padrao.md) — stack padrão Synapta
