"""Factory de `AgentRun`. Importada direto, sem `pytest_factoryboy.register`."""

import factory

from agents.models import AgentRun


class AgentRunFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = AgentRun

    agent_name = "interviewer"
    session = None
    input = factory.LazyFunction(dict)
    output = factory.LazyFunction(dict)
    usage = factory.LazyFunction(dict)
    status = AgentRun.Status.SUCCESS
    error = ""
