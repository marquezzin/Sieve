"""`AgentRun` — log de auditoria de cada chamada de LLM feita por um agente.

Um registro por turn do entrevistador (e, nas próximas fases, redator/revisor/
juiz). Guarda input/output resumidos, usage de tokens e status — visível no admin
pra debug e medição de custo/cache.
"""

from django.db import models

from core.models.base import BaseModel


class AgentRun(BaseModel):
    class Status(models.TextChoices):
        SUCCESS = "success", "Sucesso"
        ERROR = "error", "Erro"

    agent_name = models.CharField(max_length=64)
    session = models.ForeignKey(
        "chat.InterviewSession",
        on_delete=models.CASCADE,
        related_name="agent_runs",
        null=True,
        blank=True,
    )
    input = models.JSONField(default=dict, blank=True)
    output = models.JSONField(default=dict, blank=True)
    usage = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.SUCCESS)
    error = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-id"]

    def __str__(self) -> str:
        return f"AgentRun<{self.agent_name} {self.status}>"
