"""Testes do loop de tool_use e da construção de kwargs.

Puros: usam um FakeLLMClient (não precisam do SDK anthropic) que devolve
LLMResponse canned de uma fila. Sem DB, sem rede.
"""

import pytest

from integrations.llm.anthropic_client import build_messages_kwargs
from integrations.llm.base import LLMError, LLMResponse
from integrations.llm.tool_use import run_tool_use_loop


def _usage(
    *,
    input_tokens=0,
    output_tokens=0,
    cache_read_input_tokens=0,
    cache_creation_input_tokens=0,
):
    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cache_read_input_tokens": cache_read_input_tokens,
        "cache_creation_input_tokens": cache_creation_input_tokens,
    }


class FakeLLMClient:
    """Devolve LLMResponse canned de uma fila a cada messages_create."""

    def __init__(self, responses):
        self._responses = list(responses)
        self.calls = []

    def messages_create(self, *, system, messages, tools=None, max_tokens=4096):
        # Snapshot do estado da conversa em cada chamada pra inspeção nos testes.
        self.calls.append(
            {
                "system": system,
                "messages": list(messages),
                "tools": tools,
                "max_tokens": max_tokens,
            }
        )
        if not self._responses:
            raise AssertionError("FakeLLMClient ficou sem respostas na fila")
        return self._responses.pop(0)


def _tool_use_response(*blocks, usage=None):
    return LLMResponse(
        stop_reason="tool_use",
        content=list(blocks),
        usage=usage or _usage(),
        model="fake-model",
    )


def _text_response(text, *, usage=None):
    return LLMResponse(
        stop_reason="end_turn",
        content=[{"type": "text", "text": text}],
        usage=usage or _usage(),
        model="fake-model",
    )


def test_multi_tool_in_single_turn():
    """2 rounds de tool_use (um deles com 2 tool_use no mesmo turn), depois text."""
    responses = [
        _tool_use_response(
            {"type": "tool_use", "id": "a1", "name": "search", "input": {"q": "x"}},
            {"type": "tool_use", "id": "a2", "name": "fetch", "input": {"url": "y"}},
        ),
        _tool_use_response(
            {"type": "tool_use", "id": "b1", "name": "search", "input": {"q": "z"}},
        ),
        _text_response("resposta final"),
    ]
    client = FakeLLMClient(responses)

    executed = []

    def executor(name, tool_input):
        executed.append((name, tool_input))
        return {"ok": True, "name": name}

    result = run_tool_use_loop(
        client=client,
        system="sys",
        messages=[{"role": "user", "content": "oi"}],
        tools=[{"name": "search"}, {"name": "fetch"}],
        tool_executor=executor,
    )

    # 3 tool_use blocks no total (2 + 1).
    assert len(executed) == 3
    assert executed[0] == ("search", {"q": "x"})
    assert executed[1] == ("fetch", {"url": "y"})
    assert executed[2] == ("search", {"q": "z"})

    assert result.rounds == 2
    assert result.final_text == "resposta final"

    # messages: user inicial + assistant(t1) + user(tool_result t1) +
    #           assistant(t2) + user(tool_result t2) + assistant(final)
    assert len(result.messages) == 6
    tool_result_msgs = [
        m
        for m in result.messages
        if m["role"] == "user"
        and isinstance(m["content"], list)
        and m["content"]
        and m["content"][0].get("type") == "tool_result"
    ]
    assert len(tool_result_msgs) == 2
    first_results = tool_result_msgs[0]["content"]
    assert len(first_results) == 2
    assert first_results[0]["tool_use_id"] == "a1"
    assert first_results[1]["tool_use_id"] == "a2"
    assert "is_error" not in first_results[0]


def test_loop_terminates_on_text_response():
    """Fake retorna direto text: rounds == 0 e final_text correto."""
    client = FakeLLMClient([_text_response("direto")])

    def executor(name, tool_input):  # pragma: no cover — não deve ser chamado
        raise AssertionError("tool_executor não deveria ser chamado")

    result = run_tool_use_loop(
        client=client,
        system="sys",
        messages=[{"role": "user", "content": "oi"}],
        tools=[],
        tool_executor=executor,
    )

    assert result.rounds == 0
    assert result.final_text == "direto"
    # user inicial + assistant(final)
    assert len(result.messages) == 2
    assert result.messages[-1]["role"] == "assistant"


def test_cache_control_injected():
    """build_messages_kwargs envolve system com cache_control ephemeral."""
    kwargs = build_messages_kwargs(
        model="m",
        system="meu system",
        messages=[{"role": "user", "content": "oi"}],
        tools=None,
        max_tokens=100,
        cache_system=True,
    )
    assert kwargs["system"] == [
        {
            "type": "text",
            "text": "meu system",
            "cache_control": {"type": "ephemeral"},
        }
    ]
    # tools=None não entra no kwargs.
    assert "tools" not in kwargs

    plain = build_messages_kwargs(
        model="m",
        system="meu system",
        messages=[],
        tools=[{"name": "t"}],
        max_tokens=100,
        cache_system=False,
    )
    assert plain["system"] == "meu system"
    assert plain["tools"] == [{"name": "t"}]


def test_max_rounds_cap_raises():
    """Fake sempre retorna tool_use: estoura max_rounds e levanta LLMError."""

    def always_tool():
        while True:
            yield _tool_use_response(
                {"type": "tool_use", "id": "x", "name": "loop", "input": {}},
            )

    gen = always_tool()

    class InfiniteClient:
        calls = 0

        def messages_create(self, *, system, messages, tools=None, max_tokens=4096):
            InfiniteClient.calls += 1
            return next(gen)

    with pytest.raises(LLMError):
        run_tool_use_loop(
            client=InfiniteClient(),
            system="sys",
            messages=[{"role": "user", "content": "oi"}],
            tools=[{"name": "loop"}],
            tool_executor=lambda name, ti: "ok",
            max_rounds=3,
        )


def test_tool_executor_error_becomes_tool_result():
    """tool_executor que levanta vira tool_result is_error e o loop continua."""
    responses = [
        _tool_use_response(
            {"type": "tool_use", "id": "e1", "name": "boom", "input": {}},
        ),
        _text_response("recuperou"),
    ]
    client = FakeLLMClient(responses)

    def executor(name, tool_input):
        raise ValueError("explodiu")

    result = run_tool_use_loop(
        client=client,
        system="sys",
        messages=[{"role": "user", "content": "oi"}],
        tools=[{"name": "boom"}],
        tool_executor=executor,
    )

    assert result.rounds == 1
    assert result.final_text == "recuperou"

    tool_result_msg = result.messages[2]
    assert tool_result_msg["role"] == "user"
    block = tool_result_msg["content"][0]
    assert block["type"] == "tool_result"
    assert block["tool_use_id"] == "e1"
    assert block["is_error"] is True
    assert "explodiu" in block["content"]


def test_usage_accumulated():
    """usage é somado em todos os rounds, incluindo cache_read_input_tokens."""
    responses = [
        _tool_use_response(
            {"type": "tool_use", "id": "u1", "name": "t", "input": {}},
            usage=_usage(
                input_tokens=10,
                output_tokens=5,
                cache_read_input_tokens=2,
                cache_creation_input_tokens=1,
            ),
        ),
        _text_response(
            "fim",
            usage=_usage(
                input_tokens=20,
                output_tokens=7,
                cache_read_input_tokens=3,
                cache_creation_input_tokens=0,
            ),
        ),
    ]
    client = FakeLLMClient(responses)

    result = run_tool_use_loop(
        client=client,
        system="sys",
        messages=[{"role": "user", "content": "oi"}],
        tools=[{"name": "t"}],
        tool_executor=lambda name, ti: "ok",
    )

    assert result.usage == {
        "input_tokens": 30,
        "output_tokens": 12,
        "cache_read_input_tokens": 5,
        "cache_creation_input_tokens": 1,
    }
