"""Factories do app `chat`. Importadas direto, sem `pytest_factoryboy.register`."""

import factory

from accounts.tests.factories import UserFactory
from chat.models import ChatMessage, InterviewSession


class InterviewSessionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = InterviewSession

    user = factory.SubFactory(UserFactory)
    status = InterviewSession.Status.ACTIVE
    current_phase = InterviewSession.Phase.INTRO
    collected_data = factory.LazyFunction(dict)


class ChatMessageFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ChatMessage

    session = factory.SubFactory(InterviewSessionFactory)
    role = ChatMessage.Role.USER
    content = factory.LazyAttribute(lambda o: [{"type": "text", "text": "oi"}])
    is_visible = True
    usage = factory.LazyFunction(dict)
