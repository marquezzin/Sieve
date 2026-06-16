"""Use case `RunWriter` com DI — collected_data → ResumeVersion v1.

Injeta `FakeLLMClient` (fila com tool_use `submit_resume` + texto) e
`FakeKnowledgeLoader`. Cobre: consumo do collected_data, criação da v1,
KB no system prompt e retrieval de exemplos por target_role.
"""

import json

import pytest

from agents.tests.fakes import FakeKnowledgeLoader, FakeLLMClient, text_response, tool_use_response
from agents.use_cases.run_writer import RunWriter
from chat.tests.factories import InterviewSessionFactory
from resumes.models import Resume, ResumeVersion
from resumes.tests.factories import SAMPLE_STRUCTURED


def _make_resume(*, target_role="backend-python", collected_data=None):
    session = InterviewSessionFactory(
        collected_data=collected_data
        if collected_data is not None
        else {"personal_info": {"name": "Marina Costa"}, "skills": ["Python"]}
    )
    return Resume.objects.create(
        user=session.user,
        session=session,
        title="Currículo de Marina",
        target_role=target_role,
        status=Resume.Status.GENERATING,
    )


@pytest.mark.django_db
def test_consumes_collected_data():
    collected = {"personal_info": {"name": "Marina Costa"}, "skills": ["Python", "Django"]}
    resume = _make_resume(collected_data=collected)
    fake = FakeLLMClient([tool_use_response("submit_resume", SAMPLE_STRUCTURED), text_response("ok")])

    RunWriter(llm_client=fake, knowledge=FakeKnowledgeLoader()).execute(resume=resume)

    # O collected_data (em JSON) aparece no conteúdo do 1º user message.
    first_call = fake.calls[0]
    user_text = json.dumps(first_call["messages"][0]["content"])
    assert "Marina Costa" in user_text
    assert "Django" in user_text


@pytest.mark.django_db
def test_creates_resume_version_v1():
    resume = _make_resume()
    fake = FakeLLMClient([tool_use_response("submit_resume", SAMPLE_STRUCTURED), text_response("ok")])

    version = RunWriter(llm_client=fake, knowledge=FakeKnowledgeLoader()).execute(resume=resume)

    assert version.version_number == 1
    assert version.generated_by_agent == "writer"
    assert version.structured_data == SAMPLE_STRUCTURED
    assert ResumeVersion.objects.filter(resume=resume, version_number=1).count() == 1

    resume.refresh_from_db()
    assert resume.status == Resume.Status.WRITER_DONE


@pytest.mark.django_db
def test_loads_knowledge_for_writer():
    resume = _make_resume()
    fake = FakeLLMClient([tool_use_response("submit_resume", SAMPLE_STRUCTURED), text_response("ok")])
    knowledge = FakeKnowledgeLoader()

    RunWriter(llm_client=fake, knowledge=knowledge).execute(resume=resume)

    assert "writer" in knowledge.calls
    assert FakeKnowledgeLoader.SENTINEL in fake.last_system


@pytest.mark.django_db
def test_retrieves_canonical_examples_by_target_role():
    resume = _make_resume(target_role="backend-python")
    fake = FakeLLMClient([tool_use_response("submit_resume", SAMPLE_STRUCTURED), text_response("ok")])
    knowledge = FakeKnowledgeLoader()

    RunWriter(llm_client=fake, knowledge=knowledge).execute(resume=resume)

    assert len(knowledge.retrieve_calls) == 1
    call = knowledge.retrieve_calls[0]
    assert call["agents"] == ["writer"]
    assert call["filters"] == {"target_role": "backend-python"}
