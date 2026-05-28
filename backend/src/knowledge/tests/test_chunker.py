"""Testes do `chunk_markdown` — puro Python, sem Django."""
from knowledge.services.chunker import Chunk, chunk_markdown


def test_empty_string_returns_empty_list():
    assert chunk_markdown("") == []
    assert chunk_markdown("   \n  ") == []


def test_markdown_without_headers_returns_single_chunk():
    md = "Parágrafo único sem header algum.\n\nOutro parágrafo curto."
    chunks = chunk_markdown(md)

    assert len(chunks) == 1
    assert chunks[0].ordinal == 0
    assert chunks[0].heading == ""
    assert "Parágrafo único" in chunks[0].content


def test_three_h2_sections_produce_three_chunks_with_continuous_ordinals():
    md = """## Primeira

Conteúdo da primeira seção.

## Segunda

Conteúdo da segunda.

## Terceira

Final.
"""
    chunks = chunk_markdown(md)

    assert len(chunks) == 3
    assert [c.ordinal for c in chunks] == [0, 1, 2]
    assert [c.heading for c in chunks] == ["Primeira", "Segunda", "Terceira"]
    assert chunks[0].content == "Conteúdo da primeira seção."
    assert chunks[2].content == "Final."


def test_h1_at_top_becomes_preamble_chunk_with_empty_heading():
    md = """# Título do doc

Intro do doc.

## Seção A

Texto da seção A.
"""
    chunks = chunk_markdown(md)

    # 1 preamble (h1 + intro) + 1 seção A
    assert len(chunks) == 2
    assert chunks[0].heading == ""
    assert "Título do doc" in chunks[0].content
    assert "Intro do doc" in chunks[0].content
    assert chunks[1].heading == "Seção A"
    assert "Texto da seção A" in chunks[1].content
    # Ordinals contínuos sem buraco
    assert [c.ordinal for c in chunks] == [0, 1]


def test_long_section_gets_split_into_subchunks_with_overlap():
    # Cada parágrafo tem ~30 palavras; 8 parágrafos ≈ 240 palavras.
    para_words = ["palavra"] * 30
    paragraphs = [" ".join(para_words + [f"marcador{i}"]) for i in range(8)]
    body = "\n\n".join(paragraphs)
    md = f"## Grande\n\n{body}\n"

    chunks = chunk_markdown(md, max_words=80, overlap_words=10)

    # Seção excede max_words → deve quebrar em sub-chunks múltiplos.
    assert len(chunks) > 1
    # Todos preservam o heading da seção
    assert all(c.heading == "Grande" for c in chunks)
    # Ordinals contínuos
    assert [c.ordinal for c in chunks] == list(range(len(chunks)))
    # Cada sub-chunk respeita o teto de palavras
    for c in chunks:
        assert c.word_count <= 80


def test_ordinals_are_continuous_across_mixed_section_sizes():
    big_para = " ".join(["palavra"] * 600)
    md = f"""## Curta

ok curto.

## Gigante

{big_para}

## Outra curta

fim.
"""
    chunks = chunk_markdown(md, max_words=100, overlap_words=20)
    ordinals = [c.ordinal for c in chunks]
    assert ordinals == list(range(len(ordinals)))
    # Curtas vêm primeiro/último, gigante quebra no meio
    assert chunks[0].heading == "Curta"
    assert chunks[-1].heading == "Outra curta"
    # Tem que ter pelo menos 1 sub-chunk com heading "Gigante"
    assert any(c.heading == "Gigante" for c in chunks)


def test_chunk_dataclass_word_count_property():
    c = Chunk(ordinal=0, content="uma duas tres quatro", heading="x")
    assert c.word_count == 4
