"""Unit de `chat.services` — verdade de fase derivada do `collected_data`.

Funções puras (sem DB). Cobrem os mínimos por seção, o piso correto, projetos
vazios pulados quando skills existe, e o teto em `skills`.
"""

from chat.services import derive_phase_floor, phase_index, section_status

_FULL_PERSONAL = {"name": "Ana", "email": "a@x.com", "phone": "1", "location": "SP"}
_FULL_EXPERIENCE = {"company": "Acme", "role": "Dev", "bullets": ["fiz X"]}


def test_empty_data_floor_is_intro():
    assert derive_phase_floor({}) == "intro"
    assert derive_phase_floor(None) == "intro"


def test_personal_info_requires_all_min_fields():
    assert section_status({"personal_info": _FULL_PERSONAL})["personal_info"] is True
    # Falta location → não satisfaz.
    partial = {"personal_info": {"name": "Ana", "email": "a@x.com", "phone": "1"}}
    assert section_status(partial)["personal_info"] is False
    assert derive_phase_floor(partial) == "intro"


def test_personal_info_only_floor():
    assert derive_phase_floor({"personal_info": _FULL_PERSONAL}) == "personal_info"


def test_experience_requires_bullet():
    no_bullet = {"experiences": [{"company": "Acme", "role": "Dev"}]}
    assert section_status(no_bullet)["experience"] is False
    with_bullet = {"experiences": [_FULL_EXPERIENCE]}
    assert section_status(with_bullet)["experience"] is True


def test_floor_is_max_satisfied_not_contiguous():
    # Só skills satisfeito (sem personal_info/experience): piso = skills mesmo assim.
    assert derive_phase_floor({"skills": ["Python"]}) == "skills"


def test_empty_projects_skipped_when_skills_present():
    # Caso Thales: projects vazio mas skills coletado → piso = skills (não trava em projects).
    data = {
        "personal_info": _FULL_PERSONAL,
        "education": [{"institution": "X", "course": "CC"}],
        "experiences": [_FULL_EXPERIENCE],
        "skills": ["Python"],
        # sem "projects"
    }
    assert derive_phase_floor(data) == "skills"


def test_floor_caps_at_skills():
    # Mesmo com tudo coletado, nunca deriva review/done (dependem do LLM/usuário).
    data = {
        "personal_info": _FULL_PERSONAL,
        "education": [{"institution": "X", "course": "CC"}],
        "experiences": [_FULL_EXPERIENCE],
        "projects": [{"name": "Ingenia"}],
        "skills": ["Python"],
    }
    assert derive_phase_floor(data) == "skills"
    assert phase_index("skills") < phase_index("review")


def test_thales_collected_data_derives_skills():
    # Snapshot fiel do collected_data real da sessão travada (sem projects).
    data = {
        "skills": ["Java", "SQL", "PostgreSQL"],
        "education": [
            {"course": "Ciência da Computação", "institution": "Sua instituição", "status": "in_progress"}
        ],
        "experiences": [
            {"role": "Estagiário", "company": "ENSTI Tecnologia", "bullets": ["Atuei no ETL Java..."]}
        ],
        "personal_info": {
            "name": "Thales Rassi",
            "email": "thales@gmail.com",
            "phone": "61993388719",
            "location": "Brasília-DF",
        },
    }
    assert derive_phase_floor(data) == "skills"
