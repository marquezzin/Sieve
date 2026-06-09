from django.urls import path

from accounts.api.views import MeView, RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="accounts-register"),
    path("me/", MeView.as_view(), name="accounts-me"),
]
