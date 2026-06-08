"""Endpoint `/me/` do candidato. Views finas — leitura via selector."""

from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.api.serializers import CandidateProfileSerializer
from accounts.selectors import get_profile_for_user


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
