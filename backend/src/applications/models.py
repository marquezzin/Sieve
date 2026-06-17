"""Model do Kanban de candidaturas.

`Application` é um card no Kanban: a vaga aplicada (opcionalmente ligada a uma
`JobPosting` ingerida e à `ResumeVersion` usada), o estágio no funil (`status`) e
notas livres. FKs pra job/resume são `SET_NULL` — apagar a vaga não apaga o
histórico da candidatura.
"""

from django.conf import settings
from django.db import models

from core.models.base import BaseModel


class Application(BaseModel):
    class Status(models.TextChoices):
        APPLIED = "applied", "Aplicado"
        SCREENING = "screening", "Triagem"
        TECHNICAL_INTERVIEW = "technical_interview", "Entrevista técnica"
        FINAL_INTERVIEW = "final_interview", "Entrevista final"
        OFFER = "offer", "Oferta"
        REJECTED = "rejected", "Rejeitado"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    job_posting = models.ForeignKey(
        "matching.JobPosting",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="applications",
    )
    resume_version = models.ForeignKey(
        "resumes.ResumeVersion",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="applications",
    )
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    link = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    applied_at = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.APPLIED,
    )

    class Meta:
        ordering = ["-id"]  # UUID v7 é cronológico; evita sort em created_at não-indexado

    def __str__(self) -> str:
        return f"Application<{self.position} @ {self.company} [{self.status}]>"
