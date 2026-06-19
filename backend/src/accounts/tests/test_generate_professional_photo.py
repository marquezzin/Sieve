"""Use case `GenerateProfessionalPhoto` — geração via client injetado.

Client de headshot é injetado no `__init__` (DI, sem mock de HTTP). Sucesso
persiste o PNG e marca `ready`; `HeadshotError` re-raise e marca `failed`.
"""

import pytest
from django.core.files.base import ContentFile

from accounts.tests.factories import UserFactory
from accounts.use_cases.generate_professional_photo import GenerateProfessionalPhoto
from core.errors import ApplicationError
from integrations.headshot.base import HeadshotError
from integrations.headshot.fake_client import MINIMAL_PNG_BYTES


class _StubClient:
    """Devolve bytes fixos, registrando se foi chamado."""

    def __init__(self, png_bytes=MINIMAL_PNG_BYTES):
        self._png = png_bytes
        self.called = False

    def generate(self, image_bytes, *, filename="photo.png", content_type="image/png"):
        self.called = True
        return self._png


class _FailingClient:
    def generate(self, image_bytes, *, filename="photo.png", content_type="image/png"):
        raise HeadshotError("boom")


def _profile_with_base():
    profile = UserFactory().candidate_profile
    profile.base_photo.save("base.png", ContentFile(MINIMAL_PNG_BYTES), save=True)
    return profile


@pytest.mark.django_db
def test_calls_image_api_and_persists():
    profile = _profile_with_base()
    client = _StubClient(png_bytes=MINIMAL_PNG_BYTES)

    result = GenerateProfessionalPhoto(headshot_client=client).execute(profile=profile)

    assert client.called is True
    assert result.professional_photo.name
    result.professional_photo.open("rb")
    assert result.professional_photo.read() == MINIMAL_PNG_BYTES
    result.professional_photo.close()


@pytest.mark.django_db
def test_updates_status_to_ready():
    profile = _profile_with_base()

    GenerateProfessionalPhoto(headshot_client=_StubClient()).execute(profile=profile)

    profile.refresh_from_db()
    assert profile.photo_status == "ready"


@pytest.mark.django_db
def test_api_error_marks_failed():
    profile = _profile_with_base()

    with pytest.raises(HeadshotError):
        GenerateProfessionalPhoto(headshot_client=_FailingClient()).execute(profile=profile)

    profile.refresh_from_db()
    assert profile.photo_status == "failed"


@pytest.mark.django_db
def test_no_base_photo_raises():
    profile = UserFactory().candidate_profile

    with pytest.raises(ApplicationError):
        GenerateProfessionalPhoto(headshot_client=_StubClient()).execute(profile=profile)
