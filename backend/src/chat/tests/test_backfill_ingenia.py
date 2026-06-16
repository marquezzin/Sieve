"""Command one-shot `backfill_ingenia_project` — backfill idempotente do projeto.

Cobre: dry-run não grava, --apply insere, rodar 2x não duplica, --recompute-phase
aplica o piso de fase.
"""

import pytest
from django.core.management import call_command

from chat.tests.factories import InterviewSessionFactory


@pytest.mark.django_db
def test_dry_run_does_not_write():
    session = InterviewSessionFactory(collected_data={})
    call_command("backfill_ingenia_project", f"--session={session.id}")

    session.refresh_from_db()
    assert session.collected_data.get("projects") in (None, [])


@pytest.mark.django_db
def test_apply_inserts_ingenia():
    session = InterviewSessionFactory(collected_data={})
    call_command("backfill_ingenia_project", f"--session={session.id}", "--apply")

    session.refresh_from_db()
    projects = session.collected_data["projects"]
    assert len(projects) == 1
    assert projects[0]["name"] == "Ingenia"
    assert projects[0]["tech_stack"] == ["desenvolvimento web"]


@pytest.mark.django_db
def test_apply_is_idempotent():
    session = InterviewSessionFactory(collected_data={})
    call_command("backfill_ingenia_project", f"--session={session.id}", "--apply")
    call_command("backfill_ingenia_project", f"--session={session.id}", "--apply")

    session.refresh_from_db()
    assert len(session.collected_data["projects"]) == 1


@pytest.mark.django_db
def test_recompute_phase_bumps_floor():
    # collected_data já com skills → piso = skills; --recompute-phase destrava.
    session = InterviewSessionFactory(
        current_phase="education",
        collected_data={"skills": ["Python"]},
    )
    call_command(
        "backfill_ingenia_project",
        f"--session={session.id}",
        "--apply",
        "--recompute-phase",
    )

    session.refresh_from_db()
    assert session.current_phase == "skills"
