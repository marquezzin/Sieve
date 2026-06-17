"""Queries puras sobre Application. Sem regra de negócio — só leitura + checagem
de dono. Espelha `resumes/selectors.py:get_resume_for_user`.
"""

from django.db.models import QuerySet

from applications.models import Application
from core.errors import NotFoundError, PermissionDeniedError


def list_applications_for_user(*, user) -> QuerySet[Application]:
    return Application.objects.filter(user=user)


def get_application_for_user(*, user, application_id) -> Application:
    """Application por id, garantindo que pertence ao usuário.

    404 se não existe; 403 se é de outro usuário.
    """
    try:
        application = Application.objects.get(id=application_id)
    except Application.DoesNotExist as exc:
        raise NotFoundError("Candidatura não encontrada.") from exc
    if application.user_id != user.id:
        raise PermissionDeniedError("Candidatura pertence a outro usuário.")
    return application
