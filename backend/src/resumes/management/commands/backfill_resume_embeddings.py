"""Backfill de embeddings das `ResumeVersion` existentes.

Versões criadas antes da Fase 3 não têm embedding. Este comando itera as versões
sem vetor (ou todas, com `--force`) e recalcula salvando — o `pre_save` faz o
trabalho via `get_embeddings_client()`.

Uso:
    docker compose exec backend uv run python manage.py backfill_resume_embeddings
    docker compose exec backend uv run python manage.py backfill_resume_embeddings --force
"""

from django.core.management.base import BaseCommand
from loguru import logger

from resumes.models import ResumeVersion


class Command(BaseCommand):
    help = "Recalcula embeddings das ResumeVersion sem vetor (ou todas, com --force)."

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--force",
            action="store_true",
            help="Recalcula todas as versões, mesmo as que já têm embedding.",
        )

    def handle(self, *args, **options) -> None:
        qs = ResumeVersion.objects.all()
        if not options["force"]:
            qs = qs.filter(embedding__isnull=True)

        total = qs.count()
        if total == 0:
            self.stdout.write(self.style.SUCCESS("Nenhuma versão pendente de embedding."))
            return

        logger.info(f"Backfill de embedding: {total} versões a processar.")
        done = 0
        for version in qs.iterator():
            # Zera o hash pra forçar o recálculo no pre_save mesmo com --force.
            version.structured_data_hash = ""
            version.save(update_fields=["embedding", "structured_data_hash", "updated_at"])
            done += 1
            if done % 20 == 0:
                logger.info(f"  {done}/{total}…")

        self.stdout.write(self.style.SUCCESS(f"Backfill concluído: {done}/{total} versões."))
