"""Use case do Agente Redator — `collected_data` da entrevista → `ResumeVersion v1`.

ADR 0002: agente = use case dedicado, sem framework. Monta o system prompt
(persona + knowledge base full-load via `KnowledgeLoader`), injeta exemplos
canônicos por retrieval (best-effort), roda UMA submissão estruturada
(`run_structured_agent`) e persiste a v1 + renderiza o HTML. Cada execução vira
um `AgentRun` de auditoria.

Dependências injetadas via `__init__` (LLM client, knowledge loader) pra testar
com fakes. O modelo é o mesmo do entrevistador (OpenAI por default); override por
agente via `settings.LLM_MODEL_WRITER`.
"""

import json
from pathlib import Path
from typing import Any

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from loguru import logger

from agents.models import AgentRun
from agents.prompts.resume_tools import build_resume_tool
from agents.use_cases.structured import run_structured_agent
from core.errors import ApplicationError
from integrations.llm.base import LLMError
from integrations.llm.factory import get_llm_client
from knowledge.services.loader import KnowledgeLoader
from resumes.models import Resume, ResumeVersion
from resumes.use_cases.render_to_html import render_structured_data_to_html

AGENT_NAME = "writer"
_PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "writer_system.md"
_KB_PLACEHOLDER = "{{KNOWLEDGE_BASE}}"
_DATE_PLACEHOLDER = "{{CURRENT_DATE}}"
_SUBMIT_DESCRIPTION = (
    "Submete o currículo estruturado completo, derivado SOMENTE dos dados da "
    "entrevista. Não invente fatos."
)


class RunWriter:
    def __init__(self, *, llm_client: Any = None, knowledge: KnowledgeLoader | None = None):
        self._llm = llm_client or get_llm_client(model=settings.LLM_MODEL_WRITER or None)
        self._knowledge = knowledge or KnowledgeLoader()

    def execute(self, *, resume: Resume) -> ResumeVersion:
        session = resume.session
        collected_data = session.collected_data if session else {}

        try:
            system = self._build_system()
            user_content = self._build_user_content(resume, collected_data)
            tool = build_resume_tool(description=_SUBMIT_DESCRIPTION)

            result = run_structured_agent(
                client=self._llm,
                system=system,
                user_content=user_content,
                tool=tool,
            )
            structured_data = result.data
            html = render_structured_data_to_html(structured_data)

            with transaction.atomic():
                version = ResumeVersion.objects.create(
                    resume=resume,
                    version_number=1,
                    structured_data=structured_data,
                    html_rendered=html,
                    generated_by_agent=AGENT_NAME,
                )
                resume.status = Resume.Status.WRITER_DONE
                resume.save(update_fields=["status", "updated_at"])
                AgentRun.objects.create(
                    agent_name=AGENT_NAME,
                    session=session,
                    input={"resume_id": str(resume.id)},
                    output={"version_number": 1, "rounds": result.rounds},
                    usage=result.usage,
                    status=AgentRun.Status.SUCCESS,
                )
            return version
        except (LLMError, ApplicationError) as exc:
            self._mark_failed(resume, session, exc)
            raise

    # ─── helpers ──────────────────────────────────────────────────────────────

    def _build_system(self) -> str:
        template = _PROMPT_PATH.read_text(encoding="utf-8")
        kb = self._knowledge.load_for_agent(AGENT_NAME)
        today = timezone.localdate().strftime("%d/%m/%Y")
        return template.replace(_KB_PLACEHOLDER, kb).replace(_DATE_PLACEHOLDER, today)

    def _build_user_content(self, resume: Resume, collected_data: dict) -> str:
        parts = [
            "Dados coletados na entrevista (JSON):",
            "```json",
            json.dumps(collected_data, ensure_ascii=False, indent=2),
            "```",
            "",
            "Produza o currículo estruturado chamando a tool `submit_resume`. "
            "Use SOMENTE informação presente nos dados acima.",
        ]
        examples = self._retrieve_examples(resume)
        if examples:
            parts += ["", "Exemplos de currículos canônicos (referência de estilo, NÃO copie fatos):", examples]
        return "\n".join(parts)

    def _retrieve_examples(self, resume: Resume) -> str:
        """Few-shot por retrieval (best-effort). Falha de embeddings não derruba
        o pipeline — só perde o exemplo."""
        target_role = (resume.target_role or "").strip()
        query = f"currículo modelo para {target_role}" if target_role else "currículo modelo de tecnologia"
        filters = {"target_role": target_role} if target_role else None
        try:
            chunks = self._knowledge.retrieve_chunks(
                query=query, agents=[AGENT_NAME], k=2, filters=filters
            )
        except Exception as exc:  # noqa: BLE001 — retrieval é best-effort
            logger.warning(f"writer retrieval falhou (seguindo sem exemplos): {exc}")
            return ""
        return "\n\n".join(c.content for c in chunks)

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
