# `integrations/` — clients externos

Esta camada concentra **todo acesso a sistemas externos** do backend: HTTP fetchers, LLMs (Anthropic/OpenAI), object storage (S3/MinIO), notificações (WhatsApp, email, Slack), etc.

> Regras gerais em [`backend/CLAUDE.md`](../../CLAUDE.md). Em conflito, esse ganha.
> Subagente dono: `integrations-platform` (`.claude/agents/integrations-platform.md`).

## O que mora aqui

```
integrations/
  fetcher/         # HTTP genérico (httpx; futuramente Playwright pra SPA)
  llm/             # Anthropic, OpenAI, etc.
  storage/         # S3/MinIO via boto3
  notifications/   # WhatsApp (uazapi), email (SES/SMTP), Slack
```

Cada categoria segue o mesmo formato:

- `base.py` — interface abstrata (`Fetcher`, `LLMClient`, ...) + erros do módulo (`FetcherError`, ...).
- `<provider>_client.py` — implementação concreta (`HttpxFetcher`, `AnthropicClient`, `S3Client`).
- `factory.py` — escolha de provider via config quando há múltiplos.
- `__init__.py` — vazio (imports explícitos do código que consome).

## Regras duras

- **HTTP só com `httpx`.** Nunca `requests`, nunca `urllib`.
- **Credenciais via `decouple.config`.** Nunca hardcode, nunca `os.getenv` direto.
- **Sem `rest_framework`.** Integrations não são HTTP-aware (não viram view).
- **Sem domain knowledge.** Não importe de `<app>/use_cases/`, `<app>/services/`, `<app>/models/`. O cliente devolve dado bruto/tipado; quem chama decide o que fazer.
- **Sem persistência em DB.** Não importe Django models. Quem chama o cliente persiste se quiser.
- **Sem swallowing de exceção.** Captura erro do SDK/lib e re-raise como erro do módulo (`FetcherError`, `LLMError`, ...). Nunca `except: pass`.
- **Retry/timeout configuráveis.** Default sensato no `__init__` (timeout=10s, retries=3 onde fizer sentido). Use `tenacity` ou decorator próprio — nunca loop manual com `time.sleep`.
- **Libs opt-in (anthropic, boto3, etc.) ficam fora do `pyproject.toml` default.** Cada produto que precisar adiciona com `uv add <lib>`. O cliente faz **import lazy** dentro do método pra não quebrar import estático.

## Como apps consomem

Sempre via classe ou factory, **nunca raw HTTP no use case**.

```python
# ✅ certo
from integrations.fetcher.factory import get_fetcher

class CheckExternalUrlUseCase:
    def __init__(self, fetcher=None):
        self._fetcher = fetcher or get_fetcher(timeout=5.0)

    def execute(self, url: str):
        result = self._fetcher.get(url)
        return result.status_code == 200
```

```python
# ❌ errado — use case montando httpx
import httpx
class CheckExternalUrlUseCase:
    def execute(self, url: str):
        return httpx.get(url).status_code == 200
```

Vantagem: testes injetam um fake `Fetcher` sem mock de HTTP.

## Adicionando um provider novo

1. Cria pasta da categoria se ainda não existe (`integrations/<categoria>/`).
2. Define `base.py` com interface + erro.
3. Implementa `<provider>_client.py` herdando da interface.
4. Se houver mais de um provider, cria `factory.py` com `get_<categoria>(...)`.
5. Documenta credenciais esperadas (env vars) no topo do arquivo.
6. Se a lib do SDK não está no `pyproject.toml`, faz **import lazy** e comenta `# Ative com uv add <lib>`.
