from django.contrib import admin

from matching.models import JobPosting, MatchAnalysis


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "company", "user", "created_at")
    search_fields = ("title", "company", "user__username", "user__email")
    readonly_fields = ("id", "user", "embedding", "extracted_keywords", "created_at", "updated_at")


@admin.register(MatchAnalysis)
class MatchAnalysisAdmin(admin.ModelAdmin):
    list_display = ("id", "resume_version", "job_posting", "score", "created_at")
    search_fields = ("resume_version__resume__id", "job_posting__title")
    readonly_fields = (
        "id",
        "resume_version",
        "job_posting",
        "score",
        "matched_skills",
        "missing_skills",
        "recommendations",
        "created_at",
        "updated_at",
    )
