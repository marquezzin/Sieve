"""Garante um `CandidateProfile` 1:1 pra todo User recém-criado."""

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import CandidateProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def ensure_candidate_profile(sender, instance, created, **kwargs):
    if created:
        CandidateProfile.objects.get_or_create(user=instance)
