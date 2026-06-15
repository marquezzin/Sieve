# `integrations/pdf/` — render HTML → PDF

Wrapper de render de HTML em PDF. Categoria da camada `integrations/` (regras
gerais em [`../CLAUDE.md`](../CLAUDE.md)). Cliente devolve **bytes** do PDF;
quem chama decide o que fazer (salvar em storage, anexar a email, devolver no
response). Não persiste, não conhece domínio.

## Interface

- `base.py`
  - `PdfRenderer(ABC)` — `render(html: str, *, base_url: str | None = None) -> bytes`.
  - `PdfRenderError` — erro do módulo.
- `weasyprint_client.py` — `WeasyPrintRenderer(PdfRenderer)`, provider default.
- `factory.py` — `get_pdf_renderer() -> PdfRenderer`.

## Opt-in

WeasyPrint **não** está no `pyproject.toml` default — render de PDF é opt-in por
produto. Ative com `uv add weasyprint`. O cliente faz **import lazy** dentro do
método, então o módulo importa sem a lib instalada; só `render()` exige ela.
Sem a dep, `render()` levanta `PdfRenderError("weasyprint não instalado — uv add
weasyprint")`.

## Como apps consomem

```python
from integrations.pdf.factory import get_pdf_renderer

renderer = get_pdf_renderer()
pdf_bytes = renderer.render("<h1>Relatório</h1>", base_url="https://app.exemplo.com")
```

Testes injetam um fake `PdfRenderer` sem precisar do WeasyPrint instalado.
