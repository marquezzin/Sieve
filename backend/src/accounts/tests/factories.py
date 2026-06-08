"""Factories do app `accounts`. Importadas direto, sem `pytest_factoryboy.register`.

GOTCHA: um signal `post_save` cria o `CandidateProfile` automaticamente pra todo
User novo. Por isso NÃO há `CandidateProfileFactory` que cria perfil direto (viola
o OneToOne unique). Para obter um profile: `UserFactory()` → `user.candidate_profile`.
"""

import factory
from django.contrib.auth import get_user_model

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("username",)
        skip_postgeneration_save = True

    username = factory.Sequence(lambda n: f"user-{n}")
    email = factory.LazyAttribute(lambda o: f"{o.username}@example.com")
    password = factory.PostGenerationMethodCall("set_password", "testpass123")
