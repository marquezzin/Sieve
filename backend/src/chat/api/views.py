"""Views finas do chat. Lógica de conversa fica no use case `RunInterviewerTurn`."""

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from agents.use_cases.run_interviewer_turn import RunInterviewerTurn
from chat.api.serializers import (
    MessageSerializer,
    SendMessageSerializer,
    SessionSerializer,
)
from chat.models import InterviewSession
from chat.selectors import (
    get_session_for_user,
    list_sessions_for_user,
    list_visible_messages,
)
from core.api.pagination import StandardPagination


class SessionViewSet(viewsets.ViewSet):
    """Cria/lê/finaliza sessões de entrevista. Sempre escopadas ao request.user."""

    def list(self, request):
        sessions = list_sessions_for_user(user=request.user)
        return Response(SessionSerializer(sessions, many=True).data)

    def retrieve(self, request, pk=None):
        session = get_session_for_user(user=request.user, session_id=pk)
        return Response(SessionSerializer(session).data)

    def create(self, request):
        session = InterviewSession.objects.create(user=request.user)
        # Primeiro turn: o entrevistador se apresenta e abre a coleta.
        RunInterviewerTurn().execute(session=session, user_text=None)
        session.refresh_from_db()
        return Response(SessionSerializer(session).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def finalize(self, request, pk=None):
        session = get_session_for_user(user=request.user, session_id=pk)
        session.status = InterviewSession.Status.COMPLETED
        session.current_phase = InterviewSession.Phase.DONE
        session.save(update_fields=["status", "current_phase", "updated_at"])
        return Response(SessionSerializer(session).data)


class MessagesView(APIView):
    """GET lista mensagens visíveis (paginado); POST envia uma e devolve a resposta."""

    def get(self, request, session_id):
        session = get_session_for_user(user=request.user, session_id=session_id)
        paginator = StandardPagination()
        page = paginator.paginate_queryset(list_visible_messages(session=session), request, view=self)
        data = MessageSerializer(page, many=True).data
        return paginator.get_paginated_response(data)

    def post(self, request, session_id):
        session = get_session_for_user(user=request.user, session_id=session_id)
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assistant_msg = RunInterviewerTurn().execute(session=session, user_text=serializer.validated_data["text"])
        return Response(MessageSerializer(assistant_msg).data, status=status.HTTP_201_CREATED)
