from django.urls import path
from rest_framework.routers import DefaultRouter

from chat.api.views import MessagesView, SessionViewSet

router = DefaultRouter()
router.register(r"sessions", SessionViewSet, basename="session")

urlpatterns = [
    *router.urls,
    path(
        "sessions/<uuid:session_id>/messages/",
        MessagesView.as_view(),
        name="session-messages",
    ),
]
