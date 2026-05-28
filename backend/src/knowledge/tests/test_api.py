"""Testes da API `/api/v1/knowledge/status/` — admin only, envelope padrão."""
import pytest

from knowledge.models import KnowledgeDocument
from knowledge.tests.factories import KnowledgeChunkFactory, KnowledgeDocumentFactory


@pytest.mark.django_db
def test_status_unauthenticated_returns_401(api_client):
    response = api_client.get("/api/v1/knowledge/status/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_status_common_user_returns_403(auth_client):
    response = auth_client.get("/api/v1/knowledge/status/")
    assert response.status_code == 403


@pytest.mark.django_db
def test_status_superuser_returns_envelope_with_documents_and_totals(superuser_client):
    doc = KnowledgeDocumentFactory(
        source_path="knowledge_base/writing/x.md",
        category="writing",
        agents=["writer"],
        priority=KnowledgeDocument.Priority.ALWAYS,
        tags=["bullets"],
        metadata={"level": "junior"},
    )
    KnowledgeChunkFactory.create_batch(3, document=doc)

    response = superuser_client.get("/api/v1/knowledge/status/")
    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True

    data = body["data"]
    assert "documents" in data
    assert "totals" in data
    assert "embeddings" in data

    assert data["totals"]["documents"] == 1
    assert data["totals"]["chunks"] == 3

    assert data["embeddings"]["dim"] == 1024
    assert "provider" in data["embeddings"]
    assert "model" in data["embeddings"]

    assert len(data["documents"]) == 1
    doc_payload = data["documents"][0]
    assert doc_payload["source_path"] == "knowledge_base/writing/x.md"
    assert doc_payload["category"] == "writing"
    assert doc_payload["agents"] == ["writer"]
    assert doc_payload["priority"] == "always"
    assert doc_payload["tags"] == ["bullets"]
    assert doc_payload["metadata"] == {"level": "junior"}
    assert doc_payload["chunk_count"] == 3
    # content_md NÃO deve vazar (pode ser grande).
    assert "content_md" not in doc_payload


@pytest.mark.django_db
def test_status_empty_db_returns_zero_totals(superuser_client):
    response = superuser_client.get("/api/v1/knowledge/status/")
    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    assert body["data"]["totals"]["documents"] == 0
    assert body["data"]["totals"]["chunks"] == 0
    assert body["data"]["documents"] == []
