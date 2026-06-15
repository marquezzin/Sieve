from django.contrib import admin

from resumes.models import Resume, ResumeScore, ResumeVersion


class ResumeVersionInline(admin.TabularInline):
    model = ResumeVersion
    extra = 0
    can_delete = False
    fields = ("version_number", "generated_by_agent", "created_at")
    readonly_fields = fields
    ordering = ("version_number",)
    show_change_link = True

    def has_add_permission(self, request, obj=None) -> bool:
        return False


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "target_role", "status", "updated_at")
    list_filter = ("status",)
    search_fields = ("title", "user__username", "user__email", "target_role")
    readonly_fields = ("id", "user", "session", "created_at", "updated_at")
    inlines = (ResumeVersionInline,)


class ResumeScoreInline(admin.StackedInline):
    model = ResumeScore
    extra = 0
    can_delete = False
    fields = ("overall", "criteria", "feedback")
    readonly_fields = fields

    def has_add_permission(self, request, obj=None) -> bool:
        return False


@admin.register(ResumeVersion)
class ResumeVersionAdmin(admin.ModelAdmin):
    list_display = ("id", "resume", "version_number", "generated_by_agent", "created_at")
    list_filter = ("generated_by_agent",)
    search_fields = ("resume__id", "resume__title")
    readonly_fields = (
        "id",
        "resume",
        "version_number",
        "generated_by_agent",
        "structured_data",
        "html_rendered",
        "created_at",
        "updated_at",
    )
    inlines = (ResumeScoreInline,)


@admin.register(ResumeScore)
class ResumeScoreAdmin(admin.ModelAdmin):
    list_display = ("id", "resume_version", "overall")
    search_fields = ("resume_version__resume__id",)
    readonly_fields = ("id", "resume_version", "overall", "criteria", "feedback", "created_at", "updated_at")
