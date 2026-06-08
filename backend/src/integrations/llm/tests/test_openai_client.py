"""Testes do adapter OpenAI ↔ formato canônico Anthropic.

Puros: exercitam as funções de tradução (`to_openai_messages`,
`to_openai_tools`, `from_openai_response`), que NÃO importam o SDK `openai`. O
round-trip do loop usa um fake SDK client injetável (`_sdk_client=`), sem
precisar da lib instalada.
"""

import json
from types import SimpleNamespace

from integrations.llm.base import LLMResponse
from integrations.llm.openai_client import (
    OpenAIClient,
    from_openai_response,
    to_openai_messages,
    to_openai_tools,
)
from integrations.llm.tool_use import run_tool_use_loop

# ---------------------------------------------------------------------------
# to_openai_messages
# ---------------------------------------------------------------------------


def test_to_openai_messages_system_and_user_string():
    out = to_openai_messages("sou o system", [{"role": "user", "content": "oi"}])

    assert out[0] == {"role": "system", "content": "sou o system"}
    assert out[1] == {"role": "user", "content": "oi"}


def test_to_openai_messages_empty_system_omitted():
    out = to_openai_messages("", [{"role": "user", "content": "oi"}])

    assert out == [{"role": "user", "content": "oi"}]


def test_to_openai_messages_user_text_blocks_joined():
    out = to_openai_messages(
        "",
        [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "parte 1 "},
                    {"type": "text", "text": "parte 2"},
                ],
            }
        ],
    )

    assert out == [{"role": "user", "content": "parte 1 parte 2"}]


def test_to_openai_messages_tool_result_becomes_role_tool():
    out = to_openai_messages(
        "",
        [
            {
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": "call_1",
                        "content": "resultado da tool",
                    }
                ],
            }
        ],
    )

    assert out == [
        {
            "role": "tool",
            "tool_call_id": "call_1",
            "content": "resultado da tool",
        }
    ]


def test_to_openai_messages_multiple_tool_results_split():
    out = to_openai_messages(
        "",
        [
            {
                "role": "user",
                "content": [
                    {"type": "tool_result", "tool_use_id": "c1", "content": "a"},
                    {"type": "tool_result", "tool_use_id": "c2", "content": "b"},
                ],
            }
        ],
    )

    assert len(out) == 2
    assert out[0] == {"role": "tool", "tool_call_id": "c1", "content": "a"}
    assert out[1] == {"role": "tool", "tool_call_id": "c2", "content": "b"}


def test_to_openai_messages_assistant_tool_use_becomes_tool_calls():
    out = to_openai_messages(
        "",
        [
            {
                "role": "assistant",
                "content": [
                    {"type": "text", "text": "vou buscar"},
                    {
                        "type": "tool_use",
                        "id": "call_9",
                        "name": "search",
                        "input": {"q": "django"},
                    },
                ],
            }
        ],
    )

    msg = out[0]
    assert msg["role"] == "assistant"
    assert msg["content"] == "vou buscar"
    assert len(msg["tool_calls"]) == 1
    tc = msg["tool_calls"][0]
    assert tc["id"] == "call_9"
    assert tc["type"] == "function"
    assert tc["function"]["name"] == "search"
    # arguments é JSON string, não dict.
    assert json.loads(tc["function"]["arguments"]) == {"q": "django"}


def test_to_openai_messages_assistant_text_only_no_tool_calls_key():
    out = to_openai_messages(
        "",
        [{"role": "assistant", "content": [{"type": "text", "text": "só texto"}]}],
    )

    assert out[0] == {"role": "assistant", "content": "só texto"}
    assert "tool_calls" not in out[0]


# ---------------------------------------------------------------------------
# to_openai_tools
# ---------------------------------------------------------------------------


def test_to_openai_tools_translates_schema():
    anthropic_tools = [
        {
            "name": "search",
            "description": "Busca na web",
            "input_schema": {
                "type": "object",
                "properties": {"q": {"type": "string"}},
                "required": ["q"],
            },
        }
    ]

    out = to_openai_tools(anthropic_tools)

    assert out == [
        {
            "type": "function",
            "function": {
                "name": "search",
                "description": "Busca na web",
                "parameters": {
                    "type": "object",
                    "properties": {"q": {"type": "string"}},
                    "required": ["q"],
                },
            },
        }
    ]


def test_to_openai_tools_none_passthrough():
    assert to_openai_tools(None) is None


# ---------------------------------------------------------------------------
# from_openai_response
# ---------------------------------------------------------------------------


def _fake_usage(*, prompt=0, completion=0, cached=None):
    details = SimpleNamespace(cached_tokens=cached) if cached is not None else None
    return SimpleNamespace(
        prompt_tokens=prompt,
        completion_tokens=completion,
        prompt_tokens_details=details,
    )


def _fake_openai_response(*, finish_reason, content=None, tool_calls=None, usage=None,
                          model="gpt-4o-mini"):
    message = SimpleNamespace(content=content, tool_calls=tool_calls)
    choice = SimpleNamespace(finish_reason=finish_reason, message=message)
    return SimpleNamespace(choices=[choice], usage=usage, model=model)


def test_from_openai_response_text_end_turn():
    resp = _fake_openai_response(
        finish_reason="stop",
        content="resposta final",
        usage=_fake_usage(prompt=10, completion=5),
    )

    result = from_openai_response(resp)

    assert isinstance(result, LLMResponse)
    assert result.stop_reason == "end_turn"
    assert result.content == [{"type": "text", "text": "resposta final"}]
    assert result.model == "gpt-4o-mini"
    assert result.usage["input_tokens"] == 10
    assert result.usage["output_tokens"] == 5
    assert result.usage["cache_read_input_tokens"] == 0
    assert result.usage["cache_creation_input_tokens"] == 0


def test_from_openai_response_tool_calls():
    tc = SimpleNamespace(
        id="call_abc",
        function=SimpleNamespace(name="fetch", arguments='{"url": "http://x"}'),
    )
    resp = _fake_openai_response(
        finish_reason="tool_calls",
        content=None,
        tool_calls=[tc],
        usage=_fake_usage(prompt=8, completion=3),
    )

    result = from_openai_response(resp)

    assert result.stop_reason == "tool_use"
    assert result.content == [
        {
            "type": "tool_use",
            "id": "call_abc",
            "name": "fetch",
            "input": {"url": "http://x"},  # desserializado
        }
    ]


def test_from_openai_response_text_then_tool_use_order():
    tc = SimpleNamespace(
        id="call_1",
        function=SimpleNamespace(name="t", arguments="{}"),
    )
    resp = _fake_openai_response(
        finish_reason="tool_calls",
        content="vou usar a tool",
        tool_calls=[tc],
    )

    result = from_openai_response(resp)

    assert result.content[0]["type"] == "text"
    assert result.content[1]["type"] == "tool_use"


def test_from_openai_response_cached_tokens_mapped():
    resp = _fake_openai_response(
        finish_reason="stop",
        content="x",
        usage=_fake_usage(prompt=100, completion=10, cached=40),
    )

    result = from_openai_response(resp)

    assert result.usage["cache_read_input_tokens"] == 40
    assert result.usage["cache_creation_input_tokens"] == 0


def test_from_openai_response_length_maps_to_max_tokens():
    resp = _fake_openai_response(finish_reason="length", content="cortado")

    assert from_openai_response(resp).stop_reason == "max_tokens"


def test_from_openai_response_unknown_finish_reason_passthrough():
    resp = _fake_openai_response(finish_reason="content_filter", content="x")

    assert from_openai_response(resp).stop_reason == "content_filter"


def test_from_openai_response_bad_arguments_fallback_empty_dict():
    tc = SimpleNamespace(
        id="call_x",
        function=SimpleNamespace(name="t", arguments="not json"),
    )
    resp = _fake_openai_response(
        finish_reason="tool_calls", content=None, tool_calls=[tc]
    )

    result = from_openai_response(resp)

    assert result.content[0]["input"] == {}


# ---------------------------------------------------------------------------
# OpenAIClient com SDK fake injetado + round-trip pelo loop
# ---------------------------------------------------------------------------


class _FakeCompletions:
    def __init__(self, responses):
        self._responses = list(responses)
        self.calls = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        return self._responses.pop(0)


class _FakeSDKClient:
    """Imita o shape `client.chat.completions.create(...)` do SDK openai."""

    def __init__(self, responses):
        self.chat = SimpleNamespace(completions=_FakeCompletions(responses))


def test_messages_create_with_injected_sdk_client():
    sdk = _FakeSDKClient(
        [
            _fake_openai_response(
                finish_reason="stop",
                content="oi de volta",
                usage=_fake_usage(prompt=5, completion=2),
                model="gpt-4o-mini",
            )
        ]
    )
    client = OpenAIClient(_sdk_client=sdk, model="gpt-4o-mini")

    result = client.messages_create(
        system="sys",
        messages=[{"role": "user", "content": "oi"}],
        tools=[
            {"name": "t", "description": "d", "input_schema": {"type": "object"}}
        ],
        max_tokens=128,
    )

    assert result.stop_reason == "end_turn"
    assert result.content == [{"type": "text", "text": "oi de volta"}]

    sent = sdk.chat.completions.calls[0]
    assert sent["model"] == "gpt-4o-mini"
    assert sent["max_tokens"] == 128
    assert sent["messages"][0] == {"role": "system", "content": "sys"}
    assert sent["tools"][0]["type"] == "function"


def test_round_trip_tool_use_loop_with_fake_openai_client():
    """O loop agnóstico funciona igual com o OpenAIClient (SDK fake)."""
    tc = SimpleNamespace(
        id="call_1",
        function=SimpleNamespace(name="search", arguments='{"q": "x"}'),
    )
    sdk = _FakeSDKClient(
        [
            # round 1: pede tool
            _fake_openai_response(
                finish_reason="tool_calls",
                content=None,
                tool_calls=[tc],
                usage=_fake_usage(prompt=10, completion=4, cached=2),
            ),
            # round 2: resposta final em texto
            _fake_openai_response(
                finish_reason="stop",
                content="achei: resultado",
                usage=_fake_usage(prompt=20, completion=6),
            ),
        ]
    )
    client = OpenAIClient(_sdk_client=sdk, model="gpt-4o-mini")

    executed = []

    def executor(name, tool_input):
        executed.append((name, tool_input))
        return {"hits": 1}

    result = run_tool_use_loop(
        client=client,
        system="sys",
        messages=[{"role": "user", "content": "busca x"}],
        tools=[
            {"name": "search", "description": "busca", "input_schema": {}}
        ],
        tool_executor=executor,
    )

    assert executed == [("search", {"q": "x"})]
    assert result.rounds == 1
    assert result.final_text == "achei: resultado"
    # usage acumulado dos 2 rounds (incl cached → cache_read).
    assert result.usage["input_tokens"] == 30
    assert result.usage["output_tokens"] == 10
    assert result.usage["cache_read_input_tokens"] == 2

    # A 2ª chamada ao SDK recebeu o tool_result traduzido pra role="tool".
    second_call_messages = sdk.chat.completions.calls[1]["messages"]
    tool_msgs = [m for m in second_call_messages if m["role"] == "tool"]
    assert len(tool_msgs) == 1
    assert tool_msgs[0]["tool_call_id"] == "call_1"
    assert json.loads(tool_msgs[0]["content"]) == {"hits": 1}
