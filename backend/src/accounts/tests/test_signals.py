"""O signal `post_save` em User deve criar um `CandidateProfile` 1:1."""

import pytest

from accounts.models import CandidateProfile
from accounts.tests.factories import UserFactory


@pytest.mark.django_db
def test_user_save_creates_profile():
    user = UserFactory()

    assert CandidateProfile.objects.filter(user=user).count() == 1
    profile = user.candidate_profile
    assert profile.user_id == user.id
    # Defaults vazios — nenhum dado de currículo na criação.
    assert profile.headline == ""
    assert profile.location == ""


@pytest.mark.django_db
def test_existing_user_save_does_not_duplicate_profile():
    user = UserFactory()
    user.first_name = "Atualizado"
    user.save()

    assert CandidateProfile.objects.filter(user=user).count() == 1
