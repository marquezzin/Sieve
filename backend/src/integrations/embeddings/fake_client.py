"""`DeterministicEmbeddingsClient` — embeddings offline e determinísticos.

Não faz chamada externa: vetoriza via hash de tokens. Textos com tokens em comum
produzem vetores próximos (cosseno alto); sem overlap, afastados. Útil em testes
e em ambientes sem credencial de embeddings (`EMBEDDINGS_PROVIDER=fake`), onde o
signal de `ResumeVersion` precisa recalcular embedding sem rede.

Mesma estratégia do fake usado nos testes de `knowledge/`, agora promovido pra
camada de integrations pra que a factory possa servi-lo em runtime.
"""

import hashlib
import random
import re

from django.conf import settings

from .base import EmbeddingsClient, InputType

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def _tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall(text.lower())


class DeterministicEmbeddingsClient(EmbeddingsClient):
    """Embeddings determinísticos baseados em tokens (sem chamada externa).

    `input_type` é ignorado de propósito: o mesmo texto produz o mesmo vetor seja
    documento ou query, pra que comparações coseno (currículo × keyword) sejam
    estáveis.
    """

    def __init__(self, *, dim: int | None = None) -> None:
        self.dim = dim or settings.EMBEDDINGS_DIM

    def embed_batch(
        self,
        texts: list[str],
        *,
        input_type: InputType = "document",
    ) -> list[list[float]]:
        return [self._vector_for(text) for text in texts]

    def _vector_for(self, text: str) -> list[float]:
        tokens = _tokenize(text)
        if not tokens:
            return [0.0] * self.dim

        vec = [0.0] * self.dim
        for token in tokens:
            seed = int(hashlib.sha256(token.encode("utf-8")).hexdigest()[:16], 16)
            rng = random.Random(seed)
            for i in range(self.dim):
                vec[i] += rng.uniform(-1.0, 1.0)

        magnitude = sum(v * v for v in vec) ** 0.5
        if magnitude == 0:
            return [0.0] * self.dim
        return [v / magnitude for v in vec]
