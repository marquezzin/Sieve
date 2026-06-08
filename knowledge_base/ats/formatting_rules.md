---
category: ats
agents: [ats_optimizer, matcher, writer, reviewer]
priority: always
tags: [ats, formatting, pdf, links]
---

# Regras de formatação para passar no ATS

Um currículo bonito que o ATS não consegue ler é pior do que um currículo simples que
passa. O design deve ser **simples e linear** — o objetivo é que o parser extraia 100% do
texto na ordem certa.

## Formato e tamanho do arquivo

- **Use sempre PDF.** O texto é lido com facilidade pela maioria dos ATS. Evite DOCX, PNG
  ou JPG.
- **Tamanho máximo: 2MB.** Arquivos maiores são rejeitados em muitas plataformas (Indeed,
  Greenhouse, etc.).
- **Nome do arquivo profissional**, com o nome do candidato — ex: `joao_silva_cv.pdf`.

## Elementos que quebram a leitura

- **Elementos gráficos** — imagens, fotos, ícones, gráficos, infográficos. O ATS não
  extrai texto deles.
- **Layout em colunas** — colunas lado a lado confundem a ordem de leitura. O ATS lê de
  cima para baixo, linha a linha; colunas embaralham tudo.
- **Tabelas** — células e tabelas aninhadas frequentemente são lidas fora de ordem ou
  ignoradas.
- **Fontes exóticas** — use fontes simples, comuns e na cor preta. Fontes decorativas podem
  não ser interpretadas.
- **Cabeçalhos e rodapés** — informação colocada nessas áreas é frequentemente ignorada.
  Não coloque contato ou dados essenciais ali.
- **Foto** — além de opcional (e desencorajada em muitos mercados), não é lida por ATS e
  pode levar à rejeição por viés.

## URLs e links

ATS frequentemente **não detecta hiperlinks ocultos** atrás de textos como "perfil do
LinkedIn", "meu portfólio" ou "clique aqui". Sempre inclua a **URL completa e visível**:

- Correto: `https://linkedin.com/in/seunome`
- Errado: [LinkedIn](#) (texto âncora sem URL visível)

Todos os links no PDF devem ser clicáveis, e o texto da URL deve estar legível no
documento. Isso garante acesso tanto pelo ATS quanto pelo recrutador humano.

## Checklist rápido

- [ ] PDF, abaixo de 2MB, nome de arquivo com o nome do candidato
- [ ] Sem imagens, ícones, colunas, tabelas ou foto
- [ ] Fonte simples, preta, tamanho legível
- [ ] Contato fora de cabeçalho/rodapé
- [ ] URLs completas, visíveis e clicáveis
- [ ] CTRL+F encontra as keywords principais da vaga
