# Protótipo Sieve

Protótipo navegável de alta fidelidade das telas do Sieve, exportado do Claude Design
(handoff bundle `sieve-v2`). É um protótipo **HTML/CSS/JS** — não código de produção. Serve
como referência visual para portar as telas para o frontend real (**React 19 + Mantine v9**,
ver [`../frontend/CLAUDE.md`](../frontend/CLAUDE.md)).

## Como rodar

Os componentes são carregados via `<script type="text/babel" src=...>`, então **precisa de um
servidor HTTP** (não abra com `file://` — o Babel não consegue buscar os `.jsx`).

```bash
cd prototipo
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Identidade visual (IDV)

- **Cores:** base creme quente, tinta espresso, primária **terracota/clay** `#cf5530`
  (o token Tailwind continua chamado `indigo` para reuso de classes, mas os hexes são terracota).
  Verde/amarelo/vermelho só em scores e status.
- **Tipografia:** `Bricolage Grotesque` (títulos), `Hanken Grotesk` (corpo),
  `JetBrains Mono` (números/scores).
- **Disposição:** nav horizontal no topo (logo → busca em pílula → menu do usuário) +
  barra de navegação com ícone + rótulo (item ativo sublinhado). Sem sidebar.
- **Dark mode:** painel de **Tweaks** (canto da tela) liga modo escuro, textura de pontos e
  brilho no topo. Preferências persistem em localStorage.

## Telas (9)

Navegação pela barra do topo; menu do avatar → "Sair" leva ao Login.

1. **Login** — fora do shell, split-screen marca + form. (Estado de erro: digite `erro` na senha.)
2. **Início / Dashboard** — saudação, stat cards com sparklines, hero, currículos recentes, feed.
3. **Chat — Entrevistador** — interativo: digitar → "digitando…" → resposta, stepper de fases,
   mensagem de esclarecimento, "Finalizar entrevista" (habilita ao chegar em Skills).
4. **Currículos — Lista** — cards Pronto / Gerando / Falhou + empty state.
5. **Currículo — Detalhe** — preview A4 ATS-safe + ScoreGauge (0–10) + breakdown de 6 critérios
   + feedback + versões. Estados: Pronto / Gerando (redator→revisor→juiz) / Falhou.
6. **Currículo — Diff** — comparação lado a lado (adicionado / modificado / removido).
7. **Vagas — Match** — form → análise (gauge %, skills que batem/faltam, recomendações, otimizar).
8. **Candidaturas — Kanban** — 6 colunas com drag-and-drop real + modal "Nova candidatura".
9. **Perfil + Foto profissional** — form + upload (dropzone), gerar, antes/depois,
   erro "Rosto não detectado".

## Estrutura

```
prototipo/
├── index.html            ← entrypoint: tokens Tailwind + fontes + dark mode CSS; carrega os 2 scripts abaixo
└── src/
    ├── tweaks-panel.jsx   ← painel de Tweaks (useTweaks, TweaksPanel…)
    ├── bundle.jsx         ← BUNDLE que o index.html realmente carrega (todos os módulos concatenados)
    ├── app.jsx            ← fonte: App + roteamento (referência)
    ├── icons.jsx          ← fonte: ícones estilo Lucide
    ├── ui.jsx             ← fonte: átomos (Button, Card, Badge, ScoreGauge, Modal, Tabs…)
    ├── login.jsx · dashboard.jsx · chat.jsx · resumes.jsx · jobs.jsx · kanban.jsx · profile.jsx
```

> `index.html` carrega **só** `tweaks-panel.jsx` + `bundle.jsx`. Os `.jsx` individuais são o
> fonte desmembrado e legível (úteis para ler/portar componente a componente); editar um deles
> **não** reflete no protótipo até regerar o `bundle.jsx`.
