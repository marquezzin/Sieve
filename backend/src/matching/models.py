"""Models do matching semântico currículo ↔ vaga.

`JobPosting` é uma descrição de vaga colada pelo usuário, com keywords extraídas
por LLM e um embedding vetorial (pgvector) da descrição. `MatchAnalysis` é o
veredito de aderência de uma `ResumeVersion` a uma `JobPosting` específica:
score 0.000–1.000 (similaridade coseno), skills batidas/ausentes e
recomendações acionáveis. É cacheado por par (`unique_together`) — recalcula só
sob `?refresh=true`.
"""

from django.conf import settings
from django.db import models
from pgvector.django import VectorField

from core.models.base import BaseModel


class JobPosting(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="job_postings",
    )
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    description = models.TextField()
    embedding = VectorField(dimensions=settings.EMBEDDINGS_DIM, null=True, blank=True)
    extracted_keywords = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["-id"]  # UUID v7 é cronológico; evita sort em created_at não-indexado

    def __str__(self) -> str:
        return f"JobPosting<{self.title} @ {self.company}>"


class MatchAnalysis(BaseModel):
    resume_version = models.ForeignKey(
        "resumes.ResumeVersion",
        on_delete=models.CASCADE,
        related_name="match_analyses",
    )
    job_posting = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        related_name="match_analyses",
    )
    # Similaridade coseno em [0.000, 1.000].
    score = models.DecimalField(max_digits=4, decimal_places=3)
    matched_skills = models.JSONField(default=list, blank=True)  # list[str]
    missing_skills = models.JSONField(default=list, blank=True)  # list[{"skill": str, "critical": bool}]
    recommendations = models.JSONField(default=list, blank=True)  # list[str]

    class Meta:
        ordering = ["-id"]  # UUID v7 é cronológico; evita sort em created_at não-indexado
        unique_together = ("resume_version", "job_posting")

    def __str__(self) -> str:
        return f"MatchAnalysis<{self.resume_version_id} ↔ {self.job_posting_id} = {self.score}>"
