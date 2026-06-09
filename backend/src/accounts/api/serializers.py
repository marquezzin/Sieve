from rest_framework import serializers

from accounts.models import CandidateProfile


class RegisterSerializer(serializers.Serializer):
    """Valida o input do cadastro público. Criação fica no use case."""

    username = serializers.CharField(max_length=150, trim_whitespace=True)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )


class CandidateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = (
            "id",
            "headline",
            "location",
            "phone",
            "linkedin_url",
            "github_url",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
