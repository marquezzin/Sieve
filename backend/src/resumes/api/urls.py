from django.urls import path
from rest_framework.routers import DefaultRouter

from resumes.api.views import (
    ResumeVersionDetailView,
    ResumeVersionDiffView,
    ResumeVersionPdfView,
    ResumeVersionsView,
    ResumeViewSet,
)

router = DefaultRouter()
router.register(r"", ResumeViewSet, basename="resume")

urlpatterns = [
    # Rotas específicas antes do router (que registra "" e "<pk>/").
    path(
        "<uuid:resume_id>/versions/",
        ResumeVersionsView.as_view(),
        name="resume-versions",
    ),
    path(
        "<uuid:resume_id>/versions/<int:version_from>/diff/<int:version_to>/",
        ResumeVersionDiffView.as_view(),
        name="resume-version-diff",
    ),
    path(
        "<uuid:resume_id>/versions/<int:version_number>/pdf/",
        ResumeVersionPdfView.as_view(),
        name="resume-version-pdf",
    ),
    path(
        "<uuid:resume_id>/versions/<int:version_number>/",
        ResumeVersionDetailView.as_view(),
        name="resume-version-detail",
    ),
    *router.urls,
]
