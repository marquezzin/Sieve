"""Use case do Agente Juiz — `ResumeVersion` → `ResumeScore`.

LLM-as-a-judge: avalia a versão (a v2 do revisor, no pipeline) segundo a rubrica
formal (full-load via `KnowledgeLoader`), ancorado por exemplos de pontuação
(retrieval, best-effort). O LLM devolve as 6 notas por critério + feedback; a
**média ponderada é computada aqui** (não confiamos no overall do modelo) com os
pesos da rubrica. Marca o `Resume` como `ready` ao fim.
"""

import json
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path
from typing import Any

from django.conf import settings
from django.db import transaction
from loguru import logger

from agents.models import AgentRun
from agents.prompts.resume_tools import SCORE_CRITERIA, SUBMIT_SCORE_TOOL
from agents.use_cases.structured import run_structured_agent
from core.errors import ApplicationError
from integrations.llm.base import LLMError
from integrations.llm.factory import get_llm_client
from knowledge.services.loader import KnowledgeLoader
from resumes.models import Resume, ResumeScore, ResumeVersion

AGENT_NAME = "judge"
_PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "judge_system.md"
_KB_PLACEHOLDER = "{{KNOWLEDGE_BASE}}"

# Pesos da rubrica (`knowledge_base/rubric/full_rubric.md`). Somam 1.0.
RUBRIC_WEIGHTS = {
    "action_verbs": 0.15,
    "metrics": 0.20,
    "cliches": 0.15,
    "specificity": 0.20,
    "conciseness": 0.15,
    "formatting": 0.15,
}


def compute_overall(criteria: dict) -> Decimal:
    """Média ponderada das 6 notas pelos pesos da rubrica, 0.00–10.00."""
    total = sum(RUBRIC_WEIGHTS[k] * float(criteria.get(k, 0) or 0) for k in SCORE_CRITERIA)
    return Decimal(str(total)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


class RunJudge:
    def __init__(self, *, llm_client: Any = None, knowledge: KnowledgeLoader | None = None):
        self._llm = llm_client or get_llm_client(model=settings.LLM_MODEL_JUDGE or None)
        self._knowledge = knowledge or KnowledgeLoader()

    def execute(self, *, version: ResumeVersion) -> ResumeScore:
        resume = version.resume
        session = resume.session

        try:
            system = self._build_system()
            user_content = self._build_user_content(version.structured_data)

            result = run_structured_agent(
                client=self._llm,
                system=system,
                user_content=user_content,
                tool=SUBMIT_SCORE_TOOL,
            )
            criteria = self._normalize_criteria(result.data.get("criteria", {}))
            feedback = result.data.get("feedback", [])
            overall = compute_overall(criteria)

            with transaction.atomic():
                score = ResumeScore.objects.create(
                    resume_version=version,
                    overall=overall,
                    criteria=criteria,
                    feedback=feedback,
                )
                resume.status = Resume.Status.READY
                resume.save(update_fields=["status", "updated_at"])
                AgentRun.objects.create(
                    agent_name=AGENT_NAME,
                    session=session,
                    input={"resume_id": str(resume.id), "version_number": version.version_number},
                    output={"overall": float(overall), "rounds": result.rounds},
                    usage=result.usage,
                    status=AgentRun.Status.SUCCESS,
                )
            return score
        except (LLMError, ApplicationError) as exc:
            self._mark_failed(resume, session, exc)
            raise

    # ─── helpers ──────────────────────────────────────────────────────────────

    def _build_system(self) -> str:
        template = _PROMPT_PATH.read_text(encoding="utf-8")
        kb = self._knowledge.load_for_agent(AGENT_NAME)
        return template.replace(_KB_PLACEHOLDER, kb)

    def _build_user_content(self, structured_data: dict) -> str:
        parts = [
            "Currículo a avaliar (structured_data JSON):",
            "```json",
            json.dumps(structured_data, ensure_ascii=False, indent=2),
            "```",
            "",
            "Avalie segundo a rubrica e submeta as 6 notas + feedback via `submit_score`.",
        ]
        anchors = self._retrieve_anchors(structured_data)
        if anchors:
            parts += ["", "Exemplos de pontuação (âncoras de calibração):", anchors]
        return "\n".join(parts)

    def _retrieve_anchors(self, structured_data: dict) -> str:
        try:
            chunks = self._knowledge.retrieve_chunks(
                query="exemplos de pontuação de currículo segundo a rubrica",
                agents=[AGENT_NAME],
                k=2,
            )
        except Exception as exc:  # noqa: BLE001 — retrieval é best-effort
            logger.warning(f"judge retrieval falhou (seguindo sem âncoras): {exc}")
            return ""
        return "\n\n".join(c.content for c in chunks)

    def _normalize_criteria(self, raw: dict) -> dict:
        """Garante as 6 keys, clamp em [0, 10]. Falta de uma key → 0."""
        out = {}
        for key in SCORE_CRITERIA:
            value = float(raw.get(key, 0) or 0)
            out[key] = max(0.0, min(10.0, value))
        return out

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
