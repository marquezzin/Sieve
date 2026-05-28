"""Endpoint de debug da knowledge base.

`GET /api/v1/knowledge/status/` — lista todos os docs ingeridos, com hash,
contagem de chunks, metadata. Útil pra verificar ingest, debugar consumo
pelos agentes, e responder "qual versão da knowledge base está rodando?".

Permissão: `IsAdminUser` — não é endpoint público, mas não é segredo de
estado. Quem tem acesso ao admin Django pode ler isto.
"""
from django.conf import settings
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from ..selectors import count_chunks, count_documents, list_documents
from .serializers import KnowledgeDocumentStatusSerializer


class KnowledgeStatusView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        docs = list_documents()
        return Response(
            {
                "embeddings": {
                    "provider": settings.EMBEDDINGS_PROVIDER,
                    "model": settings.EMBEDDINGS_MODEL,
                    "dim": settings.EMBEDDINGS_DIM,
                },
                "totals": {
                    "documents": count_documents(),
                    "chunks": count_chunks(),
                },
                "documents": KnowledgeDocumentStatusSerializer(docs, many=True).data,
            }
        )
