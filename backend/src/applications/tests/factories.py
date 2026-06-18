"""Factories do app `applications`. Importadas direto, sem `pytest_factoryboy.register`."""

import factory

from accounts.tests.factories import UserFactory
from applications.models import Application


class ApplicationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Application

    user = factory.SubFactory(UserFactory)
    company = factory.Sequence(lambda n: f"Empresa {n}")
    position = factory.Sequence(lambda n: f"Backend Engineer {n}")
    link = ""
    notes = ""
    status = Application.Status.APPLIED
