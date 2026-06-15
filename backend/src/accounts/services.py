"""Serviços de escrita do `CandidateProfile`.

`accounts` é dono da mutação do perfil — outros apps (ex.: `agents`) pedem a
sincronização por aqui, em vez de tocar no model direto.
"""

from accounts.models import CandidateProfile

# Campos do `record_personal_info` do entrevistador que espelham o perfil.
# Headline e os dados em massa (experiências/educação/projetos/skills) NÃO entram
# aqui — seguem no `collected_data` da sessão até a Fase 2.
_PROFILE_FIELDS = ("location", "phone", "linkedin_url", "github_url")


def sync_profile_from_personal_info(*, user, personal_info: dict) -> None:
    """Espelha no `CandidateProfile`/`User` os dados de contato da entrevista.

    - Campos do perfil (`_PROFILE_FIELDS`): só sobrescreve com valores não-vazios.
    - `name`: preenche `first_name`/`last_name` do User **só se ainda não houver
      nome** (não clobbera um nome já definido).
    - `email`: NUNCA é sincronizado — é identidade de login (única, usada no auth).
      Fica só no `collected_data` da sessão.

    No-op nas partes sem dado novo.
    """
    updates = {
        field: personal_info[field]
        for field in _PROFILE_FIELDS
        if personal_info.get(field) not in (None, "")
    }
    if updates:
        profile = CandidateProfile.objects.filter(user=user).first()
        if profile is not None:
            for field, value in updates.items():
                setattr(profile, field, value)
            profile.save(update_fields=[*updates, "updated_at"])

    name = (personal_info.get("name") or "").strip()
    if name and not user.get_full_name():
        first, _, last = name.partition(" ")
        user.first_name = first
        user.last_name = last
        user.save(update_fields=["first_name", "last_name"])
