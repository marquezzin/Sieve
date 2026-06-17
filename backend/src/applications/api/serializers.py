from rest_framework import serializers

from applications.models import Application
from matching.models import JobPosting
from resumes.models import ResumeVersion


class ApplicationSerializer(serializers.ModelSerializer):
    """Leitura de um card do Kanban. FKs expostas só pelo id (nullable)."""

    job_posting = serializers.UUIDField(source="job_posting_id", read_only=True)
    resume_version = serializers.UUIDField(source="resume_version_id", read_only=True)

    class Meta:
        model = Application
        fields = (
            "id",
            "company",
            "position",
            "link",
            "notes",
            "applied_at",
            "status",
            "job_posting",
            "resume_version",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Criação/edição de card. `company`/`position` obrigatórios; resto opcional.

    `job_posting_id` / `resume_version_id` são escritos diretamente nas FKs (a
    checagem de ownership fica na view via perform_create + queryset escopado).
    """

    job_posting_id = serializers.UUIDField(required=False, allow_null=True)
    resume_version_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Application
        fields = (
            "company",
            "position",
            "link",
            "notes",
            "applied_at",
            "status",
            "job_posting_id",
            "resume_version_id",
        )

    def validate_job_posting_id(self, value):
        """Só permite ligar a vaga do próprio usuário — evita attach cross-user e
        FK inexistente (que viraria IntegrityError 500)."""
        if value is None:
            return value
        user = self.context["request"].user
        if not JobPosting.objects.filter(id=value, user=user).exists():
            raise serializers.ValidationError("Vaga não encontrada ou de outro usuário.")
        return value

    def validate_resume_version_id(self, value):
        if value is None:
            return value
        user = self.context["request"].user
        if not ResumeVersion.objects.filter(id=value, resume__user=user).exists():
            raise serializers.ValidationError("Versão de currículo não encontrada ou de outro usuário.")
        return value


class ApplicationMoveSerializer(serializers.Serializer):
    """Atualização atômica de estágio no Kanban."""

    status = serializers.ChoiceField(choices=Application.Status.choices)
