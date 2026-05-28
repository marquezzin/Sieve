"""Models da knowledge base.

`KnowledgeDocument` = 1 arquivo `.md` em `knowledge_base/`. Carrega metadata
do frontmatter YAML + texto cru + hash SHA-256 (idempotência do ingest).

`KnowledgeChunk` = pedaço do documento (~300 palavras). Carrega o embedding
vetorial via pgvector e é o que o retrieval semântico consome.

Padrão de uso: o app é alimentado pelo comando `make ingest-knowledge`, não
por CRUD manual. O admin é read-only.
"""
from django.conf import settings
from django.db import models
from pgvector.django import VectorField

from core.models.base import BaseModel


class KnowledgeDocument(BaseModel):
    """Um arquivo `.md` da knowledge base.

    `source_path` é relativo à raiz do repo (ex:
    `knowledge_base/writing/action_verbs.md`) e é único por documento — funciona
    como chave natural pra idempotência do ingest.
    """

    class Priority(models.TextChoices):
        ALWAYS = "always", "Always (full-load no system prompt)"
        RETRIEVE = "retrieve", "Retrieve (top-k via pgvector)"

    source_path = models.CharField(max_length=512, unique=True)
    category = models.CharField(max_length=64)
    agents = models.JSONField(default=list)
    priority = models.CharField(
        max_length=16,
        choices=Priority.choices,
        default=Priority.ALWAYS,
    )
    tags = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    content_md = models.TextField()
    content_hash = models.CharField(max_length=64)

    class Meta:
        ordering = ["category", "source_path"]
        indexes = [
            models.Index(fields=["category"]),
            models.Index(fields=["priority"]),
        ]

    def __str__(self) -> str:
        return self.source_path


class KnowledgeChunk(BaseModel):
    """Pedaço de um `KnowledgeDocument`.

    `ordinal` preserva a ordem original do texto (chunk 0, 1, 2...). Permite
    reconstruir o doc original (`order_by('ordinal')`) e buscar vizinhos pra
    contexto adjacente.

    `embedding` é o vetor de N dimensões (`EMBEDDINGS_DIM`) usado pra busca
    semântica via pgvector. Nunca vai pro LLM — é índice de busca, não payload.
    O LLM recebe o campo `content`.
    """

    document = models.ForeignKey(
        KnowledgeDocument,
        on_delete=models.CASCADE,
        related_name="chunks",
    )
    ordinal = models.PositiveIntegerField()
    content = models.TextField()
    embedding = VectorField(dimensions=settings.EMBEDDINGS_DIM)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["document_id", "ordinal"]
        constraints = [
            models.UniqueConstraint(
                fields=["document", "ordinal"],
                name="uniq_chunk_per_doc_ordinal",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.document.source_path}#{self.ordinal}"
