"""Use case do Agente Revisor — `ResumeVersion vN` → `ResumeVersion vN+1` revisada.

Pega a versão do redator e eleva a qualidade (verbos, métricas inferíveis,
remoção de clichês, concisão) SEM inventar fatos. Mesmo shape de `structured_data`
entra e sai. Persiste a nova versão + renderiza HTML + grava `AgentRun`.
"""

import json
from pathlib import Path
from typing import Any

from django.conf import settings
from django.db import transaction

from agents.models import AgentRun
from agents.prompts.resume_tools import build_resume_tool
from agents.use_cases.structured import run_structured_agent
from core.errors import ApplicationError
from integrations.llm.base import LLMError
from integrations.llm.factory import get_llm_client
from knowledge.services.loader import KnowledgeLoader
from resumes.models import Resume, ResumeVersion
from resumes.use_cases.render_to_html import render_structured_data_to_html

AGENT_NAME = "reviewer"
_PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "reviewer_system.md"
_KB_PLACEHOLDER = "{{KNOWLEDGE_BASE}}"
_SUBMIT_DESCRIPTION = (
    "Submete o currículo revisado COMPLETO (mesmo shape recebido). Reescreva para "
    "melhorar, sem inventar fatos novos nem apagar informação verdadeira."
)


class RunReviewer:
    def __init__(self, *, llm_client: Any = None, knowledge: KnowledgeLoader | None = None):
        self._llm = llm_client or get_llm_client(model=settings.LLM_MODEL_REVIEWER or None)
        self._knowledge = knowledge or KnowledgeLoader()

    def execute(self, *, version: ResumeVersion) -> ResumeVersion:
        resume = version.resume
        session = resume.session

        try:
            system = self._build_system()
            user_content = self._build_user_content(version.structured_data)
            tool = build_resume_tool(description=_SUBMIT_DESCRIPTION)

            result = run_structured_agent(
                client=self._llm,
                system=system,
                user_content=user_content,
                tool=tool,
            )
            structured_data = result.data
            html = render_structured_data_to_html(structured_data)
            next_number = version.version_number + 1

            with transaction.atomic():
                new_version = ResumeVersion.objects.create(
                    resume=resume,
                    version_number=next_number,
                    structured_data=structured_data,
                    html_rendered=html,
                    generated_by_agent=AGENT_NAME,
                )
                resume.status = Resume.Status.REVIEWER_DONE
                resume.save(update_fields=["status", "updated_at"])
                AgentRun.objects.create(
                    agent_name=AGENT_NAME,
                    session=session,
                    input={"resume_id": str(resume.id), "from_version": version.version_number},
                    output={"version_number": next_number, "rounds": result.rounds},
                    usage=result.usage,
                    status=AgentRun.Status.SUCCESS,
                )
            return new_version
        except (LLMError, ApplicationError) as exc:
            self._mark_failed(resume, session, exc)
            raise

    # ─── helpers ──────────────────────────────────────────────────────────────

    def _build_system(self) -> str:
        template = _PROMPT_PATH.read_text(encoding="utf-8")
        kb = self._knowledge.load_for_agent(AGENT_NAME)
        return template.replace(_KB_PLACEHOLDER, kb)

    def _build_user_content(self, structured_data: dict) -> str:
        return "\n".join(
            [
                "Currículo atual (structured_data JSON):",
                "```json",
                json.dumps(structured_data, ensure_ascii=False, indent=2),
                "```",
                "",
                "Revise e devolva a versão melhorada COMPLETA via `submit_resume`. "
                "Preserve os mesmos `id`s das entradas que continuam as mesmas.",
            ]
        )

    def _mark_failed(self, resume: Resume, session: Any, exc: Exception) -> None:
        resume.status = Resume.Status.FAILED
        resume.error = str(exc)
        resume.save(update_fields=["status", "error", "updated_at"])
        AgentRun.objects.create(
            agent_name=AGENT_NAME,
            session=session,
            input={"resume_id": str(resume.id)},
            output={},
            usage={},
            status=AgentRun.Status.ERROR,
            error=str(exc),
        )
