from django.urls import path

from accounts.api.views import (
    MeView,
    PhotoGenerateView,
    PhotoStatusView,
    PhotoUploadView,
    RegisterView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="accounts-register"),
    path("me/", MeView.as_view(), name="accounts-me"),
    path("me/photo/", PhotoUploadView.as_view(), name="accounts-photo-upload"),
    path("me/photo/generate/", PhotoGenerateView.as_view(), name="accounts-photo-generate"),
    path("me/photo/status/", PhotoStatusView.as_view(), name="accounts-photo-status"),
]
