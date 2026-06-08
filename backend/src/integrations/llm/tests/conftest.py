"""Conftest local — testes do loop de tool_use são puros (sem Django/Redis/SDK).

Sobrescreve a fixture autouse `_clear_cache` do conftest raiz pra não tentar
conectar no Redis em testes que não precisam dele.
"""

import pytest


@pytest.fixture(autouse=True)
def _clear_cache():
    """No-op: testes do loop de tool_use não usam cache Django."""
    yield
