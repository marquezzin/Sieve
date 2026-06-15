"""Queries puras sobre Resume / ResumeVersion. Sem regra de negócio — só leitura
+ checagem de dono. Espelha `chat/selectors.py:get_session_for_user`.
"""

from django.db.models import QuerySet

from core.errors import NotFoundError, PermissionDeniedError
from resumes.models import Resume, ResumeVersion


def get_resume_for_user(*, user, resume_id) -> Resume:
    """Resume por id, garantindo que pertence ao usuário.

    404 se não existe; 403 se é de outro usuário (não revela conteúdo alheio).
    """
    try:
        resume = Resume.objects.get(id=resume_id)
    except Resume.DoesNotExist as exc:
        raise NotFoundError("Currículo não encontrado.") from exc
    if resume.user_id != user.id:
        raise PermissionDeniedError("Currículo pertence a outro usuário.")
    return resume


def list_resumes_for_user(*, user) -> QuerySet[Resume]:
    return Resume.objects.filter(user=user)


def get_latest_version(*, resume: Resume) -> ResumeVersion | None:
    return resume.versions.order_by("-version_number").first()


def list_versions(*, resume: Resume) -> QuerySet[ResumeVersion]:
    return resume.versions.order_by("version_number")


def get_version(*, resume: Resume, version_number) -> ResumeVersion:
    try:
        return resume.versions.get(version_number=version_number)
    except ResumeVersion.DoesNotExist as exc:
        raise NotFoundError("Versão de currículo não encontrada.") from exc
