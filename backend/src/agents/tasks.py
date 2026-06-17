"""Pipeline Celery dos agentes de geração de currículo (Fase 2).

Tasks são THIN: cada uma busca o objeto, chama UM use case e devolve o id
(str — o broker serializa em JSON, e a PK é UUID). Nenhuma regra de negócio
mora aqui; os use cases (`RunWriter`/`RunReviewer`/`RunJudge`) fazem o trabalho,
marcam `Resume.status` e gravam `AgentRun` de auditoria/erro internamente.

Sem retry automático: a chamada LLM é single-shot e cara — retry cego
re-rodaria o agente inteiro. Exceções **propagam**: se o writer falhar, o
`chain` do Celery interrompe o pipeline (reviewer/judge não rodam), que é o
comportamento desejado.
"""

from celery import chain, shared_task

from agents.use_cases.run_ats_optimizer import RunAtsOptimizer
from agents.use_cases.run_judge import RunJudge
from agents.use_cases.run_reviewer import RunReviewer
from agents.use_cases.run_writer import RunWriter
from matching.models import JobPosting
from resumes.models import Resume, ResumeVersion


@shared_task
def run_writer_task(resume_id: str) -> str:
    resume = Resume.objects.get(id=resume_id)
    version = RunWriter().execute(resume=resume)
    return str(version.id)


@shared_task
def run_reviewer_task(resume_version_id: str) -> str:
    version = ResumeVersion.objects.get(id=resume_version_id)
    new_version = RunReviewer().execute(version=version)
    return str(new_version.id)


@shared_task
def run_judge_task(resume_version_id: str) -> str:
    version = ResumeVersion.objects.get(id=resume_version_id)
    score = RunJudge().execute(version=version)
    return str(score.id)


@shared_task
def generate_resume_pipeline(resume_id: str) -> None:
    """Encadeia writer → reviewer → judge.

    Cada `.s()` (exceto o primeiro) recebe o retorno da task anterior como 1º
    arg: writer devolve `version_id` → reviewer; reviewer devolve `version_id`
    → judge. Em modo eager (testes, `CELERY_TASK_ALWAYS_EAGER`) o chain roda
    inline e síncrono.
    """
    chain(
        run_writer_task.s(resume_id),
        run_reviewer_task.s(),
        run_judge_task.s(),
    ).apply_async()


@shared_task
def run_ats_optimizer_task(resume_version_id: str, job_posting_id: str) -> str:
    version = ResumeVersion.objects.get(id=resume_version_id)
    job = JobPosting.objects.get(id=job_posting_id)
    new_version = RunAtsOptimizer().execute(version=version, job_posting=job)
    return str(new_version.id)


@shared_task
def run_ats_optimizer_pipeline(resume_version_id: str, job_posting_id: str) -> None:
    """Encadeia ATS optimizer → judge.

    O otimizador cria a versão reescrita pra vaga; o juiz volta a pontuá-la (e
    marca `Resume.status=ready`). Mesmo padrão do `generate_resume_pipeline`:
    `run_judge_task.s()` recebe o `version_id` retornado pelo otimizador.
    """
    chain(
        run_ats_optimizer_task.s(resume_version_id, job_posting_id),
        run_judge_task.s(),
    ).apply_async()
