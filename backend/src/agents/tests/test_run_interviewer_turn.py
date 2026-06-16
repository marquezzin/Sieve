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
from core.errors import ApplicationError
from integrations.llm.base import LLMError


class _FailingLLMClient:
    """messages_create sempre estoura LLMError — simula falha no meio do turno."""

    def messages_create(self, *, system, messages, tools=None, max_tokens=4096):
        raise LLMError("boom")


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
def test_build_system_includes_current_date():
    from django.utils import timezone

    session = InterviewSessionFactory()
    fake = FakeLLMClient([text_response("Olá!")])
    RunInterviewerTurn(llm_client=fake, knowledge_loader=FakeKnowledgeLoader()).execute(
        session=session, user_text=None
    )

    today = timezone.localdate().strftime("%d/%m/%Y")
    assert today in fake.last_system


@pytest.mark.django_db
def test_record_education_dedups_duplicate_call():
    session = InterviewSessionFactory()
    edu = {
        "institution": "Uniceub",
        "course": "Ciência da Computação",
        "status": "in_progress",
    }
    # Modelo chama a MESMA tool duas vezes no mesmo turn.
    use_case = _make_use_case(
        [
            tool_use_response("record_education", edu, tool_id="e1"),
            tool_use_response("record_education", edu, tool_id="e2"),
            text_response("Anotado!"),
        ]
    )

    use_case.execute(session=session, user_text="estudo na Uniceub")

    session.refresh_from_db()
    # Upsert por (institution, course) → uma única entrada, sem duplicata.
    assert len(session.collected_data["education"]) == 1
    assert session.collected_data["education"][0]["institution"] == "Uniceub"


@pytest.mark.django_db
def test_record_personal_info_syncs_candidate_profile():
    session = InterviewSessionFactory()
    personal_info = {
        "name": "Marina Costa",
        "email": "marina@nova.com",
        "location": "São Paulo, SP",
        "phone": "(11) 98888-0000",
        "linkedin_url": "linkedin.com/in/marinacosta",
        "github_url": "github.com/marinacosta",
    }
    use_case = _make_use_case(
        [
            tool_use_response("record_personal_info", personal_info),
            text_response("Anotado!"),
        ]
    )

    use_case.execute(session=session, user_text="sou a Marina, de SP")

    profile = session.user.candidate_profile
    profile.refresh_from_db()
    assert profile.location == "São Paulo, SP"
    assert profile.phone == "(11) 98888-0000"
    assert profile.linkedin_url == "linkedin.com/in/marinacosta"
    assert profile.github_url == "github.com/marinacosta"

    # `name` cai no User (first/last); `email` NUNCA é sincronizado.
    user = session.user
    user.refresh_from_db()
    assert user.first_name == "Marina"
    assert user.last_name == "Costa"
    assert user.email != "marina@nova.com"  # não foi tocado pela entrevista

    # collected_data continua sendo o sink completo (inclui name + email).
    assert session.collected_data["personal_info"]["name"] == "Marina Costa"


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
def test_phase_reconciled_from_data_when_mark_phase_skipped():
    # O LLM grava skills mas ESQUECE de chamar mark_phase_complete (o bug do Thales).
    # A reconciliação pelo dado avança a fase mesmo assim — destrava o botão Finalizar.
    session = InterviewSessionFactory(current_phase="education")
    use_case = _make_use_case(
        [
            tool_use_response("record_skills", {"skills": ["Python", "SQL"]}),
            text_response("Skills anotadas!"),  # nenhuma chamada de mark_phase_complete
        ]
    )

    use_case.execute(session=session, user_text="uso Python e SQL")

    session.refresh_from_db()
    assert session.current_phase == "skills"


@pytest.mark.django_db
def test_phase_floor_never_regresses():
    # Fase já em `experience`; o turno só grava personal_info (piso = personal_info,
    # índice menor). A reconciliação nunca regride a fase.
    session = InterviewSessionFactory(current_phase="experience")
    use_case = _make_use_case(
        [
            tool_use_response(
                "record_personal_info",
                {"name": "Ana", "email": "a@x.com", "phone": "1", "location": "SP"},
            ),
            text_response("Ok!"),
        ]
    )

    use_case.execute(session=session, user_text="sou a Ana")

    session.refresh_from_db()
    assert session.current_phase == "experience"


@pytest.mark.django_db
def test_state_note_injected_in_system_prompt():
    session = InterviewSessionFactory()
    fake = FakeLLMClient([text_response("Olá!")])
    RunInterviewerTurn(llm_client=fake, knowledge_loader=FakeKnowledgeLoader()).execute(
        session=session, user_text=None
    )

    assert "ESTADO ATUAL DA ENTREVISTA" in fake.last_system
    assert "Fase atual no sistema" in fake.last_system
    # Checklist das seções presente (estado inicial: tudo por coletar).
    assert "Dados pessoais" in fake.last_system
    assert "Projetos" in fake.last_system


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
def test_failed_turn_is_atomic():
    session = InterviewSessionFactory()
    use_case = RunInterviewerTurn(
        llm_client=_FailingLLMClient(),
        knowledge_loader=FakeKnowledgeLoader(),
    )

    with pytest.raises(ApplicationError):
        use_case.execute(session=session, user_text="oi")

    # Rollback: a mensagem do usuário não pode ter sobrado (sem bolha pendurada).
    assert session.messages.count() == 0
    # Mas a auditoria de erro foi gravada (fora da transação).
    run = AgentRun.objects.get(session=session)
    assert run.status == AgentRun.Status.ERROR
    assert "boom" in run.error


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
