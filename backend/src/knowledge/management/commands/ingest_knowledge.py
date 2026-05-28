"""`make ingest-knowledge` — chama `services.ingest.run_ingest()` e imprime relatório.

Idempotente: rodar N vezes com mesmo conteúdo = 0 mudanças no banco.
Flag `--force` re-embeda tudo (útil quando trocar provider/modelo de embeddings).
"""
from django.core.management.base import BaseCommand

from knowledge.services.ingest import run_ingest


class Command(BaseCommand):
    help = "Ingere arquivos .md de knowledge_base/ para o Postgres (idempotente via hash)."

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--force",
            action="store_true",
            help="Re-embeda todos os arquivos mesmo se o hash não mudou (útil ao trocar provider).",
        )

    def handle(self, *args, **opts) -> None:
        report = run_ingest(force=opts["force"])

        self.stdout.write(f"Discovered {report.discovered} files in knowledge_base/")
        for file_result in report.files:
            line = f"  - {file_result.source_path} ({file_result.status.upper()}"
            if file_result.chunks:
                line += f", {file_result.chunks} chunks"
            if file_result.reason:
                line += f": {file_result.reason}"
            line += ")"
            self.stdout.write(line)

        self.stdout.write(self.style.SUCCESS(report.summary_line()))
