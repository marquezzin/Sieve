"""Queries puras sobre JobPosting / MatchAnalysis. Sem regra de negócio — só
leitura + checagem de dono. Espelha `resumes/selectors.py:get_resume_for_user`.
"""

from django.db.models import QuerySet

from core.errors import NotFoundError, PermissionDeniedError
from matching.models import JobPosting, MatchAnalysis
from resumes.models import ResumeVersion


def get_job_for_user(*, user, job_id) -> JobPosting:
    """JobPosting por id, garantindo que pertence ao usuário.

    404 se não existe; 403 se é de outro usuário (não revela conteúdo alheio).
    """
    try:
        job = JobPosting.objects.get(id=job_id)
    except JobPosting.DoesNotExist as exc:
        raise NotFoundError("Vaga não encontrada.") from exc
    if job.user_id != user.id:
        raise PermissionDeniedError("Vaga pertence a outro usuário.")
    return job


def list_jobs_for_user(*, user) -> QuerySet[JobPosting]:
    return JobPosting.objects.filter(user=user)


def get_match_analysis(*, resume_version: ResumeVersion, job_posting: JobPosting) -> MatchAnalysis | None:
    """MatchAnalysis existente para o par (cache), ou None."""
    return MatchAnalysis.objects.filter(
        resume_version=resume_version,
        job_posting=job_posting,
    ).first()
