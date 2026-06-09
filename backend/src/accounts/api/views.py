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
    RegisterSerializer,
)
from accounts.selectors import get_profile_for_user
from accounts.use_cases.register_candidate import RegisterCandidate


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
