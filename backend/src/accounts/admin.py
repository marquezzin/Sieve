from django.contrib import admin

from accounts.models import CandidateProfile


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "headline", "location", "updated_at")
    search_fields = ("user__username", "user__email", "headline")
