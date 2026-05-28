"""Testes do `run_ingest` — pipeline completo com FakeEmbeddingsClient injetado."""
import pytest

from knowledge.models import KnowledgeChunk, KnowledgeDocument
from knowledge.services.ingest import run_ingest


@pytest.mark.django_db
def test_run_ingest_on_missing_dir_returns_empty_report(tmp_path, fake_embeddings_client):
    missing = tmp_path / "does_not_exist"
    report = run_ingest(knowledge_dir=missing, embeddings_client=fake_embeddings_client)

    assert report.discovered == 0
    assert report.new == 0
    assert report.updated == 0
    assert report.unchanged == 0
    assert report.skipped == 0
    assert report.errors == 0
    assert report.deleted == 0


@pytest.mark.django_db
def test_run_ingest_creates_new_documents_and_chunks(tmp_knowledge_dir, fake_embeddings_client):
    report = run_ingest(
        knowledge_dir=tmp_knowledge_dir,
        embeddings_client=fake_embeddings_client,
    )

    # 3 arquivos descobertos: 2 com frontmatter + 1 README sem.
    assert report.discovered == 3
    assert report.new == 2
    assert report.skipped == 1
    assert report.errors == 0
    assert report.deleted == 0

    assert KnowledgeDocument.objects.count() == 2
    assert KnowledgeChunk.objects.count() > 0

    # Embeddings foi chamado pelo menos 1x por doc (batched).
    assert len(fake_embeddings_client.calls) >= 2
    # Todos os calls são do tipo "document".
    assert all(call[1] == "document" for call in fake_embeddings_client.calls)


@pytest.mark.django_db
def test_run_ingest_is_idempotent(tmp_knowledge_dir, fake_embeddings_client):
    run_ingest(knowledge_dir=tmp_knowledge_dir, embeddings_client=fake_embeddings_client)

    second = run_ingest(
        knowledge_dir=tmp_knowledge_dir,
        embeddings_client=fake_embeddings_client,
    )

    assert second.new == 0
    assert second.updated == 0
    assert second.unchanged == 2
    assert second.skipped == 1
    assert second.deleted == 0
    assert second.errors == 0


@pytest.mark.django_db
def test_run_ingest_detects_content_change_and_updates(tmp_knowledge_dir, fake_embeddings_client):
    run_ingest(knowledge_dir=tmp_knowledge_dir, embeddings_client=fake_embeddings_client)

    initial_chunk_ids = set(
        KnowledgeChunk.objects.values_list("id", flat=True)
    )

    file_ = tmp_knowledge_dir / "writing" / "verbos.md"
    edited = file_.read_text() + "\n\n## Nova seção\n\nConteúdo extra adicionado.\n"
    file_.write_text(edited, encoding="utf-8")

    report = run_ingest(
        knowledge_dir=tmp_knowledge_dir,
        embeddings_client=fake_embeddings_client,
    )

    assert report.updated == 1
    assert report.unchanged == 1
    assert report.new == 0

    # Chunks antigos do doc editado foram apagados e recriados.
    after_chunk_ids = set(KnowledgeChunk.objects.values_list("id", flat=True))
    # Pelo menos parte mudou (os chunks do doc atualizado).
    assert initial_chunk_ids != after_chunk_ids


@pytest.mark.django_db
def test_run_ingest_skips_files_without_frontmatter(tmp_knowledge_dir, fake_embeddings_client):
    report = run_ingest(
        knowledge_dir=tmp_knowledge_dir,
        embeddings_client=fake_embeddings_client,
    )

    skipped = [f for f in report.files if f.status == "skipped"]
    assert len(skipped) == 1
    assert "README" in skipped[0].source_path
    assert skipped[0].reason == "no frontmatter"


@pytest.mark.django_db
def test_run_ingest_reports_errors_on_invalid_frontmatter(tmp_knowledge_dir, fake_embeddings_client):
    bad = tmp_knowledge_dir / "writing" / "bad.md"
    bad.write_text(
        """---
category: writing
priority: always
---
falta agents
""",
        encoding="utf-8",
    )

    report = run_ingest(
        knowledge_dir=tmp_knowledge_dir,
        embeddings_client=fake_embeddings_client,
    )

    assert report.errors == 1
    error_files = [f for f in report.files if f.status == "error"]
    assert len(error_files) == 1
    assert "bad.md" in error_files[0].source_path


@pytest.mark.django_db
def test_run_ingest_removes_orphan_documents(tmp_knowledge_dir, fake_embeddings_client):
    run_ingest(knowledge_dir=tmp_knowledge_dir, embeddings_client=fake_embeddings_client)
    assert KnowledgeDocument.objects.count() == 2

    # Apaga um arquivo do disco
    removed = tmp_knowledge_dir / "writing" / "verbos.md"
    removed.unlink()

    report = run_ingest(
        knowledge_dir=tmp_knowledge_dir,
        embeddings_client=fake_embeddings_client,
    )

    assert report.deleted == 1
    assert KnowledgeDocument.objects.count() == 1
    # Cascade: chunks órfãos foram apagados junto.
    surviving_doc = KnowledgeDocument.objects.first()
    assert "verbos" not in surviving_doc.source_path
    # Sem chunks órfãos no banco.
    orphans = KnowledgeChunk.objects.exclude(document=surviving_doc)
    assert orphans.count() == 0


@pytest.mark.django_db
def test_run_ingest_force_re_embeds_even_without_hash_diff(tmp_knowledge_dir, fake_embeddings_client):
    run_ingest(knowledge_dir=tmp_knowledge_dir, embeddings_client=fake_embeddings_client)
    initial_call_count = len(fake_embeddings_client.calls)

    report = run_ingest(
        knowledge_dir=tmp_knowledge_dir,
        embeddings_client=fake_embeddings_client,
        force=True,
    )

    # Com force=True, ambos os docs com frontmatter contam como updated.
    assert report.updated == 2
    assert report.unchanged == 0
    # Embedding foi chamado de novo (mais calls do que após o primeiro ingest).
    assert len(fake_embeddings_client.calls) > initial_call_count
