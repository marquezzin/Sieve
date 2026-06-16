"""One-shot: backfill do projeto "Ingenia" no `collected_data` da sessão do Thales.

Na sessão 019ed068-84b1-7514-ad0a-ee0d9dd9ecfe o entrevistador narrou "registrei o
projeto Ingenia" mas nunca chamou `record_project` — o projeto não foi gravado. Os
dados abaixo foram extraídos fielmente da transcrição (sem inventar: o candidato não
nomeou stack específica, só "desenvolvimento web").

Idempotente: upsert por `name` (rodar 2x não duplica). `--dry-run` (default) só mostra
o diff; `--apply` grava. `--recompute-phase` aplica o piso derivado dos dados (destrava
o botão "Finalizar"); por padrão NÃO mexe na fase.

Comando one-shot (backend/CLAUDE.md): apagar na mesma PR após rodar em produção.
"""

from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError

from chat.models import InterviewSession
from chat.services import derive_phase_floor, phase_index

_SESSION_ID = "019ed068-84b1-7514-ad0a-ee0d9dd9ecfe"
_INGENIA = {
    "name": "Ingenia",
    "description": (
        "Plataforma web de trilha de aprendizagem em programação para alunos do ensino "
        "fundamental. Atuou como desenvolvedor: implementação de funcionalidades, "
        "interface e lógica da aplicação, e modelagem/organização dos conteúdos educacionais."
    ),
    "tech_stack": ["desenvolvimento web"],
    "result": (
        "Trilha estruturada em etapas com acompanhamento de progresso, facilitando o "
        "ensino de programação a iniciantes e ampliando o acesso ao conhecimento."
    ),
}


class Command(BaseCommand):
    help = "Backfill idempotente do projeto Ingenia no collected_data da sessão do Thales."

    def add_arguments(self, parser) -> None:
        parser.add_argument("--session", default=_SESSION_ID, help="ID da sessão alvo.")
        parser.add_argument("--apply", action="store_true", help="Grava de fato (default: dry-run).")
        parser.add_argument(
            "--recompute-phase",
            action="store_true",
            help="Também aplica o piso de fase derivado dos dados (destrava o botão Finalizar).",
        )

    def handle(self, *args, **opts) -> None:
        try:
            session = InterviewSession.objects.get(id=opts["session"])
        except (InterviewSession.DoesNotExist, ValidationError, ValueError) as exc:
            raise CommandError(f"Sessão {opts['session']} não encontrada: {exc}") from exc

        data = session.collected_data or {}
        projects = data.setdefault("projects", [])
        key = _INGENIA["name"].strip().casefold()
        exists = any(
            isinstance(p, dict) and (p.get("name") or "").strip().casefold() == key for p in projects
        )

        changed_fields: list[str] = []
        if exists:
            self.stdout.write(self.style.WARNING("Projeto 'Ingenia' já presente — nada a inserir."))
        else:
            projects.append(dict(_INGENIA))
            changed_fields.append("collected_data")
            self.stdout.write("Projeto a inserir:")
            self.stdout.write(f"  {_INGENIA}")

        phase_before = session.current_phase
        if opts["recompute_phase"]:
            floor = derive_phase_floor(data)
            if phase_index(floor) > phase_index(session.current_phase):
                session.current_phase = floor
                if "current_phase" not in changed_fields:
                    changed_fields.append("current_phase")
                self.stdout.write(f"Fase: {phase_before} → {floor}")
            else:
                self.stdout.write(f"Fase mantida em {phase_before} (piso = {floor}).")

        if not changed_fields:
            self.stdout.write(self.style.SUCCESS("Nada a fazer."))
            return

        if not opts["apply"]:
            self.stdout.write(self.style.WARNING("DRY-RUN — nada gravado. Rode com --apply pra aplicar."))
            return

        session.collected_data = data
        session.save(update_fields=[*changed_fields, "updated_at"])
        self.stdout.write(self.style.SUCCESS(f"Gravado. Campos: {changed_fields}"))
