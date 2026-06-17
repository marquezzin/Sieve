from django.urls import path
from rest_framework.routers import DefaultRouter

from matching.api.views import AnalyzeView, JobViewSet, OptimizeView

router = DefaultRouter()
router.register(r"jobs", JobViewSet, basename="job")

urlpatterns = [
    path("analyze/", AnalyzeView.as_view(), name="matching-analyze"),
    path("optimize/", OptimizeView.as_view(), name="matching-optimize"),
    *router.urls,
]
