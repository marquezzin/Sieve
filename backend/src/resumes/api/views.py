"""Views finas de currículos. Tudo escopado ao request.user via selectors.

Geração (writer/reviewer/judge) NÃO mora aqui — é o pipeline de agentes. Estas
views só leem (list/detalhe/versões), exportam PDF e calculam diff.
"""

from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from integrations.pdf.base import PdfRenderError
from resumes.api.serializers import (
    ResumeDetailSerializer,
    ResumeSerializer,
    ResumeVersionSerializer,
)
from resumes.selectors import (
    get_resume_for_user,
    get_version,
    list_resumes_for_user,
    list_versions,
)
from resumes.use_cases.compute_diff import compute_diff


class ResumeViewSet(viewsets.ViewSet):
    """Lista e detalha currículos do usuário autenticado."""

    def list(self, request):
        resumes = list_resumes_for_user(user=request.user)
        return Response(ResumeSerializer(resumes, many=True).data)

    def retrieve(self, request, pk=None):
        resume = get_resume_for_user(user=request.user, resume_id=pk)
        return Response(ResumeDetailSerializer(resume).data)


class ResumeVersionsView(APIView):
    """GET lista todas as versões de um currículo (completas)."""

    def get(self, request, resume_id):
        resume = get_resume_for_user(user=request.user, resume_id=resume_id)
        versions = list_versions(resume=resume)
        return Response(ResumeVersionSerializer(versions, many=True).data)


class ResumeVersionDetailView(APIView):
    """GET versão específica completa."""

    def get(self, request, resume_id, version_number):
        resume = get_resume_for_user(user=request.user, resume_id=resume_id)
        version = get_version(resume=resume, version_number=version_number)
        return Response(ResumeVersionSerializer(version).data)


class ResumeVersionPdfView(APIView):
    """Download binário do PDF de uma versão.

    Retorna `HttpResponse` cru — como NÃO é um `Response` do DRF, ele escapa do
    EnvelopeRenderer (binário não vira envelope). Se a stack de PDF não estiver
    disponível (WeasyPrint é opt-in) ou o render falhar, devolve 503 com mensagem
    clara em vez de 500.
    """

    def get(self, request, resume_id, version_number):
        resume = get_resume_for_user(user=request.user, resume_id=resume_id)
        version = get_version(resume=resume, version_number=version_number)

        # Import lazy da integração pdf (opt-in): quebra de import (lib ausente)
        # ou de render viram 503 — nunca 500.
        try:
            from resumes.use_cases.render_to_pdf import render_version_to_pdf

            pdf_bytes = render_version_to_pdf(version)
        except (ImportError, PdfRenderError) as exc:
            return Response(
                {
                    "code": "PdfRendererUnavailable",
                    "message": str(exc) or "Geração de PDF indisponível neste ambiente.",
                    "fields": {},
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        filename = f"resume-{resume.id}-v{version.version_number}.pdf"
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response


class ResumeVersionDiffView(APIView):
    """GET diff entre duas versões: changes de v_from → v_to."""

    def get(self, request, resume_id, version_from, version_to):
        resume = get_resume_for_user(user=request.user, resume_id=resume_id)
        v_from = get_version(resume=resume, version_number=version_from)
        v_to = get_version(resume=resume, version_number=version_to)
        changes = compute_diff(v_from.structured_data, v_to.structured_data)
        return Response({"from": v_from.version_number, "to": v_to.version_number, "changes": changes})
