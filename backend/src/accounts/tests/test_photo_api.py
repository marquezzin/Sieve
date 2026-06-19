"""Endpoints de foto sob `/api/v1/accounts/me/photo/`.

A suíte roda sob `config.settings.local` — eager do Celery NÃO está ligado e a
factory de headshot resolve o provider real (`render`) via `decouple`. Por isso
estes testes **não** dependem do modo eager: o endpoint de geração só dispara a
task (asserta o dispatch via patch no `.delay`), e o estado `ready` é exercitado
rodando a task direto com o fake injetado no use case — exatamente o que o worker
faz, de forma determinística (mesma estratégia de `agents/tests/test_tasks_pipeline.py`).
"""

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from accounts.use_cases.generate_professional_photo import GenerateProfessionalPhoto
from integrations.headshot.fake_client import MINIMAL_PNG_BYTES, FakeHeadshotClient

UPLOAD_URL = "/api/v1/accounts/me/photo/"
GENERATE_URL = "/api/v1/accounts/me/photo/generate/"
STATUS_URL = "/api/v1/accounts/me/photo/status/"


def _png(name="photo.png"):
    return SimpleUploadedFile(name, MINIMAL_PNG_BYTES, content_type="image/png")


@pytest.mark.django_db
def test_upload_endpoint(auth_client):
    response = auth_client.post(UPLOAD_URL, {"photo": _png()}, format="multipart")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    data = body["data"]
    assert data["photo_status"] == "idle"
    assert data["base_photo_url"] is not None


@pytest.mark.django_db
def test_upload_rejects_non_image(auth_client):
    not_image = SimpleUploadedFile("doc.pdf", b"%PDF-1.4 fake", content_type="application/pdf")

    response = auth_client.post(UPLOAD_URL, {"photo": not_image}, format="multipart")

    assert response.status_code == 400
    assert response.json()["success"] is False


@pytest.mark.django_db
def test_generate_endpoint_dispatches_and_sets_ready(auth_client, monkeypatch):
    auth_client.post(UPLOAD_URL, {"photo": _png()}, format="multipart")

    # Captura o dispatch sem subir broker nem chamar a API real (não há eager).
    dispatched = {}

    def fake_delay(profile_id):
        dispatched["profile_id"] = profile_id

    from accounts.tasks import generate_professional_photo_task

    monkeypatch.setattr(generate_professional_photo_task, "delay", fake_delay)

    response = auth_client.post(GENERATE_URL)

    # A view marca `generating` e dispara a task; o corpo imediato reflete isso.
    assert response.status_code == 202
    assert response.json()["data"]["photo_status"] == "generating"

    from accounts.models import CandidateProfile

    profile = CandidateProfile.objects.get(user=auth_client.user)
    assert dispatched["profile_id"] == str(profile.id)

    # O que o worker faria: roda o use case com o fake (determinístico, sem rede).
    GenerateProfessionalPhoto(headshot_client=FakeHeadshotClient()).execute(profile=profile)

    status_response = auth_client.get(STATUS_URL)
    assert status_response.status_code == 200
    status_data = status_response.json()["data"]
    assert status_data["photo_status"] == "ready"
    assert status_data["professional_photo_url"] is not None


@pytest.mark.django_db
def test_generate_without_base_returns_error(auth_client):
    response = auth_client.post(GENERATE_URL)

    assert response.status_code == 400
    assert response.json()["success"] is False


@pytest.mark.django_db
def test_status_endpoint(auth_client):
    response = auth_client.get(STATUS_URL)

    assert response.status_code == 200
    data = response.json()["data"]
    assert set(data.keys()) == {"photo_status", "base_photo_url", "professional_photo_url"}
