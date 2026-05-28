"""Selectors do app `knowledge` — funções de leitura pura, sem efeito colateral.

Use cases dos agentes consomem via `KnowledgeLoader` (em `services/loader.py`).
Estes selectors são úteis pro admin/API de debug e pra testes.
"""
from django.db.models import Count, QuerySet

from .models import KnowledgeChunk, KnowledgeDocument


def list_documents() -> QuerySet[KnowledgeDocument]:
    """Todos os documentos, ordenados por categoria e source_path."""
    return (
        KnowledgeDocument.objects
        .annotate(chunk_count=Count("chunks"))
        .order_by("category", "source_path")
    )


def list_documents_for_agent(agent: str) -> QuerySet[KnowledgeDocument]:
    return list_documents().filter(agents__contains=[agent])


def count_chunks() -> int:
    return KnowledgeChunk.objects.count()


def count_documents() -> int:
    return KnowledgeDocument.objects.count()
