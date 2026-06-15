from rest_framework import serializers

from resumes.models import Resume, ResumeScore, ResumeVersion


class ResumeScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeScore
        fields = ("overall", "criteria", "feedback")
        read_only_fields = fields


class ResumeVersionSerializer(serializers.ModelSerializer):
    """Versão completa: structured_data + html + score embutido (se houver)."""

    score = serializers.SerializerMethodField()

    class Meta:
        model = ResumeVersion
        fields = (
            "id",
            "version_number",
            "generated_by_agent",
            "structured_data",
            "html_rendered",
            "score",
            "created_at",
        )
        read_only_fields = fields

    def get_score(self, obj: ResumeVersion) -> dict | None:
        score = getattr(obj, "score", None)
        if score is None:
            return None
        return ResumeScoreSerializer(score).data


class ResumeVersionSummarySerializer(serializers.ModelSerializer):
    """Versão resumida (sem html pesado) — pra listas de versões num detalhe."""

    overall = serializers.SerializerMethodField()

    class Meta:
        model = ResumeVersion
        fields = ("id", "version_number", "generated_by_agent", "overall", "created_at")
        read_only_fields = fields

    def get_overall(self, obj: ResumeVersion):
        score = getattr(obj, "score", None)
        return score.overall if score is not None else None


class ResumeSerializer(serializers.ModelSerializer):
    """Item de lista de currículos do usuário."""

    latest_version_number = serializers.SerializerMethodField()
    latest_score = serializers.SerializerMethodField()
    versions_count = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = (
            "id",
            "title",
            "target_role",
            "status",
            "latest_version_number",
            "latest_score",
            "versions_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def _latest_version(self, obj: Resume) -> ResumeVersion | None:
        return obj.versions.order_by("-version_number").first()

    def get_latest_version_number(self, obj: Resume):
        latest = self._latest_version(obj)
        return latest.version_number if latest is not None else None

    def get_latest_score(self, obj: Resume):
        latest = self._latest_version(obj)
        if latest is None:
            return None
        score = getattr(latest, "score", None)
        return score.overall if score is not None else None

    def get_versions_count(self, obj: Resume) -> int:
        return obj.versions.count()


class ResumeDetailSerializer(ResumeSerializer):
    """Detalhe: meta do currículo + última versão completa + lista de versões."""

    latest_version = serializers.SerializerMethodField()
    versions = serializers.SerializerMethodField()

    class Meta(ResumeSerializer.Meta):
        fields = (*ResumeSerializer.Meta.fields, "latest_version", "versions")
        read_only_fields = fields

    def get_latest_version(self, obj: Resume) -> dict | None:
        latest = self._latest_version(obj)
        if latest is None:
            return None
        return ResumeVersionSerializer(latest).data

    def get_versions(self, obj: Resume) -> list:
        versions = obj.versions.order_by("version_number")
        return ResumeVersionSummarySerializer(versions, many=True).data
