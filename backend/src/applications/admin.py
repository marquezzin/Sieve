from django.contrib import admin

from applications.models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("id", "position", "company", "user", "status", "applied_at", "updated_at")
    list_filter = ("status",)
    search_fields = ("position", "company", "user__username", "user__email")
    readonly_fields = ("id", "user", "created_at", "updated_at")
