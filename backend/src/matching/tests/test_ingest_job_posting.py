"""Testes do use case `IngestJobPosting` — descrição crua → JobPosting persistido.

Injeta `FakeLLMClient` (fila com tool_use `submit_keywords` + texto de fecho) e
`FakeKnowledgeLoader`. Embeddings ficam no fake determinístico (default em
`settings.test`). Cobre: extração+persistência de keywords, embedding não-nulo do
tamanho certo e isolamento por usuário no selector.
"""

import pytest
from django.conf import settings

from accounts.tests.factories import UserFactory
from agents.tests.fakes import FakeKnowledgeLoader, FakeLLMClient, text_response, tool_use_response
from matching.models import JobPosting
from matching.selectors import list_jobs_for_user
from matching.use_cases.ingest_job_posting import IngestJobPosting

KEYWORDS = ["Python", "Django", "PostgreSQL", "CI/CD"]


def _fake_llm():
    return FakeLLMClient(
        [tool_use_response("submit_keywords", {"keywords": KEYWORDS}), text_response("ok")]
    )


@pytest.mark.django_db
def test_extracts_and_persists_keywords():
    user = UserFactory()
    fake = _fake_llm()

    job = IngestJobPosting(llm_client=fake, knowledge=FakeKnowledgeLoader()).execute(
        user=user,
        title="Backend Engineer",
        company="Acme",
        description="Vaga de Python e Django com PostgreSQL e CI/CD.",
    )

    assert isinstance(job, JobPosting)
    assert job.extracted_keywords == KEYWORDS
    assert job.user_id == user.id
    assert JobPosting.objects.filter(id=job.id).exists()


@pytest.mark.django_db
def test_generates_non_null_embedding_of_correct_dim():
    user = UserFactory()

    job = IngestJobPosting(llm_client=_fake_llm(), knowledge=FakeKnowledgeLoader()).execute(
        user=user,
        title="Backend Engineer",
        company="Acme",
        description="Vaga de Python e Django com PostgreSQL.",
    )

    job.refresh_from_db()
    assert job.embedding is not None
    assert len(list(job.embedding)) == settings.EMBEDDINGS_DIM


@pytest.mark.django_db
def test_loads_knowledge_for_matcher_agent():
    knowledge = FakeKnowledgeLoader()
    fake = _fake_llm()

    IngestJobPosting(llm_client=fake, knowledge=knowledge).execute(
        user=UserFactory(),
        title="Backend Engineer",
        company="Acme",
        description="Python e Django.",
    )

    assert "matcher" in knowledge.calls
    assert FakeKnowledgeLoader.SENTINEL in fake.last_system


@pytest.mark.django_db
def test_selector_isolates_jobs_per_user():
    owner = UserFactory()
    other = UserFactory()
    IngestJobPosting(llm_client=_fake_llm(), knowledge=FakeKnowledgeLoader()).execute(
        user=owner, title="A", company="Acme", description="Python."
    )
    IngestJobPosting(llm_client=_fake_llm(), knowledge=FakeKnowledgeLoader()).execute(
        user=other, title="B", company="Beta", description="Django."
    )

    owner_jobs = list(list_jobs_for_user(user=owner))
    assert len(owner_jobs) == 1
    assert owner_jobs[0].title == "A"
