"""Backfill: cria CandidateProfile pros Users que já existiam antes do app
`accounts` (o signal `post_save` só dispara em Users novos)."""

from django.conf import settings
from django.db import migrations


def create_missing_profiles(apps, schema_editor):
    User = apps.get_model(settings.AUTH_USER_MODEL)
    CandidateProfile = apps.get_model("accounts", "CandidateProfile")
    existing = set(CandidateProfile.objects.values_list("user_id", flat=True))
    profiles = [
        CandidateProfile(user_id=user_id)
        for user_id in User.objects.exclude(id__in=existing).values_list("id", flat=True)
    ]
    CandidateProfile.objects.bulk_create(profiles)


def noop_reverse(apps, schema_editor):
    # Reverso: não apaga profiles — dado de usuário não é descartado num downgrade.
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(create_missing_profiles, noop_reverse),
    ]
