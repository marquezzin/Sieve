"""Conftest local — testes de integration são puros (sem Django/Redis).

Sobrescreve a fixture autouse `_clear_cache` do conftest raiz pra não
tentar conectar no Redis em testes que não precisam dele.
"""

import pytest


@pytest.fixture(autouse=True)
def _clear_cache():
    """No-op: testes do client httpx puro não usam cache Django."""
    yield
