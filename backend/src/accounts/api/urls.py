from django.urls import path

from accounts.api.views import MeView

urlpatterns = [
    path("me/", MeView.as_view(), name="accounts-me"),
]
