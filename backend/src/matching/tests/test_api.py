"""Testes da API de matching (`/api/v1/matching/`).

`POST /analyze/` é testado pela via do CACHE: pré-criamos a `MatchAnalysis` do par
(via factory) e checamos o envelope/contrato — assim a view não toca o LLM real
(não há DI no endpoint). `GET /jobs/` cobre o `top_score` anotado.
"""

import pytest

from matching.tests.factories import JobPostingFactory, MatchAnalysisFactory
from resumes.tests.factories import ResumeFactory, ResumeVersionFactory


@pytest.mark.django_db
def test_analyze_returns_envelope_with_expected_fields(auth_client):
    user = auth_client.user
    resume = ResumeFactory(user=user)
    version = ResumeVersionFactory(resume=resume)
    job = JobPostingFactory(user=user)
    # Análise já em cache → a view devolve sem chamar o LLM.
    MatchAnalysisFactory(resume_version=version, job_posting=job)

    response = auth_client.post(
        "/api/v1/matching/analyze/",
        {"resume_version_id": str(version.id), "job_posting_id": str(job.id)},
        format="json",
    )

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    data = body["data"]
    assert isinstance(data["score"], float)
    assert 0.0 <= data["score"] <= 1.0
    assert data["matched_skills"] == ["Python", "Django"]
    assert data["missing_skills"] == [{"skill": "Kafka", "critical": True}]
    assert isinstance(data["recommendations"], list)
    rec = data["recommendations"][0]
    assert set(rec) >= {"title", "detail", "category"}
    assert rec["category"] in ("realce", "enfase", "gap")


@pytest.mark.django_db
def test_analyze_rejects_job_of_another_user(auth_client):
    user = auth_client.user
    version = ResumeVersionFactory(resume=ResumeFactory(user=user))
    other_job = JobPostingFactory()  # dono diferente

    response = auth_client.post(
        "/api/v1/matching/analyze/",
        {"resume_version_id": str(version.id), "job_posting_id": str(other_job.id)},
        format="json",
    )

    assert response.status_code == 403


@pytest.mark.django_db
def test_list_jobs_exposes_top_score(auth_client):
    user = auth_client.user
    job = JobPostingFactory(user=user)
    version = ResumeVersionFactory(resume=ResumeFactory(user=user))
    MatchAnalysisFactory(resume_version=version, job_posting=job, score="0.812")

    response = auth_client.get("/api/v1/matching/jobs/")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    item = next(j for j in body["data"] if j["id"] == str(job.id))
    assert item["top_score"] == pytest.approx(0.812)
    assert "embedding" not in item


@pytest.mark.django_db
def test_list_jobs_top_score_null_when_never_analyzed(auth_client):
    job = JobPostingFactory(user=auth_client.user)

    response = auth_client.get("/api/v1/matching/jobs/")

    item = next(j for j in response.json()["data"] if j["id"] == str(job.id))
    assert item["top_score"] is None


@pytest.mark.django_db
def test_list_jobs_isolated_per_user(auth_client):
    JobPostingFactory(user=auth_client.user, title="Minha vaga")
    JobPostingFactory(title="Vaga alheia")

    response = auth_client.get("/api/v1/matching/jobs/")

    titles = [j["title"] for j in response.json()["data"]]
    assert titles == ["Minha vaga"]
