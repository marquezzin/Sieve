"""Use case `RunInterviewerTurn` com DI — sem chamada real de LLM.

Injeta `FakeLLMClient` (fila de `LLMResponse`) e `FakeKnowledgeLoader` (string
sentinela). Cobre: KB no system prompt, tools `record_experience` /
`mark_phase_complete` / `request_clarification`, término por texto e auditoria
`AgentRun`.
"""

import pytest

from agents.models import AgentRun
from agents.tests.fakes import (
    FakeKnowledgeLoader,
    FakeLLMClient,
    text_response,
    tool_use_response,
)
from agents.use_cases.run_interviewer_turn import RunInterviewerTurn
from chat.models import ChatMessage
from chat.tests.factories import InterviewSessionFactory


def _make_use_case(responses, knowledge=None):
    return RunInterviewerTurn(
        llm_client=FakeLLMClient(responses),
        knowledge_loader=knowledge or FakeKnowledgeLoader(),
    )


@pytest.mark.django_db
def test_first_turn_includes_kb_in_system_prompt():
    session = InterviewSessionFactory()
    fake = FakeLLMClient([text_response("Olá, vamos começar!")])
    use_case = RunInterviewerTurn(llm_client=fake, knowledge_loader=FakeKnowledgeLoader())

    use_case.execute(session=session, user_text=None)

    assert FakeKnowledgeLoader.SENTINEL in fake.last_system


@pytest.mark.django_db
def test_tool_use_record_experience_updates_session():
    session = InterviewSessionFactory()
    experience = {"company": "Acme", "role": "Dev"}
    use_case = _make_use_case(
        [
            tool_use_response("record_experience", experience),
            text_response("Anotado, obrigado!"),
        ]
    )

    use_case.execute(session=session, user_text="trabalhei na Acme como dev")

    session.refresh_from_db()
    experiences = session.collected_data["experiences"]
    assert len(experiences) == 1
    assert experiences[0] == experience


@pytest.mark.django_db
def test_mark_phase_complete_advances_phase():
    session = InterviewSessionFactory(current_phase="personal_info")
    use_case = _make_use_case(
        [
            tool_use_response("mark_phase_complete", {"next_phase": "experience"}),
            text_response("Vamos falar de experiência."),
        ]
    )

    use_case.execute(session=session, user_text="pronto")

    session.refresh_from_db()
    assert session.current_phase == "experience"


@pytest.mark.django_db
def test_tool_use_loop_terminates_on_text_response():
    session = InterviewSessionFactory()
    use_case = RunInterviewerTurn(
        llm_client=FakeLLMClient([text_response("Resposta direta.")]),
        knowledge_loader=FakeKnowledgeLoader(),
    )

    assistant_msg = use_case.execute(session=session, user_text="oi")

    assert assistant_msg.role == ChatMessage.Role.ASSISTANT
    assert assistant_msg.is_visible is True
    assert assistant_msg.text == "Resposta direta."


@pytest.mark.django_db
def test_persists_agent_run():
    session = InterviewSessionFactory()
    use_case = _make_use_case([text_response("ok")])

    use_case.execute(session=session, user_text="oi")

    run = AgentRun.objects.get(session=session)
    assert run.agent_name == "interviewer"
    assert run.status == AgentRun.Status.SUCCESS
    assert run.usage.get("input_tokens", 0) > 0


@pytest.mark.django_db
def test_request_clarification_tool():
    session = InterviewSessionFactory()
    question = "Qual a métrica?"
    use_case = _make_use_case(
        [
            tool_use_response("request_clarification", {"question": question}),
            text_response(""),
        ]
    )

    use_case.execute(session=session, user_text="melhorei o sistema")

    clarifications = session.messages.filter(role=ChatMessage.Role.ASSISTANT, is_visible=True)
    assert any(m.text == question for m in clarifications)
