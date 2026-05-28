"""Testes do parser de frontmatter — puro Python, sem Django."""
import pytest

from knowledge.services.frontmatter import (
    FrontmatterError,
    ParsedDocument,
    parse_file,
    parse_string,
)


def test_parse_string_with_full_frontmatter_returns_parsed_document():
    raw = """---
category: writing
agents:
  - writer
priority: always
tags:
  - bullets
---
Corpo do documento.
"""
    parsed = parse_string(raw)

    assert isinstance(parsed, ParsedDocument)
    assert parsed.category == "writing"
    assert parsed.agents == ["writer"]
    assert parsed.priority == "always"
    assert parsed.tags == ["bullets"]
    assert parsed.content == "Corpo do documento."
    assert parsed.metadata == {}
    assert parsed.has_full_frontmatter is True


def test_parse_string_extra_keys_go_into_metadata():
    raw = """---
category: examples
agents:
  - writer
priority: retrieve
tags:
  - x
level: junior
target_role: backend
score: 0.9
---
texto
"""
    parsed = parse_string(raw)

    assert parsed.metadata == {"level": "junior", "target_role": "backend", "score": 0.9}
    # Campos canônicos não vazam pro metadata
    assert "category" not in parsed.metadata
    assert "agents" not in parsed.metadata
    assert "priority" not in parsed.metadata
    assert "tags" not in parsed.metadata


def test_parse_string_without_frontmatter_returns_none():
    raw = "# Apenas markdown puro\n\nSem frontmatter algum."
    assert parse_string(raw) is None


def test_parse_string_missing_category_raises():
    raw = """---
agents:
  - writer
priority: always
---
x
"""
    with pytest.raises(FrontmatterError) as exc_info:
        parse_string(raw)
    assert "category" in exc_info.value.extra["missing"]


def test_parse_string_missing_agents_raises():
    raw = """---
category: writing
priority: always
---
x
"""
    with pytest.raises(FrontmatterError) as exc_info:
        parse_string(raw)
    assert "agents" in exc_info.value.extra["missing"]


def test_parse_string_missing_priority_raises():
    raw = """---
category: writing
agents:
  - writer
---
x
"""
    with pytest.raises(FrontmatterError) as exc_info:
        parse_string(raw)
    assert "priority" in exc_info.value.extra["missing"]


def test_parse_string_invalid_priority_raises():
    raw = """---
category: writing
agents:
  - writer
priority: sometimes
---
x
"""
    with pytest.raises(FrontmatterError) as exc_info:
        parse_string(raw)
    assert exc_info.value.extra["got"] == "sometimes"


def test_parse_string_agents_not_list_raises():
    raw = """---
category: writing
agents: writer
priority: always
---
x
"""
    with pytest.raises(FrontmatterError):
        parse_string(raw)


def test_parse_string_tags_not_list_raises():
    raw = """---
category: writing
agents:
  - writer
priority: always
tags: bullets
---
x
"""
    with pytest.raises(FrontmatterError):
        parse_string(raw)


def test_parse_file_reads_disk(tmp_path):
    file_ = tmp_path / "doc.md"
    file_.write_text(
        """---
category: writing
agents:
  - writer
priority: always
---
conteúdo
""",
        encoding="utf-8",
    )
    parsed = parse_file(file_)
    assert parsed is not None
    assert parsed.category == "writing"
    assert parsed.content == "conteúdo"


def test_parse_file_without_frontmatter_returns_none(tmp_path):
    file_ = tmp_path / "readme.md"
    file_.write_text("# README\n\nplaceholder", encoding="utf-8")
    assert parse_file(file_) is None
