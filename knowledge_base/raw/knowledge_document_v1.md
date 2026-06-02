# Knowledge Base — Documento de Conhecimento

---

# 1. ATS — Otimização de currículo

## 1.1 O que quebra a leitura do ATS

Um currículo compatível com ATS é aquele que pode ser facilmente escaneado e interpretado pelo sistema. Recrutadores usam ATS para filtrar candidatos que não correspondem aos requisitos da vaga. Se o currículo não for processado corretamente, seções-chave como habilidades e experiência ficam invisíveis para o sistema — e o candidato nunca chega a ser visto por um recrutador humano, independente de quão qualificado seja.

### Formato e tamanho do arquivo

- **Use sempre PDF.** O texto é lido com facilidade pelo ATS. Evitar DOCX, PNG ou JPG.
- **Tamanho máximo: 2MB.** Arquivos maiores não são aceitos na maioria das plataformas (Indeed, Greenhouse, etc.).
- Uma forma simples de testar se o PDF é legível: usar CTRL+F e verificar se as palavras-chave são encontradas. Se não forem, o ATS também não vai encontrá-las.

### Elementos que quebram a leitura

- **Elementos gráficos complexos** — imagens, tabelas, ícones, gráficos, infográficos. O ATS não consegue extrair texto desses elementos.
- **Layout em colunas** — colunas lado a lado confundem a ordem de leitura do ATS, que lê o documento de cima para baixo, linha a linha.
- **Fontes exóticas** — usar apenas fontes simples, comuns e na cor preta. Fontes decorativas podem não ser interpretadas corretamente.
- **Cabeçalhos e rodapés** — informações colocadas nessas áreas frequentemente são ignoradas pelo ATS.
- **Foto** — além de ser opcional (e não recomendada em muitos mercados), imagens não são lidas por ATS.

### URLs e links

ATS frequentemente não detecta hiperlinks ocultos atrás de textos ("perfil do LinkedIn", "meu portfólio"). O correto é incluir a URL completa e visível — ex: `https://linkedin.com/in/seunome`. Isso garante que tanto o ATS quanto o recrutador humano consigam acessar os links. Todos os links no PDF devem ser clicáveis.

O design do currículo deve ser simples. Um currículo visualmente elaborado pode impressionar um humano mas ser invisível para o ATS.

---

## 1.2 Como identificar keywords em uma vaga

O candidato cola o texto completo da descrição da vaga e o agente extrai as keywords automaticamente. O cérebro humano faz esse processo de forma intuitiva — o agente deve replicar esse raciocínio de forma sistemática.

### O que o agente deve procurar, em ordem de prioridade

1. **Título do cargo** — a própria nomenclatura da vaga é uma keyword essencial. "Backend Engineer", "Data Scientist", "DevOps Engineer" devem aparecer no currículo.

2. **Stack principal** — as tecnologias centrais da vaga. São as que aparecem com mais destaque ou frequência na descrição. Ex: se a vaga é de backend e menciona Django repetidamente, Django é a keyword principal.

3. **Habilidades específicas com ênfase** — quando a vaga foca muito em algo além da stack básica, isso é sinal. Ex: uma vaga de desenvolvimento que fala muito sobre computação em nuvem indica que AWS/GCP/Azure é uma keyword importante, não só um diferencial.

4. **Ferramentas e tecnologias secundárias** — mencionadas uma vez, mas relevantes. Git, Docker, ferramentas de monitoramento, bancos de dados específicos.

5. **Certificações exigidas ou desejadas** — se a vaga menciona certificações específicas (AWS Certified, GCP Professional, Databricks), viram keywords de peso.

### O que ignorar

- Palavras genéricas que aparecem em toda vaga: "proativo", "boa comunicação", "trabalho em equipe", "dinamismo"
- Jargões corporativos sem conteúdo técnico: "mindset ágil", "foco em resultados", "cultura de inovação"

### Resultado

O agente gera uma lista priorizada de keywords extraídas da vaga — separando as principais (que devem aparecer 3–5x no currículo) das secundárias (1–2x). Essa lista guia a otimização do currículo para aquela vaga específica.

---

## 1.3 Como inserir keywords no currículo

### Onde as keywords devem aparecer

Keywords podem e devem aparecer em múltiplos lugares: no profile summary, nos bullets de experiência, na seção de habilidades técnicas e no tech stack de cada emprego. Aparecer em mais de um lugar reforça o sinal para o ATS.

### Frequência ideal por importância da keyword

Nem toda keyword tem o mesmo peso. O primeiro passo é elencar o que é mais importante na vaga. Por exemplo, numa vaga que pede Django, React, AWS, Git e Docker — Django provavelmente é o mais crítico para o cargo.

Regra prática de frequência:
- **Keywords principais** (tecnologia central da vaga): aparecer de **3 a 5 vezes** no currículo
- **Keywords secundárias** (ferramentas de suporte, metodologias): aparecer **1 a 2 vezes**

### Como inserir de forma natural

A keyword deve aparecer dentro de contexto real de experiência — nunca solta ou forçada. Formas naturais de inserção:

- Dentro do bullet: "Desenvolvi API REST em **Django** integrada ao Celery para processamento assíncrono"
- No tech stack do emprego: "**Tech stack:** Django, PostgreSQL, Redis, AWS EC2"
- Na seção de habilidades: "**Backend:** Python, **Django**, DRF, FastAPI"
- No profile summary: "Engenheiro backend com 3 anos de experiência em **Django** e AWS"

### Keyword stuffing — o que evitar

Inserir a mesma keyword dezenas de vezes de forma repetitiva e sem contexto é contraproducente — alguns ATS modernos penalizam isso, e o texto fica ilegível para o recrutador humano que ler depois.

---

## 1.4 O que NUNCA fazer

### 1. Formatação que quebra o ATS

- Usar imagens, fotos, ícones ou elementos gráficos no currículo
- Layout com colunas, tabelas ou fontes exóticas
- Qualquer elemento que impeça o ATS de ler o texto corretamente

Um currículo bonito que o ATS não consegue ler é pior do que um currículo simples que passa.

### 2. Descrições vagas sem métrica e sem detalhe do que foi feito

Esse é o erro mais comum e mais prejudicial. O candidato sabe exatamente o que fez, mas escreve de forma tão genérica que não comunica nada.

**Exemplo real do que não fazer:**

O candidato refatorou queries SQL em relatórios financeiros, aplicando window functions e otimizações de group by, reduzindo o tempo de geração dos relatórios de 5 minutos para alguns segundos. Uma conquista concreta, técnica e mensurável.

O que ele escreveu no currículo:
> "Refatorei queries deixando mais rápido."

Isso desperdiça completamente a conquista. Não diz o contexto (relatórios financeiros), não diz o que foi feito (window functions, tuning de SQL), não diz o impacto (de 5 minutos para X segundos).

**A versão correta:**
> "Otimizei queries SQL em pipeline de relatórios financeiros aplicando window functions e reestruturação de group by, reduzindo o tempo de geração de 5 minutos para 30 segundos."

### 3. Inventar experiência ou tecnologias

Nunca sugerir que o candidato inclua tecnologias que ele não usou ou experiências que não teve para encaixar keywords da vaga. Além de desonesto, o candidato será exposto na entrevista técnica.

---

# 2. Escrita de Currículo

## 2.0 Header — o que deve conter

O header é a primeira seção do currículo. Recrutadores e ATS precisam conseguir entrar em contato facilmente.

**Obrigatório:**
- Nome completo em destaque e fácil de localizar no topo
- E-mail profissional — sem apelidos ou domínios incomuns. Um domínio próprio pode ser bem visto. O e-mail deve ter link `mailto:` no PDF.
- Link para o LinkedIn com URL completa e visível (ex: `https://linkedin.com/in/seunome`) — deve estar atualizado e consistente com o currículo
- Link para o GitHub com URL completa e visível — deve conter projetos relevantes e recentes

**Recomendado:**
- Telefone com DDD e, se necessário, código do país
- Cargo atual ou desejado logo abaixo do nome, ou no profile summary (ex: "Backend Engineer with 3 years of experience")
- Endereço ou timezone — endereço completo é opcional, mas cidade/estado ou timezone são recomendados. Não expor dados sensíveis.
- Link para portfólio, site pessoal ou projeto em destaque (URL completa e visível)
- Idiomas falados e nível

**Atenção com links:**
ATS frequentemente não detecta hiperlinks ocultos atrás de textos ("clique aqui", "meu LinkedIn"). Sempre usar a URL completa e visível no documento. Todos os links no PDF devem ser clicáveis.

**Profile summary (resumo no topo):**
- Deve ser conciso e objetivo — 2 a 4 linhas no máximo
- Deve mencionar o cargo atual ou desejado
- Não pode conter frases genéricas ("profissional dedicado", "proativo", "apaixonado por tecnologia")

## 2.1 Estrutura de um bullet ideal

Cada bullet de experiência profissional deve seguir preferencialmente o método **XYZ** — mais direto e adequado para a maioria dos casos. O método **STAR** é uma alternativa para quando a conquista precisa de contexto adicional para fazer sentido (detalhes em 2.3).

Regras práticas:
- Cada bullet deve descrever uma atividade ou conquista, acompanhada das tecnologias utilizadas quando relevante.
- As conquistas devem ser quantificadas sempre que possível. Exemplo: "Graduado como melhor da turma de 50 pessoas com nota 9,85 de 10".
- Evitar descrições vagas — foco em resultados e impacto, não em responsabilidades genéricas.
- Não usar soft skills exageradas ou frases sem substância.

Cada experiência profissional deve conter obrigatoriamente: **cargo, empresa, período (mês/ano de início e fim) e localização**.

---

## 2.2 Verbos de ação e repetição

Repetir as mesmas palavras ao longo do currículo sinaliza vocabulário limitado e faz o documento parecer plano e não polido. Alguma repetição é normal, mas a repetição excessiva deve ser evitada — prejudica a impressão geral e reduz o impacto de cada bullet.

A solução é usar **sinônimos e verbos de ação mais fortes** para descrever cada conquista de forma distinta.

### Por que verbos de ação importam

Todo bullet deve começar com um verbo de ação no passado. O verbo posiciona o candidato como protagonista — alguém que fez, construiu, liderou — e não como espectador ("fui responsável por", "trabalhei com", "ajudei a").

### Verbos fracos — evitar

Esses verbos são genéricos e não transmitem impacto:

- trabalhei, ajudei, participei, colaborei
- fui responsável por, estava encarregado de
- fiz, realizei (sem contexto)
- auxiliei, apoiei, contribuí

### Verbos fortes — usar

Agrupados por categoria para facilitar a variação:

**Construção e entrega**
construí, desenvolvi, implementei, arquitetei, lancei, entreguei, migrei, criei, projetei, estruturei

**Análise e investigação**
analisei, diagnostiquei, identifiquei, investiguei, mensurei, mapeei, avaliei, modelei

**Otimização e melhoria**
otimizei, reduzi, aumentei, acelerei, automatizei, refatorei, simplifiquei, melhorei, reestruturei

**Liderança e gestão**
liderei, coordenei, gerenciei, orientei, mentorei, facilitei, conduzi, supervisionei, organizei

**Colaboração e comunicação**
apresentei, documentei, treinei, alinhei, negociei, defini, estabeleci

### Dica prática

Ao revisar o currículo, destacar todos os verbos de abertura de cada bullet. Se o mesmo verbo aparecer mais de duas vezes, substituir ao menos uma ocorrência por um sinônimo da mesma categoria.

---

## 2.3 Como quantificar resultados

Um bom currículo mostra o impacto que o candidato gerou em funções anteriores. Quantificar esse impacto aumenta muito as chances de ser chamado para entrevista — recrutadores conseguem entender a escala em que a pessoa trabalhou.

### Todo cargo tem algo a quantificar

É um erro pensar que só finanças e vendas têm números. Cada cargo tem algo que pode ser medido. O segredo é pensar além do impacto financeiro:

- Tamanho de equipe: "trabalhei em uma equipe internacional" → "trabalhei em uma equipe internacional de mais de 50 pessoas"
- Frequência: "realizei reuniões de retrospectiva" → "realizei reuniões de retrospectiva a cada 2 semanas com uma equipe de 10"
- Escala: volume de dados processados, número de usuários, quantidade de sistemas afetados
- Tempo: redução de tempo de processo, frequência de entrega, duração de projeto
- Quantidade: número de features entregues, tickets resolvidos, integrações implementadas

O quantificador não precisa ser sempre um valor financeiro — frequência, escala e tamanho são igualmente válidos.

### Como adicionar números na prática

1. Identifique o que pode ser medido na atividade descrita
2. Reescreva o bullet incluindo a métrica

### Modelo XYZ (Google)

Fórmula: **"Accomplished [X] as measured by [Y], by doing [Z]"**

Foco em resultado mensurável + como foi atingido. Ideal para bullets curtos e diretos.

- X = o que foi conquistado
- Y = como o resultado é medido (o número)
- Z = o que foi feito para chegar lá

Exemplo: "Reduzi o tempo de deploy em 40% automatizando o pipeline de CI/CD com GitHub Actions."

### Modelo STAR

Fórmula: **Situação → Tarefa → Ação → Resultado**

Mais narrativo, útil quando o contexto precisa de mais explicação. Pode ocupar 2 a 3 linhas.

- **S**ituação — contexto do problema
- **T**arefa — o que precisava ser feito
- **A**ção — o que o candidato fez especificamente
- **R**esultado — o impacto gerado, preferencialmente com número

Exemplo: "O sistema legado causava 3h de downtime semanal (S). Fui encarregado de estabilizá-lo (T). Refatorei os módulos críticos e adicionei monitoramento com Datadog (A). Reduzimos o downtime para zero nas 8 semanas seguintes (R)."

### XYZ vs STAR — quando usar cada um

| | XYZ | STAR |
|---|---|---|
| Tamanho | Bullet curto (1 linha) | Bullet longo (2–3 linhas) |
| Foco | Resultado direto | Contexto + resultado |
| Quando usar | Impacto claro e simples | Situação que precisa de explicação |

---

## 2.4 Clichês e palavras a evitar

Clichês são palavras e expressões tão usadas que perderam completamente o significado. Recrutadores as ignoram automaticamente — e em alguns ATS, excesso de soft skills genéricas é sinal negativo.

### Lista de clichês a evitar

**Soft skills genéricas:**
- proativo, dinâmico, resiliente
- boa comunicação, comunicativo
- bom em trabalho em equipe, espírito colaborativo
- facilidade para aprender, aprendizado rápido
- apaixonado por tecnologia, entusiasta de inovação
- hands-on, orientado a resultados, foco em entregas
- comprometido, dedicado, responsável

**Expressões vagas de responsabilidade:**
- "responsável por..."
- "encarregado de..."
- "participei de..."
- "colaborei com..."
- "trabalhei com..."
- "auxiliei no desenvolvimento de..."

**Jargões corporativos vazios:**
- mindset ágil
- cultura de inovação
- pensamento fora da caixa
- visão holística
- agregar valor

### Por que prejudicam

Essas palavras não provam nada — qualquer pessoa pode escrever "proativo" ou "bom em trabalho em equipe". O que convence um recrutador é evidência concreta: um número, uma conquista, um contexto real.

### O que usar no lugar

Em vez de declarar uma qualidade, demonstrá-la com um exemplo:

- ❌ "Boa comunicação" → ✅ "Apresentei resultados técnicos mensalmente para stakeholders não-técnicos"
- ❌ "Aprendizado rápido" → ✅ "Aprendi Go em 3 semanas para entregar integração crítica no prazo"
- ❌ "Trabalho em equipe" → ✅ "Colaborei com equipe de 8 engenheiros em migração de monolito para microsserviços"

---

## 2.5 Exemplos de bullets — ruins e bons

> _Coloque aqui exemplos concretos de bullets fracos e suas versões melhoradas.
> Pode ser de qualquer área: backend, frontend, dados, produto, design, etc.
> Quanto mais exemplos reais ou realistas, melhor — o agente aprende por imitação._

### Exemplos ruins (e por quê)

[AINDA VOU PREENCHER]

### Exemplos bons (e por quê funcionam)

[AINDA VOU PREENCHER]

---

# 3. Entrevista com o Candidato

O agente conduz uma conversa com o candidato para coletar as informações necessárias para montar o currículo. A ideia é ir seção por seção, verificando o que o candidato já tem e completando o que falta — nunca de forma abrupta, sempre em passos.

## 3.1 Seção de Contatos

O agente pergunta as informações de contato uma a uma. Se o candidato já forneceu tudo que é necessário, segue em frente. Se forneceu apenas o básico (email e telefone), sugere o que pode ser adicionado:

**Fluxo:**
1. Perguntar nome completo, email e número de celular
2. Se o candidato não mencionou redes sociais, perguntar: "Você tem LinkedIn? GitHub? Portfólio ou site pessoal?"
3. Sugerir adicionar o que tiver — cada link a mais ajuda o recrutador a conhecer melhor o candidato

**Regras importantes para o agente:**
- Sempre pedir cidade, estado e país — nunca endereço completo
- **Nunca** pedir ou sugerir incluir CPF, data de nascimento ou qualquer dado sensível
- Esses dados não pertencem ao currículo e expõem o candidato desnecessariamente

---

## 3.2 Seção de Experiência Profissional

O agente verifica se o candidato já descreveu as experiências no formato correto (XYZ ou STAR, verbos de ação, métricas, sem repetição excessiva). Se sim, segue em frente. Se não, conduz a coleta em passos — nunca pedindo tudo de uma vez.

**Fluxo quando a experiência está incompleta:**

1. "Onde você trabalhou? Qual era o cargo e o período?"
2. "O que você fazia nesse cargo?"
3. "Teve alguma conquista ou resultado que você alcançou nesse período?" *(aqui começa o XYZ/STAR)*
4. Aprofundar conforme a resposta — se o candidato foi vago, perguntar sobre impacto, escala, métricas

**Escolha do método:**
O agente usa **XYZ como padrão** — é mais direto, cabe em um bullet curto e é o formato preferido por recrutadores de tech. Se o candidato tiver uma conquista que precisa de mais contexto para fazer sentido (uma situação de crise, um projeto complexo), o agente oferece o STAR como alternativa.

Na prática: o agente conduz as perguntas no formato XYZ. Se a história não couber no XYZ, sugere o STAR para aquele bullet específico.

---

## 3.3 Seção de Educação

Sem muito segredo. O agente pergunta:

1. Qual o curso?
2. Qual a instituição?
3. Quando começou e quando terminou (ou previsão de conclusão)?

Se o candidato ainda está cursando, registrar como "em andamento" com a previsão de formatura.

---

## 3.4 Seção de Habilidades Técnicas

O agente não pergunta as habilidades do zero — ele **extrai automaticamente** as tecnologias mencionadas nas seções de experiência profissional e projetos, gera uma lista consolidada e pede para o candidato validar.

**Fluxo:**
1. Após coletar experiência e projetos, o agente gera a lista de tecnologias identificadas
2. Apresenta a lista para o candidato: "Identifiquei essas habilidades técnicas a partir do que você me contou: [lista]. Está correto?"
3. Se o candidato confirmar, segue em frente
4. Se algo estiver errado: "Me diga o que não está certo e o que você gostaria de adicionar"
5. O candidato remove o que não procede e digita o que falta

Essa abordagem evita que o candidato esqueça tecnologias que já mencionou — e evita também que ele liste tecnologias que não aparecem em nenhuma experiência real, o que seria inconsistente no currículo.

---

## 3.5 Seção de Projetos

O nível de profundidade depende se o candidato tem experiência profissional ou não:

**Candidato com experiência profissional:**
Projetos são complementares — a coleta pode ser mais rápida e enxuta. Seguir o XYZ de forma resumida: o que foi o projeto, qual tecnologia usou, qual foi o resultado ou aprendizado principal.

**Candidato sem experiência profissional:**
Projetos são a seção mais importante do currículo — substituem a experiência profissional. Nesse caso, a coleta deve ser tão detalhada quanto a de experiência profissional: seguir o XYZ ou STAR completo, aprofundar conquistas, métricas, tecnologias utilizadas e impacto.

---

## 3.6 Como aprofundar respostas vagas

Quando o candidato dá uma resposta sem métrica ou sem impacto claro, o agente instiga a construção do XYZ ou STAR fazendo perguntas progressivas — nunca pedindo tudo de uma vez.

**Exemplos de perguntas de aprofundamento:**
- "O que você alcançou com isso?"
- "Você consegue colocar um número nisso? Quantas pessoas, qual o volume, qual o tempo?"
- "Qual era a escala disso? Quantos usuários, quantas requisições, qual o tamanho da equipe?"
- "O que mudou depois que você fez isso?"

**Regra das duas tentativas:**
O agente tenta aprofundar no máximo duas vezes. Se após duas tentativas a resposta ainda estiver vaga, o agente reconhece isso, avisa o candidato e segue em frente — sem travar a conversa. Exemplo: "Tudo bem, conseguimos o suficiente por enquanto. Vamos continuar e você pode complementar depois se quiser."

---

## 3.7 Sinais de quando avançar de seção

O agente avança quando:
- O candidato confirmou que não tem mais nada a adicionar naquela seção
- Após duas tentativas de aprofundamento sem resultado, como descrito acima
- Todas as informações mínimas da seção foram coletadas (ex: em educação, ter curso + instituição + período já é suficiente para avançar)

A transição deve ser natural — o agente resume brevemente o que foi coletado e anuncia a próxima seção. Exemplo: "Ótimo, anotei sua experiência na Empresa X. Agora vamos falar sobre sua formação acadêmica."

---

# 4. Rubrica de Avaliação

## 4.1 Critérios e o que define cada nota

> _Quais são os critérios que definem um currículo de qualidade?
> Para cada critério: o que é excelente? O que é mediano? O que é ruim?
> Algum critério é mais importante que os outros?_

[AINDA VOU PREENCHER]

---

## 4.2 Erros graves — o que reprova o currículo

> _Quais situações são tão graves que comprometem o currículo inteiro, independente de outros critérios?
> Ex: fabricação de experiência, layout completamente quebrado, nenhuma métrica em qualquer lugar._

[AINDA VOU PREENCHER]

---

## 4.3 Exemplos de avaliação

### Currículo ruim — exemplo e explicação

[AINDA VOU PREENCHER]

### Currículo mediano — exemplo e explicação

[AINDA VOU PREENCHER]

### Currículo bom — exemplo e explicação

[AINDA VOU PREENCHER]

---

# 5. Templates de Currículo

## 5.1 Estrutura padrão recomendada

### Tamanho por anos de experiência

| Experiência | Páginas recomendadas |
|---|---|
| 0–5 anos | 1 página (máximo) |
| 5–10 anos | Até 2 páginas |
| 10+ anos | Até 3 páginas — mas menos é mais |

### Seções obrigatórias

Todo currículo de tecnologia deve ter obrigatoriamente: **Experiência, Educação e Habilidades**. Cada elemento deve estar claramente delimitado — grau e instituição na educação; nome da empresa, cargo e datas na experiência; habilidades organizadas por categoria.

### Ordem das seções

A ordem muda conforme o momento de carreira:

**Sem experiência profissional:**
1. Contatos (header)
2. Educação
3. Projetos
4. Certificações relevantes
5. Honors / prêmios
6. Idiomas

**Com experiência profissional:**
1. Contatos (header)
2. Experiência profissional
3. Educação
4. Certificações relevantes
5. Projetos
6. Honors / prêmios
7. Idiomas

### Sobre certificações

Incluir apenas certificações com peso real no mercado — como Databricks, GCP, AWS, CKA. Certificados de cursos de plataformas como Udemy não têm valor significativo e ocupam espaço desnecessário.

### Formatação geral

- Bullet points usados de forma consistente nas experiências.
- Negrito e itálico reservados apenas para destacar informações realmente importantes.
- Datas sempre no mesmo formato em todo o documento (ex: sempre `01/2025` ou sempre `January 2025`, nunca misturar).
- Nome do arquivo profissional, incluindo o nome do candidato (ex: `joao_silva_cv.pdf`).
- Sem erros gramaticais ou de digitação — revisão por outra pessoa (peer review) é altamente recomendada.
- O currículo deve ser adaptado para cada vaga — não existe currículo genérico ideal.

### Seção de habilidades técnicas

- Linguagens e ferramentas devem estar proeminentemente visíveis.
- Atenção a dependências implícitas: Django pressupõe Python; Node.js pressupõe JavaScript (e frequentemente TypeScript). Não listar uma sem a outra.
- Cada experiência profissional pode ter uma seção própria de "tech stack" listando as tecnologias usadas naquele emprego específico (opcional, mas recomendado).

### O que remover

- Experiências profissionais irrelevantes para o cargo atual. Exemplo: profissional com 10 anos de experiência em Java não precisa listar um emprego como atendente de supermercado de 11 anos atrás.
- Soft skills exageradas e genéricas ("dedicado", "proativo", "bom em trabalho em equipe").
- Certificações de cursinhos sem peso no mercado.

