"""Task Celery da geração de foto profissional (Fase 4).

Thin: carrega o profile, chama UM use case e devolve o id. O use case
(`GenerateProfessionalPhoto`) faz o trabalho, fala com a API externa de
headshot (que pode estar "dormindo" no Render — o client acorda via /health
antes de gerar) e gerencia as transições de `photo_status` (ready/failed)
internamente, inclusive marcando `failed` e re-raise em erro.

Sem retry automático do Celery: o client já faz 1 retry de rede internamente,
e a chamada à API é cara — retry cego re-rodaria a geração inteira. A exceção
**propaga** (task falha visível no Celery), mas o use case já gravou
`photo_status="failed"` no DB antes do re-raise, então o frontend (polling) vê
o estado `failed`.

Time limits generosos: o cold-start do Render (~30-50s) + a geração (~15-30s)
+ 1 retry podem somar minutos. Os limites são só um backstop; o timeout real
é do httpx no client.
"""

from celery import shared_task

from accounts.models import CandidateProfile
from accounts.use_cases.generate_professional_photo import GenerateProfessionalPhoto


@shared_task(soft_time_limit=480, time_limit=540)
def generate_professional_photo_task(profile_id: str) -> str:
    profile = CandidateProfile.objects.get(id=profile_id)
    GenerateProfessionalPhoto().execute(profile=profile)
    return str(profile.id)
