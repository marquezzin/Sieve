"""Base settings — herdadas por local/test/production.

Toda env var é lida via `decouple.config`. Nunca `os.environ` direto.
PYTHONPATH inclui `BASE_DIR / "src"` pra apps de domínio resolverem por nome.
"""
import sys
from datetime import timedelta
from pathlib import Path

from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# src/ no PYTHONPATH — permite `from core...`, `from healthcheck...`
SRC_DIR = BASE_DIR / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

# ─── Core ────────────────────────────────────────────────────────────────────
SECRET_KEY = config("DJANGO_SECRET_KEY", default="insecure-default-change-me")
DEBUG = config("DJANGO_DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config(
    "DJANGO_ALLOWED_HOSTS",
    default="localhost,127.0.0.1",
    cast=Csv(),
)

# ─── Apps ────────────────────────────────────────────────────────────────────
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "django_celery_beat",
    "drf_spectacular",
]

LOCAL_APPS = [
    "core.apps.CoreConfig",
    "healthcheck.apps.HealthcheckConfig",
    "knowledge.apps.KnowledgeConfig",
    "accounts.apps.AccountsConfig",
    "chat.apps.ChatConfig",
    "agents.apps.AgentsConfig",
    "resumes.apps.ResumesConfig",
    "matching.apps.MatchingConfig",
    "applications.apps.ApplicationsConfig",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ─── Middleware ──────────────────────────────────────────────────────────────
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "core.middleware.RequestIDMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# ─── Database ────────────────────────────────────────────────────────────────
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("POSTGRES_DB", default="sieve"),
        "USER": config("POSTGRES_USER", default="sieve"),
        "PASSWORD": config("POSTGRES_PASSWORD", default="sieve"),
        "HOST": config("POSTGRES_HOST", default="localhost"),
        "PORT": config("POSTGRES_PORT", default="5432"),
        "CONN_MAX_AGE": 60,
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"  # BaseModel sobrescreve com UUID v7

# ─── Cache ───────────────────────────────────────────────────────────────────
REDIS_URL = config("REDIS_URL", default="redis://localhost:6379/0")
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": REDIS_URL,
    }
}

# ─── Object storage (MinIO/S3) ───────────────────────────────────────────────
# Lidos pelo healthcheck; usados por integrations quando boto3 estiver instalado.
MINIO_ENDPOINT = config("MINIO_ENDPOINT", default="")
MINIO_BUCKET = config("MINIO_BUCKET", default="")
MINIO_ROOT_USER = config("MINIO_ROOT_USER", default="")
MINIO_ROOT_PASSWORD = config("MINIO_ROOT_PASSWORD", default="")

# ─── Embeddings (knowledge base, matching semântico) ─────────────────────────
EMBEDDINGS_PROVIDER = config("EMBEDDINGS_PROVIDER", default="voyage")
EMBEDDINGS_API_KEY = config("EMBEDDINGS_API_KEY", default="")
EMBEDDINGS_MODEL = config("EMBEDDINGS_MODEL", default="voyage-3")
EMBEDDINGS_DIM = config("EMBEDDINGS_DIM", default=1024, cast=int)

# ─── Headshot (foto profissional via API externa — Render) ───────────────────
HEADSHOT_PROVIDER = config("HEADSHOT_PROVIDER", default="render")
HEADSHOT_API_URL = config("HEADSHOT_API_URL", default="https://curriculo-headshot-api.onrender.com")
HEADSHOT_API_KEY = config("HEADSHOT_API_KEY", default="")
HEADSHOT_TIMEOUT = config("HEADSHOT_TIMEOUT", default=240.0, cast=float)
HEADSHOT_WAKE_TIMEOUT = config("HEADSHOT_WAKE_TIMEOUT", default=60.0, cast=float)
HEADSHOT_MAX_RETRIES = config("HEADSHOT_MAX_RETRIES", default=1, cast=int)

# ─── Knowledge base ──────────────────────────────────────────────────────────
# Diretório raiz dos arquivos .md ingeridos pelo app `knowledge`. BASE_DIR é
# backend/, subindo um nível chega na raiz do repo onde mora `knowledge_base/`.
KNOWLEDGE_BASE_DIR = BASE_DIR.parent / "knowledge_base"
KNOWLEDGE_CHUNK_SIZE = config("KNOWLEDGE_CHUNK_SIZE", default=300, cast=int)
KNOWLEDGE_CHUNK_OVERLAP = config("KNOWLEDGE_CHUNK_OVERLAP", default=50, cast=int)

# ─── Geração de currículo (pipeline multi-agente: writer / reviewer / judge) ──
# Os agentes do pipeline usam o MESMO LLM do entrevistador (provider `LLM_PROVIDER`,
# OpenAI por default). Vazio = cai no modelo do provider (`OPENAI_MODEL`); preencha
# pra subir um agente específico a um modelo mais forte sem mexer nos outros.
LLM_MODEL_WRITER = config("LLM_MODEL_WRITER", default="")
LLM_MODEL_REVIEWER = config("LLM_MODEL_REVIEWER", default="")
LLM_MODEL_JUDGE = config("LLM_MODEL_JUDGE", default="")

# ─── Matching semântico (app `matching`: vaga ↔ currículo) ───────────────────
# Extrator de keywords da vaga é tarefa simples/barata (Haiku serve). Vazio =
# modelo default do provider.
LLM_MODEL_KEYWORD_EXTRACTOR = config("LLM_MODEL_KEYWORD_EXTRACTOR", default="")
# Keyword da vaga com similaridade coseno < threshold ao conteúdo do currículo é
# tratada como "ausente" no sinal de sanidade do ComputeMatch.
ATS_GAP_THRESHOLD = config("ATS_GAP_THRESHOLD", default=0.5, cast=float)

# ─── Celery ──────────────────────────────────────────────────────────────────
CELERY_BROKER_URL = config("CELERY_BROKER_URL", default="redis://localhost:6379/1")
CELERY_RESULT_BACKEND = config("CELERY_RESULT_BACKEND", default="redis://localhost:6379/2")
CELERY_TIMEZONE = "America/Sao_Paulo"
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

# ─── DRF ─────────────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "core.api.pagination.StandardPagination",
    "DEFAULT_RENDERER_CLASSES": (
        "core.api.renderers.EnvelopeRenderer",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "core.errors.custom_exception_handler",
}

# ─── OpenAPI / Swagger (drf-spectacular) ─────────────────────────────────────
# Schema em /api/v1/schema/ ; UIs em /api/v1/schema/swagger-ui/ e /redoc/.
# As views do spectacular definem renderers próprios — não passam pelo
# EnvelopeRenderer. O schema descreve os payloads "plain" (pré-envelope); o
# wrapper {success, data, ...} é aplicado pelo renderer em runtime.
SPECTACULAR_SETTINGS = {
    "TITLE": "Sieve API",
    "DESCRIPTION": "API do Sieve — entrevistador, redator, revisor, juiz e ATS optimizer.",
    "VERSION": "0.1.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": "/api/v1",
    "COMPONENT_SPLIT_REQUEST": True,
    "SWAGGER_UI_SETTINGS": {
        "persistAuthorization": True,
        "displayRequestDuration": True,
    },
}

# ─── JWT ─────────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=config("JWT_ACCESS_LIFETIME_MINUTES", default=60, cast=int)
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=config("JWT_REFRESH_LIFETIME_DAYS", default=7, cast=int)
    ),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ─── CORS ────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173,http://localhost:8080",
    cast=Csv(),
)

# ─── Auth password validation ────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─── i18n / tz ───────────────────────────────────────────────────────────────
LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Sao_Paulo"
USE_I18N = True
USE_TZ = True

# ─── Static / media ──────────────────────────────────────────────────────────
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ─── Observabilidade (Sentry + logging) ──────────────────────────────────────
# Sentry é opt-in: DSN vazio (default) = no-op total. Detalhe:
# `core/observability/sentry.py`. Logging via loguru — `core/logging.py`.
SENTRY_DSN = config("SENTRY_DSN", default="")
SENTRY_ENVIRONMENT = config("SENTRY_ENVIRONMENT", default="local")
SENTRY_TRACES_SAMPLE_RATE = config("SENTRY_TRACES_SAMPLE_RATE", default=0.1, cast=float)
SENTRY_RELEASE = config("SENTRY_RELEASE", default="") or None

LOG_LEVEL = config("LOG_LEVEL", default="INFO")
LOG_MODE = config("LOG_MODE", default="pretty" if DEBUG else "json")

# Inicialização: Sentry primeiro (precisa estar pronto pra capturar erros do
# próprio configure_logging), depois logging. Imports tardios pra evitar
# circular import enquanto base.py ainda está sendo lido.
from core.logging import configure_logging  # noqa: E402
from core.observability.sentry import init_sentry  # noqa: E402

init_sentry(
    dsn=SENTRY_DSN,
    environment=SENTRY_ENVIRONMENT,
    release=SENTRY_RELEASE,
    traces_sample_rate=SENTRY_TRACES_SAMPLE_RATE,
)
configure_logging(mode=LOG_MODE, level=LOG_LEVEL)
