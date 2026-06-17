"""Use case do agente entrevistador — executa UM turn da conversa.

ADR 0002: agente = use case dedicado, sem framework. Monta o system prompt
(persona + knowledge base via `KnowledgeLoader`), reconstrói o histórico, roda o
loop de tool_use (`integrations.llm.tool_use`) e persiste o resultado. As tools
mutam a `InterviewSession` (collected_data / current_phase). Cada turn vira um
`AgentRun` de auditoria.

Dependências injetadas via `__init__` (LLM client, knowledge loader) pra testar
com fakes — sem mock de framework.
"""

from pathlib import Path
from typing import Any

from django.db import transaction
from django.utils import timezone

from accounts.services import sync_profile_from_personal_info
from agents.models import AgentRun
from chat.models import ChatMessage, InterviewSession
from chat.prompts.tools import INTERVIEWER_TOOLS
from chat.services import (
    SKIPPABLE_PHASES,
    SKIPPED_KEY,
    derive_phase_floor,
    missing_sections_before,
    phase_index,
    section_status,
    skipped_sections,
)
from core.errors import ApplicationError
from integrations.llm.base import LLMError
from integrations.llm.factory import get_llm_client
from integrations.llm.tool_use import run_tool_use_loop
from knowledge.services.loader import KnowledgeLoader

AGENT_NAME = "interviewer"
_PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "interviewer_system.md"
_KB_PLACEHOLDER = "{{KNOWLEDGE_BASE}}"
_DATE_PLACEHOLDER = "{{CURRENT_DATE}}"
_KICKOFF = "[A entrevista está começando. Apresente-se brevemente e comece a coleta de dados pessoais.]"
_EMPTY_FALLBACK = "Pode me contar um pouco mais?"
_MAX_ROUNDS = 10


def _tool_calls_from_result(result: Any) -> list[str]:
    """Nomes das tools que o modelo chamou no turn, na ordem, extraídos do rastro
    de mensagens do loop. Gravado no `AgentRun` pra auditoria: dá pra ver na hora
    se `record_experience`/`record_project` foram (ou não) chamados — sem isso, o
    sintoma 'a IA disse que registrou mas não registrou' só era detectável
    cruzando o texto com o `collected_data`."""
    calls: list[str] = []
    for msg in getattr(result, "messages", []) or []:
        if msg.get("role") != "assistant":
            continue
        content = msg.get("content")
        if not isinstance(content, list):
            continue
        calls.extend(
            block["name"]
            for block in content
            if isinstance(block, dict) and block.get("type") == "tool_use" and block.get("name")
        )
    return calls


def _entry_key(entry: dict, fields: tuple[str, ...]) -> tuple[str, ...]:
    return tuple(str(entry.get(f) or "").strip().casefold() for f in fields)


def _upsert(items: list[dict], new: dict, key_fields: tuple[str, ...]) -> None:
    """Insere `new` em `items`, ou faz merge se já houver entrada com a mesma
    chave natural. Evita duplicatas quando o modelo chama a mesma `record_*` tool
    mais de uma vez (ex.: dois `record_education` idênticos) e permite refinar uma
    entrada existente sem duplicá-la.
    """
    key = _entry_key(new, key_fields)
    for existing in items:
        if _entry_key(existing, key_fields) == key:
            existing.update({k: v for k, v in new.items() if v not in (None, "", [])})
            return
    items.append(new)


class RunInterviewerTurn:
    def __init__(self, *, llm_client: Any = None, knowledge_loader: KnowledgeLoader | None = None):
        self._llm = llm_client or get_llm_client()
        self._knowledge = knowledge_loader or KnowledgeLoader()

    def execute(self, *, session: InterviewSession, user_text: str | None) -> ChatMessage:
        if session.status == InterviewSession.Status.COMPLETED:
            raise ApplicationError("Sessão já finalizada — não aceita novos turns.")

        starting_phase = session.current_phase

        try:
            # Turno atômico: grava msg do usuário + resposta do assistant +
            # mutações da sessão como uma unidade. Se o turno falhar no meio
            # (LLM, disconnect), o rollback some com a mensagem do usuário — sem
            # bolha "pendurada" nem histórico com dois `user` seguidos.
            with transaction.atomic():
                self._persist_incoming(session, user_text)

                system = self._build_system() + self._build_state_note(session)
                history = self._build_history(session)

                state: dict[str, Any] = {"clarification_msg": None}

                def tool_executor(name: str, tool_input: dict) -> Any:
                    return self._execute_tool(session, state, name, tool_input)

                result = run_tool_use_loop(
                    client=self._llm,
                    system=system,
                    messages=history,
                    tools=INTERVIEWER_TOOLS,
                    tool_executor=tool_executor,
                    max_rounds=_MAX_ROUNDS,
                )

                assistant_msg = self._persist_assistant(session, state, result)

                # Rede de segurança: mesmo que o LLM esqueça `mark_phase_complete`,
                # a fase nunca fica atrás do que já foi coletado (piso derivado dos
                # dados). Nunca regride e nunca passa de `skills` automaticamente.
                self._reconcile_phase(session)

                # As tools mutaram collected_data / current_phase in-place.
                session.save(update_fields=["collected_data", "current_phase", "updated_at"])

                AgentRun.objects.create(
                    agent_name=AGENT_NAME,
                    session=session,
                    input={"phase": starting_phase, "history_len": len(history)},
                    output={
                        "final_text": result.final_text,
                        "rounds": result.rounds,
                        "tool_calls": _tool_calls_from_result(result),
                        "phase_after": session.current_phase,
                    },
                    usage=result.usage,
                    status=AgentRun.Status.SUCCESS,
                )
            return assistant_msg
        except LLMError as exc:
            # Transação revertida — nada parcial sobrou. A sessão in-memory pode
            # ter mutações das tools; recarrega pra refletir o estado real do DB.
            session.refresh_from_db()
            AgentRun.objects.create(
                agent_name=AGENT_NAME,
                session=session,
                input={"phase": starting_phase},
                output={},
                usage={},
                status=AgentRun.Status.ERROR,
                error=str(exc),
            )
            raise ApplicationError(f"Falha no entrevistador: {exc}") from exc

    # ─── helpers ──────────────────────────────────────────────────────────────

    def _persist_incoming(self, session: InterviewSession, user_text: str | None) -> None:
        if user_text is not None:
            ChatMessage.objects.create(
                session=session,
                role=ChatMessage.Role.USER,
                content=[{"type": "text", "text": user_text}],
                is_visible=True,
            )
        elif not session.messages.exists():
            # Primeiro turn: kickoff invisível garante que o histórico começa com user.
            ChatMessage.objects.create(
                session=session,
                role=ChatMessage.Role.USER,
                content=[{"type": "text", "text": _KICKOFF}],
                is_visible=False,
            )
        else:
            raise ApplicationError("user_text é obrigatório após o primeiro turn.")

    def _build_system(self) -> str:
        template = _PROMPT_PATH.read_text(encoding="utf-8")
        kb = self._knowledge.load_for_agent(AGENT_NAME)
        today = timezone.localdate().strftime("%d/%m/%Y")
        return template.replace(_KB_PLACEHOLDER, kb).replace(_DATE_PLACEHOLDER, today)

    def _reconcile_phase(self, session: InterviewSession) -> None:
        """Nunca deixa `current_phase` ficar atrás do que foi coletado. Aplica o
        piso derivado dos dados, sem regredir uma fase que o LLM já avançou (ex.:
        `review`/`done` via `mark_phase_complete`)."""
        floor = derive_phase_floor(session.collected_data)
        if phase_index(floor) > phase_index(session.current_phase):
            session.current_phase = floor

    def _build_state_note(self, session: InterviewSession) -> str:
        """Bloco de estado vivo anexado ao FINAL do system (preserva o prefixo
        cacheável template+KB). Diz ao modelo em que fase o sistema está e o que
        já foi gravado via tools — sem isso ele voa às cegas e esquece de chamar
        `mark_phase_complete`/`record_*`."""
        Phase = InterviewSession.Phase
        data = session.collected_data or {}
        status = section_status(data)
        skipped = skipped_sections(data)

        def line(label: str, phase: str, count: int | None = None) -> str:
            if phase in skipped:
                return f"  [∅] {label} (candidato declarou não ter — marcada vazia)"
            mark = "✓" if status.get(phase) else "✗"
            suffix = f" ({count} registrado(s))" if count is not None else ""
            return f"  [{mark}] {label}{suffix}"

        current = session.current_phase
        order = Phase.values
        cur_idx = phase_index(current)
        next_phase = order[cur_idx + 1] if 0 <= cur_idx < len(order) - 1 else current

        # Contatos: mesmo com o mínimo ok, LinkedIn/GitHub não entram no mínimo.
        # Sem este lembrete o modelo avança cedo demais e pula a pergunta de redes.
        info = data.get("personal_info") or {}
        personal_note = ""
        if status.get(Phase.PERSONAL_INFO) and not (info.get("linkedin_url") or info.get("github_url")):
            personal_note = " — obrigatórios ok, mas ainda sem LinkedIn/GitHub: pergunte uma vez antes de avançar"

        checklist = "\n".join(
            [
                line("Dados pessoais", Phase.PERSONAL_INFO) + personal_note,
                line("Formação", Phase.EDUCATION, len(data.get("education") or [])),
                line("Experiência", Phase.EXPERIENCE, len(data.get("experiences") or [])),
                line("Projetos", Phase.PROJECTS, len(data.get("projects") or [])),
                line("Habilidades", Phase.SKILLS, len(data.get("skills") or [])),
            ]
        )
        return (
            "\n\n---\n\n## ESTADO ATUAL DA ENTREVISTA (uso interno — não repita ao candidato)\n\n"
            f"- Fase atual no sistema: **{Phase(current).label}** (`{current}`)\n"
            f"- Próxima fase esperada: `{next_phase}`\n"
            "- Coleta já registrada via tools:\n"
            f"{checklist}\n\n"
            "Lembretes: o sistema só avança a fase quando você chama "
            "`mark_phase_complete(next_phase)` — seu texto NÃO avança nada. E só registra "
            "dados quando você chama as tools `record_*` — NUNCA diga que registrou algo "
            "sem ter chamado a tool correspondente no MESMO turno. As seções marcadas com "
            "[✗] acima têm dado PENDENTE: `mark_phase_complete` será REJEITADA enquanto "
            "elas não forem resolvidas — registre via `record_*` (se o candidato contou) "
            "ou `mark_section_empty` (se ele genuinamente não tem)."
        )

    def _build_history(self, session: InterviewSession) -> list[dict]:
        return [{"role": msg.role, "content": msg.text} for msg in session.messages.all()]

    def _execute_tool(self, session: InterviewSession, state: dict, name: str, tool_input: dict) -> Any:
        data = session.collected_data
        if name == "record_personal_info":
            info = data.setdefault("personal_info", {})
            cleaned = {k: v for k, v in tool_input.items() if v not in (None, "")}
            info.update(cleaned)
            # Espelha os campos sobrepostos no CandidateProfile do usuário, pra que
            # a tela de Perfil reflita o que foi coletado na entrevista.
            sync_profile_from_personal_info(user=session.user, personal_info=cleaned)
            return {"ok": True}
        if name == "record_education":
            _upsert(data.setdefault("education", []), tool_input, ("institution", "course"))
            return {"ok": True}
        if name == "record_experience":
            _upsert(data.setdefault("experiences", []), tool_input, ("company", "role"))
            return {"ok": True}
        if name == "record_project":
            _upsert(data.setdefault("projects", []), tool_input, ("name",))
            return {"ok": True}
        if name == "record_skills":
            data["skills"] = tool_input.get("skills", [])
            return {"ok": True}
        if name == "mark_section_empty":
            section = tool_input.get("section")
            if section not in SKIPPABLE_PHASES:
                return {
                    "ok": False,
                    "error": f"seção não pulável: {section} (puláveis: "
                    f"{', '.join(sorted(SKIPPABLE_PHASES))})",
                }
            skipped = data.setdefault(SKIPPED_KEY, [])
            if section not in skipped:
                skipped.append(section)
            return {"ok": True, "skipped": section}
        if name == "mark_phase_complete":
            nxt = tool_input.get("next_phase")
            if nxt not in InterviewSession.Phase.values:
                return {"ok": False, "error": f"fase inválida: {nxt}"}
            # Gate: não avança por cima de seção com dado pendente (não gravado e
            # não marcado vazio). Pega o modelo que alucina "registrei X" no texto
            # sem ter chamado a `record_*`. Devolve erro acionável e o loop segue —
            # o modelo registra o que falta e tenta de novo no mesmo turn.
            missing = missing_sections_before(data, nxt)
            if missing:
                Phase = InterviewSession.Phase
                labels = ", ".join(Phase(m).label for m in missing)
                return {
                    "ok": False,
                    "error": (
                        f"Não pode avançar para '{nxt}': as seções [{labels}] ainda "
                        "têm dado pendente. Para cada uma, chame a `record_*` "
                        "correspondente (se o candidato te contou) OU "
                        "`mark_section_empty` (se ele genuinamente não tem) ANTES de "
                        "chamar `mark_phase_complete` de novo."
                    ),
                }
            session.current_phase = nxt
            return {"ok": True, "current_phase": nxt}
        if name == "request_clarification":
            question = tool_input.get("question", "").strip()
            msg = ChatMessage.objects.create(
                session=session,
                role=ChatMessage.Role.ASSISTANT,
                content=[{"type": "text", "text": question}],
                is_visible=True,
            )
            state["clarification_msg"] = msg
            return {"ok": True}
        return {"ok": False, "error": f"tool desconhecida: {name}"}

    def _persist_assistant(self, session: InterviewSession, state: dict, result: Any) -> ChatMessage:
        # request_clarification já criou a mensagem visível — só anexa o usage.
        clarification = state["clarification_msg"]
        if clarification is not None:
            clarification.usage = result.usage
            clarification.save(update_fields=["usage", "updated_at"])
            return clarification

        text = result.final_text.strip() or _EMPTY_FALLBACK
        return ChatMessage.objects.create(
            session=session,
            role=ChatMessage.Role.ASSISTANT,
            content=[{"type": "text", "text": text}],
            is_visible=True,
            usage=result.usage,
        )
