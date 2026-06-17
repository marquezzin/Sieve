"""Use case `IngestJobPosting` — descrição crua de vaga → `JobPosting` persistido.

ADR 0002: use case dedicado, sem framework. Chama o LLM (extrator de keywords,
agente "matcher") com UMA submissão estruturada pra extrair keywords, gera o
embedding da descrição via `EmbeddingsClient` e persiste o `JobPosting`.

Dependências injetadas via `__init__` (LLM, embeddings, knowledge) pra testar com
fakes. Modelo override por `settings.LLM_MODEL_KEYWORD_EXTRACTOR`.
"""

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
from matching.models import JobPosting
from matching.prompts.tools import KEYWORDS_TOOL

AGENT_NAME = "matcher"
_MAX_WORDS = 2000
_SYSTEM_INTRO = (
    "Você é um extrator de keywords de vagas para sistemas ATS. Dada a descrição "
    "de uma vaga, identifique as tecnologias, ferramentas, metodologias e hard "
    "skills relevantes que um ATS procuraria, e submeta via a tool "
    "`submit_keywords`. Não invente termos ausentes na vaga."
)


def _truncate_words(text: str, max_words: int = _MAX_WORDS) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words])


class IngestJobPosting:
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

    def execute(self, *, user, title: str, company: str, description: str) -> JobPosting:
        truncated = _truncate_words(description)

        keywords = self._extract_keywords(truncated)
        embedding = self._build_embedding(truncated)

        return JobPosting.objects.create(
            user=user,
            title=title,
            company=company,
            description=description,
            embedding=embedding,
            extracted_keywords=keywords,
        )

    # ─── helpers ──────────────────────────────────────────────────────────────

    def _extract_keywords(self, description: str) -> list[str]:
        try:
            kb = self._knowledge.load_for_agent(AGENT_NAME)
            system = f"{_SYSTEM_INTRO}\n\n{kb}".strip()
            user_content = (
                "Descrição da vaga:\n"
                "```\n"
                f"{description}\n"
                "```\n\n"
                "Extraia as keywords chamando a tool `submit_keywords`."
            )
            result = run_structured_agent(
                client=self._llm,
                system=system,
                user_content=user_content,
                tool=KEYWORDS_TOOL,
            )
        except (LLMError, ApplicationError) as exc:
            logger.exception("IngestJobPosting: extração de keywords falhou")
            raise ApplicationError(f"Falha ao extrair keywords da vaga: {exc}") from exc

        keywords = result.data.get("keywords", [])
        if not isinstance(keywords, list):
            return []
        return [str(k) for k in keywords if str(k).strip()]

    def _build_embedding(self, description: str) -> list[float]:
        try:
            return self._embeddings.embed(description, input_type="document")
        except EmbeddingsError as exc:
            logger.exception("IngestJobPosting: embedding da vaga falhou")
            raise ApplicationError(f"Falha ao gerar embedding da vaga: {exc}") from exc
