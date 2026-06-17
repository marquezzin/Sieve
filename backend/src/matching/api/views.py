"""Views finas de matching. Tudo escopado ao request.user via selectors.

A extração de keywords / cálculo de match / disparo do optimizer NÃO moram aqui —
são use cases (`IngestJobPosting`, `ComputeMatch`) e task Celery. Estas views só
validam input, resolvem ownership e delegam.
"""

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from matching.api.serializers import (
    JobPostingCreateSerializer,
    JobPostingSerializer,
    MatchAnalysisSerializer,
)
from matching.selectors import get_job_for_user, list_jobs_for_user
from matching.use_cases.compute_match import ComputeMatch
from matching.use_cases.ingest_job_posting import IngestJobPosting
from resumes.selectors import get_version_for_user


class JobViewSet(viewsets.ViewSet):
    """Lista, detalha e ingere vagas do usuário autenticado."""

    def list(self, request):
        jobs = list_jobs_for_user(user=request.user)
        return Response(JobPostingSerializer(jobs, many=True).data)

    def retrieve(self, request, pk=None):
        job = get_job_for_user(user=request.user, job_id=pk)
        return Response(JobPostingSerializer(job).data)

    def create(self, request):
        serializer = JobPostingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = IngestJobPosting().execute(user=request.user, **serializer.validated_data)
        return Response(JobPostingSerializer(job).data, status=status.HTTP_201_CREATED)


class AnalyzeView(APIView):
    """POST: calcula (ou recupera do cache) a aderência currículo ↔ vaga."""

    def post(self, request):
        resume_version_id = request.data.get("resume_version_id")
        job_posting_id = request.data.get("job_posting_id")
        refresh = str(request.query_params.get("refresh", "")).lower() in ("1", "true", "yes")

        version = get_version_for_user(user=request.user, version_id=resume_version_id)
        job = get_job_for_user(user=request.user, job_id=job_posting_id)

        analysis = ComputeMatch().execute(resume_version=version, job_posting=job, refresh=refresh)
        return Response(MatchAnalysisSerializer(analysis).data)


class OptimizeView(APIView):
    """POST: dispara o pipeline ATS optimizer (Celery) e devolve o task_id.

    A task `run_ats_optimizer_pipeline(resume_version_id, job_posting_id)` é
    criada pelo orquestrador. Import lazy dentro do método pra não acoplar este
    módulo ao app de agentes em tempo de carga (evita ciclo de import).
    """

    def post(self, request):
        resume_version_id = request.data.get("resume_version_id")
        job_posting_id = request.data.get("job_posting_id")

        version = get_version_for_user(user=request.user, version_id=resume_version_id)
        job = get_job_for_user(user=request.user, job_id=job_posting_id)

        from agents.tasks import run_ats_optimizer_pipeline

        result = run_ats_optimizer_pipeline.delay(str(version.id), str(job.id))
        return Response({"task_id": result.id}, status=status.HTTP_202_ACCEPTED)
