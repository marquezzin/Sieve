# `integrations/headshot/` — geração de headshot profissional

Responsável por chamar uma API externa que gera uma foto profissional
(headshot) a partir de uma foto base. **Não persiste, não consulta DB, não sabe
nada do domínio** — recebe `bytes` e devolve `bytes` (PNG). Quem chama decide
onde salvar/servir o resultado.

> Regras gerais em [`backend/CLAUDE.md`](../../../CLAUDE.md) e
> [`integrations/CLAUDE.md`](../CLAUDE.md). Em conflito, esses ganham.

## Providers suportados

| Provider | Backend | Quando usar |
|---|---|---|
| `render` (default) | API HTTP no Render free tier | Produção/dev com credencial |
| `fake` | offline, devolve PNG 1x1 fixo | Teste e ambiente sem credencial (`HEADSHOT_PROVIDER=fake`) |

Pra adicionar provider novo: ver header de `factory.py`.

## Env vars

| Var | Default | Descrição |
|---|---|---|
| `HEADSHOT_PROVIDER` | `render` | Qual implementação carregar |
| `HEADSHOT_API_URL` | `https://curriculo-headshot-api.onrender.com` | Base URL da API |
| `HEADSHOT_API_KEY` | — | Credencial enviada no header `x-api-key` (obrigatório no `render`) |
| `HEADSHOT_TIMEOUT` | `240.0` | Timeout (s) do POST `/generate-headshot` |
| `HEADSHOT_WAKE_TIMEOUT` | `60.0` | Timeout (s) por tentativa de `GET /health` (wake-up) |
| `HEADSHOT_MAX_RETRIES` | `1` | Retries em 5xx/erro de rede no POST |

## Uso

```python
from integrations.headshot.factory import get_headshot_client

client = get_headshot_client()

png_bytes = client.generate(
    foto_bytes,
    filename="selfie.jpg",
    content_type="image/jpeg",
)
# png_bytes = PNG do headshot profissional; caller persiste/serve.
```

Em use cases, injete o cliente no `__init__` pra facilitar teste:

```python
class GenerateHeadshotUseCase:
    def __init__(self, headshot=None):
        self._headshot = headshot or get_headshot_client()
```

## NOTA: cold-start do Render e por que `time.sleep` é permitido aqui

A API está hospedada no **Render free tier e DORME após inatividade**. A
primeira chamada após o sono pode levar 30-50s: o request fica pendurado até o
servidor acordar e então responde.

Por isso o `RenderHeadshotClient`:

1. **Acorda o servidor antes do POST** (`_wake`): faz `GET /health` com timeout
   longo, repetindo com pequeno backoff até obter 200. Cada GET pode ficar
   pendurado durante o spin-up e retornar 200 ao acordar. Isso garante a
   experiência "fica carregando até realmente devolver".
2. Se o wake-up **esgota as tentativas sem 200**, NÃO falha fatalmente: loga
   warning e segue pro POST mesmo assim (o POST tem seu próprio timeout longo e
   também pode acordar o servidor).

**Divergência deliberada da regra do `voyage_client`:** o voyage proíbe
`time.sleep` em retry porque roda dentro do request web. Este cliente roda
dentro de uma **task Celery** (worker em background), então `time.sleep` entre
tentativas de wake-up e de retry é aceitável e necessário. Documentado também no
header de `render_client.py`.

## Regras duras

- **HTTP só com `httpx`.** Sem `requests`, sem SDK próprio.
- **Sem persistência.** Não importe Django models. Quem chama salva os bytes.
- **Sem `rest_framework`.** Não é HTTP-aware.
- **Sem domain knowledge.** Não importe de `accounts/`, `chat/`, use cases, etc.
- **Re-raise como `HeadshotError`.** Capturou `httpx.HTTPError`/`KeyError`/
  `ValueError`/erro de base64? Embrulha e re-raise — nunca propaga exceção de
  baixo nível pro caller.
- **4xx não retenta.** 401/400/422 são erro de cliente — retry só piora.
  Retry só em 5xx e erro de rede, até `max_retries+1` tentativas.

## Stop list

- `except Exception: pass` — proibido. Sempre re-raise como `HeadshotError`.
- Persistir o PNG em DB/storage dentro do cliente — proibido. Cliente devolve,
  caller salva.
- Hardcode de API key — proibido. Sempre via `decouple.config` (no factory).
- Retentar 4xx — proibido. Só 5xx/rede.
