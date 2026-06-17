"""Views do Kanban de candidaturas. Tudo escopado ao request.user via
`get_queryset` (isolamento de usuário). Views finas: validam via serializer,
delegam persistência ao ORM. CRUD padrão + action `move`.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from applications.api.serializers import (
    ApplicationCreateSerializer,
    ApplicationMoveSerializer,
    ApplicationSerializer,
)
from applications.models import Application


class ApplicationViewSet(viewsets.ModelViewSet):
    """CRUD de candidaturas do usuário autenticado + `move` (muda status)."""

    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return ApplicationCreateSerializer
        return ApplicationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(ApplicationSerializer(serializer.instance).data, status=201)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ApplicationSerializer(serializer.instance).data)

    @action(detail=True, methods=["patch"], url_path="move")
    def move(self, request, pk=None):
        application = self.get_object()
        serializer = ApplicationMoveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application.status = serializer.validated_data["status"]
        application.save(update_fields=["status", "updated_at"])
        return Response(ApplicationSerializer(application).data)
