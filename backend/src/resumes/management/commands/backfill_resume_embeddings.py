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
        ok = 0
        failed: list[str] = []
        for version in qs.iterator():
            # Zera o hash pra forçar o recálculo no pre_save mesmo com --force.
            version.structured_data_hash = ""
            version.save(update_fields=["embedding", "structured_data_hash", "updated_at"])
            # O signal é best-effort (engole EmbeddingsError, ex. 429 do Voyage):
            # confere se o vetor foi de fato gravado em vez de presumir sucesso.
            version.refresh_from_db(fields=["embedding"])
            if version.embedding is not None:
                ok += 1
            else:
                failed.append(f"{version.resume_id} v{version.version_number}")
            if (ok + len(failed)) % 20 == 0:
                logger.info(f"  {ok + len(failed)}/{total}…")

        if failed:
            self.stdout.write(
                self.style.WARNING(
                    f"Backfill: {ok}/{total} ok, {len(failed)} falharam (provável rate limit "
                    f"do provider de embeddings). Rode de novo pra retomar: {failed[:10]}"
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS(f"Backfill concluído: {ok}/{total} versões."))
