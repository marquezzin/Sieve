"""Modelo `CandidateProfile` — perfil 1:1 do candidato (User).

Cadastro básico do candidato (headline, location, contatos, links). Criado
automaticamente por signal quando um User nasce. Sem lógica de currículo aqui
— isso é escopo da Fase 2. Sem método de domínio no model — fica em selector
ou use case.
"""

from django.conf import settings
from django.db import models

from core.models.base import BaseModel


class CandidateProfile(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="candidate_profile",
    )
    headline = models.CharField(max_length=200, blank=True, default="")
    location = models.CharField(max_length=120, blank=True, default="")
    phone = models.CharField(max_length=32, blank=True, default="")
    linkedin_url = models.URLField(blank=True, default="")
    github_url = models.URLField(blank=True, default="")

    def __str__(self) -> str:
        return f"Profile<{self.user}>"
