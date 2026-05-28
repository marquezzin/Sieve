"""Fixtures locais do app `knowledge`.

- `FakeEmbeddingsClient` — implementação determinística de `EmbeddingsClient`
  que devolve vetores `[float]` reproducíveis a partir do hash do texto.
  Textos parecidos (mesmo "bag of words" normalizado) produzem vetores parecidos,
  o que basta pra testar ordenação por similaridade no `KnowledgeLoader`.
- `tmp_knowledge_dir` — diretório temporário com arquivos `.md` fixture
  (priority=always, priority=retrieve, sem frontmatter).
"""
import hashlib
import random
import re

import pytest
from django.conf import settings

from integrations.embeddings.base import EmbeddingsClient, InputType


class FakeEmbeddingsClient(EmbeddingsClient):
    """Embeddings determinísticos baseados em tokens (sem chamada externa).

    Estratégia:
    - Tokeniza o texto (lower, palavras alfanuméricas) e usa cada token como
      "seed" pra somar contribuição num vetor base.
    - Cada token gera um vetor pseudo-aleatório (random.Random(seed)) e somamos.
    - Resultado: textos com tokens em comum produzem vetores próximos (cosseno
      alto). Textos sem overlap produzem vetores afastados.
    - Dim = `settings.EMBEDDINGS_DIM` exatamente — pgvector exige tamanho fixo.
    """

    def __init__(self, dim: int | None = None) -> None:
        self.dim = dim or settings.EMBEDDINGS_DIM
        self.calls: list[tuple[tuple[str, ...], InputType]] = []

    def embed_batch(
        self,
        texts: list[str],
        *,
        input_type: InputType = "document",
    ) -> list[list[float]]:
        self.calls.append((tuple(texts), input_type))
        return [self._vector_for(t) for t in texts]

    def _vector_for(self, text: str) -> list[float]:
        tokens = _tokenize(text)
        if not tokens:
            # Texto vazio → vetor com sinal mínimo mas estável.
            return [0.0] * self.dim

        vec = [0.0] * self.dim
        for token in tokens:
            seed = int(hashlib.sha256(token.encode("utf-8")).hexdigest()[:16], 16)
            rng = random.Random(seed)
            contribution = [rng.uniform(-1.0, 1.0) for _ in range(self.dim)]
            for i, c in enumerate(contribution):
                vec[i] += c

        # Normaliza pra magnitude estável (importante pra cosseno).
        magnitude = sum(v * v for v in vec) ** 0.5
        if magnitude == 0:
            return [0.0] * self.dim
        return [v / magnitude for v in vec]


def _tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", text.lower())


@pytest.fixture
def fake_embeddings_client() -> FakeEmbeddingsClient:
    """Instância pronta de FakeEmbeddingsClient com dim = settings.EMBEDDINGS_DIM."""
    return FakeEmbeddingsClient()


# Fixture markdown ------------------------------------------------------------

ALWAYS_DOC = """---
category: writing
agents:
  - writer
priority: always
tags:
  - bullets
  - verbs
level: junior
---
# Verbos de ação

## Lista

Use verbos no passado: liderou, implementou, otimizou.

## Anti-padrão

Evite "responsavel por" — passivo demais.
"""

RETRIEVE_DOC = """---
category: examples
agents:
  - writer
  - reviewer
priority: retrieve
tags:
  - bullets
level: pleno
target_role: backend
---
# Exemplos de bullets

## Caso backend pleno

Implementou pipeline de ingest de dados em Python reduzindo latencia em 40 porcento.

## Caso backend senior

Liderou refatoracao de servico critico migrando de monolito para microservicos.
"""

PLACEHOLDER_DOC = """# README

Sem frontmatter — placeholder/readme da pasta.
"""


@pytest.fixture
def tmp_knowledge_dir(tmp_path):
    """Cria um `knowledge_base/` temporário com 3 docs:

    - `writing/verbos.md` (priority=always)
    - `examples/bullets.md` (priority=retrieve)
    - `writing/README.md` (sem frontmatter, deve ser skipped pelo ingest)

    Retorna o Path do diretório raiz (`tmp_path / "knowledge_base"`).
    """
    root = tmp_path / "knowledge_base"
    (root / "writing").mkdir(parents=True)
    (root / "examples").mkdir(parents=True)

    (root / "writing" / "verbos.md").write_text(ALWAYS_DOC, encoding="utf-8")
    (root / "examples" / "bullets.md").write_text(RETRIEVE_DOC, encoding="utf-8")
    (root / "writing" / "README.md").write_text(PLACEHOLDER_DOC, encoding="utf-8")

    return root
