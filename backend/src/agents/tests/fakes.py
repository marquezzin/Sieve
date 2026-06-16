"""Fakes de teste pro use case do entrevistador — sem rede, sem pgvector.

`FakeLLMClient` implementa apenas o que `run_tool_use_loop` consome
(`messages_create`), devolvendo `LLMResponse` de uma fila e capturando o último
`system`/`messages`/`tools` pra asserts. `FakeKnowledgeLoader` devolve uma string
sentinela sem tocar DB/embeddings.
"""

from integrations.llm.base import LLMResponse


def usage(
    *,
    input_tokens=10,
    output_tokens=5,
    cache_read_input_tokens=8,
    cache_creation_input_tokens=0,
):
    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cache_read_input_tokens": cache_read_input_tokens,
        "cache_creation_input_tokens": cache_creation_input_tokens,
    }


def text_response(text, *, stop_reason="end_turn", usage_=None):
    return LLMResponse(
        stop_reason=stop_reason,
        content=[{"type": "text", "text": text}],
        usage=usage_ or usage(),
        model="fake-model",
    )


def tool_use_response(name, tool_input, *, tool_id="t1", usage_=None):
    return LLMResponse(
        stop_reason="tool_use",
        content=[{"type": "tool_use", "id": tool_id, "name": name, "input": tool_input}],
        usage=usage_ or usage(),
        model="fake-model",
    )


class FakeLLMClient:
    """Devolve `LLMResponse` canned de uma fila a cada `messages_create`.

    Captura o último `system`/`messages`/`tools`/`max_tokens` recebidos.
    """

    def __init__(self, responses):
        self._responses = list(responses)
        self.calls = []
        # Atalhos pro último call (asserts).
        self.last_system = None
        self.last_messages = None
        self.last_tools = None

    def messages_create(self, *, system, messages, tools=None, max_tokens=4096):
        self.calls.append(
            {
                "system": system,
                "messages": list(messages),
                "tools": tools,
                "max_tokens": max_tokens,
            }
        )
        self.last_system = system
        self.last_messages = list(messages)
        self.last_tools = tools
        if not self._responses:
            raise AssertionError("FakeLLMClient ficou sem respostas na fila")
        return self._responses.pop(0)


class FakeChunk:
    """Objeto mínimo de chunk de retrieval — só expõe `.content`."""

    def __init__(self, content: str):
        self.content = content


class FakeKnowledgeLoader:
    """`load_for_agent` retorna uma sentinela — sem DB/embeddings.

    `retrieve_chunks` registra cada chamada em `retrieve_calls` (pra asserts de
    retrieval) e devolve uma lista de objetos com `.content` (vazia por default,
    ou canned via `chunks`).
    """

    SENTINEL = "<<KB-INTERVIEWER>>"

    def __init__(self, payload=SENTINEL, chunks=None):
        self._payload = payload
        self._chunks = [FakeChunk(c) if isinstance(c, str) else c for c in (chunks or [])]
        self.calls = []
        self.retrieve_calls = []

    def load_for_agent(self, agent: str) -> str:
        self.calls.append(agent)
        return self._payload

    def retrieve_chunks(self, query, agents, k=5, min_similarity=None, filters=None):
        self.retrieve_calls.append(
            {
                "query": query,
                "agents": agents,
                "k": k,
                "min_similarity": min_similarity,
                "filters": filters,
            }
        )
        return list(self._chunks)
