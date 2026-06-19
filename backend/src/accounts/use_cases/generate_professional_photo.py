"""Use case: geração da foto profissional via API externa (headshot).

Lê os bytes da foto base, delega a geração ao `HeadshotClient` (injetável pra
testes) e persiste o PNG resultante em `profile.professional_photo`. Roda dentro
de uma task Celery — em falha, marca `photo_status="failed"` e re-raise o
`HeadshotError` pra a task tratar. Sem import de DRF/HTTP.
"""

from django.core.files.base import ContentFile
from loguru import logger

from accounts.models import CandidateProfile
from core.errors import ApplicationError
from integrations.headshot.base import HeadshotError
from integrations.headshot.factory import get_headshot_client


class GenerateProfessionalPhoto:
    def __init__(self, *, headshot_client=None):
        self._client = headshot_client or get_headshot_client()

    def execute(self, *, profile: CandidateProfile) -> CandidateProfile:
        if not profile.base_photo:
            raise ApplicationError("Envie uma foto base antes de gerar.")

        profile.base_photo.open("rb")
        image_bytes = profile.base_photo.read()
        profile.base_photo.close()

        try:
            png_bytes = self._client.generate(
                image_bytes,
                filename="photo.png",
                content_type="image/png",
            )
        except HeadshotError:
            logger.exception("headshot: falha ao gerar foto profissional (profile={})", profile.id)
            profile.photo_status = "failed"
            profile.save(update_fields=["photo_status", "updated_at"])
            raise

        profile.professional_photo.save(
            f"{profile.id}.png",
            ContentFile(png_bytes),
            save=False,
        )
        profile.photo_status = "ready"
        profile.save()
        return profile
