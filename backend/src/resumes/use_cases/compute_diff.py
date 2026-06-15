"""Diff estrutural entre duas versões de `structured_data`.

Produz uma lista plana de `Change`s legíveis pra UI (timeline de "o que mudou
da v1 pra v2"). Não é um diff textual char-a-char — é semântico por seção:

- `summary`: muda → 1 change `mod` (section="Resumo").
- `experiences` / `education` / `projects`: entradas casadas por `id` estável
  (slug de company-role). Entrada nova → `add` por bullet; entrada removida →
  `rem` por bullet; entrada casada → bullets alinhados por índice (`mod` quando
  diferem, `add`/`rem` pros índices extras).
- `skills`: diferença de conjunto → `add` por skill novo, `rem` por removido.

Cada Change: `{"type": "add"|"rem"|"mod", "section": str, "before": str|None,
"after": str|None}`.
"""


def _entry_id(entry: dict, index: int) -> str:
    """Id estável da entrada; fallback determinístico se faltar."""
    eid = entry.get("id")
    if eid:
        return str(eid)
    return f"__idx_{index}"


def _entry_label(section_singular: str, entry: dict) -> str:
    """Rótulo legível da seção pra uma entrada específica.

    Ex: "Experiência · ACME" / "Educação · USP" / "Projeto · CLI tool".
    """
    label = (
        entry.get("company")
        or entry.get("institution")
        or entry.get("name")
        or entry.get("role")
        or entry.get("course")
        or "—"
    )
    return f"{section_singular} · {label}"


def _diff_bulleted_section(old: list, new: list, section_singular: str) -> list[dict]:
    """Casa entradas por id e alinha bullets por índice."""
    changes: list[dict] = []

    old_by_id = {_entry_id(e, i): e for i, e in enumerate(old or [])}
    new_by_id = {_entry_id(e, i): e for i, e in enumerate(new or [])}

    # Ordem de iteração estável: ids do new na ordem original, depois ids só do old.
    new_ids = [_entry_id(e, i) for i, e in enumerate(new or [])]
    old_only_ids = [eid for eid in old_by_id if eid not in new_by_id]

    for eid in new_ids:
        new_entry = new_by_id[eid]
        label = _entry_label(section_singular, new_entry)
        new_bullets = new_entry.get("bullets", []) or []

        if eid not in old_by_id:
            # Entrada inteiramente nova → 1 "add" por bullet.
            for bullet in new_bullets:
                changes.append({"type": "add", "section": label, "before": None, "after": bullet})
            continue

        # Entrada casada: alinhar bullets por índice.
        old_bullets = old_by_id[eid].get("bullets", []) or []
        max_len = max(len(old_bullets), len(new_bullets))
        for idx in range(max_len):
            old_b = old_bullets[idx] if idx < len(old_bullets) else None
            new_b = new_bullets[idx] if idx < len(new_bullets) else None
            if old_b is not None and new_b is not None:
                if old_b != new_b:
                    changes.append({"type": "mod", "section": label, "before": old_b, "after": new_b})
            elif new_b is not None:  # índice extra no new
                changes.append({"type": "add", "section": label, "before": None, "after": new_b})
            else:  # índice extra no old
                changes.append({"type": "rem", "section": label, "before": old_b, "after": None})

    for eid in old_only_ids:
        old_entry = old_by_id[eid]
        label = _entry_label(section_singular, old_entry)
        for bullet in old_entry.get("bullets", []) or []:
            changes.append({"type": "rem", "section": label, "before": bullet, "after": None})

    return changes


def compute_diff(old: dict, new: dict) -> list[dict]:
    old = old or {}
    new = new or {}
    changes: list[dict] = []

    # ── summary ──────────────────────────────────────────────────────────────
    old_summary = (old.get("summary") or "").strip()
    new_summary = (new.get("summary") or "").strip()
    if old_summary != new_summary:
        changes.append(
            {
                "type": "mod",
                "section": "Resumo",
                "before": old_summary or None,
                "after": new_summary or None,
            }
        )

    # ── seções com bullets casadas por id ────────────────────────────────────
    changes.extend(_diff_bulleted_section(old.get("experiences", []), new.get("experiences", []), "Experiência"))
    changes.extend(_diff_bulleted_section(old.get("education", []), new.get("education", []), "Educação"))
    changes.extend(_diff_bulleted_section(old.get("projects", []), new.get("projects", []), "Projeto"))

    # ── skills (diferença de conjunto, preservando ordem de aparição) ─────────
    old_skills = old.get("skills", []) or []
    new_skills = new.get("skills", []) or []
    old_set = set(old_skills)
    new_set = set(new_skills)
    for skill in new_skills:
        if skill not in old_set:
            changes.append({"type": "add", "section": "Skills", "before": None, "after": skill})
    for skill in old_skills:
        if skill not in new_set:
            changes.append({"type": "rem", "section": "Skills", "before": skill, "after": None})

    return changes
