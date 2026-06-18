"""Testes da API do Kanban de candidaturas (`/api/v1/applications/`).

Cobre: create (status default applied), move (atualiza status), move inválido →
400, isolamento por usuário, delete, e lista como ARRAY direto (sem paginação).
"""

import pytest

from applications.models import Application
from applications.tests.factories import ApplicationFactory


@pytest.mark.django_db
def test_create_card_defaults_to_applied(auth_client):
    response = auth_client.post(
        "/api/v1/applications/",
        {"company": "Acme", "position": "Backend Engineer"},
        format="json",
    )

    assert response.status_code == 201
    data = response.json()["data"]
    assert data["status"] == Application.Status.APPLIED
    assert data["company"] == "Acme"
    assert Application.objects.filter(id=data["id"], user=auth_client.user).exists()


@pytest.mark.django_db
def test_create_requires_company_and_position(auth_client):
    response = auth_client.post("/api/v1/applications/", {"company": "Acme"}, format="json")
    assert response.status_code == 400


@pytest.mark.django_db
def test_move_updates_status_and_updated_at(auth_client):
    card = ApplicationFactory(user=auth_client.user, status=Application.Status.APPLIED)
    before = card.updated_at

    response = auth_client.patch(
        f"/api/v1/applications/{card.id}/move/",
        {"status": Application.Status.SCREENING},
        format="json",
    )

    assert response.status_code == 200
    assert response.json()["data"]["status"] == Application.Status.SCREENING
    card.refresh_from_db()
    assert card.status == Application.Status.SCREENING
    assert card.updated_at >= before


@pytest.mark.django_db
def test_move_with_invalid_status_returns_400(auth_client):
    card = ApplicationFactory(user=auth_client.user)

    response = auth_client.patch(
        f"/api/v1/applications/{card.id}/move/",
        {"status": "not_a_real_status"},
        format="json",
    )

    assert response.status_code == 400
    card.refresh_from_db()
    assert card.status == Application.Status.APPLIED


@pytest.mark.django_db
def test_list_returns_plain_array_without_pagination(auth_client):
    ApplicationFactory.create_batch(3, user=auth_client.user)

    response = auth_client.get("/api/v1/applications/")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert isinstance(body["data"], list)
    assert len(body["data"]) == 3
    assert body.get("pagination") is None


@pytest.mark.django_db
def test_list_isolated_per_user(auth_client):
    ApplicationFactory(user=auth_client.user, company="Minha")
    ApplicationFactory(company="Alheia")

    response = auth_client.get("/api/v1/applications/")

    companies = [c["company"] for c in response.json()["data"]]
    assert companies == ["Minha"]


@pytest.mark.django_db
def test_cannot_move_card_of_another_user(auth_client):
    other_card = ApplicationFactory()

    response = auth_client.patch(
        f"/api/v1/applications/{other_card.id}/move/",
        {"status": Application.Status.OFFER},
        format="json",
    )

    assert response.status_code == 404


@pytest.mark.django_db
def test_delete_removes_card(auth_client):
    card = ApplicationFactory(user=auth_client.user)

    response = auth_client.delete(f"/api/v1/applications/{card.id}/")

    assert response.status_code == 204
    assert not Application.objects.filter(id=card.id).exists()


@pytest.mark.django_db
def test_attach_job_posting_of_another_user_rejected(auth_client):
    from matching.tests.factories import JobPostingFactory

    other_job = JobPostingFactory()

    response = auth_client.post(
        "/api/v1/applications/",
        {"company": "Acme", "position": "Dev", "job_posting_id": str(other_job.id)},
        format="json",
    )

    assert response.status_code == 400
