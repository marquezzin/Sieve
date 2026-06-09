"""Use case de cadastro público de candidato.

Cria um novo `User`. O signal `post_save` do app cria o `CandidateProfile`
automaticamente — aqui não tocamos no perfil. Sem import de DRF/HTTP: validação
de input fica na view (serializer) e as regras de negócio (unicidade, força da
senha) levantam `ApplicationError`, traduzido pelo handler global.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Model

from core.errors import ApplicationError

User = get_user_model()


class RegisterCandidate:
    def execute(self, *, username: str, email: str, password: str) -> Model:
        username = username.strip()
        email = email.strip().lower()

        if User.objects.filter(username__iexact=username).exists():
            raise ApplicationError(
                "Já existe uma conta com esse usuário.",
                extra={"username": "Usuário já cadastrado."},
            )

        if email and User.objects.filter(email__iexact=email).exists():
            raise ApplicationError(
                "Já existe uma conta com esse e-mail.",
                extra={"email": "E-mail já cadastrado."},
            )

        try:
            validate_password(password)
        except DjangoValidationError as exc:
            raise ApplicationError(
                "Senha fraca.",
                extra={"password": exc.messages},
            ) from exc

        return User.objects.create_user(username=username, email=email, password=password)
