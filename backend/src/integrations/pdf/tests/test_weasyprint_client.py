"""Testes do WeasyPrintRenderer.

WeasyPrint é opt-in (fora do pyproject default). `importorskip` pula o módulo
inteiro gracioso quando a lib não está instalada, pra não quebrar o gate
`make test-fast` antes do devops adicionar a dep. Não toca DB.
"""

import pytest

# importorskip cobre o caso da lib não instalada. WeasyPrint também levanta
# OSError no import quando as libs nativas (libgobject/pango/cairo via GTK) não
# estão no sistema — capturamos isso e pulamos igual, pra não quebrar o gate.
try:
    import weasyprint  # noqa: F401
except Exception as exc:  # noqa: BLE001
    pytest.skip(f"weasyprint indisponível: {exc}", allow_module_level=True)

from integrations.pdf.weasyprint_client import WeasyPrintRenderer


def test_renders_simple_html():
    pdf = WeasyPrintRenderer().render("<h1>oi</h1>")

    assert isinstance(pdf, bytes)
    assert pdf.startswith(b"%PDF-")
    assert len(pdf) > 1000
