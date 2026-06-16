"""Pipeline Celery writer → reviewer → judge.

NÃO dependemos do modo eager do Celery aqui (ele só liga sob `config.settings.test`,
e a suíte roda sob `local`). Em vez disso testamos as duas coisas que importam,
de forma determinística:

1. **Composição** — `generate_resume_pipeline` encadeia as 3 tasks na ordem certa
   e chama `apply_async` (mock no `chain`).
2. **Fluxo de dados** — rodando as 3 tasks em sequência (exatamente o que o chain
   faz no worker real), saem v1 (writer) → v2 (reviewer) → score (judge), status
   `ready`. E falha do writer levanta + para o pipeline (não cria nada).

Patcha `get_llm_client`/`KnowledgeLoader` em cada módulo de use case (as tasks
instanciam `RunWriter()`/etc sem DI — `monkeypatch` no global do módulo).
"""

import pytest

from agents.tests.fakes import FakeKnowledgeLoader, FakeLLMClient, text_response, tool_use_response
from chat.tests.factories import InterviewSessionFactory
from integrations.llm.base import LLMError
from resumes.models import Resume, ResumeScore, ResumeVersion

WRITER_OUT = {
    "personal_info": {"name": "Marina Costa"},
    "summary": "Dev backend.",
    "experiences": [
        {"id": "nubank-backend", "role": "Eng", "company": "Nubank", "bullets": ["Fiz APIs."]}
    ],
    "skills": ["Python"],
}
REVIEWER_OUT = {
    "personal_info": {"name": "Marina Costa"},
    "summary": "Engenheira backend com foco em Python.",
    "experiences": [
        {
            "id": "nubank-backend",
            "role": "Eng",
            "company": "Nubank",
            "bullets": ["Construí APIs em Django servindo 2M req/dia."],
        }
    ],
    "skills": ["Python"],
}
JUDGE_OUT = {
    "criteria": {
        "action_verbs": 8.0,
        "metrics": 7.0,
        "cliches": 9.0,
        "specificity": 6.0,
        "conciseness": 7.0,
        "formatting": 8.0,
    },
    "feedback": [{"tone": "green", "text": "Boas métricas."}],
}


class _FailingClient:
    def messages_create(self, *, system, messages, tools=None, max_tokens=4096):
        raise LLMError("writer boom")


def _make_resume():
    session = InterviewSessionFactory(collected_data={"personal_info": {"name": "Marina Costa"}})
    return Resume.objects.create(
        user=session.user,
        session=session,
        title="Currículo de Marina",
        target_role="backend-python",
        status=Resume.Status.GENERATING,
    )


def _patch_clients(monkeypatch, *, writer_client, reviewer_client=None, judge_client=None):
    monkeypatch.setattr(
        "agents.use_cases.run_writer.get_llm_client", lambda *a, **k: writer_client
    )
    monkeypatch.setattr("agents.use_cases.run_writer.KnowledgeLoader", FakeKnowledgeLoader)
    if reviewer_client is not None:
        monkeypatch.setattr(
            "agents.use_cases.run_reviewer.get_llm_client", lambda *a, **k: reviewer_client
        )
        monkeypatch.setattr("agents.use_cases.run_reviewer.KnowledgeLoader", FakeKnowledgeLoader)
    if judge_client is not None:
        monkeypatch.setattr(
            "agents.use_cases.run_judge.get_llm_client", lambda *a, **k: judge_client
        )
        monkeypatch.setattr("agents.use_cases.run_judge.KnowledgeLoader", FakeKnowledgeLoader)


@pytest.mark.django_db
def test_generate_pipeline_composes_chain_in_order(monkeypatch):
    """`generate_resume_pipeline` monta o chain writer→reviewer→judge e dispara."""
    import agents.tasks as tasks_mod

    captured = {}

    class _FakeChainResult:
        def apply_async(self):
            captured["applied"] = True

    def _fake_chain(*signatures):
        captured["signatures"] = signatures
        return _FakeChainResult()

    monkeypatch.setattr(tasks_mod, "chain", _fake_chain)

    resume = _make_resume()
    tasks_mod.generate_resume_pipeline(str(resume.id))

    assert captured.get("applied") is True
    names = [sig.name for sig in captured["signatures"]]
    assert names == [
        "agents.tasks.run_writer_task",
        "agents.tasks.run_reviewer_task",
        "agents.tasks.run_judge_task",
    ]
    # O 1º elo carrega o resume_id; os seguintes recebem o retorno do anterior.
    assert captured["signatures"][0].args == (str(resume.id),)


@pytest.mark.django_db
def test_chain_runs_in_order(monkeypatch):
    """Roda as 3 tasks em sequência (= o que o worker faz): v1 → v2 → score."""
    from agents.tasks import run_judge_task, run_reviewer_task, run_writer_task

    resume = _make_resume()
    _patch_clients(
        monkeypatch,
        writer_client=FakeLLMClient([tool_use_response("submit_resume", WRITER_OUT), text_response("ok")]),
        reviewer_client=FakeLLMClient([tool_use_response("submit_resume", REVIEWER_OUT), text_response("ok")]),
        judge_client=FakeLLMClient([tool_use_response("submit_score", JUDGE_OUT), text_response("ok")]),
    )

    v1_id = run_writer_task(str(resume.id))
    v2_id = run_reviewer_task(v1_id)
    run_judge_task(v2_id)

    versions = ResumeVersion.objects.filter(resume=resume).order_by("version_number")
    assert [v.version_number for v in versions] == [1, 2]
    assert versions[0].generated_by_agent == "writer"
    assert versions[1].generated_by_agent == "reviewer"
    assert ResumeScore.objects.filter(resume_version=versions[1]).exists()

    resume.refresh_from_db()
    assert resume.status == Resume.Status.READY


@pytest.mark.django_db
def test_writer_failure_stops_chain(monkeypatch):
    """Writer falho levanta (o chain do Celery não dispara reviewer/judge) e marca
    o resume como failed — sem nenhuma versão criada."""
    from agents.tasks import run_writer_task

    resume = _make_resume()
    _patch_clients(monkeypatch, writer_client=_FailingClient())

    with pytest.raises(LLMError):
        run_writer_task(str(resume.id))

    assert not ResumeVersion.objects.filter(resume=resume).exists()
    assert not ResumeScore.objects.filter(resume_version__resume=resume).exists()

    resume.refresh_from_db()
    assert resume.status == Resume.Status.FAILED
