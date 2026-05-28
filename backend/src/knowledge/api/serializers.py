from rest_framework import serializers

from ..models import KnowledgeDocument


class KnowledgeDocumentStatusSerializer(serializers.ModelSerializer):
    """Shape pro endpoint de debug — não expõe `content_md` (pode ser grande)."""

    chunk_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = KnowledgeDocument
        fields = (
            "id",
            "source_path",
            "category",
            "agents",
            "priority",
            "tags",
            "metadata",
            "content_hash",
            "chunk_count",
            "updated_at",
        )
