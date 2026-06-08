from django.contrib import admin

from chat.models import ChatMessage, InterviewSession


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    can_delete = False
    fields = ("role", "text", "is_visible", "created_at")
    readonly_fields = fields

    def has_add_permission(self, request, obj=None) -> bool:
        return False


@admin.register(InterviewSession)
class InterviewSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "current_phase", "updated_at")
    list_filter = ("status", "current_phase")
    search_fields = ("user__username", "user__email")
    readonly_fields = ("id", "user", "collected_data", "created_at", "updated_at")
    inlines = (ChatMessageInline,)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "role", "is_visible", "created_at")
    list_filter = ("role", "is_visible")
    search_fields = ("session__id",)
    readonly_fields = ("id", "session", "role", "content", "is_visible", "usage", "created_at", "updated_at")
