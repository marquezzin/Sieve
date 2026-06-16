"""API de currículos — tudo escopado ao request.user.

PDF é mockado no módulo do use case (`get_pdf_renderer`) pra não depender de
WeasyPrint/GTK. Diff e list passam pelo envelope normal.
"""

import pytest

from resumes.tests.factories import ResumeFactory, ResumeVersionFactory

FAKE_PDF = b"%PDF-1.7\n" + b"0" * 1100


class FakeRenderer:
    def render(self, html, *, base_url=None):
        return FAKE_PDF


@pytest.fixture
def fake_pdf(monkeypatch):
    monkeypatch.setattr(
        "resumes.use_cases.render_to_pdf.get_pdf_renderer",
        lambda: FakeRenderer(),
    )


@pytest.mark.django_db
def test_list_returns_user_resumes_only(auth_client):
    mine = ResumeFactory.create_batch(2, user=auth_client.user)
    ResumeFactory()  # de outro usuário

    response = auth_client.get("/api/v1/resumes/")
    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    ids = {item["id"] for item in body["data"]}
    assert ids == {str(r.id) for r in mine}


@pytest.mark.django_db
def test_get_pdf_returns_binary(auth_client, fake_pdf):
    resume = ResumeFactory(user=auth_client.user)
    version = ResumeVersionFactory(resume=resume, version_number=1)

    response = auth_client.get(
        f"/api/v1/resumes/{resume.id}/versions/{version.version_number}/pdf/"
    )
    assert response.status_code == 200
    assert response["Content-Type"] == "application/pdf"
    assert response.content == FAKE_PDF


@pytest.mark.django_db
def test_diff_endpoint(auth_client):
    resume = ResumeFactory(user=auth_client.user)
    ResumeVersionFactory(
        resume=resume,
        version_number=1,
        structured_data={
            "experiences": [
                {"id": "acme-dev", "role": "Dev", "company": "Acme", "bullets": ["Fiz X."]}
            ]
        },
    )
    ResumeVersionFactory(
        resume=resume,
        version_number=2,
        generated_by_agent="reviewer",
        structured_data={
            "experiences": [
                {"id": "acme-dev", "role": "Dev", "company": "Acme", "bullets": ["Construí X com métrica."]}
            ]
        },
    )

    response = auth_client.get(f"/api/v1/resumes/{resume.id}/versions/1/diff/2/")
    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    data = body["data"]
    assert data["from"] == 1
    assert data["to"] == 2
    assert "changes" in data
    assert any(c["type"] == "mod" for c in data["changes"])


@pytest.mark.django_db
def test_other_users_resume_is_forbidden(auth_client):
    other = ResumeFactory()  # de outro usuário
    response = auth_client.get(f"/api/v1/resumes/{other.id}/")
    assert response.status_code == 403
