"""Use case `RunReviewer` com DI — ResumeVersion vN → vN+1 revisada."""

import pytest

from agents.tests.fakes import FakeKnowledgeLoader, FakeLLMClient, text_response, tool_use_response
from resumes.models import Resume, ResumeVersion
from resumes.tests.factories import ResumeFactory, ResumeVersionFactory
from resumes.use_cases.compute_diff import compute_diff

# v1: 4 bullets nas experiências (2 + 2).
SAMPLE_V1 = {
    "personal_info": {"name": "Marina Costa"},
    "summary": "Dev backend.",
    "experiences": [
        {
            "id": "nubank-backend",
            "role": "Eng",
            "company": "Nubank",
            "bullets": ["Fiz APIs.", "Cuidei do banco."],
        },
        {
            "id": "acme-backend",
            "role": "Dev",
            "company": "Acme",
            "bullets": ["Toquei ETL.", "Fiz testes."],
        },
    ],
    "skills": ["Python"],
}

# v2: mesmos ids, mas 2 de 4 bullets reescritos (50% > 30%).
SAMPLE_V2 = {
    "personal_info": {"name": "Marina Costa"},
    "summary": "Engenheira backend com foco em Python.",
    "experiences": [
        {
            "id": "nubank-backend",
            "role": "Eng",
            "company": "Nubank",
            "bullets": ["Construí APIs em Django servindo 2M req/dia.", "Cuidei do banco."],
        },
        {
            "id": "acme-backend",
            "role": "Dev",
            "company": "Acme",
            "bullets": ["Implementei pipeline de ETL processando 500GB/dia.", "Fiz testes."],
        },
    ],
    "skills": ["Python"],
}


def _v1_version():
    resume = ResumeFactory(status=Resume.Status.WRITER_DONE)
    return ResumeVersionFactory(
        resume=resume,
        version_number=1,
        generated_by_agent="writer",
        structured_data=SAMPLE_V1,
    )


def _flatten_bullets(structured):
    out = []
    for exp in structured.get("experiences", []):
        out.extend(exp.get("bullets", []))
    return out


@pytest.mark.django_db
def test_creates_resume_version_v2_higher():
    from agents.use_cases.run_reviewer import RunReviewer

    v1 = _v1_version()
    fake = FakeLLMClient([tool_use_response("submit_resume", SAMPLE_V2), text_response("ok")])

    v2 = RunReviewer(llm_client=fake, knowledge=FakeKnowledgeLoader()).execute(version=v1)

    assert v2.version_number == 2
    assert v2.generated_by_agent == "reviewer"
    assert ResumeVersion.objects.filter(resume=v1.resume, version_number=2).count() == 1

    v1.resume.refresh_from_db()
    assert v1.resume.status == Resume.Status.REVIEWER_DONE


@pytest.mark.django_db
def test_modifies_at_least_30pct_bullets():
    from agents.use_cases.run_reviewer import RunReviewer

    v1 = _v1_version()
    fake = FakeLLMClient([tool_use_response("submit_resume", SAMPLE_V2), text_response("ok")])

    v2 = RunReviewer(llm_client=fake, knowledge=FakeKnowledgeLoader()).execute(version=v1)
    v2.refresh_from_db()

    v1_bullets = _flatten_bullets(v1.structured_data)
    total = len(v1_bullets)
    assert total > 0

    changes = compute_diff(v1.structured_data, v2.structured_data)
    modified = sum(1 for c in changes if c["type"] in ("mod", "add"))
    assert modified / total >= 0.30
