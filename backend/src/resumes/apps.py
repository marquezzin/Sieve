from django.apps import AppConfig


class ResumesConfig(AppConfig):
    name = "resumes"
    verbose_name = "Resumes"
    default_auto_field = "django.db.models.BigAutoField"

    def ready(self) -> None:
        from . import signals  # noqa: F401  (registra o pre_save de embedding)
