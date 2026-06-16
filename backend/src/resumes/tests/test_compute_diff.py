"""Diff semântico entre duas versões de `structured_data`."""

from resumes.use_cases.compute_diff import compute_diff


def test_detects_bullet_changes():
    v1 = {
        "experiences": [
            {
                "id": "acme-dev",
                "role": "Dev",
                "company": "Acme",
                "bullets": ["Fiz X.", "Fiz Y."],
            }
        ]
    }
    v2 = {
        "experiences": [
            {
                "id": "acme-dev",
                "role": "Dev",
                "company": "Acme",
                # Mesmo id, mesma quantidade de bullets, mas os 2 mudaram.
                "bullets": ["Construí X com métrica.", "Liderei Y."],
            }
        ]
    }

    changes = compute_diff(v1, v2)
    mods = [c for c in changes if c["type"] == "mod"]
    assert len(mods) == 2
    assert len(changes) == 2


def test_detects_added_section():
    v1 = {
        "experiences": [
            {"id": "acme-dev", "role": "Dev", "company": "Acme", "bullets": ["Fiz X."]}
        ]
    }
    v2 = {
        "experiences": [
            {"id": "acme-dev", "role": "Dev", "company": "Acme", "bullets": ["Fiz X."]},
            # Experiência de id inédito → add por bullet.
            {"id": "nubank-dev", "role": "Eng", "company": "Nubank", "bullets": ["Novo feito."]},
        ]
    }

    changes = compute_diff(v1, v2)
    adds = [c for c in changes if c["type"] == "add"]
    assert len(adds) >= 1
    assert any(c["after"] == "Novo feito." for c in adds)
