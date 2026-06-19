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


class PhotoStatusSerializer(serializers.Serializer):
    """Estado da foto do perfil — consumido pelos endpoints de foto."""

    photo_status = serializers.CharField()
    base_photo_url = serializers.SerializerMethodField()
    professional_photo_url = serializers.SerializerMethodField()

    def get_base_photo_url(self, obj):
        return obj.base_photo.url if obj.base_photo else None

    def get_professional_photo_url(self, obj):
        return obj.professional_photo.url if obj.professional_photo else None


class CandidateProfileSerializer(serializers.ModelSerializer):
    # Dados do User só pra exibição (avatar/cabeçalho do perfil). `user` em si
    # nunca é editável — quem identifica é o `request.user`.
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.SerializerMethodField()
    base_photo_url = serializers.SerializerMethodField()
    professional_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = CandidateProfile
        fields = (
            "id",
            "email",
            "full_name",
            "headline",
            "location",
            "phone",
            "linkedin_url",
            "github_url",
            "photo_status",
            "base_photo_url",
            "professional_photo_url",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "email",
            "full_name",
            "photo_status",
            "base_photo_url",
            "professional_photo_url",
            "created_at",
            "updated_at",
        )

    def get_full_name(self, obj) -> str:
        return obj.user.get_full_name() or obj.user.get_username()

    def get_base_photo_url(self, obj):
        return obj.base_photo.url if obj.base_photo else None

    def get_professional_photo_url(self, obj):
        return obj.professional_photo.url if obj.professional_photo else None
