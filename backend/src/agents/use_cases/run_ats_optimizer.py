"""Use case do Agente Otimizador ATS — `ResumeVersion` + `JobPosting` → nova
`ResumeVersion` reescrita para a vaga (ATS-aware).

Diferente do revisor (que melhora qualidade geral), o otimizador reescreve o
currículo enfatizando as keywords da vaga **sem inventar experiência**. Esse
guardrail anti-fabricação é o núcleo defensável do produto, então é garantido em
DOIS níveis:

1. **Prompt** (`ats_optimizer_system.md` + knowledge base `ats/do_not_fabricate`):
   instrui o LLM a nunca inventar empregador, cargo, período, instituição ou
   tecnologia não vivida.
2. **Validação post-hoc** (`_assert_no_fabrication`): depois da resposta do LLM,
   compara os conjuntos de identidade (empresas, cargos, instituições) e as
   contagens de experiências/formações entre entrada e saída. Se algo foi
   fabricado, lança `ApplicationError` e **não persiste** — fail-closed.
"""

import json
import re
from pathlib import Path
from typing import Any

from django.conf import settings
from django.db import transaction
from django.db.models import Max

from agents.models import AgentRun
from agents.prompts.resume_tools import build_resume_tool
from agents.use_cases.structured import run_structured_agent
from core.errors import ApplicationError
from integrations.llm.base import LLMError
from integrations.llm.factory import get_llm_client
from knowledge.services.loader import KnowledgeLoader
from matching.models import JobPosting
from resumes.models import Resume, ResumeVersion
from resumes.use_cases.render_to_html import render_structured_data_to_html

AGENT_NAME = "ats_optimizer"
_PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "ats_optimizer_system.md"
_KB_PLACEHOLDER = "{{KNOWLEDGE_BASE}}"
_MAX_JD_WORDS = 1500
_SUBMIT_DESCRIPTION = (
    "Submete o currículo otimizado para a vaga COMPLETO (mesmo shape recebido). "
    "Use o vocabulário da vaga apenas onde for verdade; nunca invente empresa, "
    "cargo, período, instituição ou tecnologia que o candidato não viveu."
)


def _norm(value: Any) -> str:
    """Normaliza texto pra comparação de identidade: minúsculo, espaços colapsados."""
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def _identity(data: dict) -> dict:
    """Conjuntos de identidade factual do currículo — o que NÃO pode ser fabricado."""
    experiences = data.get("experiences") or []
    education = data.get("education") or []
    return {
        "companies": {_norm(e.get("company")) for e in experiences if _norm(e.get("company"))},
        "roles": {_norm(e.get("role")) for e in experiences if _norm(e.get("role"))},
        "institutions": {_norm(ed.get("institution")) for ed in education if _norm(ed.get("institution"))},
        "experience_count": len(experiences),
        "education_count": len(education),
    }


class RunAtsOptimizer:
    def __init__(self, *, llm_client: Any = None, knowledge: KnowledgeLoader | None = None):
        self._llm = llm_client or get_llm_client(model=settings.LLM_MODEL_ATS_OPTIMIZER or None)
        self._knowledge = knowledge or KnowledgeLoader()

    def execute(self, *, version: ResumeVersion, job_posting: JobPosting) -> ResumeVersion:
        resume = version.resume
        session = resume.session
        original = version.structured_data or {}

        try:
            # Sinaliza re-geração pra UI (o juiz volta pra READY ao fim do chain).
            resume.status = Resume.Status.GENERATING
            resume.save(update_fields=["status", "updated_at"])

            system = self._build_system(job_posting)
            user_content = self._build_user_content(original, job_posting)
            tool = build_resume_tool(description=_SUBMIT_DESCRIPTION)

            result = run_structured_agent(
                client=self._llm,
                system=system,
                user_content=user_content,
                tool=tool,
            )
            optimized = result.data

            # Guardrail post-hoc: fail-closed se inventou identidade factual.
            self._assert_no_fabrication(original, optimized)

            html = render_structured_data_to_html(optimized)
            next_number = (
                resume.versions.aggregate(m=Max("version_number"))["m"] or version.version_number
            ) + 1

            with transaction.atomic():
                new_version = ResumeVersion.objects.create(
                    resume=resume,
                    version_number=next_number,
                    structured_data=optimized,
                    html_rendered=html,
                    generated_by_agent=AGENT_NAME,
                )
                AgentRun.objects.create(
                    agent_name=AGENT_NAME,
                    session=session,
                    input={
                        "resume_id": str(resume.id),
                        "from_version": version.version_number,
                        "job_posting_id": str(job_posting.id),
                    },
                    output={"version_number": next_number, "rounds": result.rounds},
                    usage=result.usage,
                    status=AgentRun.Status.SUCCESS,
                )
            return new_version
        except (LLMError, ApplicationError) as exc:
            self._mark_failed(resume, session, exc)
            raise

    # ─── guardrail ──────────────────────────────────────────────────────────────

    def _assert_no_fabrication(self, original: dict, optimized: dict) -> None:
        before = _identity(original)
        after = _identity(optimized)

        fabricated_companies = after["companies"] - before["companies"]
        fabricated_roles = after["roles"] - before["roles"]
        fabricated_institutions = after["institutions"] - before["institutions"]
        added_experiences = after["experience_count"] > before["experience_count"]
        added_education = after["education_count"] > before["education_count"]

        problems: list[str] = []
        if fabricated_companies:
            problems.append(f"empresas inventadas: {sorted(fabricated_companies)}")
        if fabricated_roles:
            problems.append(f"cargos inventados: {sorted(fabricated_roles)}")
        if fabricated_institutions:
            problems.append(f"instituições inventadas: {sorted(fabricated_institutions)}")
        if added_experiences:
            problems.append(
                f"experiências a mais ({before['experience_count']} → {after['experience_count']})"
            )
        if added_education:
            problems.append(
                f"formações a mais ({before['education_count']} → {after['education_count']})"
            )

        if problems:
            raise ApplicationError(
                "Otimização ATS rejeitada por fabricação de conteúdo: " + "; ".join(problems)
            )

    # ─── helpers ──────────────────────────────────────────────────────────────

    def _build_system(self, job_posting: JobPosting) -> str:
        template = _PROMPT_PATH.read_text(encoding="utf-8")
        kb = self._knowledge.load_for_agent(AGENT_NAME)
        job_block = self._job_block(job_posting)
        return template.replace(_KB_PLACEHOLDER, f"{job_block}\n\n{kb}".strip())

    def _job_block(self, job_posting: JobPosting) -> str:
        keywords = job_posting.extracted_keywords or []
        description = " ".join((job_posting.description or "").split()[:_MAX_JD_WORDS])
        return "\n".join(
            [
                "### Vaga-alvo",
                f"- Título: {job_posting.title}",
                f"- Empresa: {job_posting.company}",
                f"- Keywords (priorize estas, quando verdadeiras): {', '.join(keywords)}",
                "",
                "Descrição da vaga:",
                "```",
                description,
                "```",
            ]
        )

    def _build_user_content(self, structured_data: dict, job_posting: JobPosting) -> str:
        return "\n".join(
            [
                "Currículo atual (structured_data JSON):",
                "```json",
                json.dumps(structured_data, ensure_ascii=False, indent=2),
                "```",
                "",
                "Otimize para a vaga-alvo descrita no system e devolva a versão "
                "COMPLETA via `submit_resume`. Preserve os `id`s e nunca invente "
                "empresa, cargo, período, instituição ou tecnologia não vivida.",
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
