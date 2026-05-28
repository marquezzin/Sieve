"""Orquestra a ingestão da knowledge base.

Fluxo (idempotente):
1. Descobre todos os `.md` em `KNOWLEDGE_BASE_DIR` (recursivo).
2. Pra cada arquivo: parseia frontmatter; se ausente, marca como SKIPPED.
3. Calcula `content_hash` SHA-256 do conteúdo cru.
4. Compara com hash salvo no banco:
   - Match → UNCHANGED (pula).
   - Diff (ou doc novo) → re-chunka, embeda batch, upsert `KnowledgeDocument`
     e recria `KnowledgeChunk`s do zero.
5. Detecta docs em DB cujo arquivo sumiu do disco → marca como DELETED
   (apaga do banco — `on_delete=CASCADE` limpa chunks).
6. Retorna `IngestReport` com contagens.

Embedding: chamadas batched ao `EmbeddingsClient` (1 chamada por documento
contendo todos seus chunks, não 1 chamada por chunk).
"""
import hashlib
from dataclasses import dataclass, field
from pathlib import Path

from django.conf import settings
from django.db import transaction
from loguru import logger

from integrations.embeddings.base import EmbeddingsClient
from integrations.embeddings.factory import get_embeddings_client

from ..models import KnowledgeChunk, KnowledgeDocument
from .chunker import Chunk, chunk_markdown
from .frontmatter import FrontmatterError, ParsedDocument, parse_file


@dataclass
class FileResult:
    source_path: str
    status: str  # "new" | "updated" | "unchanged" | "skipped" | "error"
    chunks: int = 0
    reason: str = ""


@dataclass
class IngestReport:
    discovered: int = 0
    new: int = 0
    updated: int = 0
    unchanged: int = 0
    skipped: int = 0
    deleted: int = 0
    errors: int = 0
    files: list[FileResult] = field(default_factory=list)

    def summary_line(self) -> str:
        return (
            f"Ingested: {self.new} new, {self.updated} updated, "
            f"{self.unchanged} unchanged, {self.skipped} skipped, "
            f"{self.deleted} deleted, {self.errors} errors"
        )


def run_ingest(
    *,
    knowledge_dir: Path | None = None,
    embeddings_client: EmbeddingsClient | None = None,
    force: bool = False,
) -> IngestReport:
    """Roda o ingest completo. Idempotente.

    - `knowledge_dir`: override do diretório (default: `settings.KNOWLEDGE_BASE_DIR`).
    - `embeddings_client`: injeção pra testes (default: factory).
    - `force`: re-embeda tudo mesmo que hash não tenha mudado.
    """
    root = knowledge_dir or settings.KNOWLEDGE_BASE_DIR
    report = IngestReport()

    if not root.exists():
        logger.warning(f"knowledge_dir não existe: {root}")
        return report

    embeddings = embeddings_client  # lazy: só instancia se houver arquivo pra embedar
    md_files = sorted(root.rglob("*.md"))
    report.discovered = len(md_files)

    seen_source_paths: set[str] = set()

    for path in md_files:
        relative = path.relative_to(root.parent)
        source_path = str(relative).replace("\\", "/")
        seen_source_paths.add(source_path)

        try:
            parsed = parse_file(path)
        except FrontmatterError as e:
            report.errors += 1
            report.files.append(FileResult(source_path=source_path, status="error", reason=str(e)))
            logger.error(f"frontmatter inválido em {source_path}: {e}")
            continue

        if parsed is None:
            report.skipped += 1
            report.files.append(
                FileResult(source_path=source_path, status="skipped", reason="no frontmatter")
            )
            continue

        raw = path.read_text(encoding="utf-8")
        content_hash = _sha256(raw)
        existing = KnowledgeDocument.objects.filter(source_path=source_path).first()

        if existing and existing.content_hash == content_hash and not force:
            report.unchanged += 1
            report.files.append(
                FileResult(source_path=source_path, status="unchanged", chunks=existing.chunks.count())
            )
            continue

        chunks = chunk_markdown(
            parsed.content,
            max_words=settings.KNOWLEDGE_CHUNK_SIZE,
            overlap_words=settings.KNOWLEDGE_CHUNK_OVERLAP,
        )
        if not chunks:
            # Doc com frontmatter mas conteúdo vazio — vira documento sem chunks
            # (full-load ainda funciona via content_md no system prompt).
            embeddings_vectors: list[list[float]] = []
        else:
            if embeddings is None:
                embeddings = get_embeddings_client()
            embeddings_vectors = embeddings.embed_batch(
                [c.content for c in chunks],
                input_type="document",
            )

        with transaction.atomic():
            if existing:
                # Re-chunk: apaga chunks antigos, atualiza doc, cria chunks novos.
                existing.chunks.all().delete()
                doc = existing
                status = "updated"
            else:
                doc = KnowledgeDocument(source_path=source_path)
                status = "new"

            doc.category = parsed.category
            doc.agents = parsed.agents
            doc.priority = parsed.priority
            doc.tags = parsed.tags
            doc.metadata = parsed.metadata
            doc.content_md = parsed.content
            doc.content_hash = content_hash
            doc.save()

            chunk_objs = [
                KnowledgeChunk(
                    document=doc,
                    ordinal=c.ordinal,
                    content=c.content,
                    embedding=vec,
                    metadata={"heading": c.heading} if c.heading else {},
                )
                for c, vec in zip(chunks, embeddings_vectors, strict=True)
            ]
            if chunk_objs:
                KnowledgeChunk.objects.bulk_create(chunk_objs)

        if status == "new":
            report.new += 1
        else:
            report.updated += 1
        report.files.append(
            FileResult(source_path=source_path, status=status, chunks=len(chunks))
        )
        logger.info(f"ingest {status}: {source_path} ({len(chunks)} chunks)")

    # Cleanup: docs no banco cujo arquivo sumiu.
    stale = KnowledgeDocument.objects.exclude(source_path__in=seen_source_paths)
    deleted_count = stale.count()
    if deleted_count:
        deleted_paths = list(stale.values_list("source_path", flat=True))
        stale.delete()
        report.deleted = deleted_count
        for p in deleted_paths:
            report.files.append(FileResult(source_path=p, status="deleted", reason="file removed"))
            logger.info(f"ingest deleted: {p} (file removed)")

    return report


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()
