"""Test settings — Celery eager, MD5 hasher, suffix _test no DB."""
import os
import tempfile

# Embeddings determinísticos e offline na suíte. A factory de embeddings lê o
# provider via `decouple` (os.environ/.env) — NÃO via settings do Django — e no
# Docker o `.env` entra como env var do container. Então força a env var aqui:
# sem isto, o signal de embedding do ResumeVersion (roda em todo save()) chamaria
# a Voyage REAL na suíte (lento + rate limit + dependência de credencial/rede).
os.environ["EMBEDDINGS_PROVIDER"] = "fake"

# Mesma razão para o headshot: a factory `get_headshot_client()` lê
# `HEADSHOT_PROVIDER` via `decouple` (os.environ/.env), não via settings do
# Django. Forçar `fake` aqui garante que nenhum teste bata na API real do Render
# (lenta por cold-start, dependente de credencial/rede). Os testes que exercitam
# o use case injetam o fake por DI; isto é a defesa em profundidade.
os.environ["HEADSHOT_PROVIDER"] = "fake"

from .base import *  # noqa: E402, F401, F403
from .base import DATABASES  # noqa: E402

DEBUG = False

# Celery roda inline durante testes
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# DB de teste — sufixo _test pra não colidir
DATABASES = {
    **DATABASES,
    "default": {
        **DATABASES["default"],
        "NAME": f"{DATABASES['default']['NAME']}_test",
        "TEST": {"NAME": f"{DATABASES['default']['NAME']}_test"},
    },
}

# Hash mais rápido só pra teste
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# (provider de embeddings forçado via os.environ no topo — a factory lê decouple,
# não estes settings.)

# Mídia em tmpdir — os testes de upload de foto escrevem em MEDIA_ROOT; isolar
# num diretório temporário evita sujar o repo com arquivos de teste.
MEDIA_ROOT = tempfile.mkdtemp(prefix="sieve-test-media-")
