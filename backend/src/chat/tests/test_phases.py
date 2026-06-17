"""Unit de `chat.services` — verdade de fase derivada do `collected_data`.

Funções puras (sem DB). Cobrem os mínimos por seção, o piso CONTÍGUO (para no
primeiro buraco real, não mascara gap), seções marcadas vazias via
`mark_section_empty` (`_skipped`) que o piso atravessa, o gate
`missing_sections_before`, e o teto em `skills`.
"""

from chat.services import (
    SKIPPED_KEY,
    derive_phase_floor,
    missing_sections_before,
    phase_index,
    section_resolved,
    section_status,
    skipped_sections,
)

_FULL_PERSONAL = {"name": "Ana", "email": "a@x.com", "phone": "1", "location": "SP"}
_FULL_EDUCATION = {"institution": "X", "course": "CC"}
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


def test_floor_is_contiguous_stops_at_first_gap():
    # Só skills satisfeito, sem nada antes: o piso PARA no buraco de personal_info.
    # (Antes pulava o gap e ia pra skills — agora o piso é honesto.)
    assert derive_phase_floor({"skills": ["Python"]}) == "intro"


def test_floor_stops_at_pending_experience():
    # Caso Gabriel: pessoal+formação ok, mas experiência tem dado pendente (não
    # gravada) e skills foi gravado. O piso NÃO mascara: trava em `education`.
    data = {
        "personal_info": _FULL_PERSONAL,
        "education": [_FULL_EDUCATION],
        # sem "experiences" (a IA esqueceu de chamar record_experience)
        "skills": ["Python"],
    }
    assert derive_phase_floor(data) == "education"


def test_skipped_section_lets_floor_flow_through():
    # Candidato sem projetos: marca `projects` como vazio → o piso atravessa.
    data = {
        "personal_info": _FULL_PERSONAL,
        "education": [_FULL_EDUCATION],
        "experiences": [_FULL_EXPERIENCE],
        "skills": ["Python"],
        SKIPPED_KEY: ["projects"],
    }
    assert derive_phase_floor(data) == "skills"


def test_skipped_sections_filters_non_skippable():
    # `personal_info` não é pulável — um valor inválido em _skipped é ignorado.
    data = {SKIPPED_KEY: ["projects", "personal_info", "lixo"]}
    assert skipped_sections(data) == {"projects"}


def test_section_resolved_combines_collected_and_skipped():
    data = {
        "personal_info": _FULL_PERSONAL,
        SKIPPED_KEY: ["experience"],
    }
    resolved = section_resolved(data)
    assert resolved["personal_info"] is True  # coletado
    assert resolved["experience"] is True  # marcado vazio
    assert resolved["education"] is False  # nem um nem outro


def test_missing_sections_before_gates_pending_data():
    # Quer avançar pra `projects` mas a experiência tem dado pendente → bloqueia.
    data = {
        "personal_info": _FULL_PERSONAL,
        "education": [_FULL_EDUCATION],
        # sem experiences
    }
    assert missing_sections_before(data, "projects") == ["experience"]


def test_missing_sections_before_allows_when_skipped():
    data = {
        "personal_info": _FULL_PERSONAL,
        "education": [_FULL_EDUCATION],
        SKIPPED_KEY: ["experience"],
    }
    assert missing_sections_before(data, "projects") == []


def test_missing_sections_before_empty_when_resolved():
    data = {
        "personal_info": _FULL_PERSONAL,
        "education": [_FULL_EDUCATION],
        "experiences": [_FULL_EXPERIENCE],
    }
    assert missing_sections_before(data, "projects") == []


def test_floor_caps_at_skills():
    # Mesmo com tudo coletado, nunca deriva review/done (dependem do LLM/usuário).
    data = {
        "personal_info": _FULL_PERSONAL,
        "education": [_FULL_EDUCATION],
        "experiences": [_FULL_EXPERIENCE],
        "projects": [{"name": "Ingenia"}],
        "skills": ["Python"],
    }
    assert derive_phase_floor(data) == "skills"
    assert phase_index("skills") < phase_index("review")
