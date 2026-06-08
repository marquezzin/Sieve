from rest_framework import serializers

from accounts.models import CandidateProfile


class CandidateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = (
            "id",
            "headline",
            "location",
            "phone",
            "linkedin_url",
            "github_url",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
