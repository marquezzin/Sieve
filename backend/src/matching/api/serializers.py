from rest_framework import serializers

from matching.models import JobPosting, MatchAnalysis


class JobPostingSerializer(serializers.ModelSerializer):
    """Item de leitura de vaga. NUNCA expõe o embedding (índice interno).

    `top_score` (float 0.0–1.0 ou `null`) é a maior aderência já calculada para a
    vaga — vem da anotação de `list_jobs_for_user`. Em objetos sem a anotação
    (create/detail) sai `null`.
    """

    top_score = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = (
            "id",
            "title",
            "company",
            "description",
            "extracted_keywords",
            "top_score",
            "created_at",
        )
        read_only_fields = fields

    def get_top_score(self, obj: JobPosting) -> float | None:
        raw = getattr(obj, "top_score", None)
        return float(raw) if raw is not None else None


class JobPostingCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    company = serializers.CharField(max_length=200)
    description = serializers.CharField()

    def validate_description(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Descrição da vaga não pode ser vazia.")
        return value


class MatchAnalysisSerializer(serializers.ModelSerializer):
    """Veredito de aderência. `score` é exposto como float 0.0–1.0."""

    resume_version = serializers.UUIDField(source="resume_version_id", read_only=True)
    resume = serializers.UUIDField(source="resume_version.resume_id", read_only=True)
    job_posting = serializers.UUIDField(source="job_posting_id", read_only=True)
    score = serializers.SerializerMethodField()

    class Meta:
        model = MatchAnalysis
        fields = (
            "id",
            "resume_version",
            "resume",
            "job_posting",
            "score",
            "matched_skills",
            "missing_skills",
            "recommendations",
            "created_at",
        )
        read_only_fields = fields

    def get_score(self, obj: MatchAnalysis) -> float:
        return float(obj.score)


class JobPostingDetailSerializer(JobPostingSerializer):
    """Detalhe da vaga + as análises já feitas contra ela (mais recente primeiro).

    Alimenta a página de detalhe da análise no frontend — a lista de vagas é
    enxuta; o detalhe traz o veredito completo.
    """

    analyses = serializers.SerializerMethodField()

    class Meta(JobPostingSerializer.Meta):
        fields = (*JobPostingSerializer.Meta.fields, "analyses")
        read_only_fields = fields

    def get_analyses(self, obj: JobPosting) -> list[dict]:
        analyses = obj.match_analyses.select_related("resume_version").order_by("-id")
        return MatchAnalysisSerializer(analyses, many=True).data
