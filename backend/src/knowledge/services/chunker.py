"""Chunking de Markdown em pedaços pra embedding.

Estratégia: quebrar em fronteiras naturais (headers `##` e parágrafos), respeitar
um teto de palavras por chunk (`max_words`), com overlap leve entre chunks
adjacentes pra preservar contexto na borda.

Output: lista de `Chunk(ordinal, content, heading)` na ordem original do texto.
Caller é responsável por mapear chunk → embedding e persistir.
"""
import re
from dataclasses import dataclass


@dataclass(frozen=True)
class Chunk:
    ordinal: int
    content: str
    heading: str = ""

    @property
    def word_count(self) -> int:
        return len(self.content.split())


# Match headers `##` (ou mais), capturando o nível e o texto.
_HEADER_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$", re.MULTILINE)


def chunk_markdown(md: str, max_words: int = 300, overlap_words: int = 50) -> list[Chunk]:
    """Divide MD em chunks respeitando headers `##` como fronteiras preferenciais.

    Algoritmo:
    1. Splitta em "seções" usando headers `##+` como pontos de corte.
    2. Cada seção que cabe em `max_words` vira 1 chunk.
    3. Seção grande demais é subdividida em sub-chunks por parágrafos (`\n\n`)
       respeitando `max_words`, com `overlap_words` palavras de continuidade
       entre sub-chunks (preserva contexto na borda).

    Headers de nível 1 (`#`) viram heading do primeiro chunk mas não dividem.
    """
    md = md.strip()
    if not md:
        return []

    sections = _split_by_h2_plus(md)
    chunks: list[Chunk] = []
    ordinal = 0

    for heading, body in sections:
        words = body.split()
        if len(words) <= max_words:
            chunks.append(Chunk(ordinal=ordinal, content=body.strip(), heading=heading))
            ordinal += 1
            continue

        sub_chunks = _split_long_section(body, max_words=max_words, overlap_words=overlap_words)
        for sub in sub_chunks:
            chunks.append(Chunk(ordinal=ordinal, content=sub.strip(), heading=heading))
            ordinal += 1

    return chunks


def _split_by_h2_plus(md: str) -> list[tuple[str, str]]:
    """Quebra MD em seções por headers `##+`. Texto antes do primeiro header vira seção sem heading."""
    matches = list(_HEADER_RE.finditer(md))
    sections: list[tuple[str, str]] = []

    if not matches:
        return [("", md)]

    if matches[0].start() > 0:
        preamble = md[: matches[0].start()].strip()
        if preamble:
            sections.append(("", preamble))

    for i, match in enumerate(matches):
        level = len(match.group(1))
        heading_text = match.group(2).strip()

        # Headers de nível 1 são título do doc — não quebra, deixa em preamble.
        if level == 1 and i == 0 and matches[0].start() == 0:
            # Pega tudo até o próximo header como "preamble com título"
            end = matches[i + 1].start() if i + 1 < len(matches) else len(md)
            body = md[: end].strip()
            sections.append(("", body))
            continue

        if level == 1:
            # Headers `#` no meio do doc são incomuns mas tratamos como uma seção.
            pass

        end = matches[i + 1].start() if i + 1 < len(matches) else len(md)
        body = md[match.end() : end].strip()
        if body:
            sections.append((heading_text, body))

    return sections


def _split_long_section(body: str, max_words: int, overlap_words: int) -> list[str]:
    """Quebra uma seção grande em sub-chunks por parágrafos, respeitando `max_words`."""
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", body) if p.strip()]
    sub_chunks: list[str] = []
    current: list[str] = []
    current_words = 0

    for para in paragraphs:
        para_words = para.split()
        if current_words + len(para_words) <= max_words:
            current.append(para)
            current_words += len(para_words)
            continue

        if current:
            sub_chunks.append("\n\n".join(current))
            # Overlap: pega últimas N palavras do chunk anterior pra começar o próximo
            tail = " ".join(_words_of("\n\n".join(current))[-overlap_words:])
            current = [tail, para] if overlap_words > 0 else [para]
            current_words = len(_words_of(current[0])) + len(para_words) if overlap_words > 0 else len(para_words)
        else:
            # Parágrafo único maior que max_words — força corte por palavras
            sub_chunks.extend(_chunk_by_words(para, max_words, overlap_words))
            current = []
            current_words = 0

    if current:
        sub_chunks.append("\n\n".join(current))

    return sub_chunks


def _chunk_by_words(text: str, max_words: int, overlap_words: int) -> list[str]:
    """Fallback: parágrafo gigante quebrado em janelas fixas de palavras."""
    words = text.split()
    chunks: list[str] = []
    step = max(1, max_words - overlap_words)
    for start in range(0, len(words), step):
        slice_ = words[start : start + max_words]
        if not slice_:
            break
        chunks.append(" ".join(slice_))
        if start + max_words >= len(words):
            break
    return chunks


def _words_of(text: str) -> list[str]:
    return text.split()
