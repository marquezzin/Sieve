"""Testes do signal `recompute_embedding` (pre_save de ResumeVersion).

O embedding é recalculado quando `structured_data` muda (hash diferente) e NÃO é
recalculado quando o conteúdo é o mesmo (hash igual). Embeddings ficam no fake
determinístico (token-hash, default em `settings.test`), então a comparação é
estável e offline.
"""

import pytest
from django.conf import settings

from resumes.signals import compute_structured_data_hash
from resumes.tests.factories import ResumeVersionFactory


@pytest.mark.django_db
def test_embedding_computed_on_create():
    version = ResumeVersionFactory()

    assert version.embedding is not None
    assert len(list(version.embedding)) == settings.EMBEDDINGS_DIM
    assert version.structured_data_hash == compute_structured_data_hash(version.structured_data)


@pytest.mark.django_db
def test_embedding_recomputed_when_structured_data_changes():
    version = ResumeVersionFactory(
        structured_data={"summary": "Backend com Python.", "skills": ["Python"]}
    )
    before_vec = list(version.embedding)
    before_hash = version.structured_data_hash

    version.structured_data = {
        "summary": "Frontend com TypeScript e React.",
        "skills": ["TypeScript", "React"],
    }
    version.save()
    version.refresh_from_db()

    assert version.structured_data_hash != before_hash
    assert list(version.embedding) != before_vec


@pytest.mark.django_db
def test_embedding_not_recomputed_when_hash_unchanged():
    version = ResumeVersionFactory()
    before_vec = list(version.embedding)
    before_hash = version.structured_data_hash

    # Save sem mudar structured_data → hash igual → não recalcula.
    version.html_rendered = "<html>changed</html>"  # campo fora do embedding
    version.save()
    version.refresh_from_db()

    assert version.structured_data_hash == before_hash
    assert list(version.embedding) == before_vec


@pytest.mark.django_db
def test_empty_structured_data_records_hash_without_embedding():
    version = ResumeVersionFactory(structured_data={})

    # Sem conteúdo pra vetorizar: hash registrado, embedding fica nulo.
    assert version.embedding is None
    assert version.structured_data_hash == compute_structured_data_hash({})
