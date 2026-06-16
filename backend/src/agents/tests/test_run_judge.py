"""Use case `RunJudge` com DI — ResumeVersion → ResumeScore.

O LLM devolve as 6 notas + feedback via `submit_score`; a média ponderada é
computada no use case (`compute_overall`), não no modelo.
"""

import pytest

from agents.prompts.resume_tools import SCORE_CRITERIA
from agents.tests.fakes import FakeKnowledgeLoader, FakeLLMClient, text_response, tool_use_response
from agents.use_cases.run_judge import RUBRIC_WEIGHTS, compute_overall
from resumes.models import Resume, ResumeScore
from resumes.tests.factories import ResumeFactory, ResumeVersionFactory

CRITERIA = {
    "action_verbs": 8.0,
    "metrics": 7.0,
    "cliches": 9.0,
    "specificity": 6.0,
    "conciseness": 7.0,
    "formatting": 8.0,
}
SCORE_INPUT = {
    "criteria": CRITERIA,
    "feedback": [{"tone": "green", "text": "Boas métricas."}],
}


def _version():
    resume = ResumeFactory(status=Resume.Status.REVIEWER_DONE)
    return ResumeVersionFactory(resume=resume, version_number=2, generated_by_agent="reviewer")


@pytest.mark.django_db
def test_creates_resume_score_with_all_criteria():
    from agents.use_cases.run_judge import RunJudge

    version = _version()
    fake = FakeLLMClient([tool_use_response("submit_score", SCORE_INPUT), text_response("ok")])

    score = RunJudge(llm_client=fake, knowledge=FakeKnowledgeLoader()).execute(version=version)

    assert set(score.criteria.keys()) == set(SCORE_CRITERIA)
    assert ResumeScore.objects.filter(resume_version=version).count() == 1


@pytest.mark.django_db
def test_overall_is_weighted_average():
    from agents.use_cases.run_judge import RunJudge

    version = _version()
    fake = FakeLLMClient([tool_use_response("submit_score", SCORE_INPUT), text_response("ok")])

    score = RunJudge(llm_client=fake, knowledge=FakeKnowledgeLoader()).execute(version=version)

    expected = compute_overall(CRITERIA)
    assert score.overall == expected

    # Sanity: bate com a média ponderada manual dos pesos.
    manual = sum(RUBRIC_WEIGHTS[k] * CRITERIA[k] for k in SCORE_CRITERIA)
    assert abs(float(score.overall) - manual) < 0.01

    version.resume.refresh_from_db()
    assert version.resume.status == Resume.Status.READY
