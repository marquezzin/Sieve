# AGENTS — `integrations/pdf/`

Dono: subagente `integrations-platform`.

Render HTML → PDF via WeasyPrint. Segue o padrão da camada `integrations/`:
base abstrata (`PdfRenderer` + `PdfRenderError`) + cliente concreto
(`WeasyPrintRenderer`) + `factory.get_pdf_renderer()` + tests co-localizados.

Regras-chave:
- WeasyPrint é opt-in (`uv add weasyprint`) — **import lazy** dentro de `render`.
- Qualquer erro do WeasyPrint (incl. `ImportError`) vira `PdfRenderError`, sem
  swallowing.
- Sem domain knowledge, sem persistência em DB. Devolve `bytes`; quem chama decide.

Detalhes de consumo em [`CLAUDE.md`](CLAUDE.md).
