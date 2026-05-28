from django.urls import path

from .views import KnowledgeStatusView

app_name = "knowledge"

urlpatterns = [
    path("status/", KnowledgeStatusView.as_view(), name="status"),
]
