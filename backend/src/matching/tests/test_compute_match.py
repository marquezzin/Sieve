"""Testes do use case `ComputeMatch` — (ResumeVersion, JobPosting) → MatchAnalysis.

Cobre: score em [0,1]; identificação de skill ausente via embedding gap (keyword
sem overlap de tokens com o currículo); cache por par (2ª chamada sem refresh NÃO
toca o LLM); e `refresh=True` forçando recálculo.

Embeddings ficam no fake determinístico (token-hash, default em `settings.test`):
keyword sem token em comum com o conteúdo do currículo → cosseno baixo → ausente.
"""

from decimal import Decimal

import pytest

from agents.tests.fakes import FakeKnowledgeLoader, FakeLLMClient, text_response, tool_use_response
from matching.models import MatchAnalysis
from matching.tests.factories import JobPostingFactory
from resumes.tests.factories import ResumeVersionFactory

# Payload que o LLM "submete" via submit_match.
MATCH_PAYLOAD = {
    "matched_skills": ["Python", "Django"],
    "missing_skills": [{"skill": "Kafka", "critical": True}],
    "recommendations": [
        {
            "title": "Nomeie Kafka",
            "detail": "Cite Kafka pelo nome na experiência do Nubank.",
            "category": "realce",
        }
    ],
}


def _match_llm():
    """Fila de respostas pra UMA execução de ComputeMatch (tool_use + fecho)."""
    return FakeLLMClient([tool_use_response("submit_match", MATCH_PAYLOAD), text_response("ok")])


@pytest.mark.django_db
def test_score_in_unit_interval():
    version = ResumeVersionFactory()
    job = JobPostingFactory(user=version.resume.user)
    from matching.use_cases.compute_match import ComputeMatch

    analysis = ComputeMatch(llm_client=_match_llm(), knowledge=FakeKnowledgeLoader()).execute(
        resume_version=version, job_posting=job
    )

    assert isinstance(analysis, MatchAnalysis)
    assert Decimal("0.000") <= analysis.score <= Decimal("1.000")


@pytest.mark.django_db
def test_identifies_missing_skill_by_embedding_gap():
    # Currículo só com tokens "python/django"; keyword "Zzqwxyk" não tem overlap →
    # cosseno baixo → entra em likely_missing do sinal de embedding.
    version = ResumeVersionFactory(
        structured_data={
            "summary": "Backend com Python e Django.",
            "skills": ["Python", "Django"],
            "experiences": [],
        }
    )
    job = JobPostingFactory(
        user=version.resume.user,
        extracted_keywords=["Python", "Zzqwxyk"],
    )

    captured_gap = {}
    from matching.use_cases import compute_match as cm

    original = cm.ComputeMatch._analyze_with_llm

    def spy(self, resume_version, job_posting, embedding_gap):
        captured_gap.update(embedding_gap)
        return MATCH_PAYLOAD

    cm.ComputeMatch._analyze_with_llm = spy
    try:
        cm.ComputeMatch(
            llm_client=_match_llm(), knowledge=FakeKnowledgeLoader()
        ).execute(resume_version=version, job_posting=job)
    finally:
        cm.ComputeMatch._analyze_with_llm = original

    # A keyword sem overlap de tokens com o currículo cai em likely_missing.
    assert "Zzqwxyk" in captured_gap.get("likely_missing", [])
    # E toda keyword é classificada (missing ∪ matched cobre as keywords da vaga).
    classified = set(captured_gap.get("likely_missing", [])) | set(
        captured_gap.get("likely_matched", [])
    )
    assert classified == {"Python", "Zzqwxyk"}


@pytest.mark.django_db
def test_second_call_is_cached_without_touching_llm():
    version = ResumeVersionFactory()
    job = JobPostingFactory(user=version.resume.user)
    from matching.use_cases.compute_match import ComputeMatch

    fake = _match_llm()
    first = ComputeMatch(llm_client=fake, knowledge=FakeKnowledgeLoader()).execute(
        resume_version=version, job_posting=job
    )
    calls_after_first = len(fake.calls)
    assert calls_after_first > 0

    # 2ª chamada: mesmo par, sem refresh → cache. Não pode tocar o LLM (fila vazia
    # estouraria AssertionError se chamasse).
    second = ComputeMatch(llm_client=fake, knowledge=FakeKnowledgeLoader()).execute(
        resume_version=version, job_posting=job
    )

    assert second.id == first.id
    assert len(fake.calls) == calls_after_first
    assert MatchAnalysis.objects.filter(resume_version=version, job_posting=job).count() == 1


@pytest.mark.django_db
def test_refresh_forces_recompute():
    version = ResumeVersionFactory()
    job = JobPostingFactory(user=version.resume.user)
    from matching.use_cases.compute_match import ComputeMatch

    first = ComputeMatch(llm_client=_match_llm(), knowledge=FakeKnowledgeLoader()).execute(
        resume_version=version, job_posting=job
    )

    refresh_fake = _match_llm()
    second = ComputeMatch(llm_client=refresh_fake, knowledge=FakeKnowledgeLoader()).execute(
        resume_version=version, job_posting=job, refresh=True
    )

    assert len(refresh_fake.calls) > 0  # tocou o LLM de novo
    assert second.id == first.id  # update_or_create respeita unique_together
    assert MatchAnalysis.objects.filter(resume_version=version, job_posting=job).count() == 1
