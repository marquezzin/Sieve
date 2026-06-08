"""API do `/api/v1/accounts/me/` — GET/PATCH do perfil do request.user."""

import pytest


@pytest.mark.django_db
def test_get_me_returns_profile(auth_client):
    response = auth_client.get("/api/v1/accounts/me/")
    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    data = body["data"]
    # Serializer expõe estes campos — e nunca `user`.
    assert set(data.keys()) == {
        "id",
        "headline",
        "location",
        "phone",
        "linkedin_url",
        "github_url",
        "created_at",
        "updated_at",
    }
    assert "user" not in data
    assert data["id"] == str(auth_client.user.candidate_profile.id)


@pytest.mark.django_db
def test_patch_me_updates_profile(auth_client):
    response = auth_client.patch(
        "/api/v1/accounts/me/",
        {"headline": "Engenheiro de Software"},
        format="json",
    )
    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    assert body["data"]["headline"] == "Engenheiro de Software"

    profile = auth_client.user.candidate_profile
    profile.refresh_from_db()
    assert profile.headline == "Engenheiro de Software"


@pytest.mark.django_db
def test_me_requires_auth(api_client):
    response = api_client.get("/api/v1/accounts/me/")
    assert response.status_code == 401
