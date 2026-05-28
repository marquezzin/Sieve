"""Factories de `KnowledgeDocument` e `KnowledgeChunk`.

Importadas diretamente nos testes — sem `pytest_factoryboy.register`.
`KnowledgeChunk.embedding` é preenchido com vetor zero (tamanho EMBEDDINGS_DIM)
só pra satisfazer o INSERT do pgvector; testes que exercem similaridade usam
os clientes/services reais que sobrescrevem o vetor.
"""
import factory
from django.conf import settings

from knowledge.models import KnowledgeChunk, KnowledgeDocument


class KnowledgeDocumentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = KnowledgeDocument

    source_path = factory.Sequence(lambda n: f"knowledge_base/cat/doc-{n}.md")
    category = "writing"
    agents = factory.LazyFunction(lambda: ["writer"])
    priority = KnowledgeDocument.Priority.ALWAYS
    tags = factory.LazyFunction(list)
    metadata = factory.LazyFunction(dict)
    content_md = factory.Faker("paragraph", locale="pt_BR")
    content_hash = factory.Sequence(lambda n: f"hash-{n:064d}"[:64])


class KnowledgeChunkFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = KnowledgeChunk

    document = factory.SubFactory(KnowledgeDocumentFactory)
    ordinal = factory.Sequence(lambda n: n)
    content = factory.Faker("paragraph", locale="pt_BR")
    embedding = factory.LazyFunction(lambda: [0.0] * settings.EMBEDDINGS_DIM)
    metadata = factory.LazyFunction(dict)
