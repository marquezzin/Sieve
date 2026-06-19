"""Task Celery da geração de foto profissional (Fase 4).

Thin: carrega o profile, chama UM use case e devolve o id. O use case
(`GenerateProfessionalPhoto`) faz o trabalho, fala com a API externa de
headshot (que pode estar "dormindo" no Render — o client acorda via /health
antes de gerar) e gerencia as transições de `photo_status` (ready/failed)
internamente, inclusive marcando `failed` e re-raise em erro.

Sem retry automático do Celery: o client já faz 1 retry de rede internamente,
e a chamada à API é cara — retry cego re-rodaria a geração inteira.

Garantia de status: a task marca `photo_status="failed"` em QUALQUER exceção
antes de re-raise. O `execute()` já marca `failed` nos erros que acontecem
dentro dele, mas falhas que ocorrem ANTES (ex.: construir o client sem
`HEADSHOT_API_KEY`, no `__init__` do use case) escapariam desse try — e
deixariam o `photo_status` preso em `generating` pra sempre. O `update()` aqui
é o backstop que garante que o frontend (polling) sempre vê `ready` ou `failed`.

Time limits generosos: o cold-start do Render (~30-50s) + a geração (~15-30s)
+ 1 retry podem somar minutos. Os limites são só um backstop; o timeout real
é do httpx no client.
"""

from celery import shared_task
from loguru import logger

from accounts.models import CandidateProfile
from accounts.use_cases.generate_professional_photo import GenerateProfessionalPhoto


@shared_task(soft_time_limit=480, time_limit=540)
def generate_professional_photo_task(profile_id: str) -> str:
    profile = CandidateProfile.objects.get(id=profile_id)
    try:
        GenerateProfessionalPhoto().execute(profile=profile)
    except Exception:
        logger.exception("Falha na geração de foto profissional; marcando failed.")
        CandidateProfile.objects.filter(id=profile_id).update(photo_status="failed")
        raise
    return str(profile.id)
