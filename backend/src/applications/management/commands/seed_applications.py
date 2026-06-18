"""Semeia candidaturas de demonstração no Kanban de um usuário.

Uso típico (perfil do João Almeida):

    docker compose exec backend uv run python manage.py seed_applications

Por padrão **apaga** as candidaturas existentes do usuário antes de semear
(estado de demo idempotente). Use `--keep` pra só acrescentar.
"""

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from loguru import logger

from applications.models import Application
from matching.models import JobPosting
from resumes.models import ResumeVersion

DEFAULT_EMAIL = "joao.almeida@example.com"

S = Application.Status

# Conjunto curado de candidaturas — empresas reais do ecossistema tech/fintech BR,
# cargos coerentes com o perfil backend do João, distribuídas pelo funil.
# `cv` liga a candidatura à última versão do currículo do usuário (badge "CV").
SEED = [
    # ── Oferta ──────────────────────────────────────────────────────────────
    {"company": "QuintoAndar", "position": "Engenheiro(a) de Software Backend Sênior", "status": S.OFFER, "days": 3, "link": True, "cv": True,
     "notes": "Oferta recebida! Pacote: CLT + PLR. Aguardando proposta formal por e-mail."},
    {"company": "CloudWalk", "position": "Backend Engineer (Python) - Pagamentos", "status": S.OFFER, "days": 6, "link": True, "cv": True,
     "notes": "Oferta verbal na call com o hiring manager. Negociando data de início."},
    # ── Entrevista final ────────────────────────────────────────────────────
    {"company": "Nubank", "position": "Software Engineer - Plataforma de Pagamentos", "status": S.FINAL_INTERVIEW, "days": 2, "link": True, "cv": True,
     "notes": "Entrevista final com o diretor de engenharia na quinta. Revisar system design."},
    {"company": "PicPay", "position": "Tech Lead Backend (Python)", "status": S.FINAL_INTERVIEW, "days": 5, "link": True, "cv": True,
     "notes": "Painel final: 2 entrevistas (técnica + cultural). Recrutadora: Marina."},
    {"company": "Inter", "position": "Pessoa Desenvolvedora Backend Sênior", "status": S.FINAL_INTERVIEW, "days": 9, "link": False, "cv": False,
     "notes": "Última etapa com VP de Tech. Foco em liderança técnica."},
    # ── Entrevista técnica ──────────────────────────────────────────────────
    {"company": "Stone", "position": "Desenvolvedor(a) Backend Sênior (Python)", "status": S.TECHNICAL_INTERVIEW, "days": 4, "link": True, "cv": True,
     "notes": "Live coding agendado: desafio de concorrência + design de API."},
    {"company": "Mercado Livre", "position": "Backend Developer Sr - Fintech", "status": S.TECHNICAL_INTERVIEW, "days": 7, "link": True, "cv": True,
     "notes": "Take-home entregue. Aguardando feedback do time técnico."},
    {"company": "Creditas", "position": "Engenheiro(a) de Software Backend", "status": S.TECHNICAL_INTERVIEW, "days": 8, "link": True, "cv": False,
     "notes": "Pair programming na próxima semana com 2 engenheiros do time de crédito."},
    {"company": "Dock", "position": "Pessoa Engenheira Backend Sênior", "status": S.TECHNICAL_INTERVIEW, "days": 12, "link": False, "cv": True,
     "notes": "Desafio técnico em Python/Django. Prazo: 5 dias."},
    # ── Triagem ─────────────────────────────────────────────────────────────
    {"company": "C6 Bank", "position": "Engenheiro(a) de Software - Core Banking", "status": S.SCREENING, "days": 6, "link": True, "cv": True,
     "notes": "Conversa inicial com recrutadora amanhã às 15h."},
    {"company": "PagBank", "position": "Backend Sênior (Python/Go)", "status": S.SCREENING, "days": 10, "link": True, "cv": False,
     "notes": "Triagem por telefone feita. Vão encaminhar pro time técnico."},
    {"company": "Neon", "position": "Pessoa Desenvolvedora Python Sênior", "status": S.SCREENING, "days": 11, "link": False, "cv": False,
     "notes": "Recrutadora: Bia. Cultura fit marcado pra sexta."},
    {"company": "Cora", "position": "Backend Engineer - Plataforma", "status": S.SCREENING, "days": 13, "link": True, "cv": True,
     "notes": ""},
    {"company": "Warren", "position": "Engenheiro(a) de Software Backend", "status": S.SCREENING, "days": 16, "link": True, "cv": False,
     "notes": "Aguardando agenda da recrutadora para o papo inicial."},
    # ── Aplicada ────────────────────────────────────────────────────────────
    {"company": "iFood", "position": "Software Engineer Backend - Logística", "status": S.APPLIED, "days": 1, "link": True, "cv": True,
     "notes": "Apliquei pelo site. Vaga 100% remota."},
    {"company": "Loft", "position": "Pessoa Desenvolvedora Backend Sênior", "status": S.APPLIED, "days": 2, "link": True, "cv": True,
     "notes": ""},
    {"company": "VTEX", "position": "Backend Engineer (Python)", "status": S.APPLIED, "days": 3, "link": True, "cv": False,
     "notes": "Indicação do Rafael. Mencionar no processo."},
    {"company": "Wellhub", "position": "Senior Backend Engineer", "status": S.APPLIED, "days": 5, "link": True, "cv": True,
     "notes": "Vaga internacional, inglês obrigatório."},
    {"company": "Ebanx", "position": "Engenheiro(a) de Software Backend Sênior", "status": S.APPLIED, "days": 6, "link": False, "cv": False,
     "notes": ""},
    {"company": "Pismo", "position": "Backend Developer - Core", "status": S.APPLIED, "days": 8, "link": True, "cv": True,
     "notes": "Stack: Python + microsserviços + Kafka. Combina muito com meu perfil."},
    {"company": "Olist", "position": "Pessoa Desenvolvedora Backend Pleno/Sênior", "status": S.APPLIED, "days": 9, "link": True, "cv": False,
     "notes": ""},
    {"company": "RD Station", "position": "Engenheiro(a) de Software Backend", "status": S.APPLIED, "days": 11, "link": True, "cv": False,
     "notes": "Apliquei via LinkedIn. Aguardando retorno."},
    # ── Recusada ────────────────────────────────────────────────────────────
    {"company": "Loggi", "position": "Backend Engineer Sr - Roteirização", "status": S.REJECTED, "days": 18, "link": True, "cv": True,
     "notes": "Feedback: buscavam mais experiência com Go. Pediram pra reaplicar no futuro."},
    {"company": "Hotmart", "position": "Pessoa Desenvolvedora Backend Sênior", "status": S.REJECTED, "days": 22, "link": False, "cv": False,
     "notes": "Não avancei após a entrevista técnica. Feedback construtivo sobre system design."},
    {"company": "Conta Azul", "position": "Engenheiro(a) de Software Backend", "status": S.REJECTED, "days": 27, "link": True, "cv": False,
     "notes": "Processo congelado por reestruturação do time. Vaga cancelada."},
]


class Command(BaseCommand):
    help = "Semeia candidaturas de demonstração no Kanban de um usuário (default: João Almeida)."

    def add_arguments(self, parser):
        parser.add_argument("--user-email", default=DEFAULT_EMAIL, help="E-mail do usuário alvo.")
        parser.add_argument(
            "--keep",
            action="store_true",
            help="Não apaga as candidaturas existentes antes de semear (default: apaga).",
        )

    def handle(self, *args, **options):
        email = options["user_email"]
        user_model = get_user_model()
        try:
            user = user_model.objects.get(email=email)
        except user_model.DoesNotExist as exc:
            raise CommandError(f"Usuário {email!r} não encontrado.") from exc

        # Última versão do currículo do usuário — usada nas candidaturas com `cv`.
        latest_version = (
            ResumeVersion.objects.filter(resume__user=user)
            .order_by("-version_number")
            .first()
        )
        if latest_version is None:
            logger.warning("Usuário {} não tem ResumeVersion; candidaturas ficarão sem 'CV'.", email)

        if not options["keep"]:
            deleted, _ = Application.objects.filter(user=user).delete()
            self.stdout.write(self.style.WARNING(f"Removidas {deleted} candidaturas existentes de {email}."))

        today = timezone.now().date()
        created = 0
        for item in SEED:
            # Liga à vaga ingerida de mesma empresa, se houver (senão fica solto).
            job = JobPosting.objects.filter(user=user, company__iexact=item["company"]).first()
            Application.objects.create(
                user=user,
                company=item["company"],
                position=item["position"],
                status=item["status"],
                applied_at=today - timedelta(days=item["days"]),
                link=(f"https://vagas.exemplo.com/{item['company'].lower().replace(' ', '-')}" if item["link"] else ""),
                notes=item["notes"],
                resume_version=latest_version if item["cv"] else None,
                job_posting=job,
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f"✓ {created} candidaturas semeadas para {email}."))
