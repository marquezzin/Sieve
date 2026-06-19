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


def _normalize_url(value: str) -> str:
    """Aceita o domínio puro (ex.: `linkedin.com/in/x`) e prefixa `https://`.

    O usuário digita o link do jeito natural, sem scheme; o `URLField` do DRF
    rejeitaria isso. Normalizamos pra armazenar um URL válido. Vazio segue vazio.
    """
    value = (value or "").strip()
    if value and "://" not in value:
        value = f"https://{value}"
    return value


class CandidateProfileSerializer(serializers.ModelSerializer):
    # Dados do User só pra exibição (avatar/cabeçalho do perfil). `user` em si
    # nunca é editável — quem identifica é o `request.user`.
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.SerializerMethodField()
    base_photo_url = serializers.SerializerMethodField()
    professional_photo_url = serializers.SerializerMethodField()
    # CharField (não URLField) pra aceitar domínio sem scheme; normalizado abaixo.
    linkedin_url = serializers.CharField(
        required=False, allow_blank=True, max_length=200
    )
    github_url = serializers.CharField(
        required=False, allow_blank=True, max_length=200
    )

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

    def validate_linkedin_url(self, value: str) -> str:
        return _normalize_url(value)

    def validate_github_url(self, value: str) -> str:
        return _normalize_url(value)

    def get_base_photo_url(self, obj):
        return obj.base_photo.url if obj.base_photo else None

    def get_professional_photo_url(self, obj):
        return obj.professional_photo.url if obj.professional_photo else None
