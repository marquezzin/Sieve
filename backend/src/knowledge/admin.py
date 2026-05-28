"""Admin read-only — knowledge base é alimentada por `make ingest-knowledge`, não por CRUD manual."""
from django.contrib import admin

from .models import KnowledgeChunk, KnowledgeDocument


@admin.register(KnowledgeDocument)
class KnowledgeDocumentAdmin(admin.ModelAdmin):
    list_display = ("source_path", "category", "priority", "chunk_count", "updated_at")
    list_filter = ("category", "priority")
    search_fields = ("source_path", "category")
    readonly_fields = (
        "id",
        "source_path",
        "category",
        "agents",
        "priority",
        "tags",
        "metadata",
        "content_md",
        "content_hash",
        "created_at",
        "updated_at",
    )
    fields = readonly_fields

    @admin.display(description="chunks")
    def chunk_count(self, obj: KnowledgeDocument) -> int:
        return obj.chunks.count()

    def has_add_permission(self, request) -> bool:
        return False

    def has_delete_permission(self, request, obj=None) -> bool:
        return False


@admin.register(KnowledgeChunk)
class KnowledgeChunkAdmin(admin.ModelAdmin):
    list_display = ("document", "ordinal", "content_preview")
    list_filter = ("document__category", "document__priority")
    search_fields = ("document__source_path", "content")
    readonly_fields = (
        "id",
        "document",
        "ordinal",
        "content",
        "metadata",
        "created_at",
        "updated_at",
    )
    # Não exibir embedding (vetor grande, irrelevante visualmente).
    fields = readonly_fields

    @admin.display(description="content")
    def content_preview(self, obj: KnowledgeChunk) -> str:
        return obj.content[:120] + ("…" if len(obj.content) > 120 else "")

    def has_add_permission(self, request) -> bool:
        return False

    def has_delete_permission(self, request, obj=None) -> bool:
        return False
