"""Models do chat conversacional: sessão de entrevista + mensagens.

`InterviewSession` é a conversa do candidato com o agente entrevistador; mantém
`current_phase` (avança via tool `mark_phase_complete`) e `collected_data` (JSON
populado pelas tools `record_*`). `ChatMessage` guarda os turns conversacionais
(user/assistant) em blocos estilo Anthropic; o rastro de tool_use intermediário
não vira mensagem — fica no `AgentRun` (app `agents`).
"""

from django.conf import settings
from django.db import models

from core.models.base import BaseModel


class InterviewSession(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Ativa"
        COMPLETED = "completed", "Concluída"

    class Phase(models.TextChoices):
        INTRO = "intro", "Introdução"
        PERSONAL_INFO = "personal_info", "Dados pessoais"
        EDUCATION = "education", "Educação"
        EXPERIENCE = "experience", "Experiência"
        PROJECTS = "projects", "Projetos"
        SKILLS = "skills", "Habilidades"
        REVIEW = "review", "Revisão"
        DONE = "done", "Finalizado"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="interview_sessions",
    )
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    current_phase = models.CharField(max_length=20, choices=Phase.choices, default=Phase.INTRO)
    collected_data = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-id"]

    def __str__(self) -> str:
        return f"Session<{self.user} {self.status}/{self.current_phase}>"


class ChatMessage(BaseModel):
    class Role(models.TextChoices):
        USER = "user", "Usuário"
        ASSISTANT = "assistant", "Assistente"

    session = models.ForeignKey(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(max_length=16, choices=Role.choices)
    # Blocos de content estilo Anthropic, ex: [{"type": "text", "text": "..."}].
    content = models.JSONField(default=list)
    # Falso pro kickoff inicial (gatilho do 1º turn) — fica no histórico do LLM
    # mas não aparece pro usuário.
    is_visible = models.BooleanField(default=True)
    # Usage agregado do turn (input/output/cache tokens) — só em mensagens do assistant.
    usage = models.JSONField(default=dict, blank=True)

    class Meta:
        # Ordem cronológica (UUID v7 já é monotônico) — histórico de chat lê asc.
        ordering = ["id"]

    def __str__(self) -> str:
        return f"Msg<{self.role} session={self.session_id}>"

    @property
    def text(self) -> str:
        """Concatena os blocos de texto do content."""
        return "".join(
            block.get("text", "") for block in self.content if isinstance(block, dict) and block.get("type") == "text"
        )
