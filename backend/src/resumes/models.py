"""Models do currículo gerado: Resume + ResumeVersion + ResumeScore.

`Resume` é o currículo de um candidato, originado (opcionalmente) de uma
`chat.InterviewSession`. Cada passo do pipeline multi-agente (writer → reviewer)
emite um `ResumeVersion` imutável com `structured_data` (schema documentado em
`resumes/CLAUDE.md`) e o HTML ATS-safe renderizado. `ResumeScore` é o veredito
do agente juiz sobre uma versão específica (1:1 com a versão).
"""

from django.conf import settings
from django.db import models

from core.models.base import BaseModel


class Resume(BaseModel):
    class Status(models.TextChoices):
        GENERATING = "generating", "Gerando"
        WRITER_DONE = "writer_done", "Writer concluído"
        REVIEWER_DONE = "reviewer_done", "Reviewer concluído"
        READY = "ready", "Pronto"
        FAILED = "failed", "Falhou"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resumes",
    )
    session = models.ForeignKey(
        "chat.InterviewSession",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resumes",
    )
    title = models.CharField(max_length=200)
    target_role = models.CharField(max_length=120, blank=True, default="")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.GENERATING)
    error = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-id"]

    def __str__(self) -> str:
        return f"Resume<{self.title} {self.status}>"


class ResumeVersion(BaseModel):
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="versions",
    )
    version_number = models.PositiveIntegerField()
    structured_data = models.JSONField(default=dict, blank=True)
    html_rendered = models.TextField(blank=True, default="")
    generated_by_agent = models.CharField(max_length=32)  # "writer" | "reviewer"

    class Meta:
        unique_together = ("resume", "version_number")
        ordering = ["resume_id", "version_number"]

    def __str__(self) -> str:
        return f"ResumeVersion<{self.resume_id} v{self.version_number}>"


class ResumeScore(BaseModel):
    resume_version = models.OneToOneField(
        ResumeVersion,
        on_delete=models.CASCADE,
        related_name="score",
    )
    overall = models.DecimalField(max_digits=4, decimal_places=2)  # 0.00–10.00
    criteria = models.JSONField(default=dict)
    feedback = models.JSONField(default=list)

    class Meta:
        ordering = ["-id"]

    def __str__(self) -> str:
        return f"ResumeScore<{self.resume_version_id} {self.overall}>"
