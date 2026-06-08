"""Queries puras de chat. Sem regra de negócio — só leitura + checagem de dono."""

from django.db.models import QuerySet

from chat.models import ChatMessage, InterviewSession
from core.errors import NotFoundError, PermissionDeniedError


def get_session_for_user(*, user, session_id) -> InterviewSession:
    """Sessão por id, garantindo que pertence ao usuário.

    404 se não existe; 403 se é de outro usuário (não revela conteúdo alheio).
    """
    try:
        session = InterviewSession.objects.get(id=session_id)
    except InterviewSession.DoesNotExist as exc:
        raise NotFoundError("Sessão não encontrada.") from exc
    if session.user_id != user.id:
        raise PermissionDeniedError("Sessão pertence a outro usuário.")
    return session


def list_sessions_for_user(*, user) -> QuerySet[InterviewSession]:
    return InterviewSession.objects.filter(user=user)


def list_visible_messages(*, session: InterviewSession) -> QuerySet[ChatMessage]:
    return session.messages.filter(is_visible=True)
