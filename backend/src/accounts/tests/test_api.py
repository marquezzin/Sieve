"""API do `/api/v1/accounts/me/` — GET/PATCH do perfil do request.user
+ `/api/v1/accounts/register/` — cadastro público.
"""

import pytest
from django.contrib.auth import get_user_model

from accounts.models import CandidateProfile
from accounts.tests.factories import UserFactory

User = get_user_model()

REGISTER_URL = "/api/v1/accounts/register/"
STRONG_PASSWORD = "Sieve!2026xyz"


def _error_fields(body):
    """Extrai `errors[0]['fields']` do envelope de erro."""
    assert body["success"] is False
    assert body["errors"], body
    return body["errors"][0]["fields"]


@pytest.mark.django_db
def test_register_creates_user_and_returns_tokens(api_client):
    before = User.objects.count()

    response = api_client.post(
        REGISTER_URL,
        {"username": "novato", "email": "novato@example.com", "password": STRONG_PASSWORD},
        format="json",
    )

    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True

    data = body["data"]
    assert data["access"]
    assert data["refresh"]

    assert User.objects.count() == before + 1
    user = User.objects.get(username="novato")

    # Signal post_save criou o perfil.
    assert CandidateProfile.objects.filter(user=user).exists()
    assert user.candidate_profile is not None

    # Senha hasheada — confere e não vaza em claro.
    assert user.check_password(STRONG_PASSWORD)
    assert user.password != STRONG_PASSWORD
    assert STRONG_PASSWORD not in str(data)


@pytest.mark.django_db
def test_register_is_public(api_client):
    # api_client é não-autenticado; endpoint AllowAny deve responder 201.
    response = api_client.post(
        REGISTER_URL,
        {"username": "publico", "email": "publico@example.com", "password": STRONG_PASSWORD},
        format="json",
    )
    assert response.status_code == 201


@pytest.mark.django_db
def test_register_rejects_duplicate_username_case_insensitive(api_client):
    UserFactory(username="Joao", email="joao@example.com")
    before = User.objects.count()

    response = api_client.post(
        REGISTER_URL,
        {"username": "joao", "email": "outro@example.com", "password": STRONG_PASSWORD},
        format="json",
    )

    assert response.status_code == 400
    assert User.objects.count() == before
    fields = _error_fields(response.json())
    assert "username" in fields


@pytest.mark.django_db
def test_register_rejects_duplicate_email_case_insensitive(api_client):
    UserFactory(username="existente", email="dup@example.com")
    before = User.objects.count()

    response = api_client.post(
        REGISTER_URL,
        {"username": "novo", "email": "DUP@example.com", "password": STRONG_PASSWORD},
        format="json",
    )

    assert response.status_code == 400
    assert User.objects.count() == before
    fields = _error_fields(response.json())
    assert "email" in fields


@pytest.mark.django_db
def test_register_rejects_weak_password(api_client):
    before = User.objects.count()

    response = api_client.post(
        REGISTER_URL,
        {"username": "fraco", "email": "fraco@example.com", "password": "12345678"},
        format="json",
    )

    assert response.status_code == 400
    assert User.objects.count() == before
    fields = _error_fields(response.json())
    assert "password" in fields
    assert isinstance(fields["password"], list)


@pytest.mark.django_db
def test_register_rejects_short_password(api_client):
    before = User.objects.count()

    response = api_client.post(
        REGISTER_URL,
        {"username": "curto", "email": "curto@example.com", "password": "abc"},
        format="json",
    )

    assert response.status_code == 400
    assert User.objects.count() == before
    fields = _error_fields(response.json())
    assert "password" in fields


@pytest.mark.django_db
def test_register_rejects_invalid_email(api_client):
    before = User.objects.count()

    response = api_client.post(
        REGISTER_URL,
        {"username": "semat", "email": "naoé-email", "password": STRONG_PASSWORD},
        format="json",
    )

    assert response.status_code == 400
    assert User.objects.count() == before
    fields = _error_fields(response.json())
    assert "email" in fields


@pytest.mark.django_db
def test_register_rejects_missing_password(api_client):
    before = User.objects.count()

    response = api_client.post(
        REGISTER_URL,
        {"username": "semsenha", "email": "semsenha@example.com"},
        format="json",
    )

    assert response.status_code == 400
    assert User.objects.count() == before
    fields = _error_fields(response.json())
    assert "password" in fields


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
        "email",
        "full_name",
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
    # email/full_name são read-only espelhados do User (cabeçalho do perfil).
    assert data["email"] == auth_client.user.email


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
