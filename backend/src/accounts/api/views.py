"""Endpoints do candidato: cadastro público (`/register/`) + `/me/`.

Views finas — leitura via selector, escrita via use case.
"""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.api.serializers import (
    CandidateProfileSerializer,
    PhotoStatusSerializer,
    RegisterSerializer,
)
from accounts.selectors import get_profile_for_user
from accounts.use_cases.register_candidate import RegisterCandidate
from accounts.use_cases.upload_base_photo import UploadBasePhoto
from core.errors import ApplicationError


class RegisterView(APIView):
    """Cadastro público. Cria o usuário e já devolve o par de tokens JWT,
    pra o frontend autenticar sem um segundo round-trip no /token/."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = RegisterCandidate().execute(**serializer.validated_data)

        refresh = RefreshToken.for_user(user)
        return Response(
            {"access": str(refresh.access_token), "refresh": str(refresh)},
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    def get(self, request):
        profile = get_profile_for_user(user=request.user)
        return Response(CandidateProfileSerializer(profile).data)

    def patch(self, request):
        profile = get_profile_for_user(user=request.user)
        serializer = CandidateProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PhotoUploadView(APIView):
    """Upload da foto base do candidato (multipart, campo `photo`)."""

    def post(self, request):
        uploaded_file = request.FILES.get("photo")
        if uploaded_file is None:
            raise ApplicationError(
                "Nenhum arquivo enviado.",
                extra={"photo": "Nenhum arquivo enviado."},
            )
        profile = UploadBasePhoto().execute(
            profile=get_profile_for_user(user=request.user),
            uploaded_file=uploaded_file,
        )
        return Response(PhotoStatusSerializer(profile).data)


class PhotoGenerateView(APIView):
    """Dispara a geração assíncrona da foto profissional (task Celery)."""

    def post(self, request):
        profile = get_profile_for_user(user=request.user)
        if not profile.base_photo:
            raise ApplicationError(
                "Envie uma foto base antes de gerar.",
                extra={"photo": "Envie uma foto base antes de gerar."},
            )
        profile.photo_status = "generating"
        profile.save(update_fields=["photo_status", "updated_at"])

        # Import tardio: `accounts/tasks.py` é criado pelo agente
        # celery-orchestration; lazy import evita quebra no boot se ainda não existir.
        from accounts.tasks import generate_professional_photo_task

        generate_professional_photo_task.delay(str(profile.id))
        return Response(
            PhotoStatusSerializer(profile).data,
            status=status.HTTP_202_ACCEPTED,
        )


class PhotoStatusView(APIView):
    """Estado atual da foto do perfil (polling pelo frontend)."""

    def get(self, request):
        profile = get_profile_for_user(user=request.user)
        return Response(PhotoStatusSerializer(profile).data)
