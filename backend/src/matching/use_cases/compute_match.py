"""Use case `ComputeMatch` — (ResumeVersion, JobPosting) → `MatchAnalysis`.

Calcula a similaridade coseno entre o embedding do currículo e o da vaga (score
0.0–1.0), faz uma análise de gap por embedding de keyword (sinal de sanidade) e
chama o LLM (agente "matcher") pra produzir a saída legível: `matched_skills`,
`missing_skills` (com flag `critical`) e `recommendations`.

Cacheado por par via `unique_together`: segunda chamada sem `refresh=True`
retorna a análise existente sem tocar em LLM/embeddings.

Dependências injetadas via `__init__` pra testar com fakes.
"""

import json
from decimal import Decimal
from typing import Any

from django.conf import settings
from loguru import logger

from agents.use_cases.structured import run_structured_agent
from core.errors import ApplicationError
from integrations.embeddings.base import EmbeddingsError
from integrations.embeddings.factory import get_embeddings_client
from integrations.llm.base import LLMError
from integrations.llm.factory import get_llm_client
from knowledge.services.loader import KnowledgeLoader
from matching.models import JobPosting, MatchAnalysis
from matching.prompts.tools import MATCH_TOOL
from matching.selectors import get_match_analysis
from resumes.models import ResumeVersion

AGENT_NAME = "matcher"
_SYSTEM_INTRO = (
    "Você é um analista de aderência de currículos a vagas (ATS-aware). Compare as "
    "keywords da vaga com o conteúdo real do currículo e submeta a análise via a "
    "tool `submit_match`. Nunca invente experiência que o candidato não tem.\n\n"
    "As RECOMENDAÇÕES são o ENTREGÁVEL PRINCIPAL do produto — capriche. Gere de 3 a "
    "5, cada uma DETALHADA, ESPECÍFICA e personalizada: cite a experiência, projeto "
    "ou tecnologia REAL do candidato pelo nome (ex.: 'na sua experiência no Nubank…') "
    "e diga exatamente o que fazer, onde no currículo e por que importa PARA ESTA "
    "VAGA. Nada de conselho genérico do tipo 'melhore seu currículo'.\n"
    "Cada recomendação tem `title` (ação em uma frase), `detail` (2-4 frases com o "
    "porquê e o como, ancorado no conteúdo real) e `category`:\n"
    "- `realce`: explicitar/renomear experiência REAL com o termo exato da vaga "
    "(ex.: usou Kafka mas escreveu 'mensageria' → recomende nomear 'Kafka').\n"
    "- `enfase`: priorizar/destacar no topo o que já existe e a vaga valoriza.\n"
    "- `gap`: lacuna GENUÍNA — aponte como algo a desenvolver no futuro, com franqueza. "
    "NUNCA mande adicionar, adquirir ou inventar no currículo uma skill que o "
    "candidato não tem. Honestidade acima de aderência."
)


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    """Similaridade coseno entre dois vetores. Retorna 0.0 se algum for nulo/zero."""
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b, strict=True))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(y * y for y in b) ** 0.5
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


def _clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def _resume_skill_text(structured_data: dict) -> str:
    """Texto contextualizado das skills do currículo pra comparar com keywords."""
    skills = structured_data.get("skills") or []
    summary = structured_data.get("summary") or ""
    stacks: list[str] = []
    for exp in structured_data.get("experiences") or []:
        stacks.extend(exp.get("tech_stack") or [])
    all_terms = list(skills) + stacks
    return f"{summary}\nSkills: {', '.join(str(t) for t in all_terms)}".strip()


class ComputeMatch:
    def __init__(
        self,
        *,
        llm_client: Any = None,
        embeddings_client: Any = None,
        knowledge: KnowledgeLoader | None = None,
    ):
        self._llm = llm_client or get_llm_client(model=settings.LLM_MODEL_KEYWORD_EXTRACTOR or None)
        self._embeddings = embeddings_client or get_embeddings_client()
        self._knowledge = knowledge or KnowledgeLoader()

    def execute(
        self,
        *,
        resume_version: ResumeVersion,
        job_posting: JobPosting,
        refresh: bool = False,
    ) -> MatchAnalysis:
        if not refresh:
            cached = get_match_analysis(resume_version=resume_version, job_posting=job_posting)
            if cached is not None:
                return cached

        score = self._compute_score(resume_version, job_posting)
        embedding_gap = self._embedding_gap(resume_version, job_posting)
        match_payload = self._analyze_with_llm(resume_version, job_posting, embedding_gap)

        return self._persist(resume_version, job_posting, score, match_payload)

    # ─── score ────────────────────────────────────────────────────────────────

    # Busca similaridade semantica/vetorial
    def _compute_score(self, resume_version: ResumeVersion, job_posting: JobPosting) -> float:
        resume_vec = list(resume_version.embedding) if resume_version.embedding is not None else []
        job_vec = list(job_posting.embedding) if job_posting.embedding is not None else []
        return _clamp01(_cosine_similarity(resume_vec, job_vec))

    # ─── gap por embedding (sinal de sanidade) ─────────────────────────────────

    def _embedding_gap(self, resume_version: ResumeVersion, job_posting: JobPosting) -> dict:
        """Para cada keyword da vaga, mede a melhor similaridade contra o conteúdo
        do currículo. Keyword com similaridade < ATS_GAP_THRESHOLD = ausente.

        Best-effort: se embeddings falharem, retorna estrutura vazia (o LLM ainda
        produz a análise primária). Nunca derruba o match por isso.
        """
        keywords = [str(k) for k in (job_posting.extracted_keywords or []) if str(k).strip()]
        result = {"likely_missing": [], "likely_matched": []}
        if not keywords:
            return result

        resume_text = _resume_skill_text(resume_version.structured_data or {})
        if not resume_text.strip():
            return result

        try:
            # 2 chamadas no total (currículo + 1 batch de keywords), não N+1 —
            # crítico no free tier do Voyage (3 RPM): uma keyword por chamada
            # estourava o rate limit em qualquer vaga com várias skills.
            resume_vec = self._embeddings.embed(resume_text, input_type="document")
            kw_vecs = self._embeddings.embed_batch(
                [f"skill: {kw}" for kw in keywords], input_type="query"
            )
            for kw, kw_vec in zip(keywords, kw_vecs, strict=True):
                sim = _cosine_similarity(kw_vec, resume_vec)
                if sim < settings.ATS_GAP_THRESHOLD:
                    result["likely_missing"].append(kw)
                else:
                    result["likely_matched"].append(kw)
        except EmbeddingsError as exc:
            logger.warning(f"ComputeMatch gap por embedding falhou (seguindo só com LLM): {exc}")
            return {"likely_missing": [], "likely_matched": []}

        return result

    # ─── análise legível via LLM ───────────────────────────────────────────────

    def _analyze_with_llm(
        self,
        resume_version: ResumeVersion,
        job_posting: JobPosting,
        embedding_gap: dict,
    ) -> dict:
        try:
            kb = self._knowledge.load_for_agent(AGENT_NAME)
            system = f"{_SYSTEM_INTRO}\n\n{kb}".strip()
            user_content = self._build_user_content(resume_version, job_posting, embedding_gap)
            result = run_structured_agent(
                client=self._llm,
                system=system,
                user_content=user_content,
                tool=MATCH_TOOL,
            )
        except (LLMError, ApplicationError) as exc:
            logger.exception("ComputeMatch: análise via LLM falhou")
            raise ApplicationError(f"Falha ao analisar match com a vaga: {exc}") from exc

        return result.data

    def _build_user_content(
        self,
        resume_version: ResumeVersion,
        job_posting: JobPosting,
        embedding_gap: dict,
    ) -> str:
        cv = resume_version.structured_data or {}
        return "\n".join(
            [
                "Keywords extraídas da vaga (JSON):",
                "```json",
                json.dumps(job_posting.extracted_keywords or [], ensure_ascii=False, indent=2),
                "```",
                "",
                "Currículo do candidato (structured_data JSON):",
                "```json",
                json.dumps(cv, ensure_ascii=False, indent=2),
                "```",
                "",
                "Sinal de sanidade por embeddings (referência, não verdade absoluta):",
                "```json",
                json.dumps(embedding_gap, ensure_ascii=False, indent=2),
                "```",
                "",
                "Produza a análise chamando a tool `submit_match`. Considere ausente "
                "apenas keyword que NÃO aparece no conteúdo real do currículo.",
            ]
        )

    # ─── persistência (respeita unique_together) ───────────────────────────────

    def _persist(
        self,
        resume_version: ResumeVersion,
        job_posting: JobPosting,
        score: float,
        match_payload: dict,
    ) -> MatchAnalysis:
        matched = match_payload.get("matched_skills") or []
        missing = match_payload.get("missing_skills") or []
        recommendations = match_payload.get("recommendations") or []

        analysis, _ = MatchAnalysis.objects.update_or_create(
            resume_version=resume_version,
            job_posting=job_posting,
            defaults={
                "score": Decimal(str(round(score, 3))),
                "matched_skills": [str(s) for s in matched],
                "missing_skills": self._normalize_missing(missing),
                "recommendations": self._normalize_recommendations(recommendations),
            },
        )
        return analysis

    @staticmethod
    def _normalize_recommendations(recs: list) -> list[dict]:
        """Recomendação detalhada: `{title, detail, category}`. Tolera string crua
        (modelo antigo) promovendo-a a `detail`."""
        valid_cats = {"realce", "enfase", "gap"}
        normalized: list[dict] = []
        for item in recs:
            if isinstance(item, dict):
                title = str(item.get("title", "")).strip()
                detail = str(item.get("detail", "")).strip()
                category = str(item.get("category", "")).strip().lower()
                if category not in valid_cats:
                    category = ""
                if title or detail:
                    normalized.append({"title": title, "detail": detail, "category": category})
            elif isinstance(item, str) and item.strip():
                normalized.append({"title": "", "detail": item.strip(), "category": ""})
        return normalized

    @staticmethod
    def _normalize_missing(missing: list) -> list[dict]:
        normalized: list[dict] = []
        for item in missing:
            if isinstance(item, dict) and "skill" in item:
                normalized.append(
                    {"skill": str(item["skill"]), "critical": bool(item.get("critical", False))}
                )
            elif isinstance(item, str):
                normalized.append({"skill": item, "critical": False})
        return normalized
