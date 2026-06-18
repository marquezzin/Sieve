"""Factories do app `matching`. Importadas direto, sem `pytest_factoryboy.register`.

`JobPosting.embedding` é um `VectorField(dim=settings.EMBEDDINGS_DIM)`: gerar um
vetor unitário determinístico (não-nulo) do tamanho certo permite que os testes de
score do `ComputeMatch` rodem sem precisar passar pelo `IngestJobPosting`.
"""

import factory
from django.conf import settings

from accounts.tests.factories import UserFactory
from matching.models import JobPosting, MatchAnalysis
from resumes.tests.factories import ResumeVersionFactory


def _unit_vector(seed: float = 1.0) -> list[float]:
    """Vetor não-nulo do tamanho EMBEDDINGS_DIM (constante por dimensão)."""
    return [seed] * settings.EMBEDDINGS_DIM


class JobPostingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = JobPosting

    user = factory.SubFactory(UserFactory)
    title = factory.Sequence(lambda n: f"Engenheiro(a) Backend {n}")
    company = factory.Sequence(lambda n: f"Empresa {n}")
    description = (
        "Buscamos pessoa desenvolvedora backend com Python, Django e PostgreSQL "
        "para construir APIs escaláveis."
    )
    embedding = factory.LazyFunction(lambda: _unit_vector(1.0))
    extracted_keywords = factory.LazyFunction(lambda: ["Python", "Django", "PostgreSQL"])


class MatchAnalysisFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = MatchAnalysis

    resume_version = factory.SubFactory(ResumeVersionFactory)
    job_posting = factory.SubFactory(JobPostingFactory)
    score = "0.750"
    matched_skills = factory.LazyFunction(lambda: ["Python", "Django"])
    missing_skills = factory.LazyFunction(lambda: [{"skill": "Kafka", "critical": True}])
    recommendations = factory.LazyFunction(
        lambda: [
            {
                "title": "Nomeie Kafka explicitamente",
                "detail": "Você usou mensageria no Nubank; cite Kafka pelo nome.",
                "category": "realce",
            }
        ]
    )
