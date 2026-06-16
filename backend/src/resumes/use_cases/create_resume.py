"""Cria o `Resume` placeholder a partir de uma sessão de entrevista finalizada.

Chamado pelo `finalize` do chat ANTES de disparar o pipeline assíncrono: cria o
registro com `status=generating` pra que o frontend já redirecione e faça polling
enquanto writer/reviewer/judge rodam no Celery.
"""

from chat.models import InterviewSession
from resumes.models import Resume


def _derive_title(collected_data: dict) -> str:
    info = collected_data.get("personal_info") or {}
    name = (info.get("name") or "").strip()
    return f"Currículo de {name}" if name else "Meu currículo"


def _derive_target_role(collected_data: dict) -> str:
    """Melhor esforço: cargo da experiência mais recente (1ª da lista)."""
    experiences = collected_data.get("experiences") or []
    if experiences and isinstance(experiences[0], dict):
        return (experiences[0].get("role") or "").strip()
    return ""


def create_resume_for_session(session: InterviewSession) -> Resume:
    data = session.collected_data or {}
    return Resume.objects.create(
        user=session.user,
        session=session,
        title=_derive_title(data),
        target_role=_derive_target_role(data),
        status=Resume.Status.GENERATING,
    )
