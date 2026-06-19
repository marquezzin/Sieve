"""Use case `UploadBasePhoto` — validação de tamanho/tipo + persistência.

Chama o use case direto (sem HTTP). Foto base nova invalida a profissional.
"""

import pytest
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile

from accounts.tests.factories import UserFactory
from accounts.use_cases.upload_base_photo import UploadBasePhoto
from core.errors import ApplicationError
from integrations.headshot.fake_client import MINIMAL_PNG_BYTES

_MAX_SIZE = 5 * 1024 * 1024


def _png(name="photo.png", data=None):
    return SimpleUploadedFile(name, data or MINIMAL_PNG_BYTES, content_type="image/png")


@pytest.mark.django_db
def test_validates_size():
    profile = UserFactory().candidate_profile
    big = SimpleUploadedFile("big.png", b"\x00" * (_MAX_SIZE + 1), content_type="image/png")

    with pytest.raises(ApplicationError):
        UploadBasePhoto().execute(profile=profile, uploaded_file=big)


@pytest.mark.django_db
def test_validates_format():
    profile = UserFactory().candidate_profile
    not_image = SimpleUploadedFile("doc.pdf", b"%PDF-1.4 fake", content_type="application/pdf")

    with pytest.raises(ApplicationError):
        UploadBasePhoto().execute(profile=profile, uploaded_file=not_image)


@pytest.mark.django_db
def test_persists_base_photo():
    profile = UserFactory().candidate_profile

    result = UploadBasePhoto().execute(profile=profile, uploaded_file=_png())

    assert result.base_photo.name
    assert result.photo_status == "idle"
    profile.refresh_from_db()
    assert profile.base_photo.name


@pytest.mark.django_db
def test_replacing_base_resets_professional():
    profile = UserFactory().candidate_profile
    profile.professional_photo.save(
        "old.png", ContentFile(MINIMAL_PNG_BYTES), save=False
    )
    profile.photo_status = "ready"
    profile.save()

    UploadBasePhoto().execute(profile=profile, uploaded_file=_png(name="new.png"))

    profile.refresh_from_db()
    assert profile.photo_status == "idle"
    assert not profile.professional_photo
