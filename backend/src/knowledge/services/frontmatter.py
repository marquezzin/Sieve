"""Parser de frontmatter YAML para arquivos `.md` da knowledge base.

Wrapper fino sobre `python-frontmatter` que adiciona validação dos campos
obrigatórios (`category`, `agents`, `priority`) e normalização do shape.

Arquivos sem frontmatter retornam `None` — caller decide se ignora (READMEs)
ou loga warning.
"""
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import frontmatter

from core.errors import ApplicationError

VALID_PRIORITIES = {"always", "retrieve"}


class FrontmatterError(ApplicationError):
    """Frontmatter ausente, inválido, ou faltando campos obrigatórios."""

    status_code = 400


@dataclass(frozen=True)
class ParsedDocument:
    """Resultado de `parse_file`. `content` é o MD sem o bloco de frontmatter."""

    category: str
    agents: list[str]
    priority: str
    tags: list[str]
    metadata: dict[str, Any]
    content: str

    @property
    def has_full_frontmatter(self) -> bool:
        # Sempre True pra ParsedDocument — só existe se passou nas validações.
        return True


def parse_file(path: Path) -> ParsedDocument | None:
    """Lê arquivo `.md`, retorna `ParsedDocument` ou `None` se sem frontmatter.

    Frontmatter ausente é caso comum (READMEs placeholder) — retorna `None`
    silenciosamente. Frontmatter presente mas inválido é erro — levanta
    `FrontmatterError`.
    """
    raw = path.read_text(encoding="utf-8")
    post = frontmatter.loads(raw)

    if not post.metadata:
        return None

    return _build_parsed_document(post.metadata, post.content, path)


def parse_string(raw: str, label: str = "<inline>") -> ParsedDocument | None:
    """Variante de `parse_file` pra testes — recebe string em vez de Path."""
    post = frontmatter.loads(raw)
    if not post.metadata:
        return None
    return _build_parsed_document(post.metadata, post.content, label)


def _build_parsed_document(meta: dict[str, Any], content: str, source: Any) -> ParsedDocument:
    missing = [k for k in ("category", "agents", "priority") if k not in meta]
    if missing:
        raise FrontmatterError(
            f"Frontmatter de {source} faltando campos obrigatórios: {missing}",
            extra={"missing": missing, "source": str(source)},
        )

    category = str(meta["category"]).strip()
    agents_raw = meta["agents"]
    priority = str(meta["priority"]).strip()
    tags_raw = meta.get("tags", []) or []

    if not isinstance(agents_raw, list) or not all(isinstance(a, str) for a in agents_raw):
        raise FrontmatterError(
            f"Frontmatter de {source}: `agents` deve ser lista de strings",
            extra={"got": agents_raw, "source": str(source)},
        )
    if priority not in VALID_PRIORITIES:
        raise FrontmatterError(
            f"Frontmatter de {source}: `priority` deve ser um de {VALID_PRIORITIES}",
            extra={"got": priority, "source": str(source)},
        )
    if not isinstance(tags_raw, list):
        raise FrontmatterError(
            f"Frontmatter de {source}: `tags` deve ser lista",
            extra={"got": tags_raw, "source": str(source)},
        )

    # Tudo que não é campo canônico vira `metadata` livre (level, target_role, score etc).
    canonical = {"category", "agents", "priority", "tags"}
    extra_metadata = {k: v for k, v in meta.items() if k not in canonical}

    return ParsedDocument(
        category=category,
        agents=[a.strip() for a in agents_raw],
        priority=priority,
        tags=[str(t).strip() for t in tags_raw],
        metadata=extra_metadata,
        content=content.strip(),
    )
