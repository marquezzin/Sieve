"""Testes do `KnowledgeLoader` — full-load + retrieval via pgvector."""
import pytest

from core.errors import ApplicationError
from knowledge.models import KnowledgeDocument
from knowledge.services.ingest import run_ingest
from knowledge.services.loader import KnowledgeLoader
from knowledge.tests.factories import KnowledgeChunkFactory, KnowledgeDocumentFactory


@pytest.mark.django_db
def test_load_for_agent_concatenates_always_docs(fake_embeddings_client):
    KnowledgeDocumentFactory(
        agents=["writer"],
        priority=KnowledgeDocument.Priority.ALWAYS,
        category="a",
        source_path="knowledge_base/a.md",
        content_md="conteúdo A",
    )
    KnowledgeDocumentFactory(
        agents=["writer"],
        priority=KnowledgeDocument.Priority.ALWAYS,
        category="b",
        source_path="knowledge_base/b.md",
        content_md="conteúdo B",
    )

    loader = KnowledgeLoader(embeddings_client=fake_embeddings_client)
    result = loader.load_for_agent("writer")

    assert "conteúdo A" in result
    assert "conteúdo B" in result
    assert "knowledge_base/a.md" in result
    assert "knowledge_base/b.md" in result
    # Separador entre docs.
    assert "---" in result


@pytest.mark.django_db
def test_load_for_agent_ignores_retrieve_priority_docs(fake_embeddings_client):
    KnowledgeDocumentFactory(
        agents=["writer"],
        priority=KnowledgeDocument.Priority.ALWAYS,
        source_path="knowledge_base/always.md",
        content_md="ALWAYS_MARKER",
    )
    KnowledgeDocumentFactory(
        agents=["writer"],
        priority=KnowledgeDocument.Priority.RETRIEVE,
        source_path="knowledge_base/retrieve.md",
        content_md="RETRIEVE_MARKER",
    )

    loader = KnowledgeLoader(embeddings_client=fake_embeddings_client)
    result = loader.load_for_agent("writer")

    assert "ALWAYS_MARKER" in result
    assert "RETRIEVE_MARKER" not in result


@pytest.mark.django_db
def test_load_for_agent_unknown_agent_returns_empty_string(fake_embeddings_client):
    KnowledgeDocumentFactory(
        agents=["writer"],
        priority=KnowledgeDocument.Priority.ALWAYS,
    )

    loader = KnowledgeLoader(embeddings_client=fake_embeddings_client)
    assert loader.load_for_agent("inexistente") == ""


@pytest.mark.django_db
def test_retrieve_chunks_orders_by_distance_ascending(tmp_knowledge_dir, fake_embeddings_client):
    # Ingere via pipeline real (com fake client) pra ter embeddings consistentes.
    run_ingest(knowledge_dir=tmp_knowledge_dir, embeddings_client=fake_embeddings_client)

    loader = KnowledgeLoader(embeddings_client=fake_embeddings_client)
    results = loader.retrieve_chunks(
        query="exemplos de bullets para backend",
        agents=["writer", "reviewer"],
        k=5,
    )

    assert len(results) >= 1
    # Distâncias monotonicamente crescentes (top-k ordenado).
    distances = [r.distance for r in results]
    assert distances == sorted(distances)
    # similarity = 1 - distance
    for r in results:
        assert abs(r.similarity - (1.0 - r.distance)) < 1e-9


@pytest.mark.django_db
def test_retrieve_chunks_applies_metadata_filter(tmp_knowledge_dir, fake_embeddings_client):
    run_ingest(knowledge_dir=tmp_knowledge_dir, embeddings_client=fake_embeddings_client)

    loader = KnowledgeLoader(embeddings_client=fake_embeddings_client)

    # O doc retrieve tem metadata level=pleno; filtro level=pleno deve retornar
    # chunks; level=junior deve retornar lista vazia.
    pleno = loader.retrieve_chunks(
        query="bullets",
        agents=["writer", "reviewer"],
        k=10,
        filters={"level": "pleno"},
    )
    junior = loader.retrieve_chunks(
        query="bullets",
        agents=["writer", "reviewer"],
        k=10,
        filters={"level": "junior"},
    )

    assert len(pleno) >= 1
    assert junior == []


@pytest.mark.django_db
def test_retrieve_chunks_respects_min_similarity_threshold(tmp_knowledge_dir, fake_embeddings_client):
    run_ingest(knowledge_dir=tmp_knowledge_dir, embeddings_client=fake_embeddings_client)

    loader = KnowledgeLoader(embeddings_client=fake_embeddings_client)

    # Threshold inalcançável — nenhum chunk passa.
    results = loader.retrieve_chunks(
        query="bullets",
        agents=["writer", "reviewer"],
        k=10,
        min_similarity=0.9999999,
    )
    assert results == []

    # Threshold baixo — passa.
    permissive = loader.retrieve_chunks(
        query="bullets",
        agents=["writer", "reviewer"],
        k=10,
        min_similarity=-1.0,
    )
    assert len(permissive) >= 1


@pytest.mark.django_db
def test_retrieve_chunks_empty_query_raises(fake_embeddings_client):
    loader = KnowledgeLoader(embeddings_client=fake_embeddings_client)
    with pytest.raises(ApplicationError):
        loader.retrieve_chunks(query="   ", agents=["writer"])


@pytest.mark.django_db
def test_retrieve_chunks_empty_agents_raises(fake_embeddings_client):
    loader = KnowledgeLoader(embeddings_client=fake_embeddings_client)
    with pytest.raises(ApplicationError):
        loader.retrieve_chunks(query="ok", agents=[])


@pytest.mark.django_db
def test_loader_uses_injected_embeddings_client(fake_embeddings_client):
    # Garante que o construtor aceita injeção e não chama o factory real.
    doc = KnowledgeDocumentFactory(
        agents=["writer"],
        priority=KnowledgeDocument.Priority.RETRIEVE,
    )
    KnowledgeChunkFactory(document=doc)

    loader = KnowledgeLoader(embeddings_client=fake_embeddings_client)
    loader.retrieve_chunks(query="qualquer coisa", agents=["writer"], k=1)

    assert len(fake_embeddings_client.calls) == 1
    assert fake_embeddings_client.calls[0][1] == "query"
