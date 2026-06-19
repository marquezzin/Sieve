"""`FakeHeadshotClient` — headshot offline e determinístico.

Não faz chamada externa: devolve sempre um PNG mínimo válido (1x1). Útil em
testes e em ambientes sem credencial de headshot (`HEADSHOT_PROVIDER=fake`),
onde o pipeline precisa rodar sem rede.
"""

import base64

from .base import HeadshotClient

# PNG 1x1 transparente, válido — bytes reutilizáveis pelo fake e por testes.
_MINIMAL_PNG_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgYGAAAAAEAAH2FzhV"
    "AAAAAElFTkSuQmCC"
)

MINIMAL_PNG_BYTES = base64.b64decode(_MINIMAL_PNG_B64)


class FakeHeadshotClient(HeadshotClient):
    """Devolve sempre um PNG 1x1 válido, sem rede. Determinístico."""

    def generate(
        self,
        image_bytes: bytes,
        *,
        filename: str = "photo.png",
        content_type: str = "image/png",
    ) -> bytes:
        return MINIMAL_PNG_BYTES
