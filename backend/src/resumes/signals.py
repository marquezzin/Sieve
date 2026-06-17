"""Signal que mantém `ResumeVersion.embedding` em dia.

Em todo `pre_save`, se o `structured_data` mudou (hash diferente) ou o embedding
ainda é nulo, recalcula o vetor via `get_embeddings_client()`. Best-effort: se a
vetorização falhar, loga e segue — embedding fica como está (não bloqueia o save
do currículo). O hash só avança quando o embedding é de fato recalculado, então
uma falha transitória é reprocessada no próximo save.

Custo controlado: o hash de `structured_data` evita re-embeddar quando nada
mudou. Em teste, `EMBEDDINGS_PROVIDER=fake` torna isso offline e determinístico.
"""

import hashlib
import json

from django.db.models.signals import pre_save
from django.dispatch import receiver
from loguru import logger

from integrations.embeddings.base import EmbeddingsError

from .models import ResumeVersion


def compute_structured_data_hash(structured_data: dict) -> str:
    """Hash estável do conteúdo — independente da ordem das chaves."""
    payload = json.dumps(structured_data or {}, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


@receiver(pre_save, sender=ResumeVersion)
def recompute_embedding(sender, instance: ResumeVersion, **kwargs) -> None:
    new_hash = compute_structured_data_hash(instance.structured_data or {})
    unchanged = new_hash == instance.structured_data_hash and instance.embedding is not None
    if unchanged:
        return

    text = instance._build_embedding_text()
    if not text.strip():
        # Sem conteúdo pra vetorizar — registra o hash pra não retentar à toa.
        instance.structured_data_hash = new_hash
        return

    try:
        from integrations.embeddings.factory import get_embeddings_client

        instance.embedding = get_embeddings_client().embed(text, input_type="document")
        instance.structured_data_hash = new_hash
    except EmbeddingsError as exc:
        logger.warning(
            f"Falha ao recalcular embedding do ResumeVersion "
            f"(resume={instance.resume_id} v={instance.version_number}): {exc}"
        )
