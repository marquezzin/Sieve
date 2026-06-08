"""Queries puras sobre `CandidateProfile`. Sem regra de negócio — só leitura."""

from accounts.models import CandidateProfile
from core.errors import NotFoundError


def get_profile_for_user(*, user) -> CandidateProfile:
    try:
        return CandidateProfile.objects.get(user=user)
    except CandidateProfile.DoesNotExist as exc:
        raise NotFoundError("Candidate profile not found.") from exc
