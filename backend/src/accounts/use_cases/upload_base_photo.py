"""Use case: upload da foto base do candidato.

Recebe um `UploadedFile` (Django), valida tamanho e tipo, salva em
`profile.base_photo` e reseta o estado da foto profissional — uma foto base
nova invalida a profissional gerada anteriormente. Sem import de DRF/HTTP:
validação de input que é regra de domínio levanta `ApplicationError`.
"""

from accounts.models import CandidateProfile
from core.errors import ApplicationError

_MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5MB


class UploadBasePhoto:
    def execute(self, *, profile: CandidateProfile, uploaded_file) -> CandidateProfile:
        if uploaded_file.size > _MAX_SIZE_BYTES:
            raise ApplicationError(
                "A foto deve ter até 5MB.",
                extra={"photo": "A foto deve ter até 5MB."},
            )

        content_type = (uploaded_file.content_type or "").lower()
        if not content_type.startswith("image/"):
            raise ApplicationError(
                "Envie um arquivo de imagem (JPG, PNG ou WEBP).",
                extra={"photo": "Envie um arquivo de imagem (JPG, PNG ou WEBP)."},
            )

        # Nova foto base invalida a profissional anterior: apaga o arquivo antigo
        # (se houver) e zera o campo/estado.
        if profile.professional_photo:
            profile.professional_photo.delete(save=False)
            profile.professional_photo = None

        profile.base_photo = uploaded_file
        profile.photo_status = "idle"
        profile.save()
        return profile
