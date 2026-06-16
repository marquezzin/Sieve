"""Factories do app `resumes`. Importadas direto, sem `pytest_factoryboy.register`."""

import factory

from accounts.tests.factories import UserFactory
from resumes.models import Resume, ResumeScore, ResumeVersion

# Sample realista de structured_data (1-2 experiences com bullets). Reusado por
# ResumeVersionFactory e disponível pra asserts diretos nos testes.
SAMPLE_STRUCTURED = {
    "personal_info": {
        "name": "Marina Costa",
        "email": "marina@example.com",
        "phone": "(11) 98888-0000",
        "location": "São Paulo, SP",
        "linkedin_url": "linkedin.com/in/marinacosta",
        "github_url": "github.com/marinacosta",
    },
    "summary": "Desenvolvedora backend com foco em Python e sistemas distribuídos.",
    "experiences": [
        {
            "id": "nubank-backend-pleno",
            "role": "Engenheira de Software Pleno",
            "company": "Nubank",
            "start": "2022",
            "end": "Atual",
            "location": "São Paulo, SP",
            "bullets": [
                "Construí APIs em Django que serviram 2M de requests/dia.",
                "Reduzi a latência p95 do serviço de pagamentos em 40%.",
            ],
            "tech_stack": ["Python", "Django", "PostgreSQL"],
        },
        {
            "id": "acme-backend-junior",
            "role": "Desenvolvedora Backend Júnior",
            "company": "Acme",
            "start": "2020",
            "end": "2022",
            "bullets": [
                "Implementei pipeline de ETL processando 500GB diários.",
            ],
            "tech_stack": ["Python", "Airflow"],
        },
    ],
    "education": [
        {
            "id": "usp-cc",
            "course": "Ciência da Computação",
            "institution": "USP",
            "start": "2016",
            "end": "2020",
            "status": "done",
        }
    ],
    "projects": [
        {
            "id": "cli-tool",
            "name": "devkit",
            "description": "CLI de automação de tarefas de dev.",
            "bullets": ["Distribuído via PyPI com 1k downloads/mês."],
            "tech_stack": ["Python", "Click"],
        }
    ],
    "skills": ["Python", "Django", "PostgreSQL", "Docker", "AWS"],
}


class ResumeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Resume

    user = factory.SubFactory(UserFactory)
    session = None
    title = factory.Sequence(lambda n: f"Currículo {n}")
    target_role = "backend-python"
    status = Resume.Status.GENERATING
    error = ""


class ResumeVersionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ResumeVersion

    resume = factory.SubFactory(ResumeFactory)
    version_number = factory.Sequence(lambda n: n + 1)
    structured_data = factory.LazyFunction(lambda: dict(SAMPLE_STRUCTURED))
    html_rendered = "<html></html>"
    generated_by_agent = "writer"


class ResumeScoreFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ResumeScore

    resume_version = factory.SubFactory(ResumeVersionFactory)
    overall = "7.50"
    criteria = factory.LazyFunction(
        lambda: {
            "action_verbs": 8.0,
            "metrics": 7.0,
            "cliches": 9.0,
            "specificity": 7.0,
            "conciseness": 6.0,
            "formatting": 8.0,
        }
    )
    feedback = factory.LazyFunction(lambda: [{"tone": "green", "text": "Boas métricas."}])
