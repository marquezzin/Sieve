"""API do `/api/v1/chat/` — sessões + mensagens.

POST `/sessions/` e POST `/messages/` instanciam `RunInterviewerTurn()` SEM
injeção (dentro da view), então o LLM real seria chamado. Mockamos via
`monkeypatch` de `agents.use_cases.run_interviewer_turn.get_llm_client`,
devolvendo um `FakeLLMClient` que responde texto simples (`end_turn`). O
`KnowledgeLoader` real roda contra o test DB vazio e devolve "" — ok.
"""

import pytest

from agents.tests.fakes import FakeLLMClient, text_response
from chat.tests.factories import ChatMessageFactory, InterviewSessionFactory


@pytest.fixture
def fake_llm(monkeypatch):
    """Patcha `get_llm_client` no módulo do use case pra um FakeLLMClient.

    A fila é recarregada a cada `get_llm_client()` (a view instancia um client
    novo por turn), então cada turn recebe uma resposta de texto fresca.
    """

    def _factory(*args, **kwargs):
        return FakeLLMClient([text_response("Olá! Vamos começar a entrevista.")])

    monkeypatch.setattr(
        "agents.use_cases.run_interviewer_turn.get_llm_client",
        _factory,
    )
    return _factory


@pytest.mark.django_db
def test_create_session(auth_client, fake_llm):
    response = auth_client.post("/api/v1/chat/sessions/", {}, format="json")
    assert response.status_code == 201

    body = response.json()
    assert body["success"] is True
    data = body["data"]
    assert data["status"] == "active"
    assert len(data["messages"]) >= 1
    assert any(m["role"] == "assistant" for m in data["messages"])


@pytest.mark.django_db
def test_send_message(auth_client, fake_llm):
    create = auth_client.post("/api/v1/chat/sessions/", {}, format="json")
    session_id = create.json()["data"]["id"]

    response = auth_client.post(
        f"/api/v1/chat/sessions/{session_id}/messages/",
        {"text": "oi"},
        format="json",
    )
    assert response.status_code == 201

    body = response.json()
    assert body["success"] is True
    assert body["data"]["role"] == "assistant"


@pytest.mark.django_db
def test_session_isolation(auth_client):
    other_session = InterviewSessionFactory()  # pertence a outro user

    response = auth_client.get(f"/api/v1/chat/sessions/{other_session.id}/")
    assert response.status_code == 403


@pytest.mark.django_db
def test_finalize_creates_resume_and_dispatches_pipeline(auth_client, monkeypatch):
    from resumes.models import Resume

    # Patcha o pipeline pra `.delay` não rodar nada (em EAGER chamaria LLM real).
    calls = []

    class _FakePipeline:
        def delay(self, resume_id):
            calls.append(resume_id)

    monkeypatch.setattr("chat.api.views.generate_resume_pipeline", _FakePipeline())

    session = InterviewSessionFactory(
        user=auth_client.user,
        collected_data={"personal_info": {"name": "Maria"}},
    )

    response = auth_client.post(f"/api/v1/chat/sessions/{session.id}/finalize/")
    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    data = body["data"]
    assert data["status"] == "completed"
    assert data["current_phase"] == "done"
    assert data["collected_data"] == {"personal_info": {"name": "Maria"}}

    # Um Resume foi criado pro usuário, e seu id voltou no payload.
    resume = Resume.objects.get(user=auth_client.user, session=session)
    assert data["resume_id"] == str(resume.id)

    # O pipeline foi disparado 1x com o id do resume.
    assert calls == [str(resume.id)]


@pytest.mark.django_db
def test_messages_paginated(auth_client):
    session = InterviewSessionFactory(user=auth_client.user)
    ChatMessageFactory.create_batch(3, session=session, is_visible=True)
    # Mensagem invisível (kickoff) não deve aparecer.
    ChatMessageFactory(session=session, is_visible=False)

    response = auth_client.get(f"/api/v1/chat/sessions/{session.id}/messages/")
    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    # Envelope paginado: só as 3 visíveis (kickoff invisível fica de fora).
    pagination = body["pagination"]
    assert pagination["count"] == 3
    assert pagination["page"] == 1
    # `page_size`/`total_pages` presentes no envelope de paginação.
    assert "page_size" in pagination
    assert "total_pages" in pagination
    assert len(body["data"]) == 3


@pytest.mark.django_db
def test_create_requires_auth(api_client):
    response = api_client.post("/api/v1/chat/sessions/", {}, format="json")
    assert response.status_code == 401
