"""Top-level URL routing.

Apps de domínio expõem suas próprias rotas via `include(...)`. Este arquivo
só monta:
- /admin/
- /api/v1/health/                  (core healthcheck simples — AllowAny)
- /api/v1/token/                   (JWT obtain)
- /api/v1/token/refresh/           (JWT refresh)
- /api/v1/schema/                  (OpenAPI 3 schema)
- /api/v1/docs/                    (Swagger UI)
- /api/v1/redoc/                   (Redoc)
- /api/v1/healthcheck/             (app `healthcheck`, se existir)
"""
import contextlib

from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.observability.health import health_view

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", health_view, name="health"),
    path("api/v1/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/v1/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # OpenAPI schema + UIs. O "Authorize" do Swagger injeta o Bearer JWT
    # (obtido em /api/v1/token/) pra testar os endpoints protegidos.
    path("api/v1/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/v1/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/v1/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

# `healthcheck` app pode ainda não existir durante bootstrap. Inclui se disponível.
with contextlib.suppress(ImportError):
    urlpatterns.append(path("api/v1/healthcheck/", include("healthcheck.api.urls")))

# `knowledge` app — endpoint de debug em /api/v1/knowledge/status/ (IsAdminUser).
with contextlib.suppress(ImportError):
    urlpatterns.append(path("api/v1/knowledge/", include("knowledge.api.urls")))

# `accounts` app — perfil do candidato em /api/v1/accounts/me/.
with contextlib.suppress(ImportError):
    urlpatterns.append(path("api/v1/accounts/", include("accounts.api.urls")))

# `chat` app — sessões de entrevista + mensagens em /api/v1/chat/.
with contextlib.suppress(ImportError):
    urlpatterns.append(path("api/v1/chat/", include("chat.api.urls")))

# `resumes` app — currículos gerados + versões + diff + PDF em /api/v1/resumes/.
with contextlib.suppress(ImportError):
    urlpatterns.append(path("api/v1/resumes/", include("resumes.api.urls")))

# `matching` app — vagas + análise de aderência + optimize em /api/v1/matching/.
with contextlib.suppress(ImportError):
    urlpatterns.append(path("api/v1/matching/", include("matching.api.urls")))

# django-debug-toolbar — só em DEBUG. As URLs `__debug__/` precisam estar
# registradas, senão o toolbar quebra com NoReverseMatch ('djdt') ao tentar
# se injetar em qualquer resposta vinda de INTERNAL_IPS.
if settings.DEBUG:
    with contextlib.suppress(ImportError):
        import debug_toolbar  # noqa: F401

        urlpatterns.append(path("__debug__/", include("debug_toolbar.urls")))
