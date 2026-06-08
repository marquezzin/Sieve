from django.contrib import admin

from agents.models import AgentRun


@admin.register(AgentRun)
class AgentRunAdmin(admin.ModelAdmin):
    list_display = ("id", "agent_name", "session", "status", "created_at")
    list_filter = ("agent_name", "status")
    search_fields = ("session__id",)
    readonly_fields = (
        "id",
        "agent_name",
        "session",
        "input",
        "output",
        "usage",
        "status",
        "error",
        "created_at",
        "updated_at",
    )

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False
