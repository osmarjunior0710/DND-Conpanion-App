# DECISOES-DESIGN.md

> Este é o "cérebro" do projeto. Enquanto o `CLAUDE.md` tem regras fixas,
> este arquivo **acumula aprendizado** — decisões de design tomadas, o
> porquê, o que foi tentado e descartado. Contexto de conversa se perde
> com o tempo; este arquivo é a memória que sobrevive a isso.
>
> Formato de cada entrada: **Decisão** (o que foi escolhido) · **Contexto**
> (por que isso apareceu) · **Alternativas descartadas** (o que foi
> tentado antes e por que não ficou) · **Data/origem** (quando, se souber).
>
> Regra de uso: antes de propor uma solução de UI ou de comportamento que
> não seja uma correção técnica óbvia, procure aqui primeiro. Depois de
> qualquer decisão nova de design, adicione uma entrada — não deixe isso
> só no histórico do chat.

---

## Level Up — overlay em cima da ficha, não uma rota separada

**Decisão:** o fluxo de Level Up (`LevelUpShell`) é renderizado como um
overlay de tela cheia (`position: fixed`) **dentro** do componente da
ficha (`FichaShell`), trocado por uma flag de estado
(`levelUpAberto`), e não por uma navegação de rota (`/ficha/:id/levelup`).

**Contexto:** o wireframe HTML original usa uma "tela" separada
(`screen-levelup`) alcançada por `go('screen-levelup')`. Copiar esse
padrão literalmente como uma rota React Router faria o React desmontar o
`FichaShell` ao navegar — perdendo todo o estado vivo da sessão de
combate (PV atual, Espaços de Magia gastos, estado Ativo/Usada dos 3
botões de turno) só porque o jogador foi fazer level-up no meio de uma
sessão. Manter como overlay dentro do mesmo componente preserva esse
estado.

**Alternativas descartadas:** rota `/ficha/:id/levelup` separada,
descartada pelo motivo acima.

**Padrão a repetir:** qualquer fluxo futuro que precise "tomar a tela
inteira" mas continuar dentro do contexto de uma ficha já aberta (ex:
editor de item, ficha de NPC dentro de uma sessão) deve seguir esse
mesmo padrão — overlay controlado por estado local, não rota nova.

**Data/origem:** 2026-08, entrega 0.7.

## Rolagem de dados — contexto global (`RollProvider`), não popup por tela

**Decisão:** existe um único componente de overlay de dado
(`RollOverlay`) montado uma vez no topo do app (`App.tsx`), controlado
por um React Context (`RollContext`/`useRoll()`). Qualquer tela chama
`rolarD20(...)` ou `rolarDados(...)` de qualquer lugar da árvore de
componentes, sem precisar montar sua própria cópia do overlay.

**Contexto:** o wireframe tinha um único `#roll-overlay` compartilhado
manipulado via funções globais (`roll()`, `rollDamage()`) porque era só
HTML/JS solto. Em React, o equivalente correto de "uma coisa só que
qualquer tela aciona" é Context + Provider no topo da árvore, não
duplicar o componente de overlay em cada tela que precisa rolar dado.

**Data/origem:** 2026-08, entrega 0.7.

## Tema visual do app de verdade (React): light, não dark

**Decisão:** o app em React usa paleta **clara** (fundo claro, texto
escuro), ainda monocromática/cinza — não o dark do wireframe HTML
original.

**Contexto:** o wireframe HTML (`wireframe-app-rpg-v2.html`) foi feito em
dark de propósito pra simular "protótipo neutro" (ver seção 9 do
`guia-mestre-projeto.md`), mas na hora de validar texto e leitura durante
o desenvolvimento em React, o Osmar achou mais fácil revisar em fundo
claro. Pedido explícito, na entrega 0.2.

**Alternativas descartadas:** manter o dark do wireframe como já estava —
descartado porque dificultava a validação de texto nesta fase.

**Pendência conhecida:** a direção visual "RPGzística" de verdade
(tipografia old-school, paleta dourado/bronze, textura) continua adiada
pra mais pra frente (ver seção 9 do `guia-mestre-projeto.md`) — light aqui
é só facilitar revisão nesta fase inicial, não é a decisão final de
identidade visual. Quando a direção visual entrar, esse tema muda de novo
e essa entrada deve ser atualizada.

**Data/origem:** 2026-08, durante a entrega 0.2 (Fase 0 — esqueleto
navegável).

## Combat Layout C — painéis com `position: fixed` na viewport (não relativos ao frame)

**Decisão:** os painéis deslizantes de Ação/Ação Bônus/Reação (Layout C,
já escolhido antes — ver entrada "Combate — economia de ação" abaixo)
usam `position: fixed` relativo à viewport do navegador, igual às pills
do wizard, em vez de `position: absolute` relativo a um elemento "frame"
como no wireframe HTML original (que simulava um celular dentro da
página). Como o app de verdade não tem esse frame — a tela real do
celular já é o contêiner — `fixed` é o equivalente correto.

**Contexto:** decisão técnica quase óbvia (o wireframe tinha uma div
`#frame` simulando um celular; o app de verdade não tem isso), mas
registro aqui porque estabelece um padrão: **qualquer overlay/painel
futuro** (bottom sheet, modais, o Roll Overlay que chega na 0.7) deve
seguir esse mesmo padrão de `fixed` na viewport, não tentar reproduzir
posicionamento relativo ao "frame" do wireframe.

**Data/origem:** 2026-08, entrega 0.6.

## Wizard — navegação em pills flutuantes ancoradas + sorteio + validação bloqueante

**Decisão:** a partir da entrega 0.4-extra, o wizard de criação (e deve
valer pra qualquer fluxo de múltiplos passos que vier depois — level-up,
por exemplo) usa 3 mecanismos que **não existiam no wireframe original**:

1. **Voltar/Avançar viram pills flutuantes** (`border-radius: 999px`),
   ancoradas com `position: fixed` no rodapé da viewport — Voltar no
   canto inferior esquerdo, Avançar/Salvar no canto inferior direito.
   O conteúdo da etapa rola por baixo delas (scroll não move as pills).
   Isso troca a barra de rodapé fixa de largura total do wireframe
   (`.wiz-footer`), que ocupava uma faixa inteira da tela.
2. **Botão de sorteio (🔀)**, um FAB circular ancorado na borda esquerda
   da tela (fixed, `left: 12px`, centralizado verticalmente). Aparece só
   nas etapas que têm algo pra sortear (Classe, Origem, Espécie,
   Atributos — inclui o ajuste de antecedente +1/+1/+1, Línguas,
   Alinhamento, Resumo — sorteia um nome). Não aparece nas telas
   puramente informativas (Escolhas da Classe/Origem/Espécie) nem na
   Loja (compra é opcional, nada "precisa" ser sorteado ali).
3. **Validação bloqueante no Avançar:** cada etapa declara o que é
   obrigatório pra sair dela. Se faltar, o clique em Avançar não navega
   — mostra um aviso curto (ex: "Escolha uma classe antes de avançar.")
   e mantém o jogador na mesma tela.

**Contexto:** pedido explícito do Osmar, pra acelerar o preenchimento
(sorteio pra quem não se importa em escolher manualmente cada campo) e
evitar avançar com uma etapa incompleta sem perceber.

**Quais campos foram considerados "obrigatórios" (decisão minha, meio
arbitrária — revisar com o Osmar se algo não fizer sentido):**
- Classe, Origem, Espécie, Alinhamento: obrigatórios (todo personagem
  precisa ter os quatro).
- Atributos: obrigatório preencher os 6 valores **e** aplicar o ajuste de
  antecedente (+1/+1/+1) antes de avançar — sem isso o PV/Percepção do
  Resumo saem errados.
- Línguas: **opcional** — o livro permite escolher até 2, não exige
  mínimo.
- Loja: **opcional** — comprar item nenhum é uma escolha válida.
- Resumo: só o **nome** é obrigatório pra salvar (aparência/personalidade
  ficam livres).

**Alternativas descartadas:** manter o rodapé de largura total do
wireframe — descartado porque ocupava espaço vertical fixo em toda tela,
e o pedido explícito era "ocupar menos espaço".

**Data/origem:** 2026-08, logo após a entrega 0.4 (Fase 0).

## Carimbo de versão visível em toda entrega

**Decisão:** todo build publicado mostra um carimbo `v{AAAA}{MM}_{HHmm}`
(ano/mês/hora/minuto do commit) fixo e discreto na tela, lido de
`src/version.ts`.

**Contexto:** o Osmar testa cada entrega abrindo o mesmo link Netlify
repetidas vezes. Sem um jeito visível de diferenciar versões, é difícil
saber se o navegador está mostrando a entrega nova ou uma versão em
cache. Pedido explícito, na entrega 0.2. Regra fixa registrada também no
`CLAUDE.md` (seção 10).

**Data/origem:** 2026-08, durante a entrega 0.2.

---

## Combate — economia de ação (Layout C)

**Decisão:** interação de combate usa 3 botões fixos (Ação / Ação Bônus /
Reação), cada um abrindo um painel deslizante do seu lado correspondente
na tela: Ação desliza da esquerda, Ação Bônus da direita, Reação sobe de
baixo. Dentro do painel de Ação, "Usar Magia" é um acordeão que expande
inline (não navega pra outra tela).

**Contexto:** o app precisa ser jogável em tempo real durante uma sessão
de mesa, sem atrapalhar o ritmo do jogo.

**Alternativas descartadas:**
- **Radial/pizza menu** com as 12 ações do Cap. 1 espalhadas em círculo
  ao redor de um botão central "Ação", com interação de arrastar até
  "grudar" na opção mais próxima. Implementado e testado — ficou
  visualmente poluído em tela de celular (itens pequenos demais, difícil
  de mirar com o dedo). Padrão que funciona melhor em telas grandes
  (desktop) com mais espaço. **Não repetir esse padrão em mobile.**
- **Botão único "Ação" abrindo lista vertical simples empilhada** — menos
  ruim que o radial, mas ainda misturava os 3 tipos de recurso (Ação,
  Ação Bônus, Reação) numa lista só, dificultando ver rapidamente qual
  recurso já foi gasto no turno.

## Combate — estado Ativo vs Usada

**Decisão:** cada um dos 3 botões (Ação/Bônus/Reação) tem 2 estados
visuais: "ativo" (colorido, clicável) e "usada" (cinza, bloqueado,
`pointer-events:none`). Um botão "↻ Fim do Turno" restaura os 3 de uma vez.

**Contexto:** na prática de mesa, um jogador comum tem só 1 Ação, 1 Ação
Bônus (se tiver) e 1 Reação por turno — o app deveria refletir isso
visualmente pra evitar o jogador (ou o app) perder a conta do que já foi
usado.

**Caso conhecido e propositalmente adiado:** classes/situações que
concedem mais de 1 do mesmo recurso por turno (ex: Monge com Rajada de
Golpes, multiclasse) não são cobertas por este modelo simples de
booleano. Tratamento específico fica pra quando isso for implementado de
verdade — não travar o MVP por causa disso.

## Combate — espaços de magia

**Decisão:** contador visual de pips (preenchido/gasto) por círculo de
magia, dentro do acordeão "Usar Magia". Truques (círculo 0) não consomem
espaço; magias de círculo 1+ consomem, e bloqueiam nova conjuração quando
zerado.

**Aprendizado de regra importante:** Bruxo (Warlock) usa Magia de Pacto,
que recupera em **Descanso Curto** — diferente da maioria dos
conjuradores, que só recuperam em Descanso Longo. Isso já foi
implementado corretamente no protótipo. **Ao portar pra dado real, cada
classe conjuradora precisa declarar sua própria regra de recuperação de
espaço** — não assumir que todas recuperam só no Descanso Longo.

## Descansos — pertencem à aba Perfil, não à aba Combat

**Decisão:** botões de Descanso Curto/Longo ficam na aba Perfil.

**Contexto:** inicialmente estavam na aba Combat junto com as ações de
turno, mas descanso não é uma ação de turno — é algo que acontece entre
ou depois de combates. Misturar os dois confundia o propósito da aba
Combat (que deveria ser só "o que eu faço agora, no meu turno").

## Wizard de criação — telas separadas por grupo (lista → escolhas)

**Decisão:** cada grupo do wizard (Classe, Origem, Espécie) é dividido em
2 telas: uma de **lista** (cards com imagem à esquerda + info à direita,
onde o jogador escolhe a opção) e outra de **escolhas** (detalhes,
seleções específicas daquela opção, ex: perícias da classe escolhida).

**Contexto:** pedido explícito do Osmar, pra manter cada tela focada numa
única decisão por vez (hierarquia de informação progressiva).

## Atributos — ajuste de antecedente é parte da tela de Atributos

**Decisão:** depois de distribuir os 6 valores do array padrão, uma seção
adicional na mesma tela permite aplicar o ajuste do antecedente (+1/+1/+1
nos três atributos indicados pelo antecedente, ou +2/+1 — este último
ainda não implementado).

**Alternativas descartadas:** não foi cogitada uma tela separada pra
isso — o ajuste é conceitualmente parte da "distribuição final" dos
atributos, não uma etapa independente.

**Atualização:** a trava nos 3 atributos do antecedente foi implementada
— ver "Atributos — travados nos 3 elegíveis do antecedente, com opção de
desbloqueio" abaixo. Essa pendência específica está resolvida.

## Atributos — travados nos 3 elegíveis do antecedente, com opção de desbloqueio

**Decisão:** na tela de Atributos, os 3 atributos elegíveis da origem
escolhida (`origem.atributosElegiveis`, já importado junto com Origens)
vêm liberados pra receber o ajuste +1/+1/+1; os outros 3 ficam com
visual bloqueado (`btn-disabled`, `pointer-events: none`) e a função de
toggle também recusa a mudança mesmo se o clique acontecer por outro
caminho — dupla trava (CSS + lógica), não só visual.

Um checkbox **"Desbloquear atributos"** (novo campo
`desbloquearAtributos: boolean` no `WizardSelection`) libera os 6
atributos pra escolha livre, ignorando a regra do antecedente. Ao
desmarcar o checkbox de novo, qualquer atributo fora dos 3 elegíveis que
tivesse recebido o ajuste é removido automaticamente (evita ficar um
ajuste "ilegal" preso depois de destravar e retravar).

**Contexto:** pedido direto do Osmar — a regra é clara sobre quais 3
atributos cada antecedente permite, então dava pra travar isso sem
esperar UI mais elaborada. O checkbox de escape existe porque o jogador
pode ter uma razão de mesa pra fugir da regra (ex: variante de regra da
campanha, personagem feito sem seguir antecedente à risca).

**Data/origem:** 2026-08, pedido direto do Osmar.

## Ficha — trava de edição por XP

**Decisão:** enquanto a ficha não tiver XP registrado, os valores
"estáticos" (atributos, perícias) ficam livremente editáveis. Assim que
XP > 0, um aviso visual indica que a edição livre está travada, e mudanças
só deveriam acontecer via fluxo oficial de level-up.

**Contexto:** evita o jogador "trapacear" editando valores depois que a
campanha já começou, mas sem impedir ajustes numa ficha ainda em
rascunho/preparação antes da primeira sessão.

**Pendência conhecida:** hoje isso é só um aviso visual (não bloqueia de
verdade a edição). Bloqueio funcional real fica pra quando a ficha tiver
estado persistente de verdade.

## Nomenclatura da 4ª aba: "Combat", não "Play"

**Decisão:** a aba de ações de turno se chama "Combat" (com ícone de
espadas cruzadas), não "Play" como no rascunho inicial.

**Contexto:** "Play" era genérico demais e não deixava claro o propósito
específico da aba (ações de combate em tempo real).

## Origens importadas de verdade — Fase 1, entrega 1.1

**Decisão:** as 16 origens, os 10 Talentos de Origem e os 3 grupos de
ferramenta com escolha (Instrumento Musical, Kit de Jogos, Ferramentas
de Artesão) foram importados por script (Python + openpyxl lendo a
planilha diretamente, gerando os arquivos `.ts`) — não digitados à mão —
e já substituem os 3 exemplos fixos do wizard na etapa Origem/Escolhas da
Origem.

**Erro de dado encontrado e corrigido na importação:** a aba
`Antecedentes` grafa o talento da origem Artesão como "Artífice", mas o
nome oficial (confirmado pelo Osmar direto no Livro do Jogador 2024,
tanto na página da origem Artesão quanto na lista de talentos do Cap. 5)
é **"Artifista"** — bate com a aba `Talentos` da planilha, que também já
estava certa. A correção foi aplicada só na importação (mapeamento
`Artífice → Artifista` documentado como comentário no topo de
`origens.ts`); a planilha mestra em si não foi editada.

**Ferramenta com grupo de escolha agora é seletor de verdade:** na etapa
"Escolhas da Origem", quando a ferramenta da origem é `categoria:
"escolha"`, a tela lista os itens concretos do grupo (ex: Alaúde, Flauta,
Gaita de Foles... pra Instrumento Musical) como cards individuais
tocáveis — implementando a regra de UI já registrada acima. A escolha
fica em `WizardSelection.ferramentaOrigemEscolhida`, e o wizard bloqueia
"Avançar" até uma escolha ser feita (reaproveitando o mesmo mecanismo de
validação bloqueante do `DECISOES-DESIGN.md`, entrada "Wizard —
navegação em pills...").

**As 6 origens "em breve" ficam visíveis mas não-selecionáveis:**
Acólito, Guia, Sábio (Iniciado em Magia) e Nobre, Escriba, Charlatão
(Habilidoso) aparecem na lista com a tag "(em breve)" e
`pointer-events` desabilitado — ver `PENDENCIAS.md` pra detalhes de por
que e o que falta pra liberar.

**Data/origem:** 2026-08, Fase 1, entrega 1.1.

## Dados — Origens são uniformes, schema único sem exceções

**Decisão:** as 16 origens do Livro do Jogador 2024 usam um schema de
dados único e idêntico (3 atributos, 1 talento, 2 perícias, 1 ferramenta,
2 opções de equipamento). Nenhuma variação estrutural entre elas.

**Contexto:** confirmado campo a campo na planilha mestra antes de
importar. Vale como precedente: ao importar Classes/Subclasses depois,
NÃO assumir que o mesmo nível de uniformidade vai se repetir — já
sabemos, por outras análises, que características de classe têm bem
mais variação (tipos de ação, recursos limitados, etc.).

**Detalhe de implementação:** 5 das 16 origens (Artista, Artesão, Guarda,
Nobre, Soldado) têm um campo de ferramenta com escolha dentro de um
grupo (Instrumento Musical, Ferramentas de Artesão, Kit de Jogos) — as
opções reais de cada grupo já estão mapeadas a partir da coluna
"Variantes" da aba Ferramentas da planilha. Preço não entra nessas opções
durante a seleção de origem (só importa depois, na Loja).

**Regra de UI decorrente (2 formatos de exibição, não 1):**
- **Ferramenta fixa** (ex: Kit de Ladrão do Criminoso, Suprimentos de
  Calígrafo do Acólito) — é 1 item só, um "kit" fechado; aparece como
  texto simples, sem nada pra tocar/escolher.
- **Ferramenta com grupo de escolha** (Instrumento Musical, Kit de
  Jogos, Ferramentas de Artesão) — **nunca mostrar só "(escolha)"**; a
  tela precisa listar os itens concretos do grupo (ex: Alaúde, Flauta,
  Gaita de Foles... pra Instrumento Musical) como opções individuais
  tocáveis, do mesmo jeito que as origens/classes/espécies já aparecem
  como cards selecionáveis no wizard.

**Pendência conhecida (ver `PENDENCIAS.md`):** 2 dos 10 Talentos de
Origem usados nas 16 origens pedem uma seleção extra na hora de pegar —
**Habilidoso** (Nobre, Escriba, Charlatão: escolhe 3 perícias/ferramentas
livres) e **Iniciado em Magia** (Acólito, Guia, Sábio: escolhe 2 truques
+ 1 magia de 1º círculo de uma lista de classe). Essas origens ficam
marcadas "(em breve)" e não-selecionáveis na lista até essa UI de seleção
ser desenhada — não travam a importação das outras 14.

## Dados — todo import segue a mesma pasta/formato

**Decisão:** `data/rulesets/dnd2024/` recebe um arquivo por categoria
(origens.ts, talentos.ts, ferramentas.ts, ...), todos exportando um array
no mesmo padrão de objeto, indexado por `id`.

**Contexto:** evita que cada categoria de dado vire "um jeito diferente de
importar", o que dificultaria manutenção assim que o projeto crescer.

## Itens de origem/classe já nascem no formato de Mochila

**Decisão:** equipamento concedido por origem (e depois por classe) deve
usar a mesma estrutura de item que a aba Mochila espera (nome,
quantidade, peso, categoria), com uma tag `origemDoItem` indicando de
onde veio (antecedente, classe, ou compra na loja).

**Contexto:** esses itens vão parar de verdade no inventário do
personagem assim que a ficha for criada — não são só texto decorativo no
resumo do wizard. Uma estrutura de item única evita reimplementar "o que
é um item" em três lugares diferentes do código (origem, classe, loja).

## Talentos são importados junto com Origens, não depois

**Decisão:** a importação de Talentos entra na mesma leva que a
importação de Origens, não fica pra uma entrega futura separada.

**Contexto:** cada origem concede exatamente 1 Talento de Origem fixo, e
esse mesmo talento pode reaparecer como opção no level-up (níveis de
ASI/Talento). Sem os Talentos importados, a origem teria só um nome solto
sem descrição/efeito de verdade conectado.

## UI — floaters de resumo em progresso durante o wizard (a implementar)

**Decisão (adiada, só registrada por ora):** 3 painéis flutuantes durante
a criação de personagem, cada um acumulando o que já foi adicionado numa
categoria — Perfil (perícias, talentos), Itens (kits, itens de
classe/origem), Truques e Magias. Ajuda o jogador a ver o que já está
"garantido" na ficha e evita duplicata de concessão (ex: duas fontes
diferentes dando a mesma perícia).

**Contexto:** padrão que já existia no builder anterior do Osmar, vale
reaproveitar. Ainda não está no wireframe atual — entra quando chegar a
hora de detalhar o wizard visualmente.

## UI — tooltip em texto sublinhado / pill com ícone "i" (a implementar)

**Decisão (adiada, só registrada por ora):** qualquer termo com descrição
própria (talento, magia, truque) aparece sublinhado; tocar abre popup com
a descrição, sem trocar de tela. Quando o termo é uma opção selecionável
em formato de pill, o mesmo comportamento vem de um ícone "i" ao lado em
vez do sublinhado.

**Contexto:** mesmo padrão do builder anterior. Ainda não está no
wireframe atual.

## Técnica de escala pra molduras ornamentadas — 9-slice (border-image)

**Decisão:** painéis, botões e cards com moldura ornamentada (a pele RPG
que vai por cima da estrutura M3) devem usar a técnica **9-slice**
(equivalente web do 9-patch/9-slice que o Osmar já usava no Unity) via
CSS `border-image` — não gerar uma imagem por tamanho de componente.

**O que é:** o asset é dividido numa grade 3x3. Os 4 cantos nunca
esticam (preservam o entalhe/ornamento); as bordas do meio esticam só
numa direção; o centro estica nas duas. Implementado via
`border-image-source` + `border-image-slice` + `border-image-width`, com
`border-image-repeat: repeat` pra texturas como pedra/tecido (evita
esticar e borrar) ou `stretch` pra gradientes lisos.

**Contexto:** pergunta direta do Osmar comparando com a técnica que ele
já usa em Unity para assets de jogo. Confirmado que existe equivalente
nativo em CSS, sem precisar de biblioteca extra pra DOM comum (só
necessário considerar solução alternativa tipo `NineSlicePlane` do
Pixi.js se algum componente futuro for renderizado em canvas/WebGL em vez
de DOM normal).

**Relevância direta:** os estandartes e emblemas com moldura ornamentada
já produzidos são candidatos naturais a usar esse padrão quando virarem
componentes reais (botões, cards) de tamanho variável.

## Referência de design — Material Design 3 (m3.material.io)

**Decisão:** usar o Material Design 3 do Google como referência de
**estrutura/comportamento** (espaçamento, states de componente, motion,
acessibilidade, padrões de bottom sheet/FAB/seleção) sempre que houver
dúvida se um padrão de UI está dentro de boa prática.

**Nota importante (correção de um mal-entendido inicial):** estrutura
(M3) e identidade visual RPGzística **não são excludentes** — são duas
camadas independentes. Um botão pode seguir o padrão estrutural de pill
do M3 (formato, área de toque, comportamento de seleção) e ao mesmo tempo
ter textura de pedra/pergaminho e tipografia old-school por cima. Não é
"M3 ou RPG", é "M3 por baixo, RPG por cima" — dá pra fazer os dois ao
mesmo tempo, a qualquer momento, sem esperar uma fase específica.

**Sobre timing:** a recomendação de "visual pode vir depois" era só
sobre prioridade (validar fluxo/lógica é mais urgente porque bloqueia
decisões; visual não bloqueia nada). Não é uma regra contra começar a
aplicar identidade visual mais cedo, se o Osmar quiser — só não é
pré-requisito pra avançar o resto.

**Decisão de processo de construção (confirmada):** todo componente será
construído primeiro seguindo a estrutura/comportamento do M3 (isso é o
"correto por padrão" ao implementar qualquer tela nova), e só depois
recebe a alteração temática de RPG por cima. Ou seja, a ordem de trabalho
padrão é sempre: 1) implementar com M3 como base estrutural → 2) aplicar
a pele RPGzística. Isso vale como diretriz permanente de como construir
qualquer tela nova daqui pra frente, não só uma observação pontual. Regra
correspondente registrada no `CLAUDE.md`, seção 5.1.

**Contexto:** Osmar encontrou o m3.material.io e perguntou se dava pra
usar sempre como referência.

**Pendência conhecida:** as telas já construídas na Fase 0 (splash,
login, home, lista, wizard, ficha, combate) **não foram auditadas** contra
M3 retroativamente — essa regra vale como padrão daqui pra frente, pra
telas novas ou quando uma tela existente for revisitada por outro motivo.
Não é gatilho pra uma varredura geral agora.

## Tabbar da Ficha vira pill flutuante (mesmo padrão do wizard)

**Decisão:** a barra de abas da ficha (Perfil/Mochila/Magias/Combat) deixa
de ser uma faixa fixa de largura total no rodapé (`border-top`, presa ao
fim do layout em flex-column) e vira uma pill flutuante centralizada,
`position: fixed` na viewport, com sombra — igual ao padrão já usado nas
pills Voltar/Avançar do wizard.

**Contexto:** pedido explícito do Osmar — o scroll de conteúdos longos
(Mochila, Magias) ficava "triste" com a barra de abas ocupando uma faixa
fixa inteira no rodapé. A pill flutuante ocupa menos espaço visual e seu
posicionamento não depende de estar no fim do fluxo do layout.

**Detalhe de implementação:** removida a dica de texto "arraste pra
esquerda/direita pra trocar de aba" que ficava acima da barra antiga — a
pill flutuante já é visualmente óbvia o suficiente, e o swipe entre abas
continua funcionando normalmente por baixo dela.

**Padrão a repetir:** essa é a segunda vez que uma barra de navegação de
largura total vira pill flutuante (a primeira foi o rodapé do wizard) —
vale como padrão padrão pra qualquer navegação fixa futura no app, não
só um caso isolado.

**Data/origem:** 2026-08, logo após a Fase 1 (entrega 1.1 de Origens) e o
primeiro passe de Material Design 3.

## Tela de Escolhas da Origem — layout revisado

**Decisão:** revisão de layout pedida pelo Osmar depois de ver a tela na
prática:
- Header mostra só o nome da origem (não mais "Origem — Talento: X").
- Talento vira um card próprio (nome + descrição), não uma linha de
  resumo genérica.
- Perícias concedidas ficam lado a lado (tags numa linha), não uma por
  linha.
- Tira o rótulo "fixa" de perícia/ferramenta — se está na tela, é porque
  foi concedido; não precisa dizer que é fixo.
- Valores de moeda ficam como texto simples (não em `.tag` — correção:
  a ideia original era só marcar que "PO"/"PP"/"PC" é uma variável que um
  dia vira símbolo/ícone de moeda, ex: "50 PO" → "50🪙", não colocar o
  valor inteiro dentro de uma pill visual).
- **Equipamento inicial vira escolha de verdade** entre Opção A e Opção
  B (antes era só texto informativo) — clicável, com estado selecionado,
  valida antes de avançar, e tem sorteio (🔀).

**Contexto:** a primeira versão desta tela era só informativa (mostrava
o que a origem oferece, mas a escolha real ficava pra depois, na Loja).
Na prática ficou confuso — o jogador via as opções mas não podia
escolher ali, e a Loja não sabia dessa escolha.

**Detalhe de implementação:** novo campo `equipamentoOrigemEscolhido:
'A' | 'B' | null` no estado do wizard.

**Data/origem:** 2026-08, revisão da entrega 1.1.

## FAB de sorteio (🔀) ancorado no canto inferior, não mais no meio vertical

**Decisão:** o FAB de sorteio do wizard passa de `top: 50%` (flutuando
no meio vertical da tela, fixo na viewport) para ancorado no canto
inferior esquerdo, logo acima da pill "Voltar".

**Contexto:** bug encontrado durante teste visual da revisão da tela de
Escolhas da Origem — como o FAB fica fixo na viewport (não rola com o
conteúdo), qualquer tela com texto mais longo tinha o meio do texto
tampado pelo círculo do FAB no meio do scroll. Ancorado no rodapé, junto
das pills, ele nunca mais sobrepõe conteúdo, e ainda fica sempre visível
igual antes.

**Alternativas descartadas:** manter no meio vertical — descartado por
ser a causa direta do bug.

**Data/origem:** 2026-08, mesma revisão acima.

## Popup de descrição de item — implementado (ItemComDescricao)

**Decisão:** o padrão "tooltip em texto sublinhado", que estava adiado
desde a entrega de Origens, agora existe de verdade:
`ui/components/ItemComDescricao.tsx`. Nome do item vem com sublinhado
serrilhado quando tem descrição cadastrada; toque abre um popup central
(mesmo estilo visual do `RollOverlay`: card com borda de destaque,
sombra, botão "fechar") com o nome no topo e a descrição embaixo. Item
sem descrição renderiza como texto simples, sem sublinhado.

**Contexto:** o Osmar atualizou a planilha mestra com uma coluna
"Descrição" nova em **Equipamento de Aventura** (98/98 itens) e
**Montarias e Veículos** (2/19 itens — Sela Militar e Sela Exótica são
os únicos com regra mecânica; o resto é só carga/custo). Isso desbloqueou
o popup que antes só estava desenhado no papel.

**Detalhe de implementação:**
- `data/rulesets/dnd2024/equipamentoAventura.ts` e `montariasVeiculos.ts`
  — dados gerados da planilha, linhas de cabeçalho de seção (ex: "—
  Foco Arcano —") filtradas na importação.
- `data/rulesets/dnd2024/buscarDescricaoItem.ts` — índice único por nome
  (case-insensitive) que cruza as duas fontes; qualquer tela que
  precise saber "esse item tem descrição?" usa essa mesma função, não
  reimplementa a busca.
- O clique no nome do item usa `stopPropagation` — importante porque em
  vários lugares o item aparece **dentro** de um card clicável maior
  (ex: o card de "Opção A" na tela de Origem); sem isso, tocar no nome
  do item também dispararia a seleção do card por baixo.
- Cobertura ainda parcial: Armas e Armaduras não foram importadas (não
  têm campo de descrição corrido na planilha, têm colunas mecânicas) —
  ver `PENDENCIAS.md`.

**Data/origem:** 2026-08, depois da atualização da planilha mestra com a
coluna Descrição.

## ItemComDescricao — regra fixa de qual variante usar (sublinhado vs. ícone)

**Decisão:** `ItemComDescricao` tem 2 variantes visuais pro mesmo
comportamento (toque abre popup com nome+descrição) — a partir de
agora, qual usar não é escolha caso a caso, é regra fixa por contexto:
- **`sublinhado`** (padrão) — termo dentro de uma frase/parágrafo de
  texto corrido (ex: descrição de kit, lista de itens da Loja/Origem).
- **`icone`** (ⓘ solto ao lado, nome sem sublinhado) — termo dentro de
  uma **linha de estatística ou linha com checkbox**, onde sublinhar o
  texto competiria visualmente com o resto da linha ou pareceria um
  controle interativo à parte (ex: Mochila com "itens detalhados"
  desligado, Maestria em Arma — tanto no wizard quanto na Ficha).

**Contexto:** a Maestria em Arma tinha ganhado sublinhado na Ficha (B2)
e ícone no wizard (ajuste seguinte) sem uma regra declarada — o Osmar
notou a inconsistência e perguntou qual deveria ser o padrão único.
Resposta: não existe 1 variante única pro app inteiro, existem 2
variantes com contexto de uso bem definido — o real problema era essa
regra não estar registrada em lugar nenhum, então cada tela escolhia
"no olho". Agora está: tanto no JSDoc de `ItemComDescricao.tsx` quanto
aqui. Qualquer termo novo com popup de descrição consulta essa regra
antes de escolher a variante — não decide de novo.

**Termo de design pra isso:** isso é uma **guideline de uso de
componente** (ou "contrato de variante") — a mesma ideia de design
system que já usamos nesse arquivo pra qualquer decisão de UI: uma vez
registrada, vale pra sempre até você pedir pra mudar, sem precisar
repetir o pedido a cada tela nova.

**Data/origem:** 2026-08.

## "Concedido pela origem" — Talento + Perícias como botões tonais (InfoChip)

**Decisão:** tudo que é "garantido/fixado" ao escolher uma origem
(Talento de Origem, as 2 Perícias) aparece junto, numa seção só
("Concedido pela origem"), cada um como um **botão tonal** (M3: fundo
preenchido com `--accent-dim`, sem borda, formato pill) mostrando
`{nome} ⓘ`. Tocar abre o mesmo popup central (nome + descrição) usado
pelos itens de equipamento. Novo componente `ui/components/InfoChip.tsx`.

**Contexto:** correção de uma versão anterior desta tela que tinha
tratado Talento (card grande, sempre expandido) e Perícias (tags sem
info) como coisas visualmente diferentes — na prática, do ponto de
vista do jogador, ambos são a mesma categoria ("coisa que a origem te
dá"), e deveriam ter o mesmo tratamento visual e a mesma interação
(toque → popup), não um formato por tipo de dado.

**Detalhe de implementação:** `data/rulesets/dnd2024/pericias.ts` — nova
importação (18 perícias, aba "Perícias" da planilha) usando a coluna
"Exemplo de uso" como descrição, já que a planilha não tem uma coluna
chamada literalmente "Descrição" pra perícias.

**`InfoChip` vs `ItemComDescricao`:** dois componentes parecidos de
propósito, não um só — `InfoChip` é pro padrão "lista curta de coisas
concedidas" (visual de botão tonal, cabe pouca coisa lado a lado);
`ItemComDescricao` é pro padrão "termo dentro de um parágrafo/lista
longa" (texto sublinhado, não quebra o fluxo de leitura). Mesma lógica
de popup por baixo, apresentação diferente por contexto de uso.

**Data/origem:** 2026-08, correção pedida logo após a entrega do popup
de itens.

## Descrição narrativa das origens — única exceção "fonte = livro, não planilha"

**Decisão:** as 16 descrições narrativas de origem (o parágrafo de
sabor que existia nos dados fixos do wireframe, ex: "Você se dedicou ao
serviço em um templo...") foram transcritas direto do **Livro do
Jogador** (Cap. 4, PDF que o Osmar anexou) pro arquivo
`data/rulesets/dnd2024/descricoesOrigens.ts` — não vieram da planilha
mestra.

**Contexto:** o Osmar notou que a descrição de sabor tinha sumido da
tela de lista de Origens quando a Fase 1 trocou os dados fixos do
wireframe pelos dados reais da planilha (a aba Antecedentes não tem
coluna de descrição narrativa — só dados mecânicos). Ele confirmou com
o PDF do capítulo que o texto existe no livro e pediu pra transcrever
direto, sem esperar a planilha ser atualizada.

**Por que é uma exceção ao CLAUDE.md (seção 3):** a regra permanente do
projeto é "nunca busque regra em outro lugar que não a planilha; se
faltar, avise". Isso continua valendo como padrão — essa é a **única**
exceção até agora, feita com pedido explícito do Osmar depois de eu ter
avisado do buraco na planilha, não uma decisão unilateral minha.

**Consequência pra manutenção:** `descricoesOrigens.ts` é um arquivo
separado de `origens.ts` (que continua 100% gerado da planilha) e
mapeia por `id` da origem. Se um dia a aba Antecedentes ganhar uma
coluna "Descrição" de verdade (como já aconteceu com Equipamento de
Aventura), dá pra apagar esse arquivo e mover o campo pra dentro de
`origens.ts` via regeneração normal — sem quebrar nada, porque o
consumo nas telas é só `descricoesOrigens[origem.id]`.

**Onde aparece:** tela de lista de Origens (card completo) e tela de
Escolhas da Origem (parágrafo logo abaixo do nome, antes da seção
"Concedido pela origem").

**Data/origem:** 2026-08, mesmo dia da correção acima.

## "Concedido pela origem" — 3 linhas rotuladas (Talento / Perícias / Per. com Ferramentas)

**Decisão:** a seção "Concedido pela origem" da tela de Escolhas da
Origem virou 3 linhas separadas, cada uma com um rótulo de texto
seguido do(s) botão(ões) tonal(is) InfoChip:
- `Talento: {chip}`
- `Perícias {chip} {chip}`
- `Per. com Ferramentas: {chip}` (ou `(escolha abaixo)` em texto simples
  quando a origem usa ferramenta de categoria "escolha" e o jogador
  ainda não escolheu nenhuma opção na lista abaixo)

**Contexto:** o Osmar pediu pra devolver o talento (que tinha ficado só
com perícias na mesma linha) e organizar em linhas rotuladas, além de
unificar a ferramenta nessa mesma seção-resumo — antes ela tinha um
bloco "Ferramenta" separado, sem descrição nenhuma.

**Ferramenta agora tem descrição:** a aba "Ferramentas" da planilha já
tinha a coluna "Uso (ação Usar Objeto)" — foi importada como campo
`descricao` em `ferramentas.ts` (pros grupos de escolha: Instrumento
Musical, Kit de Jogos, Ferramentas de Artesão) e num novo mapa
`descricaoFerramentaFixa` (pras ferramentas fixas que não pertencem a
nenhum grupo: Suprimentos de Calígrafo, Ferramentas de Ladrão, Kit de
Falsificação, Kit de Herbalismo, Ferramentas de Carpinteiro, Ferramentas
de Cartógrafo, Ferramentas de Navegador, Kit de Disfarce, Kit de
Veneno). Um novo `buscarDescricaoFerramenta.ts` (mesmo padrão de
`buscarDescricaoItem.ts`) faz a busca por nome pras duas fontes.

**Nota sobre Instrumento Musical e Kit de Jogos:** a planilha só tem 1
linha de "Uso" por grupo (não por instrumento/jogo individual) — por
isso, ex: Alaúde e Tambor mostram a mesma descrição genérica de
"Instrumento Musical" no popup. Isso é fiel à planilha, não uma
simplificação nossa.

**Bloco de seleção da ferramenta (categoria "escolha"):** continua
existindo abaixo do resumo, com a lista de opções clicáveis — só perdeu
o título "Ferramenta" (virou redundante já que o resumo já mostra
"Per. com Ferramentas:").

**Data/origem:** 2026-08, mesmo dia da entrega das descrições
narrativas de origem.

## Deploy migrado do Netlify pro GitHub Pages

**Decisão:** o app deixou de ser publicado no Netlify
(`dndcompapp.netlify.app`) e passou a ser publicado no GitHub Pages,
via GitHub Actions (`.github/workflows/deploy.yml`), que builda e
publica automaticamente a cada push na branch de desenvolvimento. Novo
link: `https://osmarjunior0710.github.io/DND-Conpanion-App/`.

**Contexto:** o time do Netlify ficou sem crédito operacional
("operational credits"), o que pausou os deploys de produção — os
commits chegavam no GitHub normalmente, mas o site publicado ficou
travado numa versão antiga sem nenhum erro de código envolvido. Como o
app é 100% front-end (sem backend próprio; a Fase 5 com Supabase
conversa direto do navegador, sem precisar de função de servidor), o
GitHub Pages cobre o caso de uso sem depender de crédito pago.

**O que mudou tecnicamente:**
- `vite.config.ts`: `base: '/DND-Conpanion-App/'` (o GitHub Pages serve
  o site dentro de um subcaminho com o nome do repositório, diferente
  do Netlify que serve na raiz).
- `src/main.tsx`: `BrowserRouter` ganhou `basename="/DND-Conpanion-App"`
  pra as rotas do React Router baterem com esse subcaminho.
- `public/404.html` + trecho em `index.html`: truque padrão
  "spa-github-pages" (rafgraph) pra recarregar uma rota tipo
  `/ficha/123` não dar erro 404 — o GitHub Pages não tem redirecionamento
  de rota nativo como o `netlify.toml` tinha.
- `netlify.toml` removido (não é mais usado).

**Limite conhecido pro futuro:** GitHub Pages grátis só serve site
público enquanto o repositório for público. Se um dia o repositório
virar privado, o link para de funcionar (exigiria GitHub Enterprise pra
Pages privado). Registrado aqui pra não ser surpresa depois — hoje o
repo é público, então não trava nada agora.

**Data/origem:** 2026-08, mesmo dia da entrega acima — Osmar pediu a
migração depois de descobrir a pausa de créditos do Netlify.

## Dados — Espécies têm 3 naturezas diferentes de sub-escolha

**Decisão:** das 10 espécies do Livro do Jogador 2024, 5 têm uma
sub-escolha além dos traços fixos (Herança Dracônica, Linhagem Élfica,
Linhagem Gnômica, Ancestralidade Gigante, Legado Ínfero). Schema
genérico com campo `natureza`, que **não é a mesma coisa** pras 3:

- `identidade_permanente` — escolhida 1x na criação, nunca muda, é
  "quem seu personagem é" (Draconato, Golias).
- `linhagem_com_progressao_magica` — escolhida 1x, mas desbloqueia
  magia automática nos níveis 3 e 5 (Elfo, Tiferino; Gnomo é só nível 1,
  sem progressão 3/5, mas mesma natureza geral).
- `escolha_reutilizavel` — não é identidade fixa, é escolhida de novo
  toda vez que a habilidade é usada (Aasimar — Revelação Celestial).

**Por que a distinção importa:** tratar as 3 como a mesma coisa geraria
bug de UX real — perguntar de novo no combate algo que já devia estar
fixo desde a criação (`identidade_permanente`), ou nunca perguntar algo
que precisa ser escolhido a cada uso (`escolha_reutilizavel`).
`identidade_permanente` e `linhagem_com_progressao_magica` fazem
pergunta na tela de "Escolhas da Espécie" do wizard;
`escolha_reutilizavel` não aparece no wizard — aparece como opção dentro
da aba Combat quando o jogador for usar a habilidade.
`linhagem_com_progressao_magica` também precisa "conversar" com o motor
de level-up (ao chegar no nível 3/5, desbloquear a magia automaticamente
— não é escolha manual do jogador nesses níveis).

**Detalhe de implementação:** traços que herdam efeito da sub-escolha
(ex: tipo de dano do Ataque de Sopro do Draconato muda conforme a cor de
dragão escolhida) são marcados com `traçosVinculadosASubescolha` e
resolvidos em tempo de leitura pelo motor de cálculo — nunca duplicados
como valor fixo em dois lugares.

**Precedente adicional (achado parecido, mas separado):** Aasimar,
Humano e Tiferino têm campo Tamanho como escolha (Médio ou Pequeno) em
vez de valor fixo — schema `{ fixo, opcoes }` cobre os dois casos.

**Espécies sem sub-escolha nenhuma:** Anão, Humano, Orc e Pequenino —
`subescolha: null` é o valor correto pra elas, não é dado faltando.

**Contexto:** análise feita com apoio do Claude (chat separado, fora
deste ambiente de código) a pedido do Osmar, que queria organizar o
schema antes de eu começar a importar Espécies. Revisado e adotado aqui
como a decisão real do projeto.

**Data/origem:** 2026-08, antes da entrega de importação de Espécies.

## Espécies importadas — Anão como piloto, mesmo padrão de Origens

**Decisão:** as 10 espécies do Livro do Jogador 2024 foram importadas
pra `data/rulesets/dnd2024/especies.ts`, com **Anão, Orc e Pequenino**
selecionáveis (as 3 sem nenhuma escolha embutida) e as outras 7 "(em
breve)" — mesmo tratamento visual de Origens (`btn-disabled`, tag "(em
breve)" no card). A tela "3b. Escolhas da Espécie" mostra os traços como
botões tonais InfoChip (mesmo componente/padrão de Origem), cada um com
popup de descrição fiel ao texto da planilha.

**Correção de um dado errado no PENDENCIAS.md:** eu tinha registrado
"varrer as 40 espécies" — na verdade são só **10** espécies no Livro do
Jogador 2024. Corrigido na pendência atualizada.

**`.summary-row` ganhou `gap` e `text-align: right` no valor:** ao
mostrar o campo Tamanho do Anão (texto longo, quebra linha), o rótulo e
o valor coincidiam sem espaço nenhum ("TamanhoMédio..."). Corrigido
globalmente no estilo compartilhado — não afeta os outros usos de
`summary-row` (Resumo, Loja, Level Up, Escolhas de Classe), que têm
valores curtos sem quebra de linha.

**Data/origem:** 2026-08, mesmo dia da decisão de schema acima.

## Passada de legibilidade — fontes maiores e cinzas mais escuros

**Decisão:** todo `font-size` de texto pequeno/médio (≤20px) no app
subiu +2px, de forma global — 77 declarações em CSS + inline `style`
espalhadas pelas telas. Além disso, os dois tons de cinza secundário
ficaram mais escuros: `--text-dim` de `#55565b` pra `#45464b`, e
`--text-faint` de `#86878c` pra `#6b6c72` (esse último quase sem
contraste contra o fundo `#f5f5f2`/branco antes da mudança).

**Contexto:** pedido explícito do Osmar — "muito ruim de ler", "mal dá
pra ver o cinza no branco", "os textos são minúsculos". Fontes de
14px+ (títulos, números grandes) não foram tocadas, só as pequenas.

**Como foi feito:** script único fazendo a troca em todos os arquivos
`.css`/`.module.css` e nos `style={{ fontSize: N }}` inline dos
componentes React, não editado tela por tela — garante consistência e
evita esquecer algum componente.

**Pendência de fundo, não resolvida agora:** o projeto ainda não tem
tokens de escala tipográfica (tipo `--font-size-xs/sm/md`) — cada
componente guarda seu próprio valor em px. Esse ajuste manteve o
padrão atual (valores soltos), só que maiores. Migrar pra tokens de
escala é um passo de arquitetura CSS separado, não necessário agora.

**Data/origem:** 2026-08, pedido direto após revisar a entrega de
Espécies.

## Idiomas — Comum obrigatório + 2 à escolha entre Comuns e Raros juntos

**Decisão:** as 19 entradas da aba Idiomas da planilha (10 Comuns + 9
Raros) foram importadas pra `data/rulesets/dnd2024/idiomas.ts`. Na tela
"4. Línguas", Comum vem pré-marcado e travado (não dá pra desmarcar), e
o jogador escolhe mais exatamente 2 idiomas — **sem restringir a
categoria**: Raros aparecem liberados na mesma tela, junto dos Comuns,
não escondidos atrás de alguma trava de regra.

**Contexto:** pedido explícito do Osmar — a regra formal do livro exige
uma "boa justificativa de história" pra escolher um idioma Raro (ex: um
Tiferino sabendo Infernal, um Druida sabendo Druídico), mas isso é uma
validação de **narrativa**, não uma trava mecânica que o app deveria
impor. A tela mostra esse aviso como texto informativo, não como
bloqueio de seleção.

**Data/origem:** 2026-08, pedido direto do Osmar.

## Popups (InfoChip/ItemComDescricao) travam o scroll da página de trás

**Decisão:** os dois componentes de popup (`InfoChip`, `ItemComDescricao`)
agora usam um hook novo, `ui/hooks/useLockBodyScroll.ts`, que trava o
scroll da `body` enquanto o popup está aberto e devolve a posição exata
de scroll ao fechar. A trava usa `position: fixed` na `body` (não só
`overflow: hidden`) porque é o único jeito confiável de bloquear scroll
de verdade em navegador mobile — `overflow: hidden` sozinho não impede o
dedo de arrastar o conteúdo de trás em iOS/Android. O `.overlay` dos dois
componentes também ganhou `overscroll-behavior: contain` e
`touch-action: none`, e o `.card` ganhou `max-height: 80vh` +
`overflow-y: auto` (segurança pra descrição muito longa não estourar a
tela em celular baixo).

**Contexto:** o Osmar reportou dois sintomas do mesmo bug, num celular
Android real: o fundo preto do popup "deslocava" com o scroll (subia
quando rolava pra baixo, descia quando rolava pra cima), e a tela de
trás rolava mesmo com o dedo em cima do popup. Isso é o clássico bug de
"scroll vaza atrás do modal" no mobile — o `position: fixed` do overlay
continua correto, mas sem travar a `body`, o navegador deixa a página de
trás rolar por baixo (e em Android/Chrome isso pode gerar um artefato
visual de "atraso" no overlay durante o scroll por inércia).

**Data/origem:** 2026-08, reportado num Samsung Android real, mesmo dia
da entrega de Idiomas.

## Prioridade: fechar fluxo completo wizard → ficha antes de polir tela isolada

**Decisão:** a partir de agora, a prioridade é fechar um caminho
completo de construção de personagem até a ficha final navegável — cada
nova peça de dado (Classe, Talentos e Perícias de classe, etc.) deve
nascer já conectada de ponta a ponta (wizard → ficha), criando o
caminho de regressão junto, em vez de ficar só na tela isolada do
wizard. Ajustes de design fino em telas isoladas (ex: "Escolhas da
Espécie" ainda estranha — ver PENDENCIAS.md) ficam pra depois desse
fluxo estar de pé.

**Contexto:** pedido explícito do Osmar — ele quer validar cada entrega
nova olhando a ficha final resultante, não só a tela do wizard isolada.
Isso também evita retrabalho de polir uma tela isolada antes do
contexto ao redor dela (o resto do fluxo) estar decidido.

**Data/origem:** 2026-08, mesmo dia da pendência de design da tela de
Espécie.

## Dados — Classes têm núcleo comum em 3 camadas, não 1

**Decisão:** schema de Classe usa 3 camadas: (1) núcleo 100% universal —
atributo primário, dado de vida, 2 salvaguardas, nível de subclasse
(sempre 3, confirmado nas 12), Bônus de Proficiência e níveis de ASI
(globais, compartilhados, não repetidos por classe); (2) array de
`recursos` — toda classe tem ao menos 1, mas o número e formato variam
(conjurador completo, conjurador parcial, recurso não-mágico, ou só
bônus crescente sem "banco"); (3) características específicas por nível,
que não generalizam e continuam como lista solta (já cobertas pela aba
Características de Classe).

**Contexto:** diferente de Origens (uma camada só bastava), Classes têm
variação real de estrutura — forçar tudo numa tabela só geraria colunas
vazias sem sentido (ex: Espaços de Magia vazio pra classes que não
conjuram). Análise feita com apoio do Claude (chat separado, fora deste
ambiente de código) a pedido do Osmar, revisada e adotada aqui.

**Precedente que se repete:** nível de subclasse é sempre 3 nas 12
classes — mesmo padrão de "achar uniformidade real antes de assumir
variação" que já valeu pra Origens e Espécies. Bônus de Proficiência (uma
das lacunas de dados listadas no `CLAUDE.md`) já estava na planilha o
tempo todo, na aba Progressão de Classe — removido da lista.

**As 4 famílias de recurso encontradas nas 12 classes** (referência pra
quando cada classe for importada):
- **Conjurador completo** (Bardo, Clérigo, Druida, Feiticeiro, Mago):
  truques + magias preparadas + espaços por círculo (1º-9º), recupera no
  Descanso Longo.
- **Conjurador parcial/meio-conjurador** (Guardião, Paladino): mesma
  estrutura, só até 5º círculo, progressão mais lenta — ver decisão
  abaixo sobre a tabela ser compartilhada entre as duas.
- **Conjurador com regra própria** (Bruxo): Magia de Pacto, recupera no
  Descanso **Curto** (já registrado antes nesta mesma lista, seção
  "Combate — espaços de magia").
- **Recurso não-mágico próprio** (Bárbaro: Fúrias; Guerreiro: Recuperar
  Fôlego; Monge: Pontos de Foco; Feiticeiro tem Pontos de Feitiçaria
  além da magia).
- **Sem "banco" de recurso, só bônus crescente** (Ladino: Ataque
  Furtivo; Monge: Artes Marciais) — não é "gasta e recupera", é só um
  valor que sobe com o nível.

**Guerreiro (piloto, nível 1) usa a família mais simples:** só Recuperar
Fôlego como recurso com banco (2 usos no nível 1) — sem conjuração, sem
subclasse até nível 3. Por isso foi escolhido como primeira classe a
importar.

## Confirmado: Guardião e Paladino compartilham progressão idêntica de conjuração

**Decisão:** a tabela de conjuração (Magias Preparadas + Espaços de Magia
por círculo, níveis 1-20) de Guardião e Paladino é idêntica número por
número — conferido linha a linha direto na planilha (aba Progressão de
Classe), não só na análise do outro chat. Quando essas duas classes
forem importadas, a tabela entra num arquivo compartilhado
(`progressao-meio-conjurador.ts`), e as duas referenciam a mesma fonte em
vez de duplicar.

**Contexto:** confirma também que "Magias Preparadas" não é fórmula
simples (não é "nível/2 + mod") — é progressão irregular da tabela
oficial (ex: 6→6 nos níveis 5-6 mas 12→14 nos níveis 16-17), então
precisa ser importada como tabela de valores, não calculada.

**Pendência removida do CLAUDE.md** — "progressão exata de círculo dos
meio-conjuradores" não é mais lacuna, está confirmada.

**Data/origem:** 2026-08, antes de começar a importação de Classes.

## Guerreiro importado — piloto de Classes, proficiências/equipamento vindos do livro

**Decisão:** Guerreiro é a primeira classe selecionável de verdade no
wizard (as outras 11 ficam "(em breve)"). Dados vindos de 3 fontes:
- `classes.ts` — núcleo (atributo primário, dado de vida, salvaguardas,
  recursos por nível, progressão 1-20) direto da planilha (aba
  "Progressão de Classe").
- `caracteristicasClasse.ts` — texto de cada característica por nível,
  direto da planilha (aba "Características de Classe").
- `estilosDeLuta.ts` — os 10 talentos de Estilo de Luta, direto da
  planilha (aba Talentos, categoria "Estilo de Luta").
- `classesProficienciasIniciais.ts` — **exceção documentada** (mesmo
  padrão de `descricoesOrigens.ts`): proficiência de armadura/arma,
  perícias à escolha e equipamento inicial de classe, transcritos da
  tabela "Traços Básicos de Guerreiro" no Livro do Jogador (Cap. 3, pág.
  127) — a planilha não tem essas colunas pra Classe (só pra Origem).
  Osmar enviou o PDF do capítulo com autorização explícita.

**Limpeza de dado feita na importação:** as descrições dos níveis 2, 5
e 20 de Guerreiro em "Características de Classe" vinham com a tabela
"Características de Guerreiro" colada dentro do texto (erro de extração
da planilha) — removido o trecho colado, mantendo o parágrafo de regra
intacto e idêntico ao original. Registrado em PENDENCIAS.md pra revisão
futura das outras classes.

**Tela "1b. Escolhas da Classe":** segue o mesmo padrão visual de
Escolhas da Origem — resumo do núcleo em `summary-row`, características
de nível 1 como InfoChip (exceto Estilo de Luta, que é uma escolha, não
só informação), lista de Estilo de Luta como opt-cards de escolha única,
perícias como checkboxes (máx. 2), equipamento inicial como opt-cards
A/B/C com itens tocáveis quando têm descrição (armas/armaduras ainda não
têm — pendência já conhecida).

**Data/origem:** 2026-08, mesmo dia da confirmação do schema de
Classes.

## Idiomas — "2 à escolha" é regra fixa, não varia por Origem/Espécie

**Decisão:** confirmado que nem a aba Antecedentes nem a aba Espécies
da planilha têm coluna de idioma nenhuma — logo, o número de idiomas
concedidos por origem/espécie **não varia** (o campo simplesmente não
existe pra variar). A regra "Comum obrigatório + 2 à escolha", já
implementada na tela de Línguas, está correta e não precisa de ajuste.

**Contexto:** dúvida levantada numa auditoria de criação de personagem
feita com apoio do Claude (chat separado). Resolvida checando as duas
abas diretamente na planilha, não por memória.

**Data/origem:** 2026-08, durante revisão da auditoria de criação de
personagem.

## Cálculo de CA — Bárbaro e Monge têm regra própria (única exceção do núcleo)

**Decisão:** quando o motor de cálculo de CA for construído (Entrega A
da Ficha real), ele precisa checar, antes da fórmula padrão, se a
classe tem uma regra própria de "Defesa sem Armadura". Só duas das 12
classes têm isso como característica de classe base:
- **Bárbaro:** `10 + mod. Destreza + mod. Constituição`, mantém o
  benefício mesmo empunhando Escudo.
- **Monge:** `10 + mod. Destreza + mod. Sabedoria`, **perde** o
  benefício se usar Escudo ou vestir qualquer armadura.

Nenhuma das outras 10 classes tem regra de CA sem armadura própria.

**Achado relacionado, NÃO é uma 3ª exceção de núcleo:** a subclasse
Bardo — Colégio da Dança (nível 3, "Ginga Fascinante") também ganha
`10 + Destreza + Carisma` sem armadura, mas é característica de
**subclasse**, não de toda a classe Bardo — não deve entrar na função
central de cálculo de CA por classe, fica resolvida como característica
normal de subclasse (Camada 3) quando subclasses forem importadas.

**Recomendação de implementação:** função de cálculo de CA centralizada
que recebe (classe, atributos, armadura equipada, escudo equipado) e
resolve nessa ordem: 1) a classe tem regra própria sem armadura? 2) o
personagem está de fato sem armadura equipada? 3) aplica a regra
especial; senão, aplica a fórmula padrão por categoria de armadura
(Leve: base + Destreza sem limite; Média: base + Destreza até +2;
Pesada: base, sem Destreza) + Escudo (+2, se aplicável e permitido).
Nunca espalhar `if classe === "Bárbaro"` pelo código — uma função só.

**Contexto:** achado numa auditoria de criação de personagem feita com
apoio do Claude (chat separado), a partir de uma lembrança do Osmar
conferida campo a campo nas 12 classes.

**Data/origem:** 2026-08, durante revisão da auditoria de criação de
personagem — ainda não implementado (motor de CA não existe ainda),
registrado aqui pra já nascer certo quando for construído.

## Planilha mestra — Armas, Armaduras e Proficiências de Classe resolvidas

**Decisão:** o Osmar revisou a planilha mestra por conta própria e
resolveu 3 buracos de dado de uma vez:
1. **Aba "Proficiências de Classe" (nova)** — Classe / Proficiência com
   Armas / Treinamento com Armadura, extraída do Cap. 3 pras 12 classes.
   Importada em `proficienciasArmaArmaduraClasse.ts` — substitui a parte
   de arma/armadura que estava em `classesProficienciasIniciais.ts`
   (exceção transcrita do livro); essa última ficou só com perícias à
   escolha e equipamento inicial, que a planilha ainda não tem.
2. **Armas (38) e Armaduras (13) ganharam coluna "Descrição"** —
   síntese ilustrativa gerada a partir dos próprios campos estruturados
   já existentes (Dano/Propriedades/Maestria pra armas;
   CA/Força mínima/Furtividade pra armaduras), não é extração de texto
   livre do livro. Importadas em `armas.ts`/`armaduras.ts` e ligadas em
   `buscarDescricaoItem.ts` — resolve a pendência antiga de popup de
   descrição faltando pra essas duas categorias (agora as 4 categorias
   de item — Equipamento de Aventura, Montarias/Veículos, Armas,
   Armaduras — têm popup).

**Confirmado ao importar:** o item "Couro Batido" (armadura da Opção B
de equipamento do Guerreiro) estava nomeado "Armadura de Couro Batido"
em `classesProficienciasIniciais.ts` (peguei esse nome do PDF) — a
planilha usa só "Couro Batido" (a categoria "Armadura Leve" já vem
separada, no cabeçalho da seção). Corrigido pra bater com a planilha e
o popup funcionar.

**Data/origem:** 2026-08, planilha revisada pelo Osmar por conta
própria, reimportada no mesmo dia.

## Planilha mestra — duplicidade de conteúdo em características de nível alto

**Achado (não é uma decisão de design, é um problema de dado real):** ao
gerar resumos automáticos de "Descrição Curta", o Osmar descobriu que
~24 células de "Descrição Completa" (Características de Classe e
Subclasses) têm, coladas dentro da mesma célula, o dump inteiro de uma
lista de opções que já existe corretamente em outra aba (Opções de
Classe) — não é texto longo, é dado duplicado por engano na extração
original do PDF pra planilha. Padrão comum: características de
"Conjuração" carregam a lista de magias da classe inteira coladas
dentro; características de nível 14+ carregam listas de
invocações/manobras/formas.

**Nenhuma célula do Guerreiro (classe base, níveis 1-20) tem esse
problema** — já confirmado, `caracteristicasClasse.ts` está limpo. Só
as subclasses dele (Cavaleiro Místico nível 3, Mestre da Batalha nível
18) estão na lista de pendentes, e essas ainda não foram importadas.

**Ação combinada:** resolver célula por célula sob demanda, conforme
cada classe/subclasse for sendo importada de verdade — mesmo ritmo já
usado com Origens primeiro, Classes depois. Nunca importar uma dessas
células "como está".

**Data/origem:** 2026-08, mesma revisão de planilha do Osmar.

## Descrição curta de Espécies usada na lista, mesmo sendo "auto, revisar"

**Decisão:** o card da lista de Espécies (`EspecieStep.tsx`) agora
mostra `introducaoCurta` (coluna "Descrição Curta (auto, revisar)" da
planilha, ~250-350 caracteres) em vez do parágrafo de introdução
completo (~700-900 caracteres). A tela de detalhe/escolhas
(`EspecieEscolhasStep.tsx`) continua mostrando o texto completo
(`introducao`) — a curta é só pra lista, não substitui a completa em
lugar nenhum.

**Contexto:** pedido explícito do Osmar pra usar a versão curta em
Espécies também, mesmo essa coluna sendo gerada automaticamente (corte
na frase mais próxima de ~350 caracteres) e ainda sem revisão manual
linha a linha — mesmo tratamento de "ponto de partida, não fonte de
verdade final" que outras colunas auto/revisar já têm no projeto (ex:
"Tipo de Ação (auto, revisar)"). Se o Osmar revisar essas 10 frases
manualmente depois, é só atualizar o texto na planilha e reimportar —
não muda a estrutura, só o conteúdo do campo.

**Data/origem:** 2026-08, pedido direto do Osmar.

## Ícones de Classe — tamanho de origem e onde ficam no repositório

**Decisão:** a área do ícone nos cards de opção (`.opt-card-img`, usada
em Classe/Origem/Espécie) é **56×56px CSS**. A arte-mestra de cada ícone
é exportada em **512×512px PNG com fundo transparente**, com ~10% de
margem de respiro nas bordas do quadrado (o card corta em
`border-radius`, então arte encostada na borda pode ser cortada). Isso
cobre qualquer densidade de tela (2x/3x) e qualquer tamanho maior que a
gente queira usar no futuro (tablet/desktop) sem precisar redesenhar.

Antes de entrar no repositório, cada PNG de 512px é redimensionado pra
**256×256px** e re-otimizado (ainda bem acima do necessário pro box
atual de 56px, mas ~8x mais leve em disco que o master de 512px) — o
app carrega isso pela rede do celular do Osmar, então tamanho de
arquivo importa mesmo sendo uso pessoal. Arquivos ficam em
`src/assets/icones-classes/{id-da-classe}.png` (nome = id da classe:
`guerreiro.png`, `mago.png` etc). `ClasseStep.tsx` usa
`import.meta.glob` pra montar automaticamente o mapa id→arquivo — não
precisa listar imports um por um nem tocar em código quando uma nova
classe for importada, só adicionar o PNG com o nome certo.

**Contexto:** os 12 ícones de classe (todas, mesmo as 11 ainda "em
breve") vieram prontos do Osmar em 2026-08, então já foram conectados
em todas as classes de uma vez — inclusive nos cards desabilitados —
pra lista de Classe já ficar com a cara final antes mesmo das outras
11 classes serem importadas da planilha.

**Data/origem:** 2026-08, pedido direto do Osmar (upload de
`iconesclasses512.zip`).

## Ícones de Classe — evoluiu pra banner retangular (estandarte), não mais só o losango quadrado

**Decisão:** o emblema em losango quadrado (decisão acima) foi
substituído, classe por classe, por um banner/estandarte retangular
(proporção ~1:2, retrato) conforme o Osmar for entregando a arte de
cada classe. `ClasseStep.tsx` decide sozinho qual formato usar por
classe: se existe um arquivo `{id}-banner.png` em
`src/assets/icones-classes/`, usa ele sem a caixa quadrada, só a
imagem alinhada ao centro vertical do card (classe CSS
`.opt-card-img-banner`, altura fixa 96px, largura livre pela proporção
original); senão cai de volta pro emblema quadrado antigo
(`.opt-card-img`, 56×56px) ou, na ausência de qualquer arquivo, no
placeholder 🖼. Isso permite migrar classe por classe sem quebrar as
que ainda não têm banner.

Master de origem: 887×1774px PNG com alpha, redimensionado pra
256×512px antes de entrar no repositório (mesma lógica de
compressão do emblema quadrado). Guerreiro, Bárbaro, Bardo e Bruxo já
têm banner — o emblema quadrado antigo desses 4 foi **apagado** do
repositório (ficou sem uso, só pesava à toa). As outras 8 classes
continuam com o emblema quadrado até o Osmar mandar o banner de cada
uma.

**Contexto:** o Osmar pediu pra testar o formato banner isolado no
Bárbaro primeiro ("quero ver como fica"), aprovou o resultado, e
decidiu expandir pra todas as classes conforme for reunindo as artes
— não é uma entrega de uma vez só, é incremental.

**Data/origem:** 2026-08, pedido direto do Osmar (upload de
`emblemasclasses512.zip`, depois `barbaro-emblema` avulso pra teste, e
banners de Guerreiro/Bruxo/Bardo em seguida).

**Atualização:** concluído — as 12 classes têm banner agora (Clérigo/
Druida/Feiticeiro e depois Guardião/Ladino/Mago/Monge/Paladino
completaram a lista). Nenhum emblema quadrado sobrou no repositório;
o fallback pro formato quadrado/placeholder em `IconeClasse`
(`ClasseStep.tsx`) continua no código só como rede de segurança caso
algum arquivo de banner seja removido por engano — não é mais
usado na prática.

## `core/` nasce com `personagem.ts` + `calculoPersonagem.ts` + `armazenamentoPersonagens.ts`

**Decisão:** o `WizardSelection` (forma de dado das escolhas do wizard)
e as funções puras de atributo (`modificador`, `modFmt`,
`valorFinalAtributo`) saíram de `ui/wizard/types.ts` e foram pra
`core/personagem.ts` — é dado de personagem, não componente de tela, e
o motor de cálculo precisava importar isso de algum lugar dentro de
`core/`, não de dentro de `ui/`. `core/calculoPersonagem.ts` reúne as
fórmulas (PV máximo nível 1, CA — já resolve pela armadura escolhida no
equipamento inicial, com o parser de texto `"N + modificador de Des
(máx. N)"` da planilha de Armaduras —, Percepção Passiva, Iniciativa,
ouro inicial). `core/armazenamentoPersonagens.ts` é a interface trocável
de armazenamento (`ArmazenamentoPersonagens`) com implementação
`localStorage` por trás — nenhum componente acessa `localStorage`
direto, só essa camada.

**Contexto:** Entrega A1 do plano de 6 entregas pra fechar o fluxo
wizard → Ficha (ver PENDENCIAS.md). Testado de ponta a ponta: um
Guerreiro completo criado no wizard salva de verdade e aparece na Lista
de Personagens com PV/CA/Percepção Passiva calculados, não mais
fixture.

**Pendência conhecida:** a exceção de CA de Bárbaro/Monge (ver decisão
"Cálculo de CA" acima) ainda não tem entrada no motor — nenhuma das
duas classes está importada ainda. A função foi estruturada pra receber
esse lookup por `classeId` quando chegar a vez, sem espalhar `if
classe === "Bárbaro"` pelo código, como já estava recomendado.

## Ficha lê o personagem real via componente filho, não via early return antes dos hooks

**Decisão:** `FichaShell.tsx` virou dois componentes: o de fora
(`FichaShell`) só busca o personagem pelo `:id` da rota e decide entre
mostrar "personagem não encontrado" ou renderizar
`FichaConteudo`, que recebe o `PersonagemSalvo` já garantido (não-nulo)
como prop e só aí chama `useState`/`useRef`.

**Contexto:** colocar o `if (!personagemSalvo) return (...)` **antes**
dos hooks dentro do mesmo componente quebra a Regra dos Hooks do React
(hooks precisam rodar sempre na mesma ordem, sem pular condicionalmente)
— daria bug sutil de estado bagunçado ao trocar de personagem, não um
erro óbvio na hora. Separar em dois componentes resolve isso de forma
limpa, sem precisar de valores placeholder feios só pra "hooks
rodarem mesmo assim".

## Aba Perfil da Ficha lê atributos/PV/CA/Perícias reais desde a Entrega A3

**Decisão:** `PerfilTab.tsx` não importa mais fixture nenhum — recebe
`atributos`, `pericias`, `ca`, `iniciativa`, `percepcaoPassiva` como
props, calculados por `core/calculoPersonagem.ts` a partir do
personagem salvo. Perícias mostradas são a união de Origem (fixas) +
Classe (escolhidas no wizard), cada uma já com o Bônus de Proficiência
somado — usa a aba "Perícias" da planilha (`pericias.ts`) pra saber o
atributo de cada perícia (nome completo do atributo → sigla, mapeado
localmente em `calculoPersonagem.ts`).

**Contexto:** Entrega A3 do plano de 6 entregas (wizard → Ficha). O
parágrafo fixo sobre a regra especial de Descanso Curto do Bruxo (Magia
de Pacto) foi removido do Perfil — não fazia sentido aparecer pra um
Guerreiro. Mochila/Magias/Combat ainda não foram conectadas (A4/A6).

**Data/origem:** 2026-08, testado de ponta a ponta com um Guerreiro
real (Pequenino, PV 12, CA 13, Percepção Passiva 12, perícias com
atributo e bônus corretos).

## Todo número calculado tem um "ⓘ" explicando a conta

**Decisão:** qualquer valor gerado pelo motor de cálculo (PV máximo, CA,
Percepção Passiva, Iniciativa, Ouro inicial, cada Perícia) mostra um
"ⓘ" tocável logo ao lado — abre um popup com a conta em formato de
**tabela** (efeito à esquerda, valor à direita, alinhado em colunas
invisíveis; a última linha é o total, separada por uma linha divisória
e destacada). Aplicado tanto na tela "7. Resumo" do wizard quanto na
aba Perfil da Ficha — os mesmos números aparecem nos dois lugares.
Texto tipo "no nível 1 nunca rola nem tira média" foi tirado — é
contexto de regra, não parte da conta em si, e poluía o popup.

**Componente novo:** `ui/components/InfoValor.tsx` — mesmo padrão
visual de popup de `InfoChip`/`ItemComDescricao` (overlay + card
central), mas o gatilho é só o ícone "ⓘ" solto, não um chip nem texto
sublinhado. `core/calculoPersonagem.ts` ganhou o tipo
`ExplicacaoCalculo` (`{ linhas: {label, valor}[], total: {label,
valor} }`) e uma função `explicar*` pra cada `calcular*` que devolve
isso já estruturado — nunca uma string solta, exatamente pra caber na
tabela sem parsing.

**Bug corrigido (clique vazava pra linha de baixo):** o popup do
`InfoValor` é renderizado *dentro* da linha clicável que mostra o
número (ex: linha de Perícia que rola dado ao toque). Mesmo com
`position: fixed` cobrindo a tela toda visualmente, no DOM o overlay
continua sendo filho dessa linha — então, sem `stopPropagation`, tocar
pra fechar o popup borbulhava pro `onClick` da linha por baixo e
disparava uma rolagem de dado sem querer. Corrigido com
`e.stopPropagation()` em todo clique dentro do overlay (fechar tocando
fora do card, e no botão "fechar"), não só no ícone que abre. Vale
como lição geral: **qualquer popup `position: fixed` renderizado
dentro de um elemento clicável precisa desse cuidado**, não só o
`InfoValor` — `InfoChip`/`ItemComDescricao` têm o mesmo risco latente
se algum dia forem usados dentro de uma linha com `onClick` (hoje não
são, por isso não deu bug neles ainda).

**Contexto:** pedido direto do Osmar — "olhando só o número, eu não sei
dizer se está certo ou não", mais 2 bugs reportados no formato de texto
livre (nível 1 sem sentido, clique vazando pra rolar dado sem querer
na Ficha). Motivo real do pedido original: ele não programa, não pode
abrir o código pra conferir a fórmula, e cada número novo que aparece
precisa de alguma forma de verificação **na tela**, não só confiar que
"deve estar certo" (regra 1 do `CLAUDE.md`).

**Data/origem:** 2026-08, pedido direto do Osmar (texto livre + versão
com tabela).

## Mochila real (Entrega A4) — peso desconhecido vira aviso, nunca 0 silencioso

**Decisão:** `core/mochila.ts` junta os itens de Origem (só quando a
opção A — com itens — foi escolhida; opção B é só ouro) + Classe
escolhidos no wizard, cada um com peso buscado num índice novo
(`buscarPesoItem`, em `buscarDescricaoItem.ts`) que cobre Armas,
Armaduras, Equipamento de Aventura e Ferramentas (grupos de escolha).
Quando um item não tem peso cadastrado na planilha pra aquele nome
exato (ex: "Flecha" avulsa, "Roupas de Viagem"), a Mochila **não
finge que pesa 0 kg** — mostra "sem peso cadastrado" na linha do item e
soma quantos itens ficaram de fora do total de carga, num aviso visível
("N itens não entram nessa soma"). Carga MÁXIMA (só o peso carregado,
sem o "/Y kg" de capacidade) não é mostrada — depende da fórmula Força
× multiplicador, que é lacuna de dado conhecida (`CLAUDE.md` seção 8).

**Placeholder de ferramenta de grupo:** quando a origem tem `ferramenta.
categoria === 'escolha'` (Instrumento Musical, Kit de Jogos, Ferramentas
de Artesão), o item genérico com o nome do grupo dentro de
`equipamentoOpcaoA.itens` (ex: `"Instrumento Musical"`) é substituído
pelo nome real que o jogador escolheu no wizard
(`ferramentaOrigemEscolhida`) antes de entrar na Mochila e de buscar o
peso — senão a busca de peso falharia (o grupo não é um item com peso
próprio, cada variante é).

**Contexto:** Entrega A4 do plano de 6 entregas (wizard → Ficha). Regra
geral do projeto (nunca inventar dado que a planilha não tem) aplicada
também dentro do motor de cálculo, não só na importação — melhor um
aviso honesto de "não sei o peso disso" do que uma carga total errada
sem avisar.

**Data/origem:** 2026-08, testado de ponta a ponta com um Guerreiro
real (itens de Origem + Classe juntos, 70,5 kg somados, 1 item sem
peso avisado corretamente).

## Peso por linha da Mochila mostra o total (unitário × quantidade), não só o unitário

**Decisão:** cada linha de item na Mochila mostra `pesoDaLinha()` —
peso unitário × quantidade já multiplicado (ex: "8× Azagaia" a 1 kg
cada mostra "8 kg" na linha, não "1 kg"). O total de Carga no topo
sempre bateu certo (já somava multiplicado desde a A4), mas mostrar só
o peso unitário por linha parecia "não calcular nada" pra quem está
olhando de fora sem saber que o total de cima já soma direito.

**Contexto:** Osmar reportou "não está calculando o peso" depois da
Entrega A4. Investigação: o cálculo em si estava certo (testado e
confirmado), o problema era só a exibição por linha não deixar isso
óbvio.

**Data/origem:** 2026-08, feedback direto do Osmar.

## Avatar no canto superior direito da Ficha abre menu de preferências (1ª entrada: Mochila detalhada)

**Decisão:** novo componente `ui/ficha/AvatarMenu.tsx` — ícone 👤 no
canto superior direito do cabeçalho da Ficha (`FichaShell.tsx`), toque
abre um dropdown M3 (card flutuante, backdrop transparente pra fechar
tocando fora) com uma switch "Itens detalhados". Ligado: cada item da
Mochila mostra a descrição (quando existe) direto abaixo do nome,
sempre visível, sem precisar tocar em nada. Desligado (padrão): volta
pro "ⓘ" ao lado do nome, tocando abre popup — mesmo padrão dos outros
popups do app.

**Componente estendido, não duplicado:** `ItemComDescricao.tsx` ganhou
uma prop `variante?: 'sublinhado' | 'icone'` — a variante `'icone'`
deixa o nome do item como texto normal (sem sublinhado) e acrescenta um
"ⓘ" separado ao lado, porque sublinhar o nome do item na Mochila
mudaria a aparência da lista sem necessidade (a variante padrão
`'sublinhado'`, usada no wizard, continua igual). Zero componente de
popup novo — reaproveita a mesma implementação, só muda o gatilho
visual.

**Bug latente corrigido de passagem:** `InfoChip.tsx` e
`ItemComDescricao.tsx` tinham o mesmo problema de clique vazando já
documentado e corrigido no `InfoValor.tsx` (overlay `position: fixed`
renderizado dentro de um elemento clicável, sem `stopPropagation` no
clique de fechar) — não tinha sido reportado ainda nesses dois porque
nenhum uso deles até agora estava dentro de uma linha com `onClick`
próprio, mas a Mochila mudou isso (linha de item ganhou o ícone). Os
três componentes agora seguem o mesmo cuidado.

**Menu pensado pra crescer:** o menu já nasce como "Preferências" (não
"Mochila") — outras preferências de exibição futuras entram na mesma
lista, sem precisar de outro ponto de entrada na tela.

**Pendência conhecida:** a preferência não persiste entre sessões
(reseta pro padrão "desligado" ao recarregar a página) — fica como
estado local do componente por ora, registrado em `PENDENCIAS.md` caso
o Osmar queira que isso seja lembrado de verdade depois.

**Data/origem:** 2026-08, pedido direto do Osmar.

## Kits de Equipamento de Aventura desagregam nos itens de dentro, na Mochila

**Decisão:** itens do tipo "Kit de X" (ex: "Kit de Explorador de
Masmorras") não aparecem como 1 linha na Mochila — a `core/mochila.ts`
já desagrega no momento de montar a lista, cada componente virando o
próprio item real (Caixa para Fogo, Cantil, Corda, 10× Tocha, etc.),
cada um com seu peso e descrição próprios. O jogador consome cada
componente separado durante o jogo (a Tocha acaba, a Rações se come um
dia de cada vez) — faz sentido pra Mochila já entregar isso "pronto pra
jogar", não como uma caixa fechada.

**Como foi feito:** tabela `DESAGREGACAO_KITS` em `core/mochila.ts`,
verificada à mão contra a aba **"Kits — Conteúdo"** da planilha mestra
(lista oficial por kit, coluna "Itens Incluídos" — mais confiável que
o texto livre "Contém:" que aparecia solto em outras abas), e contra o
nome exato de cada item em `equipamentoAventura.ts` (alguns nomes não
batem, ex: a lista da planilha diz "Cantil", mas o item de verdade se
chama "Cantil (cheio)"; "Fantasias"/"Roupas Finas" viram "Roupas,
Fantasia"/"Roupas, Finas").

Todos os **7 kits que têm lista de itens** na aba "Kits — Conteúdo"
estão desagregados: Explorador de Masmorras, Artista, Assaltante,
Aventureiro, Diplomata, Erudito, Sacerdote. Kit de Curandeiro e Kit de
Escalada NÃO se desagregam — confirmado pela mesma aba, que não lista
itens pra eles (são item único de uso próprio: 10 usos, ou uma
ferramenta de escalada, não um saco de itens soltos).

**Data/origem:** 2026-08, pedido direto do Osmar. Atualizado 2026-08,
os 6 kits restantes desagregados após localizar a aba "Kits — Conteúdo"
na planilha mestra (achado de uma auditoria em chat separado com apoio
do Claude, verificado direto na planilha antes de confiar).

## Ficha não distingue mais "editável sem XP" vs "travada com XP"

**Decisão:** removido o banner "🔒 Ficha com XP — edição travada" /
"✏️ Edição livre" e o botão "simular +XP" (`xpBloqueado` em todo lugar:
`FichaShell.tsx`, `PerfilTab.tsx`). A regra simplificou: depois que o
jogador salva a ficha, nada é editável livremente — não existe mais
uma janela de "rascunho pré-XP" com edição solta. Não há hoje nenhum
campo de texto/número editável de verdade na Ficha (tudo é calculado a
partir da seleção do wizard), então essa remoção foi só limpar um aviso
que já não correspondia à regra real do produto.

**Contexto:** pedido direto do Osmar, simplificando uma regra que
tinha ficado mais complicada do que precisava no protótipo inicial
(Fase 0, antes do wizard/Ficha estarem ligados de verdade).

**Data/origem:** 2026-08, pedido direto do Osmar.

## Apagar personagem — confirmação por texto digitado, não só um "tem certeza?"

**Decisão:** cada card na Lista de Personagens ganhou um ícone de
lixeira (🗑️, cor `--danger` — nova cor semântica no design system,
`#b3261e`, junto de `--danger-dim` pro estado `:active`). Tocando nele
abre um popup pedindo pra digitar a palavra "apagar" — o botão
"Apagar" só destrava (`btn-disabled` sai) quando o texto bate
exatamente (case-insensitive). `armazenamentoPersonagens` ganhou
`apagar(id)`.

**Contexto:** apagar personagem é uma ação destrutiva e permanente
(armazenamento local, sem lixeira/desfazer) — um simples "tem certeza?
sim/não" é fácil de confirmar sem querer no automático. Digitar a
palavra dá o peso de "isso é sério" sem precisar de um sistema de
autenticação ou de um segundo passo complexo.

**Data/origem:** 2026-08, pedido direto do Osmar.

## Capacidade máxima de carga — confirmada na planilha, Força × 7 kg (Pequeno/Médio)

**Decisão:** a lacuna de dado "fórmula exata de capacidade de carga"
(`CLAUDE.md` seção 8) foi resolvida em duas etapas. Primeiro, usei a
regra oficial de memória (Força × 15 libras → Força × 7,5 kg na
conversão do projeto) com aprovação do Osmar, sem esperar a planilha —
mas depois localizei a fórmula de verdade na própria planilha mestra,
aba **"Glossário de Regras"**, termo "Capacidade de Carga", que tem a
tabela completa oficial (Livro do Jogador D&D 5e 2024):

| Tamanho | Carregar | Arrastar/Empurrar/Levantar |
|---|---|---|
| Minúsculo | For × 3,5 kg | For × 7 kg |
| Pequeno/Médio | For × 7 kg | For × 13,5 kg |
| Grande | For × 13,5 kg | For × 27 kg |
| Enorme | For × 27 kg | For × 54,5 kg |
| Colossal | For × 54,5 kg | For × 109 kg |

O multiplicador varia por **Tamanho da criatura**, não só Força — meu
valor de memória (×7,5) estava errado (era ×7 pra Pequeno/Médio).
Corrigido em `core/mochila.ts`
(`KG_POR_PONTO_DE_FORCA_PEQUENO_MEDIO = 7`).

**Por que não lê o Tamanho de verdade (ainda):** toda espécie jogável
hoje (`data/rulesets/dnd2024/especies.ts`) é Pequeno ou Médio, e as
duas linhas da tabela têm o mesmo multiplicador — então o código não
precisa ler o campo Tamanho da espécie pra dar a resposta certa. Só
vai precisar se uma espécie Grande for suportada, ou pelo traço "Porte
Poderoso" (Golias — conta um tamanho a mais pra capacidade de carga,
visto na aba Espécies mas ainda não implementado, é uma exceção de
personagem específico, não a regra geral). Registrado como pendência
menor, não trava nada hoje.

**Contexto:** o valor ×7,5 tinha sido aprovado pelo Osmar como "fórmula
que eu já sei de cor" antes de eu checar a planilha — corrigido depois
de localizar o Glossário oficial numa auditoria em chat separado
(achado trazido pelo Osmar), sempre reconferido direto na planilha
antes de confiar, nunca só copiado do chat paralelo.

**Data/origem:** 2026-08, pedido direto do Osmar (primeira versão) e
correção 2026-08 após checar a planilha.

## Mochila ganha 2º toggle no menu do avatar — "Peso da Mochila" (barra de progresso)

**Decisão:** `AvatarMenu.tsx` ganhou uma segunda switch, "Peso da
Mochila", generalizando a estrutura do menu pra uma lista de
`preferencias` (era código duplicado pra 1 switch só, virou `.map()`).
Ligado (padrão): mostra a caixa "Carga" com barra de progresso M3
(verde até a capacidade máxima, vira `--danger` se ultrapassar) e o
peso em cada linha de item. Desligado: some a caixa "Carga" inteira
**e** a coluna de peso de cada item — não é só esconder o total, o
Osmar pediu explicitamente que os dois desaparecessem juntos.

**Contexto:** parte do mesmo pedido da fórmula de capacidade máxima —
"mesmo toggle dos itens detalhados, fazer um pra peso de mochila".

**Data/origem:** 2026-08, pedido direto do Osmar.

## Loja (Entrega A5) — catálogo real agrupado por categoria, com estepper e Mod. de Ataque

**Decisão:** a Loja do wizard trocou o catálogo fixo (4 itens de
exemplo, "85 PO" fixo) por um catálogo real construído em
`core/loja.ts` (`construirCatalogoLoja`), organizado nas mesmas
categorias que o Osmar já tinha desenhado num protótipo anterior
(prints trazidos por ele): Armas Simples/Marciais × Corpo a
Corpo/À Distância, Armadura Leve/Média/Pesada, Escudos, Ferramentas,
Instrumentos Musicais, Focos e Símbolos, Munição, Equipamento de
Aventura — cada categoria em um acordeão colapsável (fechado por
padrão), cada item com o layout de campos que faz sentido pra ele
(arma mostra Dano/Propriedades/Mod. de Ataque; armadura mostra
CA/Furtividade; ferramenta mostra Atributo; equipamento geral mostra
Efeito).

**Comprar/vender com estepper:** cada item tem um controle "− qtd +"
— não é mais só "clicar pra adicionar". O carrinho
(`WizardSelection.itens`) mudou de `string[]` (empurrava um nome por
clique, sem jeito de tirar) pra `ItemCarrinho[]` (`{nome, quantidade}`),
suportando aumentar/diminuir livremente. Botão "+" desabilita quando
o ouro restante não cobre mais uma unidade.

**Ouro em tempo real:** "restante" = `calcularOuroInicial(selection)`
menos o custo de tudo no carrinho, recalculado a cada render — corrige
o bug relatado pelo Osmar no protótipo antigo ("a build atual não está
subtraindo o dinheiro"). Moeda: planilha não tem tabela de conversão
(checado no Glossário de Regras) — usa a regra padrão oficial
confirmada com o Osmar: 1 PO = 10 PP = 100 PC (`parseCustoPO` em
`core/loja.ts`).

**Mod. de Ataque por arma:** calculado de verdade (`calcularModAtaque`)
— usa o maior entre mod. de Força/Destreza se a arma tiver a
propriedade Acuidade, senão Destreza pra armas À Distância e Força pra
Corpo a Corpo sem Acuidade; soma +2 de bônus de proficiência (nível 1)
se a classe do personagem for proficiente na categoria (Simples/
Marcial), usando `proficienciasArmaArmaduraClasse.ts` (dado real da
planilha, já existia). O texto "(sem proficiência)" aparece quando não
é. O checkbox "Filtrar por proficiência" usa a mesma fonte pra esconder
armas/armaduras que a classe não é treinada a usar.

**Duas coisas do protótipo antigo ficaram de fora por decisão
explícita do Osmar** (ver PENDENCIAS.md): o desconto de Talento
Artifista (20%) e o corte de itens acima de 205 PO.

**Lacunas de dado fechadas pra viabilizar isso:**
- `equipamentoAventura.ts` ganhou o campo `categoria`, reconstruído a
  partir dos cabeçalhos de seção da planilha ("— Equipamento Geral —",
  "— Foco Arcano —", "— Foco Druídico —", "— Munição —", "— Símbolo
  Sagrado —") que tinham sido descartados na importação original.
  Nenhum dado foi inventado — os cabeçalhos estavam na planilha o tempo
  todo, só não tinham sido capturados.
- `ferramentas.ts` ganhou preço/peso reais pra 5 itens "avulsos" que só
  tinham descrição antes (Ferramentas de Ladrão, Kit de Disfarce, Kit
  de Falsificação, Kit de Herbalismo, Kit de Veneno) — a planilha
  sempre teve essas colunas preenchidas pra eles, só não tinham sido
  importadas porque na época só serviam pro InfoChip da tela de
  Línguas/Origem, não pra uma loja. Também ganhou o campo `atributo`
  (Força/Destreza/etc.) em toda ferramenta, pro card "Atributo: X".
  Itens genéricos "Varia" (ex: placeholder "Foco Arcano" que aponta pra
  Cajado/Cetro/Cristal/Orbe/Varinha) não entram no catálogo vendável —
  só as variantes concretas com preço próprio entram.

**Contexto:** o Osmar mostrou prints de uma versão anterior da Loja
(protótipo HTML separado) como referência de organização — a mesma
sessão que trouxe a correção da capacidade de carga (achados de uma
auditoria em chat separado). Antes de implementar, respondi com análise
de viabilidade + perguntas (regra 6 do CLAUDE.md) sobre os 2 recursos
fora do MVP e sobre sequenciar em partes — o Osmar escolheu fazer tudo
de uma vez, sem os 2 recursos extras.

**Data/origem:** 2026-08, pedido direto do Osmar.

## Bug estrutural corrigido: `#root` usava `min-height`, deveria ser `height`

**Decisão:** `#root` (em `index.css`) trocou `min-height: 100vh/100dvh`
por `height: 100vh/100dvh`. Antes disso, a página inteira crescia junto
com o conteúdo e quem rolava era o documento/janela — os containers
internos com `overflow-y: auto` (`.body` do `WizardShell`/`FichaShell`/
`LevelUpShell`, todos já desenhados assumindo que rolariam por conta
própria) nunca chegavam a ficar menores que o próprio conteúdo, então
o `overflow-y: auto` deles nunca entrava em ação de verdade — sem
efeito prático, mas também sem quebrar nada, porque não havia nada que
dependesse disso rolar "por dentro" em vez de rolar a página toda.

**Por que isso importa agora:** o cabeçalho flutuante de ouro/peso da
Loja (pedido do Osmar) usa `position: sticky`, que só funciona de
verdade quando o elemento tem um container-pai que realmente rola
(`overflow-y: auto` com altura finita) — com a página inteira rolando
em vez do `.body`, o sticky não tinha "onde" grudar e sumia da tela ao
rolar. A correção faz `.body` (e equivalentes) virarem o scroll de
verdade, do jeito que a estrutura já tinha sido desenhada pra
funcionar.

**Verificado que não quebra nada:** telas sem scroll interno próprio
(Home, Lista de Personagens) continuam rolando pela página normalmente
— `#root` não ganhou `overflow: hidden`, só um `height` fixo, então
conteúdo que ultrapassar a tela nessas telas ainda tem como aparecer
via rolagem do documento, igual antes. Testado nas 5 telas principais
(Home, Lista, Loja com scroll, Ficha Perfil/Mochila/Combat) sem
regressão visual.

**Data/origem:** 2026-08, achado ao implementar o cabeçalho flutuante
da Loja (pedido do Osmar).

## Loja — segunda rodada de ajustes (destaque, resumo ao colapsar, peso, cabeçalho flutuante)

**Decisão:** depois do Osmar testar a primeira versão da Loja (Entrega
A5) contra os prints do protótipo antigo, vieram os seguintes ajustes:
- **Item comprado fica destacado** — `ItemCard` ganha a classe
  `itemCardComprado` (borda + fundo `--accent-dim`) quando a
  quantidade no carrinho é maior que 0, pra identificar mais fácil sem
  precisar ler o número.
- **Resumo do grupo colapsado** — quando uma categoria está fechada e
  tem item comprado dentro, aparece uma caixa "Comprado" logo abaixo
  do cabeçalho da categoria, listando nome×quantidade e preço — não
  precisa abrir a categoria de novo só pra lembrar o que já comprou
  ali.
- **Peso de cada item** — linha "Peso" adicionada no card (fonte:
  mesmo campo já usado no resto do app, `item.peso`).
- **Bug de "EFEITO" duplicado corrigido** — ferramentas/instrumentos
  tinham DOIS rótulos "Efeito" (um pro atributo, outro pra descrição
  longa), e a descrição longa espremida numa coluna estreita à direita
  quebrava linha em lugar feio (ex: "(CD" numa linha, "10)" sozinho na
  próxima). Corrigido: "Atributo: X" vira uma linha de estatística
  compacta rotulada "Atributo" (sem duplicar "Efeito"), e a descrição
  longa vira um parágrafo de largura cheia abaixo dos outros campos
  (`itemEfeitoTexto`) — quebra de linha natural, sem precisar espremer.
- **Cabeçalho flutuante (ouro + peso)** — a caixa "ouro inicial /
  restante" agora usa `position: sticky` (ver correção do bug de
  `#root` acima) pra ficar sempre visível ao rolar a lista de itens,
  igual ao protótipo antigo do Osmar. Ganhou uma barra de peso
  carregado (Origem + Classe + carrinho da Loja, via
  `calcularItensIniciais`/`calcularCargaTotal`/`calcularCapacidadeMaxima`
  já existentes em `core/mochila.ts` — reaproveitado, não duplicado)
  com degradê de cor por faixa de percentual: azul até 25%, verde até
  50%, amarelo até 75%, laranja até 90%, vermelho acima disso —
  terminando com um ícone 🎒, como pedido.

**Contexto:** o Osmar mandou 4 prints do protótipo antigo comentando o
que queria replicar/ajustar depois de testar a primeira versão da Loja
no celular.

**Pendência aberta (não é uma decisão, é uma dúvida pro Osmar):** ele
apontou que "quem tem Desvantagem em Furtividade é a Couro Batido", mas
a planilha mestra (aba Armaduras) diz o contrário — é a **Acolchoada**
que tem Desvantagem, e Couro/Couro Batido não têm nenhuma. Como
`CLAUDE.md` seção 3 manda usar só a planilha como fonte de regra, não
mudei o dado — reportado pro Osmar decidir se é erro da planilha (pra
ele corrigir lá) ou se o print antigo é que estava errado.

**Data/origem:** 2026-08, pedido direto do Osmar.

## Loja — terceira rodada: "Você já está levando" (Origem/Classe) e grupo Kits com popup

**Decisão:** dois ajustes pedidos depois do Osmar notar que a barra de
peso do topo já não começava vazia (Origem+Classe já concedem itens
antes de qualquer compra) sem explicar o porquê:
- **"Você já está levando"** — duas caixas em acordeão, "Equipado
  (Origem)" e "Equipado (Classe)", logo abaixo do checkbox de filtro e
  antes de "Itens à venda". Reaproveita `calcularItensIniciais(selection)`
  (já filtra por `origemDoItem`) — mesma fonte de dado que já monta a
  barra de peso do topo e a Mochila da Ficha, nada duplicado. Cada
  caixa só aparece se tiver item (some sozinha se a Origem/Classe
  escolheu "só ouro"). Itens com descrição na planilha ficam
  sublinhados e clicáveis (mesmo componente `ItemComDescricao` já
  usado na Mochila).
- **Grupo "Kits"** — itens cujo nome começa com "Kit de " (Kit de
  Artista, Assaltante, Aventureiro, Curandeiro, Diplomata, Erudito,
  Escalada, Explorador de Masmorras, Sacerdote — 9 no total) saem do
  grupo genérico "Equipamento de Aventura" e ganham categoria própria
  na Loja, já que são um tipo de item bem diferente (um "combo" de
  vários itens dentro, não um item avulso).
- ~~Nome do item ficou clicável em toda a Loja~~ — **corrigido logo em
  seguida**: o Osmar avisou que passou a informação errada. O
  sublinhado+popup (`ItemComDescricao`) é só pro grupo **Kits** (ex:
  "Kit de Aventureiro") — em todo o resto (Armas, Armaduras, Escudos,
  Ferramentas, Instrumentos Musicais, Focos e Símbolos, Munição,
  Equipamento de Aventura), o nome volta a ser texto simples e a
  descrição volta a aparecer direto no card (`itemEfeitoTexto`), do
  jeito que já estava antes desta rodada. `ItemCard` decide isso
  checando `item.grupo === 'kits'`.

**Contexto:** 2 prints do protótipo antigo mostrando a ideia + pedido
direto no chat; correção de escopo do próprio Osmar na mensagem
seguinte.

**Data/origem:** 2026-08, pedido direto do Osmar.

## Passagem de design geral: apertando o espaço em branco (escala de espaçamento + seta duplicada)

**Decisão:** o Osmar achou que o app estava com margem/espaçamento
grande demais no geral (screenshot da Loja como exemplo), fazendo o
fluxo "parecer mil vezes maior" do que precisava. Dois ajustes, os
dois valendo pra tudo (não só uma tela):
- **Escala de espaçamento (`--space-4/5/6` no `index.css`)** apertada:
  16→12px / 20→16px / 24→20px. `--space-1/2/3` (4/8/12px) ficaram como
  estavam — já eram os valores mais finos, o excesso estava nos
  maiores (padding de tela inteira, cabeçalho, cards). Como a maioria
  dos componentes já usa os tokens em vez de pixel fixo, essa mudança
  sozinha aperta a tela inteira (Home, Lista, Loja, Ficha etc.) sem
  precisar editar arquivo por arquivo.
- **Seta de voltar duplicada removida** — `WizardShell` e
  `LevelUpShell` tinham `←` no cabeçalho **e** o pill "← Voltar" no
  rodapé fazendo a mesma coisa. Removida a seta do cabeçalho nos dois,
  mantido só o pill (mesmo padrão do "Avançar →" ao lado). `FichaShell`
  e `CharacterList` não tinham essa duplicação (não têm pill de Voltar
  no rodapé) — não mexidos.
- **Cabeçalhos das 3 "shells" (Wizard/Ficha/LevelUp)** ganharam padding
  mais apertado além do que a escala de tokens já dava sozinha
  (`var(--space-3) var(--space-4) var(--space-2)` no lugar de
  `var(--space-4) var(--space-5) var(--space-3)`), e o corpo rolável
  (`.body`/`.tabContent`) foi de `var(--space-4) var(--space-5)` pra
  `var(--space-3) var(--space-4)`.

**Detalhe técnico que quase quebrou:** o cabeçalho flutuante da Loja
(`.ouroBox`, `position: sticky`) usa um truque de margem negativa pra
cobrir de ponta a ponta por cima do padding do `.body` — o valor da
margem negativa precisa bater exatamente com o padding real do
`.body`. Como o padding do `.body` mudou nesta entrega, a margem
negativa do `.ouroBox` teve que ser atualizada junto (senão sobrava
uma faixa sem cobrir nas bordas). Deixei um comentário no CSS
avisando que os dois precisam mudar juntos se algum dos dois for
mexido de novo.

**Não mexido:** `--touch-target-min` (48px) ficou intocado — a
economia de espaço é só em margem/padding visual, nenhuma área de
toque encolheu.

**Contexto:** pedido direto do Osmar depois de ver a Loja no celular;
confirmado "faz pra tudo" quando perguntei se era só o wizard ou o
app inteiro.

**Data/origem:** 2026-08, pedido direto do Osmar.

## Bug corrigido: peso em gramas não contava na carga total

**Decisão:** `parseKg` (`core/mochila.ts`) só reconhecia peso no
formato "N kg" — itens com peso cadastrado em gramas na planilha (ex:
"Espelho" = 250 g) caíam silenciosamente em "sem peso cadastrado" e
não entravam na soma da carga, mesmo tendo peso de verdade. Corrigido:
`parseKg` agora reconhece "N g" também, convertendo pra kg (÷1000).
Afeta 6 itens no catálogo hoje: Espelho, Poção de Cura, Saca (250 g
cada), Dardo (150 g), Balas de Funda e Virotes (750 g cada) — todos
tinham peso "perdido" antes desse fix.

**Contexto:** o Osmar notou que o Espelho (250 g) não somava na barra
de peso da Loja/Mochila.

**Data/origem:** 2026-08, achado direto pelo Osmar.

## Faixas de cor da barra de Carga unificadas (Loja + Mochila da Ficha)

**Decisão:** nova função única `corDaCarga` (`ui/utils/corCarga.ts`),
usada pelas duas barras de peso do app (`LojaStep` e `MochilaTab`, que
antes tinham cada uma sua própria lógica de cor — a da Loja com
degradê de 5 cores incluindo azul, a da Mochila só verde/vermelho
binário). Faixas novas, pedidas pelo Osmar:
- até 75% — verde
- até 85% — amarelo
- até 95% — laranja
- até 100% — vermelho
- acima de 100% — vermelho escuro (bem mais escuro que o vermelho
  normal, pra "estourou o limite" ficar visualmente óbvio)

**Detalhe técnico:** o percentual usado pra decidir a COR não é mais
limitado a 100 (precisa saber se passou de 100 pra escolher vermelho
escuro) — só a LARGURA da barra continua limitada a 100% (`Math.min`),
senão a barra vazaria pra fora da caixa visualmente.

**Contexto:** pedido direto do Osmar, com as faixas exatas já definidas
por ele.

**Data/origem:** 2026-08, pedido direto do Osmar.

## Perícias de Classe, itens de Equipamento de Classe e Estilo de Luta conectados na Ficha final

**Decisão:** fechando a pendência "Estilo de Luta escolhido ainda não
aparece na Ficha/Combat" registrada depois da Entrega A4. Ao revisar
pra resolver, descobri que **2 dos 3 pontos já estavam conectados**
desde entregas anteriores, só não tinham sido riscados da lista:
- **Perícias de Classe** (`periciasClasseEscolhidas`) — já eram somadas
  com as de Origem em `calcularPericias` (`core/calculoPersonagem.ts`)
  desde a Entrega A1/A3, e a aba Perfil da Ficha já lê isso direto
  (`pericias = calcularPericias(selecao, personagem.nivel)` em
  `FichaShell.tsx`). Nada pra fazer aqui.
- **Itens de Equipamento de Classe** (`equipamentoClasseEscolhido`) —
  já entravam na Mochila desde a Entrega A4
  (`calcularItensIniciais` em `core/mochila.ts` já junta Origem +
  Classe + Loja). Nada pra fazer aqui.
- **Estilo de Luta** (`estiloDeLutaEscolhido`) — esse sim estava
  faltando de verdade. Adicionado: `FichaShell.tsx` procura o
  `EstiloDeLuta` escolhido em `estilosDeLuta.ts` pelo nome e passa pra
  `CombatTab`, que mostra um `InfoChip` (nome + benefício mecânico
  real, ex: "Defensivo — +1 CA enquanto usa armadura Leve, Média ou
  Pesada") logo abaixo do aviso de protótipo dos PV, antes do painel
  Ação/Ação Bônus/Reação.

**Contexto:** pedido do Osmar pra fechar essa pendência de vez ("pra
não sobrar pendências").

**Data/origem:** 2026-08, pedido direto do Osmar.

## Guerreiro — plano de implementação completa nível 1-20 + 4 subclasses

**Decisão:** em vez de continuar entregando pedaços soltos do Guerreiro
(A6 só cobria Estilo de Luta/Magias), o Osmar pediu uma decupagem
nível a nível completa (1-20, incluindo as 4 subclasses: Campeão,
Cavaleiro Místico, Combatente Psíquico, Mestre da Batalha), feita numa
auditoria em chat separado, pra implementar de ponta a ponta. Achados
verificados direto no PDF do Cap. 3 (`04b__Cap_3_..._Guardiao_a_Paladino.pdf`,
já autorizado antes — mesma exceção documentada de
`classesProficienciasIniciais.ts`) antes de aceitar, não copiado às
cegas:

- **Estilo de Luta é escolha trocável a cada level-up, não fixa desde
  o nível 1** — confirmado no texto oficial: "Sempre que atinge um
  nível de Guerreiro, você pode substituir o talento que escolheu por
  um talento diferente de Estilo de Luta." No nível 7, subclasse
  Campeão ganha um **2º** Estilo de Luta simultâneo (não troca, some
  aos dois). Isso é uma categoria de escolha de level-up nova, além de
  Subclasse (fixa, nível 3) e ASI/Talento — precisa reaparecer em
  **todo** level-up de Guerreiro (e provavelmente Guardião/Paladino,
  que também têm essa característica — texto de troca dessas duas
  ainda não conferido).
- **Maestria em Arma troca por Descanso Longo, não por Level Up** —
  confirmado: "Sempre que completar um Descanso Longo, você pode
  praticar movimentos com armas e alterar uma dessas escolhas de
  armas." Mecanismo de troca diferente do Estilo de Luta — deveria
  aparecer como opção no botão de Descanso Longo (aba Perfil), não no
  fluxo de Level Up.
- **Guerreiro tem ASI em 6 níveis (4, 6, 8, 12, 14, 16), não 5** —
  confirmado na tabela "Características de Guerreiro" do livro. A
  regra geral assumida antes (4/8/12/16/19) vale pra maioria das
  classes, mas não pra Guerreiro — o motor de Level Up precisa de uma
  tabela de níveis-de-ASI **por classe**, não uma constante global.
- **Novas categorias de "coisa de level-up" que o motor genérico
  precisa suportar** (além de Subclasse única/ASI-Talento já
  cobertos): escolha trocável a cada level-up (Estilo de Luta),
  escolha trocável por Descanso Longo — não por level-up (Maestria em
  Arma), escolha exclusiva de nível único (Dádiva Épica, só nível 19).
- **Novas categorias de "coisa de Combat" que o painel Ação/Ação
  Bônus/Reação precisa suportar** (além do modelo atual de
  ativo/usada simples): recurso limitado com 2 formas de gasto
  compartilhando o mesmo "banco" (Recuperar Fôlego cura PV OU ativa
  Mente Tática), ação extra que não ocupa o slot normal (Surto de
  Ação), botão contextual pós-rolagem (Indomável após falhar
  salvaguarda), escolha situacional dentro do próprio ataque (Mestre
  Tático), estado a rastrear por inimigo (Ataques Estudados — Vantagem
  condicional contra quem errou por último), recurso com limite duplo
  simultâneo (Surto de Ação nível 17: limite por descanso E só 1x por
  turno). Confirma que o Layout C (painel Ação/Bônus/Reação, ver
  decisão "Combate — economia de ação") foi desenhado certo pra
  suportar isso — só o **conteúdo** disponível cresce com o nível, a
  estrutura do painel não muda.
- **Cavaleiro Místico prova que classe não-conjuradora pode ganhar
  conjuração completa via subclasse** — motor de magia não pode
  assumir que só classes conjuradoras na base vão precisar dele.

**Ordem de implementação recomendada** (mais simples → mais complexo,
pra não travar tentando tudo de uma vez):
1. Guerreiro base sem subclasse (níveis 1-2, 4-6, 8-9 parcial, 11-14,
   16-17, 19-20) — já jogável do 1 ao 2, completo do 4 ao 20 exceto
   pelos "buracos" de característica de subclasse.
2. Campeão — mais simples das 4 (só características passivas/
   automáticas, zero recurso novo).
3. Mestre da Batalha — recurso (Dados de Superioridade) + biblioteca
   de 16 manobras pequenas e isoladas, cada uma simples de testar
   separada.
4. Combatente Psíquico — recurso central (Dados de Energia Psiônica)
   alimentando ~7 poderes de categorias de ação diferentes.
5. Cavaleiro Místico por último — só subclasse que exige sistema de
   conjuração completo; melhor reaproveitar o motor de magia depois
   dele já validado numa classe conjuradora de verdade (Mago,
   Clérigo).

**Contexto:** pedido direto do Osmar — "o plano é resolver guerreiro
de 1 a 20 e depois a gente vem arrumando as especializações", decupagem
feita numa auditoria em chat separado com apoio do Claude, conferida
contra o PDF oficial antes de aceitar.

**Data/origem:** 2026-08, pedido direto do Osmar.

## Guerreiro B1 — motor de Level Up genérico, derivado da progressão real (sem constante hardcoded)

**Decisão:** primeira entrega do plano "Guerreiro 1-20" (ver decisão
acima). Novo `core/levelUp.ts` com 4 funções que leem a progressão
real da classe (`classes.ts`) em vez de assumir regra fixa:
`niveisComASI(classe)`, `niveisComDadivaEpica(classe)`,
`temEstiloDeLutaTrocavel(classe, nivelAtual)`,
`caracteristicasDoNivel(classe, nivel)` (junta o nome da característica
— sempre presente em `classes.ts` — com a descrição real, quando já
importada em `caracteristicasClasse.ts`).

**Achado que mudou o escopo da entrega pra menor do que o esperado:**
ao investigar pra implementar, `classes.ts` já tinha a progressão
completa 1-20 do Guerreiro importada (não só nível 1) e
`caracteristicasClasse.ts` já tinha 15 características com descrição
real (incluindo o texto exato "Sempre que atinge um nível de
Guerreiro, você pode substituir..." de Estilo de Luta, e a tabela de
ASI nos níveis certos). B1 acabou sendo **conectar dado que já
existia** na UI de Level Up, não criar dado novo.

**`LevelUpShell.tsx` ganhou 2 passos novos:**
- **"Estilo de Luta"** — aparece em **todo** level-up (não só quando é
  concedido pela primeira vez), deixa trocar por outro. Generalizado
  por nome de característica (`temEstiloDeLutaTrocavel` procura
  "Estilo de Luta" na progressão até o nível atual) — quando
  Guardião/Paladino forem importados, funciona sem mudar código,
  porque eles também têm essa característica (nível 2 deles).
- **"Dádiva Épica"** — só nível 19 (`niveisComDadivaEpica`), por ora
  um placeholder informativo (a lista de Dádivas do Cap. 5 ainda não
  foi importada).

O passo "Novas Características" trocou o texto de exemplo
(`featuresPorNivel` fixture) pela descrição real de
`caracteristicasClasse.ts` quando existir, ou um aviso "descrição
ainda não importada pra esse nível" quando não (níveis sem detalhe
próprio, ex: repetições de "Aumento no Valor de Atributo").

**Passo "Subclasse" temporariamente sem escolha real** — nenhuma
subclasse de Guerreiro foi importada ainda (isso é a Fase 2+ do plano:
Campeão primeiro). Por ora mostra um aviso e **não trava o avanço**
(a validação antiga que exigia escolher subclasse antes de avançar foi
removida — travaria o Level Up pra sempre no nível 3, já que não há
opção nenhuma pra escolher). Volta a validar quando a primeira
subclasse existir.

**`data/levelUpFixtures.ts` reduzido** — só sobrou `dadoVidaValor`
(conversão dado-de-vida → média, genérico, não é dado de classe
específico). `featuresPorNivel`, `niveisComSubclasse` (agora lido de
`classe.nivelSubclasse`, já existia no schema) e `niveisComASI`
(fixture, virou a função derivada) foram removidos por não terem mais
uso.

**Contexto:** primeira entrega do plano "Guerreiro 1-20" aprovado pelo
Osmar ("vamos!").

**Data/origem:** 2026-08, pedido direto do Osmar.

## Cuidado de import — nome repetido na progressão não é característica nova (Indomável, Surto de Ação)

**Decisão:** o livro sinaliza que um recurso escala com o nível de 3
jeitos diferentes, inconsistentes entre si — importante pra qualquer
classe futura, não só Guerreiro:
1. **Repete o mesmo nome** em cada nível que muda (Indomável nos
   níveis 9/13/17; Surto de Ação nos níveis 2/17) — o texto de regra
   completo vive inteiro no nível mais baixo onde aparece; os níveis
   seguintes só significam "+1 uso" ou "regra adicional", não uma
   descrição nova.
2. **Muda de nome a cada salto** (Ataque Extra → Dois Ataques Extras →
   Três Ataques Extras) — são entradas de tabela distintas, mas ainda
   é a mesma mecânica de base escalando.
3. **Não aparece na coluna de Características, escala numa coluna
   própria** (Recuperar Fôlego e Maestria em Arma têm colunas
   numéricas dedicadas — a característica em si só é listada 1 vez).

**Bug real causado por isso (corrigido):** `caracteristicasDoNivel`
(`core/levelUp.ts`) exigia igualdade exata de nível contra
`caracteristicasClasse.ts`, que só tem 1 entrada de descrição por
característica (no nível em que ela aparece pela 1ª vez, padrão 1
acima). Resultado: níveis 13/17 de Indomável mostravam "descrição
ainda não importada" — reportado pelo Osmar ao testar B1. Corrigido
pra buscar a entrada de **maior nível ≤ nível atual** com o mesmo
nome, em vez de igualdade exata — resolve Indomável e qualquer outra
característica no padrão 1 (inclusive Surto de Ação, que ainda não
tem passo próprio no Level Up — entra na B4).

**Recomendação de implementação (pra quando outras classes forem
importadas):** ao ler a coluna "Características" da progressão, nunca
tratar reaparição do mesmo nome como característica nova — o texto
real de regra só existe 1 vez, no nível mais baixo.

**Data/origem:** 2026-08, achado repassado pelo Osmar (registrado
antes na decupagem do Guerreiro feita num chat paralelo) + bug real
confirmado no teste do Osmar pós-B1.

## Guerreiro B2 — Maestria em Arma (escolha no wizard + troca no Descanso Longo)

**Decisão:** nova tela de escolha no wizard (dentro de
`ClasseEscolhasStep.tsx`, mesmo passo do Estilo de Luta) — jogador
escolhe N tipos de arma pra ganhar Maestria, N lido do recurso
"Maestria em Arma" da classe (`classes.ts`, 3 armas no nível 1 pro
Guerreiro). Na Ficha, aba Perfil ganhou uma seção "Maestria em Arma"
listando as armas escolhidas (com dano + tipo de maestria) e um ícone
"🔄" em cada uma que abre um popup pra trocar por outra arma — a
lista do popup já exclui as armas que ocupam os outros slots, pra não
deixar duplicar.

**Novo `core/maestriaArma.ts`:** `quantidadeMaestriaEmArma(classe,
nivel)` lê o valor real de `recursos` da classe (não hardcoded);
`armasParaMaestria(classe)` filtra `armas.ts` pela proficiência de
arma da classe (`proficienciasArmaArmaduraClasse.ts`) — hoje só sabe
resolver o caso "Armas Simples e Marciais" (= catálogo inteiro, caso
do Guerreiro); proficiência restrita (ex: Ladino) fica pra quando essa
classe ganhar o recurso "Maestria em Arma" de verdade.

**Simplificação assumida (fidelidade parcial à regra):** a regra real
diz que a troca acontece **durante** o Descanso Longo. Implementei o
ícone de troca como sempre visível na seção "Maestria em Arma" da aba
Perfil, não escondido/desbloqueado só depois de apertar o botão
"Descanso Longo". Optei por isso pra manter a entrega pequena e
testável — gating por evento de descanso exigiria um fluxo de UI novo
(popup pós-descanso, ou trava temporária) que não parecia valer a
complexidade extra agora. Registrado em `PENDENCIAS.md` como algo
revisável se o Osmar quiser a versão mais fiel.

**Novo componente reutilizável:** `TrocarArmaMaestria.tsx` (ícone +
popup de troca) segue o mesmo padrão visual/estrutural de
`InfoValor.tsx` (overlay central, `stopPropagation`, card com lista) —
não um componente do zero.

**Contexto:** segunda entrega do plano "Guerreiro 1-20", aprovado
pelo Osmar ("vamos seguir").

**Data/origem:** 2026-08.

## Guerreiro B2 (ajuste) — linha de Maestria em Arma quebrada em 2 + popup na propriedade

**Decisão:** cada arma na seção "Maestria em Arma" (aba Perfil) agora
mostra o nome numa linha e "dano · maestria" numa linha abaixo — antes
vinha tudo junto na mesma linha. A própria palavra da propriedade de
maestria (Ágil, Derrubar, Drenar...) virou termo sublinhado clicável
(`ItemComDescricao`, padrão já usado no resto do app) que abre popup
com o efeito completo da propriedade.

**Novo dado:** `data/rulesets/dnd2024/propriedadesMaestria.ts`,
importado da aba "Propriedades de Maestria" da planilha mestra (8
propriedades: Afligir, Derrubar, Drenar, Empurrar, Garantido,
Lentidão, Trespassar, Ágil — texto de regra completo de cada uma).
Essa aba já existia na planilha desde antes, só não tinha sido
importada ainda porque nada no app precisava dela até esse popup.

**Contexto:** pedido direto do Osmar depois de ver a seção de B2 na
Ficha — queria a hierarquia visual mais clara e a explicação da
maestria acessível sem precisar decorar o que cada termo significa.

**Data/origem:** 2026-08.

## Guerreiro B3 — Recuperar Fôlego + Mente Tática (banco de usos compartilhado)

**Decisão:** Recuperar Fôlego e Mente Tática gastam o **mesmo banco de
usos** (regra real: Mente Tática "gasta um uso de seu Recuperar
Fôlego"), então o app modela isso como 1 contador só
(`folegoGasto`/`usosFolegoRestantes` em `FichaShell.tsx`), não dois
contadores separados. Recuperar Fôlego vive dentro do painel de Ação
Bônus (é uma Ação Bônus de verdade — marca o botão "Bônus" como
usado). Mente Tática **não** vive dentro de nenhum painel de
Ação/Bônus/Reação — é um card sempre visível na aba Combat, porque a
regra não consome a economia de ação do turno (é reativo a "falhar um
teste de atributo", pode acontecer a qualquer momento).

**Novo `core/recursosClasse.ts`:** `valorRecursoClasse(classe,
prefixoNome, nivel)` — leitura genérica de qualquer recurso da classe
por nome+nível. `maestriaArma.ts` (B2) foi refatorado pra usar essa
função em vez de duplicar a mesma lógica de busca em `recursos`.

**Simplificação assumida, depois corrigida:** a primeira versão só
rolava o dado (`useRoll`) e deixava o jogador somar o PV na mão,
seguindo o mesmo aviso de protótipo já existente no resto da Combat
("cada toque muda 1 PV por vez"). O Osmar reportou "Recuperar Fôlego
não cura" — corrigido usando o `onResultado` do `rolarDados` pra
aplicar o total direto em `onAlterarPv`; a cura agora reflete na barra
de PV sem passo manual. Mente Tática **continua** manual de propósito
(só rola 1d10) — diferente da cura, o app não tem como saber qual
teste de atributo o jogador está tentando salvar, então não tem valor
certo pra aplicar automaticamente.

**Contexto:** terceira entrega do plano "Guerreiro 1-20", aprovado
pelo Osmar ("vamos seguir").

**Data/origem:** 2026-08.

## Magia de item vs magia natural — sistemas separados, não uma "fonte a mais"

**Decisão:** magia concedida por item mágico (bastão, anel, etc. com
cargas) **não entra** na aba Magias nem na função `personagemConjura()`.
Vive como item com contador de cargas na Mochila; o uso em combate
acontece pela ação **"Usar Objeto"** (uma das 12 ações oficiais do Cap.
1, distinta de "Usar Magia"), reaproveitando o motor de rolagem de
magia, mas com a fonte do efeito vindo do item (CD/bônus fixos do
item), não da ficha de conjuração do personagem.

**Contexto:** pergunta do Osmar sobre onde encaixar item mágico com uso
de magia, e sobre esconder a aba Magias por classe (rejeitado por
quebrar em multiclasse — ver decisão seguinte). A separação Usar
Magia/Usar Objeto já existe na regra oficial (Cap. 1) — não é invenção
de design, é reconhecer uma distinção que o livro já faz. Isso também
resolve de graça o caso de um não-conjurador usar item mágico sem
precisar de nenhuma lógica especial de exceção.

**`personagemConjura()` fica enxuta:** só responde "esse personagem tem
alguma fonte própria de conjuração?" — item mágico nunca entra nessa
pergunta, por ser sistema independente. As fontes reais que somam
nessa resposta são 3: **classe atual** (já implementado), **multiclasse**
(pendência em aberto) e **Talento de Origem que concede magia** (ex:
"Iniciado em Magia" — Acólito/Guia/Sábio; hoje essas 3 origens estão
`disponivel: false` no wizard, então inalcançável na prática, mas
precisa entrar no cálculo assim que a tela de escolha existir).

**Implementação:** `core/conjuracao.ts` (`personagemConjura()`) já
existe e está ligado em `MagiasTab.tsx` (estado vazio real) e no
acordeão "Usar Magia" da Combat (some completamente pra quem não
conjura). Hoje só a fonte "classe atual" está implementada — Talento
de Origem e multiclasse ficam como pendência, ver `PENDENCIAS.md`.
"Usar Objeto" (item mágico com carga) ainda não existe no código.

## Aba Magias sempre visível, nunca escondida por classe

**Decisão:** a aba Magias não some pra personagens sem conjuração —
mostra estado vazio ("nenhuma magia disponível"), mesmo padrão já
usado pra Ação Bônus vazia no Layout C. Visibilidade/estado
controlado por `personagemConjura()` (derivado, não hardcoded por
classe), justamente pra não quebrar em multiclasse.

**Contexto:** mesma conversa acima. Consistência de navegação (aba
sempre no mesmo lugar) vale mais que economizar a aba pra quem não
usa — já era o padrão adotado antes (Ação Bônus vazia), só
generalizado agora pra essa aba inteira.

**Implementação:** decisão registrada, ainda não aplicada — a aba
Magias já é sempre visível hoje, mas só porque tudo é fixture; falta
o estado vazio real condicionado a `personagemConjura()`. Ver
`PENDENCIAS.md`.

## Guerreiro B4 — Ataque Extra, Surto de Ação, Indomável, Mestre Tático, Ataques Estudados

**Decisão:** quarta entrega do plano "Guerreiro 1-20". Duas funções
novas em `core/levelUp.ts` generalizam os 2 padrões de "recurso que
escala por nível sem coluna numérica própria" já documentados em
"Cuidado de import — nome repetido":
- `contarRepeticoesCaracteristica(classe, nome, nivel)` — convenção 1
  (repete o mesmo nome): conta ocorrências até o nível atual. Deriva
  usos de Indomável (9/13/17 → 1/2/3 usos) e Surto de Ação (2/17 →
  1/2 usos).
- `numeroDeAtaques(classe, nivel)` — convenção 2 (muda de nome a cada
  salto): mapa fixo `{'Ataque Extra': 2, 'Dois Ataques Extras': 3,
  'Três Ataques Extras': 4}` — nomes oficiais do Livro do Jogador
  2024, compartilhados por várias classes (não é hardcode específico
  de Guerreiro), lidos contra a progressão real.
- `caracteristicaDesbloqueada(classe, nome, nivel)` — retorna
  nome+descrição se a classe já tem essa característica nomeada até
  o nível atual; usado pra Mestre Tático/Ataques Estudados como
  InfoChip informativo (sem mecânica interativa ainda).

**UI de "Atacar" com múltiplos golpes:** o desafio real era que o
painel de Ação fecha e marca a Ação do turno como "usada" assim que
qualquer opção é escolhida — mas Ataque Extra dá múltiplos ataques
dentro da MESMA Ação, não uma Ação por ataque. Solução: `AcaoPanelContent`
ganhou um callback `onAtacar` separado de `onEscolher`, e `CombatTab`
conta os ataques feitos no turno (`ataquesFeitos`, reseta no "Fim do
Turno") — só fecha o painel e marca a Ação como usada quando o último
ataque é registrado; os anteriores mantêm o painel aberto (o rótulo
mostra "ataque N/M") sem consumir o turno.

**Surto de Ação dentro do painel de Ação, mas sem marcar a Ação
como usada:** ao contrário de Recuperar Fôlego (que É uma Ação Bônus
de verdade, então marca o botão Bônus), Surto de Ação **concede** uma
ação extra — usá-lo não pode consumir a Ação normal do turno. A linha
fica dentro do painel de Ação (é conceitualmente relacionado), mas o
clique só decrementa o banco de usos e mostra feedback, sem chamar
`onMarcarUsado`. O limite duplo do nível 17 (2 usos por descanso, mas
só 1x por turno) usa um flag `surtoUsadoTurno` separado do contador
de usos, resetado no "Fim do Turno".

**Indomável fica fora da economia de ação** (card sempre visível na
Combat, mesmo padrão de Mente Tática) — não é Ação/Bônus/Reação, é
reativo a "falhar uma salvaguarda", pode acontecer a qualquer
momento. Diferença importante de Recuperar Fôlego/Mente Tática:
Indomável só recupera no Descanso Longo, não 1 uso no Curto — o
código já reflete isso (`indomavelGasto` só zera em `descansoLongo`,
não em `descansoCurto`).

**Simplificação assumida — Mestre Tático e Ataques Estudados só
informativos:** a mecânica real (trocar propriedade de maestria por
ataque; rastrear Vantagem contra o último inimigo que errou) exigiria
estado por-ataque ou por-inimigo que a Combat ainda não modela.
Registrados como InfoChip com a descrição real, sem interatividade —
suficiente pra o jogador saber que a característica existe e o que
ela faz, sem fingir suporte mecânico que não existe.

**Simplificação de UX identificada, não corrigida ainda:** o feedback
+ botão "Rolar Dano" de cada ataque intermediário fica atrás do
painel de Ação (que continua aberto até o último ataque) — o jogador
só vê depois de fechar o painel manualmente. Funciona, mas não é
ideal; ver `PENDENCIAS.md`.

**Contexto:** quarta entrega do plano "Guerreiro 1-20", resolve os
itens #6/#11 da lista de teste do Osmar pós-B1 (Ataque Extra/Dois
Ataques Extras/Três Ataques Extras não contabilizados na Combat).

**Data/origem:** 2026-08.

## Ataque Extra — cada instância de ataque é independente, não um "modo" único pra ação toda

**Decisão:** Ataque Extra concede múltiplas **instâncias** da ação
Atacar, e cada instância pode ser escolhida separadamente entre arma
ou Ataque Desarmado. Ataque Desarmado, por sua vez, tem 3 sub-opções
(Dano/Empurrar/Imobilizar) escolhidas a cada uso individual —
confirmado na planilha mestra (aba "Glossário de Regras", termo
"Ataque Desarmado"): "Sempre que você usar seu Ataque Desarmado,
escolha uma das seguintes opções para seu efeito" (Dano: 1+FOR
Contundente; Empurrar: salvaguarda FOR/DES CD 8+FOR+Bônus de
Proficiência ou empurra 1,5m/Caído; Imobilizar: salvaguarda FOR/DES
mesma CD ou condição Imobilizado, exige mão livre).

**Implicação prática confirmada:** um personagem com Ataque Extra (2,
3 ou 4 ataques) pode usar Imobilizar (agarrar) em **todos** os
ataques da mesma ação Atacar, contra alvos diferentes se quiser — não
é "escolhe um modo pra ação toda". Não existe restrição de "só pode
agarrar 1x por turno" na regra base (só existe se algo específico
limitar).

**Implicação de UI:** o "Atacar" do painel de Ação, quando o
personagem tem Ataque Extra, precisa oferecer a escolha Arma/
Desarmado (Dano/Empurrar/Imobilizar) **por instância de ataque
dentro da mesma ação**, não uma escolha única aplicada a todos os
ataques do turno.

**Estado atual (ainda não implementado):** hoje "Atacar" nem sequer
tem Ataque Desarmado como opção — é só a arma fixture da Adaga
(marcada `[PH]`, ver `PENDENCIAS.md` "Combat tab — auditoria de
fixture vs. real"). A escolha por-instância Arma/Desarmado entra
junto quando o cálculo de ataque real (arma equipada + atributo +
proficiência) for implementado — não faz sentido montar a UI de
escolha antes do cálculo por trás existir.

**Contexto:** dúvida direta do Osmar sobre se Ataque Extra só dá mais
dano ou permite repetir qualquer opção de Ataque Desarmado múltiplas
vezes. Confirmado que sim, repete — achado registrado num chat
paralelo, verificado contra a planilha mestra antes de entrar aqui.

**Data/origem:** 2026-08.

## Guerreiro B5 — revisão geral 1-20 (Guerreiro base concluído)

**Decisão:** quinta e última entrega do "Guerreiro base" (níveis
1-20, sem subclasse). Auditoria de todas as características contra a
progressão real (`classes.ts`) confirmou que só uma estava com dado
real importado mas sem UI: **Ajuste Tático** (nível 5 — "Sempre que
executar uma Ação Bônus para seu Recuperar Fôlego, você pode mover-se
até metade do seu Deslocamento sem provocar Ataques de Oportunidade")
não tinha InfoChip na Combat, diferente de Mestre Tático/Ataques
Estudados que já tinham. Corrigido — mesmo padrão, 3º chip na seção
"Características".

**Verificação de ponta a ponta:** Level Up automatizado nível 1→20
sem travar em nenhum passo (incluindo os placeholders de Subclasse/
Dádiva Épica, que não bloqueiam o avanço por design). Nível 20
conferido manualmente: PV, usos de Indomável/Recuperar
Fôlego/Surto de Ação e contagem de ataques todos batendo com a
planilha.

**Guerreiro base 1-20 está completo** pro escopo já aprovado — o que
falta (ASI, Dádiva Épica, Atacar real) são pendências já registradas
e conscientes, não gaps novos descobertos aqui. Próximo passo do
plano "Guerreiro 1-20": subclasses, na ordem já definida (Campeão →
Mestre da Batalha → Combatente Psíquico → Cavaleiro Místico).

**Contexto:** quinta entrega do plano "Guerreiro 1-20", aprovado pelo
Osmar ("sim b5").

**Data/origem:** 2026-08.

## Ficha — auto-save de progresso, não só na criação

**Decisão:** `FichaShell.tsx` ganhou um `useEffect` que salva o
personagem (`armazenamentoPersonagens.salvar`) sempre que nível, PV
(atual e máximo), Estilo de Luta atual, Maestria em Arma atual, ou
usos gastos de Recuperar Fôlego/Indomável/Surto de Ação/Espaços de
Magia mudam — não só uma vez na criação (wizard). `PersonagemSalvo`
ganhou os campos correspondentes (`pvMax`, `estiloDeLutaAtual`,
`maestriaArmaAtual`, `folegoGasto`, `indomavelGasto`, `surtoGasto`,
`espacosGastos`), todos opcionais pra não quebrar personagens salvos
antes dessa entrega (leitura usa `??` com fallback pro valor
derivado de `selecao`/nível 1).

**Contexto:** bug reportado pelo Osmar testando — dar F5 na Ficha
depois de subir de nível voltava tudo pro nível 1. Causa raiz: só
`nivel`/`xp`/`pvAtual` eram persistidos (e só na criação, pelo
wizard); todo o resto do progresso (PV máximo real após Level Up,
troca de Estilo de Luta, troca de Maestria em Arma, usos gastos de
recurso) só existia em estado do React, nunca ia pro `localStorage`.

**Decisão de escopo — o que NÃO entra no auto-save:** `turnState`
(Ação/Bônus/Reação usada) e `surtoUsadoTurno` ficam de fora de
propósito — são "estado do turno atual", já resetam sozinhos no "Fim
do Turno", e é esperado (mesmo padrão de qualquer app de mesa) que
sumam se a página recarregar no meio de um turno. Persistir só o que
representa progresso real do personagem, não estado efêmero de UI.

**Alternativa descartada:** salvar manualmente em cada handler
(`confirmarLevelUp`, `descansoLongo`, `trocarArmaMaestria`, etc.)
depois de cada `setState`. Descartado porque `setState` é assíncrono
— salvar logo depois de chamar `setPersonagem(...)` capturaria o
valor **antigo**, não o novo, exigindo duplicar os cálculos só pra
montar o objeto a salvar. O `useEffect` observando os valores já
resolve isso de graça (roda depois do re-render, com o valor
atualizado) e cobre todos os pontos de mudança de uma vez, sem
precisar lembrar de adicionar a chamada em cada handler novo no
futuro.

**Contexto:** teste do Osmar, "se estou numa ficha e faço Level Up
... e dou refresh, ela volta pro nível 1".

**Data/origem:** 2026-08.

## Mochila vira estado de verdade (E1 do plano de Equipamento)

**Decisão:** primeira entrega do plano de Equipamento (proposto após
o Osmar apontar as perguntas de mão principal/secundária, equipar/
desequipar, CA não olhar equipamento real, e falta de +/- na
Mochila). Antes, `itensMochila` era só um cálculo derivado da
seleção do wizard (`calcularItensIniciais(selecao)`), recalculado a
cada render — não existia array de inventário persistido em lugar
nenhum, por isso não dava pra editar. Agora é estado de verdade:
`FichaShell.tsx` inicializa `itensMochila` uma vez (da seleção, na
1ª visita) e depois só muta (`+`/`-`/remover/adicionar), com
`useEffect` de auto-save (já existente, reaproveitado) persistindo
em `PersonagemSalvo.itensMochilaAtual`.

**Cada item ganhou `id` estável** (`core/mochila.ts`) — antes a
Mochila só tinha nome/quantidade/peso/origem, chaveada por índice do
array na UI, o que quebraria assim que qualquer item fosse removido
(o índice de todo mundo depois dele mudaria).

**Grupos "Equipado (Origem)/(Classe)"/"Itens comprados na loja"
viraram 1 lista só.** Confirmado com o Osmar: depois que o item entra
na Mochila, de onde ele veio não importa mais pra exibição — `origemDoItem`
continua existindo no dado (agora incluindo `'Manual'`, pra item
adicionado direto na tela), mas é só metadado, não controla mais
agrupamento visual.

**Cada linha ganhou:** stepper `-`/`+` de quantidade (chegar a 0
remove a linha automaticamente — "gastou a última tocha" devia
sumir, não ficar mostrando "0×"), e um "🗑" que remove a pilha
inteira de uma vez, independente da quantidade. Um card no fim da
lista deixa adicionar item novo por nome livre + quantidade — peso
vem do catálogo se o nome bater com algo conhecido (`buscarPesoItem`),
senão fica "sem peso cadastrado" como qualquer outro item sem dado.

**O que isso NÃO resolve ainda (fica pras próximas entregas do
plano):** não existe conceito de "equipado" — a Mochila lista tudo
igual, sem diferenciar o que está na mão/vestido de que está só
guardado. CA continua sem olhar a Mochila real (só a opção A/B/C do
wizard). Isso é a **E2** (equipar/desequipar, Mão Principal/
Secundária) e **E3** (Combat/CA lendo o equipamento de verdade) do
mesmo plano — ver `PENDENCIAS.md`.

**Contexto:** pedido do Osmar depois de revisar tudo que foi feito
até aqui e notar que a separação por Origem/Classe/Loja não fazia
sentido, e que faltava +/- e adicionar item — junto com as perguntas
mais profundas sobre equipamento que abriram o plano E1-E4.

**Data/origem:** 2026-08.

## Mochila — quantidade trava em 0, remover exige 2 toques (ajuste pós-E1)

**Decisão:** o Osmar testou o E1 e pediu 2 ajustes de comportamento:
- **`-` da quantidade trava em 0**, não apaga a linha sozinho. Um
  toque a mais sem querer não devia fazer o item sumir — "0×" fica
  visível até o jogador decidir de propósito removê-lo.
- **Remover (🗑) exige confirmação em 2 toques**: 1º toque deixa o
  botão vermelho com texto "confirmar 🗑" (some sozinho depois de 3s
  se ninguém confirmar); 2º toque no mesmo botão remove de verdade.

**Contexto:** mesmo padrão de "ação destrutiva pede confirmação" que
qualquer app deveria ter — evita perder item de propósito (ração,
tocha) por 1 toque errado, sem precisar de um modal/popup separado
(mais pesado pra uma ação tão frequente).

**Data/origem:** 2026-08.

## Equipar/Desequipar (E2 do plano de Equipamento) — só arma/armadura/escudo, por enquanto

**Decisão:** `core/equipamento.ts` identifica o tipo de um item da
Mochila cruzando o **nome** contra os catálogos reais (`armas.ts`,
`armaduras.ts`) — zero suposição nova, só usa dado que já existia.
Cada item ganha botões de equipar pro(s) slot(s) válidos pro seu
tipo: arma normal → Mão Principal/Mão Secundária; arma com
propriedade "Duas Mãos" → 1 botão só, ocupa as duas ao equipar;
armadura → Armadura; item cuja `categoria` contém "Escudo" (aba
Armaduras da planilha, "Escudo" é uma linha lá, não uma aba própria)
→ Escudo. Item que não bate com nenhum catálogo (ração, tocha, item
mágico ainda não importado) não ganha controle de equipar nessa
entrega.

**Exclusividade de slot resolvida com 2 regras derivadas da mesma
"mão" física, não hardcoded por nome de item:**
1. Equipar em um slot já ocupado por outro item libera esse outro
   item automaticamente (slot é exclusivo, 1 item por vez).
2. Duas Mãos ocupa Mão Principal E libera Mão Secundária/Escudo (não
   dá pra seguir empunhando nada nem escudo com as duas mãos na arma).
3. Escudo e arma na Mão Secundária se excluem mutuamente (mesmo
   conceito de "a mão que não é a principal").

**Por que "Vestiário genérico" ficou de fora:** o Osmar pediu que
itens tipo anel/capa/bota também pudessem ser equipados sem limite
de slot (diferente de jóias). O catálogo real (`equipamentoAventura.ts`
etc.) não tem uma coluna que diga "isso é vestível", então não dá
pra saber com segurança se um item genérico é roupa ou é uma ração —
tentar adivinhar pelo nome seria fake data. Fica pendente até existir
uma forma real de marcar isso (provavelmente junto com o catálogo
estruturado de "Adicionar item", outra pendência já registrada).

**CA e Combat não leem o equipamento ainda — de propósito.** Essa
entrega é só o mecanismo de equipar/desequipar em si; ligar isso no
cálculo de CA e no "Atacar" da Combat é a **E3**, próxima entrega do
plano. A própria tela da Mochila já avisa isso, pra não parecer bug.

**Contexto:** segunda entrega do plano de Equipamento, aprovada pelo
Osmar ("e2!").

**Data/origem:** 2026-08.

## Sistema de Equipamento — schema de referência (chat paralelo), o que foi adotado e o que ficou pendente de verificação

**Contexto:** o Osmar pediu ajuda a outro chat pra organizar o
schema de equipamento antes de continuar a E3, e trouxe o resultado
(`schema-equipamentos.md`) pra eu conferir contra a fonte real e
adaptar — mesmo tratamento que qualquer draft externo recebe nesse
projeto (nunca aceitar direto, sempre bater contra `dnd-master-referencia.xlsx`
primeiro).

**Adotado — regra de classificação Equipável vs. Miscelânea.** A
proposta "equipável = tem Bônus de CA, Dano, ou Efeito Mágico;
senão é Miscelânea" não é uma regra de D&D, é uma decisão de
**arquitetura do nosso app** (não precisa verificação na planilha,
é escolha nossa de design) — e ela **confirma e explica melhor**
uma decisão que a E2 já tinha tomado na prática: hoje nenhum item
de `equipamentoAventura.ts` tem CA/dano/efeito mágico cadastrado
(itens mágicos não foram importados ainda), então TODOS eles já são
Miscelânea por essa régua — a "Vestiário genérico ficou de fora"
registrada na decisão da E2 não era uma lacuna arbitrária, era essa
regra objetiva já valendo, só sem estar nomeada. Fica formalizado
aqui: `identificarEquipamento()` (`core/equipamento.ts`) já implementa
essa régua na prática (arma/armadura têm dano/CA cadastrados →
equipável; o resto não tem nenhum dos 3 campos → Miscelânea).

**Adotado — refinamento da pendência de Versátil (já estava listada
na E3, agora mais precisa):** arma Versátil pode ser empunhada com 1
ou 2 mãos por escolha do jogador, mudando o dado de dano (`Versátil
(1d10)` já vem estruturado assim na planilha) — quando isso for
implementado (E3), empunhar em modo 2 mãos também precisa **ocupar a
Mão Secundária** no equipamento (não só mudar o dado), senão o
personagem "usa 2 mãos" pro dano mas a Mão Secundária continua
livre pra outro item, o que não faz sentido físico.

**Adotado — Sintonização não é exclusiva de Acessório (refinamento
da E4, ainda bloqueada por dado):** quando itens mágicos existirem,
armas/armaduras/escudos mágicos também podem exigir Sintonização, não
só "acessórios" — a checagem de Sintonização precisa rodar em cima de
qualquer categoria equipada, separada da validação física de
slot/mão. Ainda bloqueado (zero itens mágicos importados), só deixa
o desenho futuro mais correto desde já.

**Verificado contra o livro real (Osmar enviou os PDFs Cap. 1, Cap. 3,
Cap. 5, Cap. 6 e Apêndice C) — "Duas Armas exige Leve" é confirmado,
mas é regra de ATAQUE (E3), não de EQUIPAR (E2).** A afirmação do
chat paralelo bate, mas a fonte não é uma ação separada "Duas Armas"
(não existe isso no Cap. 1 nem no Glossário) — é a própria descrição
da propriedade **Leve**, no Cap. 6:

> "Quando você executa a ação Atacar em seu turno e usa uma arma
> Leve, pode realizar um ataque adicional como uma Ação Bônus mais
> tarde no mesmo turno. Esse ataque adicional deve ser realizado com
> uma arma Leve diferente, e você não adiciona seu modificador de
> atributo ao dano do ataque adicional, a menos que esse modificador
> seja negativo."

Ou seja: o livro **não proíbe** equipar uma arma não-Leve na Mão
Secundária — isso continua fisicamente válido (seguro uma espada
longa numa mão e um machado numa mão, por exemplo, mesmo sem ganhar
o ataque bônus). O que a regra Leve condiciona é **se o ataque bônus
extra fica disponível**, e isso só é avaliado no momento de atacar,
não no momento de equipar. Por isso: **nenhuma mudança em
`equiparNoSlot`/`slotsValidos` (E2)** — a lógica atual (qualquer arma
de 1 mão pode ir pra Mão Secundária) já está certa. A checagem de
Leve nas duas armas (a equipada na Mão Principal E a da Mão
Secundária) vira um requisito confirmado da **E3**, quando "Atacar"
passar a ler o equipamento de verdade — condição pra oferecer a opção
de ataque bônus com a arma da Mão Secundária.

**Confirmado — Versátil muda o dado de dano com 2 mãos (Cap. 6, tabela
de Armas).** Ex.: Espada Longa `1d8 Cortante — Versátil (1d10)`,
Lança `Versátil (1d8)`. Bate com o que já estava registrado como
refinamento da E3 acima (empunhar com 2 mãos ocupa a Mão Secundária
também) — nenhuma mudança adicional necessária, só confirma a fonte.

**Confirmado — Sintonização é de qualquer item mágico, não só
Acessório (Cap. 6, seção "Não Mais do Que Três Itens" + exemplo
explícito de Escudo mágico).** Texto do livro usa literalmente um
Escudo mágico como exemplo de item que pode exigir Sintonização
("Sem se sintonizar a um item que requer Sintonização, você só obtém
seus benefícios não mágicos... Por exemplo, um Escudo mágico que
requer Sintonização oferece os benefícios de um Escudo normal se
você não estiver sintonizado a ele"). Confirma o que já estava
registrado acima — nenhuma mudança de código (ainda bloqueado por
falta de dado de item mágico).

**Confirmado — Escudo ocupa uma mão (Cap. 6, "Treinamento com
Armadura": "Qualquer um pode vestir uma armadura ou segurar um
Escudo").** "Segurar" confirma que Escudo consome uma mão fisicamente
— consistente com o slot `'escudo'` hoje ser mutuamente exclusivo com
a Mão Secundária em `equiparNoSlot` (E2). Nenhuma mudança necessária.

**Não verificado — "Mãos como recurso numérico 0-2" vs. slots
nomeados.** O chat paralelo propôs modelar mãos como um contador
genérico em vez de `maoPrincipal`/`maoSecundaria` nomeados. Não é uma
regra de D&D pra verificar contra o livro (é decisão de arquitetura
do nosso app) — decisão: manter os slots nomeados como estão, porque
já resolvem corretamente os casos reais confirmados acima (2 mãos =
libera a Mão Secundária; Escudo/Mão Secundária são mutuamente
exclusivos) sem precisar de um contador abstrato adicional. Se
aparecer um caso real que o modelo nomeado não resolva, reavaliar
então.

**Data/origem:** 2026-08 (schema inicial) + 2026-08 (verificação
contra PDFs reais: Cap. 1, Cap. 3, Cap. 5, Cap. 6, Apêndice C).

## E3.1 — CA lê o equipamento de verdade da Mochila

**O que mudou.** Até aqui `calcularCA` (usado na aba Perfil) lia a
escolha do wizard (`selection.equipamentoClasseEscolhido`) — uma foto
do momento da criação, sem relação com o que o jogador equipou/
desequipou depois na Mochila (E2). Criada `calcularCAEquipado`/
`explicarCAEquipado` (`core/calculoPersonagem.ts`), que leem
`resumoEquipado(itensMochila)` (E2) e calculam: base pela Armadura no
slot `armadura` (ou 10 + mod. Destreza se nada equipado) + bônus do
Escudo no slot `escudo` (lido da coluna "Classe de Armadura" da
planilha, hoje sempre "+2"). `calcularCA`/`explicarCA` originais
continuam existindo e sendo usados só no Resumo do wizard (`ResumoStep.tsx`),
onde a Mochila ainda não existe como estado.

**Armadura/Escudo iniciais já nascem equipados.** Pra não regredir o
comportamento (CA já correta ao criar o personagem, sem precisar
entrar na Mochila e equipar manualmente), `calcularItensIniciais`
(`core/mochila.ts`) agora atribui automaticamente o slot `armadura`/
`escudo` à primeira Armadura/primeiro Escudo que entrar na lista
inicial (de Origem, Classe ou Loja), via `slotInicialAutomatico`
(usa `identificarEquipamento` da E2). Arma **não** entra nessa
automação de propósito — "o que está na mão" fica sempre como escolha
explícita do jogador na Mochila.

**Texto desatualizado da E2 corrigido.** A caixa "Equipado agora" da
Mochila tinha o aviso "equipar ainda não muda a CA nem o Atacar" —
agora que a CA já muda, o texto virou "Armadura e Escudo já mudam a
CA (aba Perfil). O 'Atacar' da aba Combat ainda usa dado de exemplo —
isso é a próxima entrega" (E3.2).

**Testado:** Playwright 390×844, Guerreiro nível 1 com Cota de Malha
(CA 16 fixo) + Escudo equipados — CA inicial 18 → desequipar Escudo
→ 16 → desequipar Armadura → 12 (10 + mod. Des +2) → reequipar
Armadura → 16. Todos os valores bateram.

**Data/origem:** 2026-08.

## E3.2 — "Atacar" usa a arma equipada de verdade (tira o `[PH]`)

**O que mudou.** Novo `core/ataque.ts`: `ataqueAtual(nomeArmaEquipada,
classe, nivel, forMod, desMod)` resolve o ataque disponível olhando o
que está na Mão Principal (via `resumoEquipado`, E2) — se for uma arma
do catálogo (`armas.ts`), calcula acerto/dano de verdade; se não tiver
nada equipado, cai pra **Ataque Desarmado real** (não mais fixture).
O "Atacar" no painel de Ação (`AcaoPanelContent.tsx`) mostra o nome da
arma, o dano/propriedades reais, e rola `1d20 + (mod. atributo + Bônus
de Proficiência)` de verdade — o `[PH]` (Adaga fixa `+4`/`1d4+3`) saiu
completamente, junto com o fixture `ataqueArmaExemplo`
(`data/exampleCombat.ts`, removido por não ter mais uso).

**Atributo usado — regra confirmada no Cap. 1 e no Apêndice C.**
Corpo a Corpo usa Força, à Distância usa Destreza, por padrão; com a
propriedade **Acuidade**, usa o maior entre os dois (texto do Cap. 1:
"a propriedade Acuidade... permite que você use Força ou Destreza").
Lido de `arma.categoria`/`arma.propriedades` (planilha), não
hardcoded.

**Ataque Desarmado — confirmado no Apêndice C (Glossário de
Regras).** "Seu bônus para a jogada é igual ao seu modificador de
Força mais seu Bônus de Proficiência. Se acertar, o alvo sofre dano
Contundente igual a 1 mais seu modificador de Força." Implementado só
a opção **Dano** — o livro também oferece Empurrar/Imobilizar (testes
de resistência do alvo, sem rolagem de dano), que ficam de fora por
enquanto porque o painel de Combat hoje só sabe rolar
acerto+dano, não testes de resistência de terceiros — registrado em
PENDENCIAS.md.

**Assumido — proficiência com a arma equipada.** Hoje só existe uma
classe (Guerreiro), que é proficiente com toda arma Simples e Marcial
(`core/maestriaArma.ts` já trata "Armas Simples e Marciais" como o
catálogo inteiro) — por isso `ataqueAtual` assume proficiência sempre.
Quando uma 2ª classe existir com proficiência de arma restrita,
precisa checar isso antes de somar o Bônus de Proficiência —
registrado em PENDENCIAS.md.

**Testado:** Playwright 390×844, Guerreiro nível 1 (FOR 16 → +3) com
Espada Grande equipada na Mão Principal — painel de Ação mostrou
"Atacar — Espada Grande" com descrição "2d6 Cortante · Duas Mãos,
Pesada.", e a rolagem de acerto usou `1d20 + 5` (+3 Força + 2 Bônus
de Proficiência), batendo com a conta esperada.

**Data/origem:** 2026-08.

## E3.3 — Ataque bônus com a Mão Secundária (propriedade Leve)

**O que mudou.** `core/ataque.ts` ganhou `ataqueBonusMaoSecundaria` —
só retorna um ataque quando a arma da Mão Principal **e** a da Mão
Secundária forem as duas Leve (confirmado no Cap. 6, ver decisão
"Sistema de Equipamento" acima), caso contrário retorna `null` e a
opção simplesmente não aparece. A opção mora no painel de **Ação
Bônus** (`BonusPanelContent.tsx`), não no de Ação — o livro descreve
esse ataque como "uma Ação Bônus mais tarde no mesmo turno", então é
onde ele pertence mecanicamente, ao lado de Recuperar Fôlego (as duas
opções convivem no mesmo painel agora, cada uma só aparece se
disponível).

**Dano sem bônus de atributo — regra aplicada.** `ataqueComArma`
ganhou um parâmetro `semModAtributoNoDano` (usado só por esse ataque
bônus): zera o modificador de atributo no dano, a menos que ele seja
negativo — texto exato do Cap. 6 já citado na decisão acima. O acerto
continua somando o modificador normalmente (só o dano é afetado).

**Testado:** Playwright 390×844 — Guerreiro nível 1 (FOR 16/DES 14)
com Cimitarra (Mão Principal) + Adaga (Mão Secundária, ambas Leve):
painel de Ação Bônus mostrou "Atacar — Adaga (Mão Secundária)",
rolagem `1d20 + 5` correta. Trocando a Mão Secundária por Machado de
Batalha (não é Leve): a opção não aparece, e o painel ainda mostra
Recuperar Fôlego normalmente (não cai no estado "nenhuma ação bônus
disponível").

**Data/origem:** 2026-08.

## E3.4 — Versátil empunhada com 2 mãos (fecha o Plano de Equipamento)

**O que mudou.** `ItemMochila` ganhou `duasMaosAtivo?: boolean` — só
faz sentido pra arma Versátil na Mão Principal, liga/desliga via novo
`alternarDuasMaosVersatil` (`core/equipamento.ts`). Ligado: a Mão
Secundária é liberada automaticamente (mesma regra de "arma de Duas
Mãos ocupa as duas mãos" que já existia, agora também vale pro modo
Versátil) e o dado de dano usado no "Atacar" passa a ser o maior
(entre parênteses na propriedade, ex.: "Versátil (1d10)" em vez de
"1d8") — lido de `arma.propriedades` via `identificarEquipamento`,
zero valor hardcoded. `resumoEquipado().maoSecundariaOcupadaPorDuasMaos`
passou a considerar esse flag também, então a caixa "Equipado agora"
já mostrava "ocupada (arma de 2 mãos)" sem precisar de mudança ali.

**Auto-liberação ao equipar outra coisa na Mão Secundária.**
`equiparNoSlot` ganhou uma checagem: equipar qualquer coisa na Mão
Secundária (ou Escudo) desliga automaticamente o `duasMaosAtivo` de
quem estiver na Mão Principal — senão as duas coisas "disputariam" a
mesma mão sem nenhum aviso. Testado explicitamente (ver abaixo).

**UI:** `MochilaTab.tsx` — arma Versátil equipada na Mão Principal
ganha um botão extra "Empunhar com 2 mãos (XdY)" ao lado dos botões
de slot normais. Texto desatualizado da caixa "Equipado agora"
corrigido de novo (não falava mais em `[PH]`/"dado de exemplo",
estava só desatualizado da E3.2/E3.3).

**Testado:** Playwright 390×844 — Guerreiro nível 1 com Machado de
Batalha (Versátil, 1d8→1d10) na Mão Principal: ligar "2 mãos" fez a
Mão Secundária mostrar "ocupada (arma de 2 mãos)" e o Combat mostrar
"1d10 Cortante ... (empunhada com 2 mãos)" no lugar de 1d8. Equipar a
Adaga na Mão Secundária depois disso desligou o modo 2 mãos do
Machado automaticamente (confirmado lendo o estado salvo no
localStorage, não só a tela).

**Com essa entrega, o Plano de Equipamento (E1-E4) está com E1/E2/E3
completos — só falta E4 (Sintonização), bloqueado até existir dado de
item mágico na planilha.**

**Data/origem:** 2026-08.

## Level Up — dado de vida rolado é definitivo, com pausa dramática em tela cheia

**Problema:** no passo de PV do Level Up, quando o jogador escolhia
"Rolar o dado de vida", um botão "Rolar 1dX 🎲" aparecia DENTRO do
próprio passo — dava pra rolar, ver o resultado, e reclicar no card
"Rolar o dado de vida" (mesmo já selecionado) pra resetar o resultado
e rolar de novo quantas vezes quisesse. Nada travava a escolha.

**Correção — rolagem só acontece ao avançar, e é definitiva.** O
passo PV agora só deixa escolher o MÉTODO (média ou rolar), sem
rolar nada ainda. Ao tocar "Avançar":
- **Média** → segue direto pro próximo passo, sem cerimônia (não tem
  aleatoriedade, não precisa de drama).
- **Rolar** (ainda não rolado) → abre uma tela cheia **preta**,
  cobrindo a tela inteira (sem X, sem fechar por fora — não é o
  `RollOverlay` genérico de combate, que é dispensável por toque no
  fundo) com o dado "girando" por 1,4s (números aleatórios trocando
  rápido, puramente visual) e SÓ ENTÃO rola o valor real e mostra o
  resultado, com um botão "Continuar →" que é a única saída — segue
  pro próximo passo do Level Up.

**Trava definitiva.** Uma vez que `hpRolado` é preenchido, o passo PV
para de mostrar os cards de escolha — mostra só um card fixo
"🎲 Dado de vida rolado — resultado travado" com o valor. Voltar pro
passo PV (via "← Voltar" de qualquer passo seguinte) mostra essa
mesma tela travada — não tem como escolher de novo nem re-rolar. Isso
resolve o pedido do Osmar: "se a pessoa escolheu o dado, acabou".

**Por que não usar o `RollOverlay` genérico (`ui/roll/`)?** Aquele
componente é feito pra ser dispensável (clique no fundo fecha,
"FECHAR" sempre disponível) — o oposto do que essa rolagem precisa
(não pode ser cancelada/fechada sem terminar). Por isso o Level Up
ganhou sua própria tela cheia preta (`LevelUpShell.tsx`, fase
`faseDramatica: 'rolando' | 'resultado'`), sem reusar o overlay
genérico.

**Testado:** Playwright 390×844 — escolher "Rolar", avançar: tela
preta com "ROLANDO 1D10..." e dado girando, depois "RESULTADO" com o
valor rolado + mod. CON + total, botão "Continuar". Voltando pro
passo PV depois: mostra só o card travado, sem cards de escolha.
Escolher "Média" e avançar: pula direto pro próximo passo, sem tela
preta.

**Data/origem:** 2026-08.

## Level Up — ajuste: fechar a tela inteira também não pode resetar o dado rolado

**Problema (achado pelo Osmar testando a entrega acima):** `hpModo`/
`hpRolado` viviam em `useState` local de `LevelUpShell.tsx` — travava
certinho contra reclicar no card ou usar "← Voltar" internamente, mas
"← Voltar" no 1º passo (PV) fecha o Level Up inteiro
(`onFechar` → `setLevelUpAberto(false)`), desmontando o componente.
Reabrir o Level Up depois disso criava uma instância nova, com
`useState` do zero — o valor rolado sumia e dava pra rolar de novo.

**Correção:** `hpModo`/`hpRolado` subiram pra `FichaShell.tsx` como
estado controlado (`levelUpHpModo`/`levelUpHpRolado`, passados como
props + callbacks pro `LevelUpShell`), e entraram no mesmo mecanismo
de auto-save de progresso que já existia (`PersonagemSalvo.levelUpHpModo`/
`levelUpHpRolado`, novos campos opcionais em `armazenamentoPersonagens.ts`).
Agora o rascunho do Level Up sobrevive a: fechar a tela e reabrir,
trocar de aba, e até dar F5 na página — só é zerado quando o Level Up
é **confirmado** de verdade (`confirmarLevelUp`), preparando o
próximo Level Up do zero.

**Testado:** Playwright 390×844 — rolou o dado (resultado salvo no
localStorage confirmado lendo `levelUpHpRolado`), avançou um passo,
voltou até fechar o Level Up inteiro (2× "← Voltar"), reabriu — o
passo PV já mostrou o card travado com o MESMO valor rolado antes,
sem oferecer os cards de escolha de novo.

**Data/origem:** 2026-08.

## Mochila organizada em 4 grupos expansíveis/colapsáveis

**Pedido do Osmar:** a lista plana da Mochila (E1) cresceu demais pra
ficar tudo junto — pediu 4 grupos fixos: **Armas** / **Armadura**
(inclui Escudo) / **Jóias e Artefatos** (anéis, amuletos... hoje sem
dado importado) / **Outros** (tudo mais — comida, kits, tocha...).
Grupo vazio fica invisível, não aparece como cabeçalho sem itens
embaixo.

**Implementação:** `categoriaMochila(nome)` (novo, `core/equipamento.ts`)
reaproveita `identificarEquipamento` (E2) — zero duplicação de regra:
`'arma'` → grupo Armas; `'armadura'`/`'escudo'` → grupo Armadura;
`'generico'` → grupo Outros (por enquanto — ver abaixo). `MochilaTab.tsx`
agora agrupa os itens por categoria antes de renderizar, com um
cabeçalho clicável por grupo (nome + contador + ▾/▸) que expande/
colapsa — estado só local do componente (não precisa persistir, é só
preferência de visualização momentânea, mesmo tratamento de
`itensDetalhados`/`pesoAtivo`).

**"Jóias e Artefatos" fica sempre vazio hoje, de propósito.** Não
existe NENHUM dado de item mágico (anel, amuleto, item maravilhoso)
importado ainda — `categoriaMochila` não tem como diferenciar "Jóias"
de "Outros" sem esse dado, então todo item não-arma/não-armadura cai
em Outros por enquanto. Isso não é bug: é exatamente a régua "grupo
vazio fica invisível" em ação — o grupo existe no código
(`NOME_CATEGORIA_MOCHILA`), só nunca recebe nada até a base de itens
mágicos existir (mesma pendência de sempre, ver E4/Sintonização em
`PENDENCIAS.md`). Quando isso acontecer, `categoriaMochila` ganha o
critério real (provavelmente a categoria "Anel"/"Amuleto"/"Item
Maravilhoso" da planilha de itens mágicos).

**Testado:** Playwright 390×844 — Guerreiro com Espada Grande/Mangual/
Azagaia (grupo Armas, 3 itens), Cota de Malha (grupo Armadura), Kit
de Explorador desagregado + Tocha (grupo Outros): os 3 grupos com
dado apareceram com contador certo, "Jóias e Artefatos" não apareceu
(sem item mágico), colapsar/expandir o grupo Armas escondeu/mostrou
os itens corretamente.

**Data/origem:** 2026-08.

## Itens Mágicos — E4.1: catálogo real importado (E4 deixa de estar bloqueado)

**Descoberta que muda uma decisão anterior.** A entrada "Sistema de
Equipamento — schema de referência" registrava E4 (Sintonização)
como bloqueado "até itens mágicos existirem como dado — ainda não
foram importados na planilha". Isso estava desatualizado: o upload
mais recente da `dnd-master-referencia.xlsx` nesta sessão **tem** a
aba "Itens Mágicos" com 288 itens reais (Nome, Categoria, Raridade,
Sintonização, Efeito Resumido, Página, Fonte). E4 deixa de estar
bloqueado a partir de agora.

**Escopo consciente — só a aba "Itens Mágicos".** A planilha também
tem "Itens Mágicos Inteligentes" (não é catálogo, é só o texto de
regra de como criar um item inteligente — sem tabela por item) e
"Artefatos" (8 itens únicos, superpoderosos, cada um com regra
própria — Cetro de Orcus, Espada de Kas...). Os dois ficam de fora
por ora; só entram se algum dia fizerem falta numa mesa real.

**`data/rulesets/dnd2024/itensMagicos.ts` (novo).** 288 itens,
`ItemMagico { id, nome, categoria, raridade, requerSintonizacao,
sintonizacaoTexto, efeitoResumido, pagina, fonte }`. Gerado por script
Python de uso único (rodado e descartado, mesmo padrão de
`armas.ts`/`armaduras.ts`).

**`requerSintonizacao` é um booleano derivado, não a coluna crua.** A
coluna real "Sintonização" da planilha é texto livre e inconsistente:
"Sim", "não", "Não requer sintonização", "Requer sintonização", "sim
(bardo, clérigo ou druida)", "Opcional (para a propriedade Destruidor
de Gigantes)", etc. — 26 variantes distintas de texto pra "sim" ou
"não". Regra aplicada: **só é `false` quando o texto começa com
"não"/"nao"** (case-insensitive) — qualquer outra coisa (incluindo
"Opcional...", que na prática significa que sintonizar dá um bônus
extra) vira `true`. `sintonizacaoTexto` guarda o texto original
intacto pra qualquer conferência manual depois — a régua do booleano
é propositalmente simples (não tenta capturar "só bardo" ou
"opcional"), fica documentado no cabeçalho do arquivo gerado.
Conferido manualmente: 150 itens exigem Sintonização, 138 não.

**Data/origem:** 2026-08.

## Itens Mágicos — E4.2: Sintonizar/Dessintonizar na Mochila (fecha o Plano de Equipamento)

**O que mudou.** `core/sintonizacao.ts` (novo): `itemExigeSintonizacao(nome)`
cruza o nome do item da Mochila contra `itensMagicos.ts` (E4.1);
`alternarSintonizacao(itens, id)` liga/desliga, travando silenciosamente
quando já há 3 sintonizados (`LIMITE_SINTONIZACAO`) e o item não está
sintonizado ainda — a UI desabilita o botão antes disso acontecer, não
depende só da trava da função. `ItemMochila` ganhou `sintonizado?:
boolean`, persistido pelo mesmo auto-save de sempre (é só mais um
campo dentro do array já salvo).

**UI (`MochilaTab.tsx`):** qualquer item cujo nome bata com um item
mágico que exige Sintonização ganha um botão "✨ Sintonizar" (mesmo
estilo dos botões de Equipar) — vira "✓ Sintonizado" quando ativo, ou
"Sintonização cheia (3/3)" (desabilitado) quando o limite já foi
atingido por outros itens. Nova caixa "Sintonizados agora (X/3)"
acima da lista de Itens, no mesmo padrão visual de "Equipado agora" —
só aparece quando há pelo menos 1 sintonizado (mesma régua de "grupo
vazio invisível" já usada em outros lugares da Mochila).

**Popup do item (ⓘ) ganhou o efeito real.** `buscarDescricaoItem.ts`
passou a indexar `itensMagicos.ts` também — qualquer item da Mochila
cujo nome bata exatamente com o catálogo mostra "Categoria · Raridade
[· exige Sintonização]. Efeito Resumido" no popup, sem precisar de
UI nova (reaproveita o `ItemComDescricao`/`InfoValor` que toda linha
da Mochila já tinha).

**Como testar um item mágico sem uma tela de "receber item" (essa
tela não existe ainda).** "Adicionar item" na Mochila já aceita
qualquer nome digitado — se o nome bater **exatamente** (case-insensitive,
mas os acentos importam) com um dos 288 itens de `itensMagicos.ts`,
ele já é reconhecido automaticamente como mágico, ganha o botão de
Sintonizar e o popup real. Não foi preciso construir uma feature nova
pra "dar" item mágico a alguém — só funciona porque a Mochila já
aceitava nome livre desde a E1.

**Testado:** Playwright 390×844 — 4 anéis/botas que exigem
Sintonização + 1 anel que não exige, todos adicionados via nome exato
(simulando "Adicionar item" manual). Sintonizar os 3 primeiros mostrou
"Sintonizados agora (3/3)"; o 4º item ficou com o botão desabilitado
mostrando "Sintonização cheia (3/3)"; o item que não exige Sintonização
não ganhou botão nenhum; dessintonizar um voltou pra "(2/3)"; o popup
do "Anel de Calor" mostrou "Anel · Incomum · exige Sintonização" + o
efeito real da planilha.

**Com essa entrega, o Plano de Equipamento (E1-E4) está completo.**

**Data/origem:** 2026-08.

## Casters — 3 padrões reais de troca de magia (não é "known vs prepared")

**Decisão:** análise feita em chat paralelo (revisada e aceita) sobre
os 8 conjuradores do jogo (Mago, Clérigo, Druida, Bardo, Feiticeiro,
Bruxo, Guardião, Paladino) antes de implementar a 1ª classe
conjuradora de verdade. Achado central: a troca de magia preparada
tem **3 variações reais**, não a divisão binária comum "known vs
prepared":

- **Padrão A (restritiva):** troca só 1 magia, só ao subir de nível —
  Bardo, Bruxo, Feiticeiro.
- **Padrão B (flexível por descanso):** troca só 1 magia, mas a cada
  Descanso Longo — Guardião, Paladino (meio-conjuradores).
- **Padrão C (redefinição livre):** troca qualquer quantidade, a cada
  Descanso Longo — Clérigo, Druida, Mago (Mago tem ainda uma camada
  extra: só pode preparar o que já está no grimório físico, item da
  Mochila — fora de escopo por ora).

**O que generaliza pras 8, sem exceção:** truque nunca gasta espaço
de magia (sempre lista separada, sempre 1 troca por level-up nas 6
classes que têm truque); espaço de magia é sempre banco por círculo,
recuperando no Descanso Longo — **exceto Bruxo**, que recupera no
Curto também (já confirmado antes); atributo de conjuração é sempre 1
só, fixo por classe (nunca escolha do jogador); CD/bônus de ataque de
magia seguem sempre a mesma fórmula.

**Schema recomendado (ainda não implementado):** `padraoDeTroca`
(`restritiva | flexivel_por_descanso | redefinicao_livre`) +
`gatilhoDeTroca` (`level_up | descanso_longo`) + `qtdTrocavelPorVez`
(`1 | "todas"`) — decide qual UI de troca mostrar, sem hardcode por
classe individual.

**Nova categoria de Level Up identificada:** "troca opcional de magia
preparada por level-up" (padrão A) ainda não existe no motor de Level
Up (que hoje só conhece Guerreiro, não-conjurador) — precisa entrar
como categoria própria quando a 1ª classe conjuradora for feita.

**Ordem de implementação recomendada:** Bardo (padrão A + truques + 9º
círculo completo) → Clérigo ou Druida (padrão C) → Guardião ou
Paladino (padrão B, mais barato depois dos 2 anteriores) → Mago
(grimório físico) → Bruxo (recuperação por Descanso Curto, baixo
esforço a qualquer momento).

**Data/origem:** 2026-08, análise em chat paralelo revisada.

## Bardo — próxima classe a implementar, decupagem completa (base + 4 Colégios)

**Decisão do Osmar:** depois de fechar o Plano de Equipamento (E1-E4),
a próxima classe é **Bardo** (não uma das subclasses de Guerreiro,
já deprioritizadas — ver `PENDENCIAS.md`). Escolhido porque cobre o
padrão A de troca de magia + truques + progressão até 9º círculo, a
combinação mais completa entre os conjuradores (ver decisão "Casters"
acima) — e por escolha pessoal do Osmar (a esposa dele joga Bardo).

**Dados confirmados na planilha mestra** (upload mais recente da
sessão) antes de comprometer o plano: 140 magias com "Bardo" na
coluna Classes (aba Magias); progressão completa nível 1-20 (aba
Progressão de Classe); 13 linhas de característica de classe base +
24 linhas de subclasse cobrindo os 4 Colégios (aba Características de
Classe / Subclasses). Dado existe, é só importar/conectar — mesmo
padrão do Guerreiro (que também já tinha tudo na planilha, só
precisava ser lido).

**As 4 subclasses (Colégios, todas no nível 3) ensinam padrões novos
que o motor ainda não tem:**
- **Colégio da Bravura** — Ataque Extra pode substituir 1 ataque por
  um truque (escolha por instância de ataque, mesma categoria já
  vista no Guerreiro/Mestre Tático); Magia de Batalha dá ataque de
  graça depois de conjurar. Complexidade média.
- **Colégio da Dança** — pacote de 4 efeitos condicionados a "sem
  armadura/escudo", incluindo Defesa sem Armadura própria (`10 + Des
  + Car`) — **3º caso confirmado dessa exceção de CA, e o 1º vindo de
  subclasse, não de classe base** (Bárbaro/Monge são classe). A
  função central de cálculo de CA precisa checar característica ativa
  (classe OU subclasse), não uma lista fixa de 2-3 classes. Golpes
  Ágeis soma Ataque Desarmado de graça ao gastar um dado de
  Inspiração em qualquer ação. Complexidade alta (6 efeitos, mesmo
  recurso, gatilhos diferentes).
- **Colégio do Conhecimento** — Descobertas Mágicas (nível 6) dá
  acesso a 2 magias de **outra classe inteira** (Clérigo/Druida/Mago)
  sempre preparadas — o filtro "Classes contém Bardo" na aba Magias
  **não é suficiente sozinho**, precisa aceitar essa exceção. Perícia
  Inigualável (nível 14) só gasta o recurso se o efeito realmente
  converter falha em sucesso — "reembolso condicional", padrão novo
  de gasto de recurso. Complexidade média.
- **Colégio do Glamour** — magias "sempre preparadas, não contam no
  limite" (precisa de flag `sempreDisponivel: true` por magia, não só
  a lista normal); Manto de Majestade recarrega gastando espaço de
  magia de 3º círculo+ em vez de Inspiração — **1º caso de recurso
  recarregável por 2 fontes alternativas diferentes**. Complexidade
  média-alta.

**Plano de implementação em 5 etapas (adaptado do documento original,
critérios de conclusão testáveis):**
1. **Dados** — filtrar magias de Bardo (coluna Classes) + separar
   Truques (círculo 0) de Magias (círculo 1+). Conferir contagem
   total bate com 140. **Não é filtro simples**: precisa já prever a
   exceção do Colégio do Conhecimento (magia de outra classe) e a
   flag `sempreDisponivel` (Conhecimento/Glamour) — mesmo que essas 2
   coisas só entrem de verdade nas Etapas 2/4, o schema de dado
   inicial já precisa comportar os campos.
2. **Criação de personagem** — wizard filtra 2 truques + 4 magias de
   1º círculo (sugestão do livro: Enfeitiçar Pessoa, Leque Cromático,
   Palavra Curativa, Sussurros Dissonantes). Critério: Bardo nível 1
   criado mostra exatamente 2 truques + 4 magias na Ficha, nada de
   outra classe aparecendo.
3. **Ficha/aba Magias** — suporte a múltiplos círculos simultâneos
   (hoje só existe 1 círculo, prototipado pro fixture do Bruxo).
   Critério: Bardo nível 5 (dado fixo, sem passar pelo Level Up ainda)
   mostra 3 círculos com pips corretos.
4. **Level Up** — truques/magias/espaços crescem por tabela; nova
   categoria "troca opcional de magia preparada" (padrão restritivo,
   só 1 por vez, ver decisão "Casters" acima). Critério: subir 1→2→3
   pelo fluxo real, ver a lista crescer e a troca aparecer no nível
   certo.
5. **Combat** — "Usar Magia" já existe (Bruxo), só listar as magias
   preparadas reais do Bardo em vez de fixture, e generalizar o gasto
   de espaço pra N círculos independentes. Critério: conjurar 1ª
   círculo gasta só o pip daquele círculo.

**Subclasses (Colégios) ficam pra depois da base**, mesma ordem já
usada com Guerreiro (base completa primeiro, subclasses depois) — mas
diferente do Guerreiro, aqui a decisão de seguir ou não pras
subclasses de Bardo será tomada quando a base estiver pronta e
testada, não presumida de antemão.

**Data/origem:** 2026-08, decupagem em chat paralelo revisada e
validada contra a planilha mestra real.

## Bardo — Etapa 1 (Dados) feita: núcleo, características e catálogo de magias

**O que foi importado:**
- `data/rulesets/dnd2024/classes.ts` — entrada completa de Bardo
  (Carisma, d8, DES+CAR, subclasse no nível 3), com os "Espaços de
  Magia" modelados como **9 `RecursoClasse` separados (1 por
  círculo)** em vez de 1 recurso com sub-tabela — reaproveita o schema
  genérico já existente (`RecursoClasse`) sem precisar de um novo, e
  cada círculo recupera no Descanso Longo, igual aos outros casters.
- `data/rulesets/dnd2024/caracteristicasClasse.ts` — 12 características
  reais de Bardo (base, sem subclasses). Duas células tinham o mesmo
  problema de extração já documentado pro Guerreiro (tabela/lista
  inteira colada dentro do texto): "Conjuração" (nível 1) trazia a
  tabela de progressão inteira colada no meio; "Palavras de Criação"
  (nível 20) trazia a lista completa de 140 magias de Bardo colada no
  fim. Limpas mantendo o parágrafo de regra real intacto.
- `data/rulesets/dnd2024/magias.ts` (novo) — **catálogo completo de
  390 magias** (não só as de Bardo) — decisão consciente de importar
  tudo de uma vez, não por classe, porque (a) o schema já vem com
  `classes: string[]` pronto pra qualquer classe futura reaproveitar
  sem reimportar, e (b) resolve de graça a exceção do Colégio do
  Conhecimento (acesso a magia de Clérigo/Druida/Mago), que já está
  no mesmo catálogo. `magiasDaClasse(nome, circulo?)` filtra por
  classe (e opcionalmente círculo). Confirmado: 140 magias de Bardo
  (13 truques + 127 de 1º-9º círculo).

**Qualidade de dado conhecida, não bloqueante:** a coluna "Descrição
Completa" da aba Magias tem pelo menos 1 caso confirmado (Badalar
Fúnebre) com um trecho de OUTRA magia colado no meio da frase — mesmo
tipo de problema de extração da planilha, mas na aba Magias em vez de
Características. Não foi viável revisar célula por célula as 390
magias nesta entrega — `descricaoCurta` (coluna já curada) é a fonte
preferida pra exibir em UI compacta; `descricaoCompleta` fica como
está, com o problema documentado. Registrado em PENDENCIAS.md.

**Testado:** script de sanidade rodado direto contra os arquivos
gerados (não é UI, não precisa de Playwright): `magiasDaClasse('Bardo')`
retorna 140 magias (13 truques); `classes.find(id==='bardo')` existe;
nível 3 tem 6 Magias Preparadas e 2 Espaços de 2º Círculo (bate com a
tabela oficial); 12 características de Bardo carregadas.

**Próximo passo (Etapa 2):** wizard filtra 2 truques + 4 magias de 1º
círculo na criação — ainda não implementado, essa entrega foi só os
dados.

**Data/origem:** 2026-08.

## Ícones novos (emblema redondo) substituem os estandartes na tela de Classe

**Decisão:** o Osmar subiu 2 novos ícones em formato de emblema redondo
(dourado/bronze, moldura ornamentada) — Guerreiro (espada) e Bardo
(alaúde) — pra substituir o estandarte alto/estreito antigo na tela
"1. Classe" do wizard. Mesmo arquivo (`{id}-banner.png`), mas exibido
na caixa quadrada padrão (`.opt-card-img-emblema`, ~56-110px) em vez
da caixa alta (`.opt-card-img-banner`) — o formato redondo cabe melhor
nela.

**Classes sem emblema próprio ainda usam uma cópia do emblema do
Guerreiro como placeholder** (as 10 restantes: Bárbaro, Bruxo,
Clérigo, Druida, Feiticeiro, Guardião, Ladino, Mago, Monge, Paladino)
— aparecem cinza/desativadas porque já ficam dentro do card "em
breve" (`btn-disabled`, opacidade 0.35), não precisou de tratamento
visual extra. Trocar pelo emblema real de cada classe assim que
existir — é só substituir o arquivo, o código não muda.

**Bardo corrigido pra `disponivel: false` (achado ao mexer nisso).**
A Etapa 1 (dados) do Bardo tinha deixado `disponivel: true` por engano
— e `ClasseStep.tsx` **nunca filtrava por esse campo** (só Origem e
Espécie filtravam; funcionava por acaso enquanto só existia 1 classe
no array). Corrigidos os dois: Bardo virou `disponivel: false` (wizard
ainda não sabe criar um Bardo de ponta a ponta — falta a Etapa 2), e
`ClasseStep.tsx` agora filtra `classes` por `disponivel` como as
outras telas já faziam, mostrando classes com dado real mas ainda não
prontas ("em breve" com nome/emblema reais) separadas da lista
hardcoded `CLASSES_EM_BREVE` (que agora só cobre as 10 sem dado
nenhum ainda).

**Testado:** Playwright 390×844 — Guerreiro aparece selecionável com
o emblema de espada; Bardo aparece "em breve" com o emblema de
alaúde (cinza); as outras 10 aparecem "em breve" com o emblema de
espada reaproveitado (cinza).

**Data/origem:** 2026-08.

## Bardo — Etapa 2 (Criação de personagem) feita: wizard completo de ponta a ponta

**Bardo virou `disponivel: true`** — o wizard já cria um Bardo nível 1
completo: perícias, ferramentas, truques, magias preparadas e
equipamento inicial, tudo real.

**Achado ao implementar — "Escolhas da Classe" tinha 3 acoplamentos
implícitos a Guerreiro** que só não quebravam antes porque Guerreiro
era a única classe:
1. `MAX_PERICIAS = 2` era uma constante fixa no componente, não lida
   de `proficiencias.periciasEscolha.quantidade` (Bardo escolhe 3).
2. A seção "Estilo de Luta" era renderizada incondicionalmente — Bardo
   não tem essa característica. Corrigido pra usar
   `temEstiloDeLutaTrocavel(classe, 1)` (já existia, criado no
   Guerreiro, só não estava sendo reaproveitado aqui).
3. `WizardShell.tsx`'s `isValid` do passo travava exigindo
   `estiloDeLutaEscolhido !== null` sempre — mesmo bug, mesma correção.

**Dados novos transcritos do Cap. 3 do Livro do Jogador (PDF que o
Osmar já tinha enviado, "Bárbaro a Feiticeiro" — cobre Bardo)**, mesma
exceção documentada de `classesProficienciasIniciais.ts`: Bardo
escolhe **3 perícias quaisquer** (não uma lista curta como Guerreiro —
`opcoes` virou as 18 perícias do jogo), **3 Instrumentos Musicais**
(proficiência de ferramenta — campo novo `ferramentasEscolha`,
reaproveita `gruposFerramenta['Instrumento Musical']` que já existia
pra Origem), e equipamento inicial com só 2 opções (A: Armadura de
Couro + 2 Adagas + Instrumento à escolha + Kit de Artista + 19 PO; B:
90 PO), diferente do A/B/C do Guerreiro.

**`WizardSelection` ganhou 3 campos novos:** `ferramentasClasseEscolhidas`,
`truquesEscolhidos`, `magiasPreparadasEscolhidas`. O item "Instrumento
Musical à sua escolha" do equipamento inicial é substituído pelo
primeiro instrumento escolhido (`ferramentasClasseEscolhidas[0]`) na
hora de montar a Mochila — mesmo mecanismo de placeholder que Origem
já usava (`PLACEHOLDERS_FERRAMENTA`), reaproveitado.

**Truques/Magias Preparadas na criação usam `magiasDaClasse` (E4.1 do
Plano de Equipamento, catálogo de 390 magias já existia) filtrado por
círculo** — truques = círculo 0, magias preparadas iniciais = só 1º
círculo (regra do livro: "escolha quatro magias de 1º círculo"; a
lista cresce e aceita círculos maiores só no Level Up, ainda não
implementado — Etapa 4). Contadores lidos de `valorRecursoClasse`
(genérico, já existia) em vez de constante fixa.

**Ainda não faz nada na Ficha** — Magias/Combat da aba de jogo
continuam mostrando fixture/`[PH]` pra qualquer classe (isso é Etapa
3+); esta entrega só garante que a CRIAÇÃO funciona de ponta a ponta.

**Bundle JS cresceu bastante (604KB → 1,13MB) com a entrada do
catálogo de 390 magias** (`descricaoCompleta` de cada uma, texto
bruto do livro, embutido no JS carregado inteiro na primeira visita).
Não é usado em nenhuma UI ainda (só `descricaoCurta` é exibida) —
possível otimização futura (não decidida agora): parar de embutir
`descricaoCompleta` no bundle principal, ou aplicar code-splitting.
Registrado em PENDENCIAS.md, não bloqueou esta entrega.

**Testado:** Playwright 390×844 — criei um Bardo de ponta a ponta pelo
wizard real (incluindo o botão 🔀 de sortear), confirmando: Estilo de
Luta ausente, "Perícias — escolha 3", "Ferramentas — escolha 3",
"Truques — escolha 2", "Magias Preparadas — escolha 4" todos
aparecendo certos; personagem salvo no armazenamento com os dados
reais (3 perícias, 3 ferramentas, 2 truques reais de Bardo, 4 magias
de 1º círculo reais, equipamento A). Abri a Ficha desse Bardo: Perfil
mostra CA/PV/perícias corretos com Carisma (herdado de graça do motor
de cálculo genérico); Mochila mostra o instrumento escolhido (ex.:
"Alaúde") no lugar do placeholder "Instrumento Musical"; Magias e
Combat carregam sem quebrar (ainda fixture, como esperado).

**Data/origem:** 2026-08.

## Marcação de duplicidade (Perícias) e iconografia de Magias (ataque/cura/custo) — só na criação

Portado do "outro modelo" (versão anterior do app do Osmar,
`rjunior0710.github.io`), a pedido dele — 2 recursos de UX que já
existiam lá:

**1. Marcação de duplicidade.** Aviso não-bloqueante quando uma
escolha do wizard já foi concedida em outra etapa. Escopo confirmado
com o Osmar: **só a criação de personagem por enquanto** — a Ficha
precisaria de uma abordagem diferente (não é escolha, é revisão de
personagem já pronto), fica pra depois. Hoje a única sobreposição
real e alcançável no wizard é **Perícia da Origem × Perícia da
Classe** (ex.: Bardo pode escolher livremente entre as 18 perícias do
jogo, então qualquer Origem cujas 2 perícias fixas colidam com o que
já foi escolhido na Classe deve avisar). Espécies com truque/magia
concedida por traço (Alto Elfo → Prestidigitação Arcana, Drow → Luzes
Dançantes, etc.) existem na planilha mas nenhuma está `disponivel:
true` ainda — não há hoje um 2º caso real de duplicidade de
Talento/Truque/Magia alcançável no wizard. Ver PENDENCIAS.md pro
ponto de extensão.

Implementação: `core/duplicidadeSelecao.ts` exporta `nomesDuplicados(
...grupos: string[][]): Set<string>` — genérica, conta nomes únicos
por grupo e marca quem aparece em 2+ grupos. Como a ordem real do
wizard é **Classe (com Perícia) → Origem** (não o contrário — ver
`WizardShell.tsx`), o aviso não faz sentido nos checkboxes de Perícia
da Classe (a Origem ainda não foi escolhida nesse ponto — sempre
`null`). Em vez disso, o aviso aparece nos **cards de Origem**
(`OrigemStep.tsx`): cada card calcula `nomesDuplicados(
selection.periciasClasseEscolhidas, origem.pericias)` e, se houver
sobreposição, ganha borda tracejada `var(--warn)` (classe
`.opt-card-duplicada`) + texto "⚠️ X já escolhida na Classe" abaixo da
descrição. Escolher aquela Origem continua permitido — é só aviso.

**2. Iconografia de Magias.** ⚔️ ataque / ❤️‍🩹 cura / 🪙 componente com
custo em PO — podem aparecer sozinhos ou combinados na mesma pill de
Truque/Magia Preparada da criação. `core/classificarMagia.ts` exporta
`classificarMagia(magia): {ataque, cura, custoComponente}`, heurística
por regex em cima de `descricaoCurta` (coluna curada, não
`descricaoCompleta` — que tem problema de conteúdo colado documentado
no cabeçalho de `magias.ts`) e `componentes`:
- `ataque`: `/\bataques?\b[^."]{0,30}:/i` — captura os marcadores
  formais do livro ("Ataque corpo a corpo:", "Ataque à distância:",
  "Ataque:"), maiúscula ou minúscula (varia se a frase é o início da
  descrição ou está no meio, ex. depois de parêntese) — confirmado
  por amostra da planilha.
- `cura`: `/\bcura(m)?\b/i` OU (`recupera(m)? + todo/metade/dígito`,
  removendo antes qualquer trecho "não recupera..." — evita falso
  positivo em magias que negam cura, ex. "não recupera PV" do Toque
  do Vampiro).
- `custoComponente`: `/\d+[^.)]{0,20}\b(po|pp|pc)\b/i` — precisa de um
  número antes da sigla de moeda dentro de uma janela curta (não
  exclui frases como "no valor de 100 ou mais PO", que é o padrão real
  da planilha), sem casar menção solta a moeda sem custo (ex. "um fio
  de cobre", sem número, não marca).

**Aceito explicitamente pelo Osmar que a heurística pode errar
ocasionalmente** ("vamos seguir, se aparecer erros, nós corrigimos") —
não é regra de mecânica, é só ajuda visual pra achar magia mais rápido.
Testado contra a amostra real da planilha (Bardo, ~36 magias entre
truques e 1º círculo) sem falso positivo/negativo encontrado nos casos
verificados manualmente.

**Testado:** Playwright 390×844, fluxo completo Classe (Bardo) →
Perícias (Intuição/Religião/Atuação, colidindo de propósito com
Acólito/Andarilho/Artista/Sábio) → Ferramentas → Truques → Magias
Preparadas → Equipamento → Origem. Confirmado: ⚔️/❤️‍🩹/🪙 aparecem nas
pills certas (ex. Palavra Curativa → ❤️‍🩹, Identificar → 🪙); ao chegar
em Origem, os 4 cards com Perícia colidente mostram a borda tracejada
`--warn` + texto de aviso; escolher a Origem mesmo assim continua
funcionando.

**Data/origem:** 2026-08.

## Card padronizado pra magia/truque (MagiaComDescricao) — mesmo formato sempre

Também portado do "outro modelo", a pedido do Osmar (junto com a
marcação de duplicidade e os ícones de magia da entrega anterior). Em
vez do popup genérico (`ItemComDescricao`, só nome + texto corrido),
`MagiaComDescricao` fixa o formato pra qualquer magia/truque: Nome,
Tipo (Truque ou "Xº Círculo"), toggle Desc. curta/longa, Tempo de
Conjuração + Alcance, Componentes, Duração, e a descrição em si.

Regras confirmadas com o Osmar:
- **Campo em branco fica escondido** — `null`/vazio não aparece como
  linha vazia (ex.: se não tiver Componentes, a linha some).
- **O toggle Desc. curta/Desc. longa só aparece se as duas existirem
  E forem diferentes** — se forem o mesmo texto (ou uma faltando),
  mostra só a descrição direto, sem o par de botões.

Escopo desta entrega: só Magias (única classe conjuradora pronta é
Bardo, único lugar que usa isso hoje é Truques/Magias Preparadas da
criação). Replicar esse padrão de card fixo pra Itens
Comuns/Mágicos/Armas/Armaduras é pendência registrada em
PENDENCIAS.md — cada tipo teria campos próprios (Arma: Dano/
Propriedades/Maestria, por exemplo), não é o mesmo card reaproveitado
1:1.

**Data/origem:** 2026-08.

## Bardo — Etapa 3.1 (Ficha, aba Magias) feita: dado real no lugar do fixture de Bruxo

Aba Magias da Ficha usava fixture fixo de Bruxo (1 círculo, recupera no
Descanso Curto — errado pra Bardo). Trocado por dado real:

- `core/magiasPersonagem.ts` (novo): `espacoDeMagiaAtivo(classe, nivel)`
  lê os 9 recursos "Espaços de Magia — Xº Círculo" de `classes.ts` e
  retorna o círculo ativo (o de menor número com espaço > 0 nesse
  nível) + se recupera no Descanso Curto (lido do `recuperaEm` real do
  recurso, não mais assumido). `truquesDoPersonagem`/
  `magiasPreparadasDoPersonagem` buscam os nomes escolhidos no wizard
  (`selecao.truquesEscolhidos`/`magiasPreparadasEscolhidas`) no
  catálogo completo de magias.
- **Limitação conhecida, aceita por ora:** só existe UM círculo ativo
  de cada vez hoje — suficiente porque Bardo nível 1 (único nível
  alcançável sem a Etapa 4, que ainda não existe) só tem 1º círculo.
  Se `espacoDeMagiaAtivo` algum dia encontrar 2+ círculos com espaço >
  0 simultaneamente (só possível depois que Level Up souber crescer
  Truques/Magias/Espaços — Etapa 4), ele retorna só o de menor
  círculo. Registrado como pendência, não bloqueou esta entrega.
- `FichaShell.tsx`: `gastarSlot`/`descansoCurto` usam o máximo e a
  regra de recuperação reais em vez da constante fixa de fixture
  (`espacosMagiaExemplo`). Descanso Curto só reseta Espaços de Magia
  se o recurso realmente recupera nele (Bardo não recupera — só no
  Longo).
- `MagiasTab.tsx`: cada Truque/Magia Preparada usa o card novo
  (`MagiaComDescricao`) — nome sublinhado abre o popup com Tempo/
  Alcance/Componentes/Duração/Descrição de verdade.

**Fora desta entrega (fica pra Etapa 3.2):** o painel "Usar Magia" da
aba Combat (Ação e Reação) ainda usa fixture de Bruxo com "Escudo
Arcano" — não existe pra Bardo, decidir isso é maior que essa entrega.

**Testado:** Playwright 390×844 — wizard completo (Classe Bardo
manual, resto sorteado) → Salvar → abri a Ficha → aba Magias mostra
Espaços de Magia reais (1º círculo, 2/2, "recupera no Descanso
Longo"), Truques e Magias Preparadas reais (nomes/escolas/círculos
batendo com o que foi sorteado na criação), popup de magia abre com
os campos certos.

**Data/origem:** 2026-08.

## Lista de Personagens usa o emblema da Classe no lugar do 👤 genérico

A pedido do Osmar: enquanto o upload de imagem de avatar não existe de
verdade (só um placeholder na tela de Resumo do wizard, agora marcado
`[PH]`), a Lista de Personagens preenche o espaço de avatar com o
emblema redondo da Classe do personagem — a mesma arte já usada na
tela de escolher Classe do wizard.

`IconeClasse` (componente que já existia dentro de `ClasseStep.tsx`)
virou compartilhado (`ui/components/IconeClasse.tsx`) pra poder ser
reaproveitado aqui sem duplicar a lógica de `import.meta.glob` dos
arquivos `-banner.png`. `CharacterList.tsx` busca o `id` da classe do
personagem em `classes.ts` pelo nome salvo e passa pro componente; sem
classe reconhecida (não deveria acontecer, mas por segurança), cai de
volta no 👤 antigo.

**Espaço do avatar aumentado** (48px → 64px) a pedido do Osmar, já que
o emblema é uma arte bonita e merece aparecer bem — `object-fit: cover`
preenche a caixa quadrada sem distorcer.

**Data/origem:** 2026-08.

## Bardo — Etapa 3.2 (Ficha, Combat "Usar Magia") feita: dado real no lugar do fixture de Bruxo

Painel "Usar Magia" da aba Combat (Ação e Reação) usava fixture de
Bruxo — trocado por dado real, junto com a Etapa 3.1 (aba Magias).

- **Painel de Ação:** lista os Truques + Magias Preparadas reais do
  personagem (excluindo as de Tempo de Conjuração "Reação" — essas só
  aparecem no painel de Reação). Tocar numa magia de círculo > 0 gasta
  Espaço de Magia (mesmo `gastarSlot` já usado na aba Magias); se não
  tiver espaço, mostra aviso, sem travar a UI. Cada linha mostra os
  ícones de `classificarMagia` (⚔️/❤️‍🩹/🪙) e abre o card
  `MagiaComDescricao` pelo ⓘ.
- **Ataque de magia:** se a magia for classificada como `ataque`
  (`classificarMagia().ataque`), tocar nela já rola 1d20 + bônus de
  acerto de conjuração (mod. do atributo primário + bônus de
  proficiência — novo `core/magiasPersonagem.ts`'s
  `modAcertoConjuracao`), igual já acontece pro ataque de arma. O
  **dano não é rolado automaticamente** — a planilha não tem os dados
  de dano estruturados por magia (só a descrição em texto livre), só
  `descricaoCurta`/`descricaoCompleta`; o jogador vê o dado de dano no
  card (ⓘ) e rola manualmente. Diferente do ataque de arma, que tem
  dado/dano estruturado em `core/ataque.ts`.
- **Painel de Reação:** só mostra a seção de magia se existir alguma
  Magia Preparada real com Tempo de Conjuração começando com "Reação"
  (`ehMagiaDeReacao`, novo). Bardo nível 1 normalmente não tem nenhuma
  — nesse caso o painel mostra só "Ataque de Oportunidade", sem mais o
  "Escudo Arcano" fixo (que era Bruxo-específico e não existe pra
  Bardo).
- **Simplificação aceita:** magias com Tempo de Conjuração "1 Ação
  Bônus" (poucas — 6 no catálogo inteiro) continuam aparecendo no
  painel de Ação por enquanto, não no de Ação Bônus (`BonusPanelContent`
  ainda não tem integração de magia — fora do escopo desta entrega).
  Registrado em PENDENCIAS.md.
- `data/exampleCombat.ts`: removido o fixture `magiasExemplo`/
  `espacosMagiaExemplo` (não usado em lugar nenhum depois desta
  entrega) — só sobrou `acoesBase` (as 9 ações genéricas do Cap. 1,
  que são regra real, não fixture) e o tipo `AtaqueInfo` (ainda usado
  pro ataque de arma).

**Testado:** Playwright 390×844 — Bardo criado, aba Combat → painel de
Ação → "Usar Magia" mostra Truques/Magias Preparadas reais com ícones
certos (ex.: "Curar Ferimentos" com ❤️‍🩹); tocar num truque não-ataque
gasta 0 espaço e mostra a descrição real no feedback; painel de Reação
mostra só "Ataque de Oportunidade" (sem "Escudo Arcano" fixo).

**Data/origem:** 2026-08.

## Combate — Reação vira botão baixo/compacto, não mais mesmo tamanho de Ação/Bônus

Ajuste pedido pelo Osmar sobre o Layout C: Ação e Ação Bônus continuam
lado a lado, tamanho grande (76px, ícone empilhado). Reação virou uma
barra horizontal baixa (`--touch-target-min`, ícone+nome+estado numa
linha só) embaixo das outras duas — usada com bem menos frequência
numa sessão normal de mesa, não precisa do mesmo destaque visual.
Comportamento (estado ativo/usada, painel deslizante de baixo) não
mudou, só o tamanho/formato do botão-gatilho.

**Cogitado e descartado nessa conversa:** adicionar uma 4ª categoria
"Grátis" (ações que não gastam nenhum dos 3 recursos — trocar de arma
equipada, etc.), numa grade 2×2. Osmar decidiu não seguir por ora —
prefere manter só as 3 categorias já existentes, com a Reação só
menor. Se "ações grátis" virar necessidade real de novo, reabrir como
proposta nova (a planilha precisaria mapear quais ações realmente são
grátis — não é regra pra inventar de memória).

**Data/origem:** 2026-08.

## Inspiração de Bardo plugada no Combat (painel de Bônus)

Achado do Osmar: Inspiração de Bardo existia só como característica
exibida (InfoChip), sem contador de usos nem botão de uso — diferente
de Recuperar Fôlego/Indomável/Surto de Ação (Guerreiro), que já tinham
esse tratamento completo desde antes.

**Regra confirmada na planilha** (característica "Inspiração de
Bardo" + "Fonte de Inspiração", não assumida de memória): usos = mod.
de Carisma (mínimo 1) — **não** é uma tabela por nível como os outros
recursos (só o TAMANHO do dado cresce por nível: d6→d8→d10→d12). Por
isso ganhou um arquivo próprio, `core/inspiracaoBardo.ts`, em vez de
reaproveitar `valorRecursoClasse` (que só lê tabela). Restaura no
Descanso Longo; a partir do nível 5 ("Fonte de Inspiração", já
detectável genericamente via `caracteristicaDesbloqueada`), também no
Curto, e ganha a opção extra "gastar 1 Espaço de Magia (sem ação) pra
recuperar 1 uso".

**UI:** painel de Ação Bônus (`BonusPanelContent.tsx`) ganhou a seção
de Inspiração, mesmo padrão visual de Recuperar Fôlego (pips + linha
clicável). Usar Inspiração marca a Ação Bônus do turno como "usada"
(gasta a Ação Bônus de verdade, regra do livro: "Como uma Ação
Bônus..."); a opção de recuperar com Espaço de Magia NÃO marca nada
como usada (é "sem ação necessária", conforme o texto da própria
característica) e só some quando 1) não tem Espaço de Magia sobrando
ou 2) não tem uso gasto pra recuperar.

**Sem rolagem automática do dado** — diferente de Recuperar Fôlego
(que já cura sozinho): a Inspiração de Bardo é concedida a OUTRA
criatura, que decide quando/se rola o dado (até 1h depois, só quando
falhar um teste). O botão só consome o uso e mostra o texto de
lembrete; não faz sentido "rolar" nada no momento da concessão.

**Testado:** Playwright 390×844 — Bardo nível 1 (CAR sem bônus, então
1 uso, d6, sem Fonte de Inspiração ainda) → painel de Bônus mostra
"Inspiração de Bardo (d6): 1/1 disponíveis" → usar marca a Ação Bônus
como "usada" e mostra o feedback correto.

**Data/origem:** 2026-08.

## Bardo — Etapa 4.1 (Level Up de Truques) feita

Truques Conhecidos agora crescem/trocam de verdade no Level Up, em vez
de ficar congelados no que foi escolhido na criação.

**Design da interação** (discutido com o Osmar antes de codar): **uma
lista só, um step só** — não um fluxo de "adicionar" separado de um
fluxo de "trocar". A tela mostra o catálogo completo de Truques da
classe, pré-marcado com os que o personagem já conhece (tag "· já
conhece" ao lado da escola), limite de seleção = o máximo do NOVO
nível. Isso resolve os 2 casos de regra com a mesma interação:
- **Cresceu** (2→3 no nível 4): a lista já vem com 2 marcados; o slot
  vazio força marcar +1 antes de avançar — "adicionar" sai de graça da
  validação de contagem.
- **Não cresceu** (a maioria dos níveis): já está no máximo, não
  precisa mexer pra avançar; se quiser, pode desmarcar 1 antigo +
  marcar 1 novo — isso já É a "troca" que o livro permite a cada
  nível, sem UI própria pra "modo troca".

**Validação da troca** (pergunta do Osmar: como garantir só 1 trocado,
não vira bagunça): comparo a lista FINAL com a ORIGINAL (o que já
tinha antes desse level-up) e conto quantos dos originais **sumiram**
da seleção final (`contarTrocas`, `core/magiasPersonagem.ts`). Regra:
- 0 removidos → só cresceu (ou nada mudou). OK.
- 1 removido → 1 troca. OK (exatamente o que o livro permite).
- 2+ removidos → bloqueia avançar, aviso "só pode trocar 1 truque por
  level-up".

A contagem de "quantos precisam ser adicionados" não tem lógica
própria — sai de graça da álgebra: como o total final é sempre travado
no novo máximo, (adicionados − removidos) sempre bate com o quanto a
tabela cresceu naquele nível. Só a trava de "no máximo 1 removido"
precisa de checagem explícita.

**Mudança estrutural que isso trouxe:** `selecao.truquesEscolhidos`
(campo de `WizardSelection`, imutável — retrato da criação) não é mais
a fonte de verdade dos truques atuais do personagem. `FichaShell.tsx`
ganhou `truquesAtuais` (estado próprio, `PersonagemSalvo.truquesAtual`
persistido) — mesmo padrão já usado pra `maestriaArmaAtual`/
`estiloDeLutaAtual`/`itensMochilaAtual` (retrato de criação + estado
pós-criação em cima). `truquesDoPersonagem()` (`core/magiasPersonagem.ts`)
mudou de assinatura — recebe `string[]` direto, não mais
`WizardSelection` — porque agora tem 2 fontes possíveis (criação OU
Level Up) e não faz sentido a função saber de qual.

**Fora desta entrega:** Magias Preparadas (Etapa 4.3) e Espaços de
Magia com múltiplos círculos simultâneos (Etapa 4.2) — o Bardo de
teste chegou ao nível 4 com Magias Preparadas ainda travadas nas 4 da
criação (Etapa 4.3 ainda não feita); Espaços de Magia (1º círculo)
já cresce sozinho porque `espacoDeMagiaAtivo` já lia a tabela real
desde a Etapa 3.1, não precisou de mudança.

**Testado:** Playwright 390×844 — Bardo criado → Level Up nível 2
(Truques "escolha 2 (2/2)", já satisfeito, passa direto) → nível 3
(sem step de Truques nesse nível específico — tabela não cresce e a
troca opcional não foi testada aqui) → nível 4 (Truques "escolha 3
(2/3)", bloqueado até escolher +1; escolhido "Amigos"; aviso de
bloqueio some depois de corrigir) → aba Magias confirma os 3 truques
reais (2 antigos + 1 novo) e Espaços de Magia em 4/4 (tabela do nível
4, sem mudança de código).

**Data/origem:** 2026-08.

## Level Up de Truques — marcação "já tinha"/"será removido" fica visível mesmo desmarcado

Achado do Osmar testando a Etapa 4.1: se o jogador desmarcava os 2
truques que já tinha (pra testar/explorar a lista), perdia a
referência de quais eram — só um texto pequeno cinza ("· já conhece")
ao lado, fácil de sumir no meio de uma lista de 13 itens, e ele
precisava ficar testando até achar de novo.

**Fix:** a marcação de "já tinha" agora é uma borda colorida na linha
inteira (`check-row`), não só texto — e ela **não desaparece quando
desmarcado**: continua vindo de `truquesAtuais` (a lista de ANTES
desse Level Up, congelada durante todo o fluxo — só vira a nova base
quando o Level Up é confirmado), não do estado mutável da seleção
atual. 2 estados visuais pros truques que já eram do personagem:
- **Ainda marcado** (não mexeu, ou desmarcou e marcou nele de novo):
  borda azul (`--accent`) + "· já tinha".
- **Desmarcado agora** (sendo removido): borda âmbar (`--warn`) +
  fundo levemente tingido + "· 🔻 será removido" — deixa explícito que
  aquilo é uma ação de remoção, não uma caixa vazia igual as que nunca
  foram dele.

Truques que nunca foram do personagem continuam sem marcação nenhuma.
Nenhuma mudança de mecânica/validação — só deixa impossível perder a
referência visualmente.

**Testado:** Playwright 390×844 — Bardo nível 4, desmarcou os 2
truques originais (Proteção Contra Lâminas, Zombaria Perversa) — as
duas linhas continuaram com borda âmbar + "será removido" visível o
tempo todo, mesmo com as caixas vazias; aviso de "só pode trocar 1"
seguiu bloqueando corretamente.

**Data/origem:** 2026-08.

## Combat — 3 ajustes rápidos (cor de remoção, título do painel, switch Detalhes)

Pedidos do Osmar testando o Level Up e o Combat:

1. **Marcação "será removido" (Level Up de Truques) vira vermelha, não
   amarela.** Regra de cor confirmada: amarelo/`--warn` fica reservado
   pra aviso/criticidade (ex.: "só pode trocar 1 truque"); qualquer
   ação de remover/apagar usa vermelho/`--danger` — mesmo padrão já
   usado no botão de apagar personagem (`CharacterList.tsx`).
2. **Título dos painéis de Combat perde o "— escolha uma"** — "⚔
   Ação", "⚡ Bônus", "🛡 Reação", sem sufixo.
3. **Switch "Detalhes" novo**, entre o título e a lista de cada painel
   (Ação/Bônus/Reação) — liga/desliga o texto explicativo de cada
   linha (`rowDesc`). Ligado por padrão (comportamento de sempre).
   Desligado, o texto some, **exceto** a informação essencial de
   arma/Ataque Desarmado (dado de dano, tipo, mãos, alcance/munição —
   ex.: "1d8 Perfurante · Duas Mãos, Munição..."), que o Osmar pediu
   pra manter sempre visível porque o jogador precisa saber isso na
   hora de atacar. Implementado separando, nas linhas de ataque
   (arma e mão secundária), o texto essencial (`ataqueAtual.descricao`/
   `ataqueBonus.descricao` — já vem assim de `core/ataque.ts`, sem
   floreio) da frase explicativa extra (regra de Ataque Extra/Leve
   nas duas mãos/etc.), que aí sim é escondida com o switch.
   `SidePanel.tsx` ganhou o switch (reaproveitando o mesmo padrão
   visual do menu de preferências do avatar); estado vive em
   `CombatTab.tsx` (sessão, não persiste — mesmo padrão de
   `itensDetalhados`/`pesoAtivo` da Mochila).

**Testado:** Playwright 390×844 — painel de Ação do Guerreiro, switch
ligado mostra tudo, desligado esconde todo texto exceto "Soco, chute
ou golpe corpo a corpo sem arma. Dano Contundente." no Ataque
Desarmado; título confirmado sem "escolha uma".

**Data/origem:** 2026-08.

## Bardo — Etapa 4.2 (Espaços de Magia multi-círculo) feita

Espaços de Magia passam a rastrear TODOS os círculos ativos ao mesmo
tempo — antes só existia 1 círculo simultâneo possível
(`espacoDeMagiaAtivo`, singular), o que funcionava enquanto o único
nível alcançável era 1-2 (só 1º círculo do Bardo), mas quebrava a
partir do nível 3, quando o 2º círculo desbloqueia SEM substituir o
1º (os dois ficam ativos ao mesmo tempo, cada um com seu próprio
contador de espaços gastos/máximo).

- `core/magiasPersonagem.ts`: `espacoDeMagiaAtivo` (retornava só o
  círculo de menor número) virou `espacosDeMagiaAtivos` (retorna a
  lista completa, ordenada por círculo).
- `FichaShell.tsx`: `espacosGastos` (1 número) virou
  `espacosGastosPorCirculo` (`Record<círculo, gasto>`).
  `gastarSlotCirculo(circulo)` é a operação primitiva agora; ganhou
  também `gastarQualquerSlot()` (usa o de menor círculo com espaço
  sobrando) pra ações que gastam "1 Espaço de Magia" sem se importar
  de qual círculo (ex.: recuperar Inspiração de Bardo com Fonte de
  Inspiração). Descanso Longo reseta todos os círculos; Descanso Curto
  só os que têm `recuperaNoDescansoCurto` (nenhum caso real ainda no
  Bardo, mas já fica certo se aparecer).
- **Migração de personagem salvo antes dessa entrega:** campo antigo
  `espacosGastos` (número único) é lido só na inicialização do estado
  e convertido pro círculo que já estava ativo na época — nunca mais
  escrito depois disso (documentado como `@deprecated` em
  `armazenamentoPersonagens.ts`).
- `MagiasTab.tsx`: um bloco de pips por círculo ativo (título "1º
  círculo", "2º círculo"...), cada um com seu próprio "X/Y
  disponíveis".
- Combat "Usar Magia" (`AcaoPanelContent`/`ReacaoPanelContent`): o
  contador de espaço também virou 1 linha por círculo; cada magia
  preparada gasta o espaço do círculo DELA MESMA (sem upar de círculo
  — regra separada, não implementada, registrada em PENDENCIAS.md).

**Testado:** Playwright 390×844 — Bardo criado, Level Up até nível 3 →
aba Magias mostra 2 blocos simultâneos (1º círculo 4/4, 2º círculo
2/2) → Combat "Usar Magia" mostra os mesmos 2 contadores independentes
→ conjurei uma magia de 1º círculo, confirmei que só o 1º círculo
desceu (3/4) e o 2º ficou intacto (2/2).

**Data/origem:** 2026-08.

## Bardo — Etapa 4.3 (Level Up de Magias Preparadas) feita — plano dos 5 fecha

Magias Preparadas ganharam o mesmo tratamento de Level Up já feito
pros Truques na Etapa 4.1: cresce e troca no mesmo step, mesma
validação ("no máximo 1 removido"), mesma marcação visual persistente
("já tinha" / "🔻 será removida" vermelho). Reaproveitado quase 1:1 —
`core/magiasPersonagem.ts`'s `contarTrocas` já era genérico o
suficiente pra servir os dois casos sem mudar nada nele.

**Diferença real em relação aos Truques:** o catálogo pra escolher não
é fixo — cresce junto com os círculos de Espaço de Magia disponíveis
no NOVO nível (Etapa 4.2, já pronta). `LevelUpShell.tsx` calcula
`circuloMaximoNovoNivel` via `espacosDeMagiaAtivos(classe, novoNivel)`
e filtra o catálogo completo (`magiasDaClasseDisponiveis`, passado
pronto de `FichaShell` — todas as magias de círculo > 0 da classe) por
`circulo <= circuloMaximoNovoNivel`. Ex.: Bardo nível 3 já pode
escolher magias de 1º OU 2º círculo (a regra do livro confirmada na
característica "Conjuração": "sua lista de magias preparadas pode
incluir seis magias de 1º ou 2º círculo em qualquer combinação").

**Mesma mudança estrutural de `truquesAtuais` (Etapa 4.1) repetida
aqui:** `selecao.magiasPreparadasEscolhidas` (retrato da criação,
imutável) não é mais a fonte de verdade — `FichaShell.tsx` ganhou
`magiasPreparadasAtuais` (estado próprio, persistido em
`PersonagemSalvo.magiasPreparadasAtual`). `magiasPreparadasDoPersonagem()`
mudou de assinatura pra receber `string[]` direto, mesma razão de
`truquesDoPersonagem`.

Com isso, os 5 passos do plano original do Bardo (Dados, Criação,
Ficha/Magias, Level Up completo, Combat) estão feitos — só faltam as 4
subclasses, que continuam deliberadamente fora de escopo até decisão
em contrário.

**Testado:** Playwright 390×844 — Bardo criado, Level Up nível 2 e 3
seguidos. Nível 2: step "Magias Preparadas — escolha 5 (4/5)" força
escolher +1. Nível 3: "escolha 6 (5/6)" — confirmado que o catálogo já
oferece **25 opções de 2º círculo** nesse ponto (antes só existiam
opções de 1º), junto das de 1º círculo com a marcação "já tinha"
correta. Personagem final mostra 6 Magias Preparadas reais na aba
Magias.

**Data/origem:** 2026-08.

## Detector de déficit de Truques/Magias Preparadas + tela "Completar"

**Achado do Osmar:** se um Level Up passar sem escolher Truques/Magias
Preparadas (bug, ou personagem que subiu de nível antes dessa
funcionalidade existir), a ficha fica "atrasada" em relação à tabela
da classe — e não havia como perceber isso nem corrigir, porque a
tela de escolha só aparecia DURANTE a transição de nível.

**Decisão — comparação simples, não mecanismo genérico:**
`core/magiasPersonagem.ts` ganhou `deficitTruques()` e
`deficitMagiasPreparadas()`: `valorRecursoClasse(classe, <recurso>,
nivel)` (quanto a tabela da classe diz que deveria ter NO NÍVEL ATUAL)
menos o tamanho da lista atual, nunca negativo. `MagiasTab.tsx` mostra
uma linha de aviso (vermelha, `--danger` — mesma convenção de
"problema na ficha" já usada pro "🔻 será removida" do Level Up,
distinto do `--warn` âmbar reservado pra validação bloqueante) sempre
que o déficit é maior que zero, mesmo se a seção "Truques"/"Magias
Preparadas" estivesse vazia (mudou a condição de exibição da seção de
`lista.length > 0` pra `lista.length > 0 || deficit > 0`).

**Tela "Completar" (`levelup/CompletarMagiasShell.tsx`) — nova,
deliberadamente diferente do step de Level Up:** reaproveita os
estilos de `LevelUpShell.module.css` (mesmo `.screen`/`.header`/
`.body`/`.navLayer`/`.pill`/`.truqueAtual`), mas **não permite
remover nada** — os itens que o personagem já tem ficam travados
(`toggle()` ignora clique neles), só dá pra adicionar até fechar
exatamente o déficit. Diferente do Level Up (que permite trocar 1),
porque isso não é uma escolha de subida de nível — é só preencher uma
lacuna que já deveria estar preenchida. Catálogo de Magias Preparadas
usa o círculo máximo do NÍVEL ATUAL (`espacosDeMagiaAtivos(classe,
nivel)`), não do nível seguinte como no Level Up.

**Registrado como pendência maior (ver `PENDENCIAS.md`):** o Osmar
pediu explicitamente pra isso virar um mecanismo genérico depois
("tenho certeza que vamos descobrir coisas no caminho") — essa entrega
resolveu só o caso de Truques/Magias Preparadas, por decisão dele
("por enquanto vamos revisar as magias").

**Testado:** Playwright 390×844 — Bardo criado nível 1 via wizard,
nível forçado pra 6 direto no `localStorage` (simulando o bug
descrito), reload. Aba Magias mostrou os 2 avisos ("Faltam 1 truque" e
"Faltam 6 magias preparadas pro seu nível"), cada um levando pra
`CompletarMagiasShell` com os itens atuais marcados "já tinha" e
travados (clique neles não faz nada) e o botão Confirmar desabilitado
até preencher a conta exata. Depois de completar os dois, os avisos
somem e as listas mostram os itens novos junto dos antigos. Reload da
página confirma que a correção persiste (`truquesAtual`/
`magiasPreparadasAtual` salvos). Aba Combat testada em seguida sem
nenhuma regressão.

**Data/origem:** 2026-08.

## Listas de Truques/Magias Preparadas agrupadas por círculo, colapsáveis

**Achado do Osmar:** nas telas de escolha (Level Up e a tela "Completar"
que detecta déficit), a lista de magias vinha toda misturada — Truques,
1º círculo, 2º círculo etc. sem separação, difícil de escanear numa
lista de 20+ opções.

**Decisão:** `core/magiasPersonagem.ts` ganhou `agruparMagiasPorCirculo()`
— agrupa por círculo (0 = "Truques", N = "Nº Círculo"), grupos em ordem
crescente, magias dentro de cada grupo em ordem alfabética
(`localeCompare` com locale `pt-BR`, pra acentuação correta). Componente
novo `ui/components/GrupoMagiaColapsavel.tsx` — cabeçalho clicável com
nome + contador (mesmo padrão visual de `.grupoHeader` já usado nos
grupos da Mochila) que expande/colapsa a lista abaixo; recebe a lista de
magias do grupo e uma função de renderização por linha (render-prop),
já que cada tela (Level Up truques/magiasPreparadas, tela Completar)
marca cada linha de um jeito diferente ("já tinha", "será removido",
"travado") e não fazia sentido forçar isso dentro do componente de
agrupamento.

**Aplicado nos 3 lugares que usam essa lista** (por pedido explícito do
Osmar, mesmo sendo 3 entregas técnicas numa só): step "Truques" do Level
Up (vira 1 grupo só, "Truques (N)", mas com o mesmo cabeçalho por
consistência visual), step "Magias Preparadas" do Level Up (aqui é onde
o agrupamento faz diferença de verdade — círculos diferentes ficam
separados), e a tela "Completar" (déficit) pros dois casos.

**Testado:** Playwright 390×844 — Bardo nível 4, step Truques mostra
"Truques (13)" com Amigos/Fagulha Estelar/Golpe Certeiro/Ilusão
Menor/Luz/... em ordem alfabética; clique no cabeçalho colapsa (lista
some, seleção marcada continua intacta) e reexpande. Bardo nível 2→3,
step Magias Preparadas mostra "1º Círculo (23)" com Amizade
Animal/Comando/Compreender Idiomas/... alfabético, marcações "já tinha"
preservadas. Tela Completar (déficit de Truques) também mostra "Truques
(13)" com o mesmo agrupamento.

**Data/origem:** 2026-08.

## Ordem descendente por círculo + cabeçalho fixo em Magias Preparadas + erros de seleção sempre vermelhos

**3 ajustes pedidos pelo Osmar depois de testar a entrega anterior:**

**1. Ordem dos grupos:** `agruparMagiasPorCirculo()` (`core/magiasPersonagem.ts`)
inverteu a ordenação — agora começa pelo círculo mais alto disponível e
desce até Truques (círculo 0) por último. Motivo: o jogador normalmente
está de olho no círculo que acabou de destravar no level-up, não no 1º.

**2. Cabeçalho fixo específico da Magias Preparadas:** o título
"Magias Preparadas — escolha N (X/N)" e o texto de regra saíram de
dentro do corpo rolável (`.body`, onde sumiam ao rolar a lista) e viraram
um bloco fixo (`.subHeader`, novo em `LevelUpShell.module.css`) entre o
cabeçalho principal (Nível/progresso) e a lista — mesmo em CSS Modules
comum, não `position: sticky`, porque o layout já é flex-coluna com
`.body` como única área rolável (`overflow-y: auto`), então um irmão
fora dela já fica sempre visível sem precisar de sticky. Pedido só pra
esse step (não pro de Truques) — texto perdeu a frase final "— não
precisa mexer se não quiser." por pedido direto.

**3. Cor de erro de seleção:** todo aviso que representa uma seleção
inválida/incompleta impedindo avançar (não um aviso informativo) virou
`--danger` (vermelho) em vez de `--warn` (âmbar) — revisão da convenção
registrada na entrega anterior ("`--warn` reservado pra
aviso/criticidade"). Isso muda: o balão fixo "Escolha exatamente X
antes de avançar" (`.warning` em `LevelUpShell.module.css` E
`WizardShell.module.css` — mesmo componente, os dois tinham a cópia
própria da classe), os avisos inline "N trocados — só pode trocar 1"
(Truques e Magias Preparadas do Level Up), e os avisos "Sem Espaço de
Magia disponível" nos painéis de Ação/Reação do Combat. **Não mudei**
a borda tracejada `--warn` da Origem (colisão de Perícia — aviso
informativo, não bloqueia nada) nem os usos estruturais de `--warn`
sem ligação com erro (botão de Ação Bônus no Combat, indicador visual
do CombatTab).

**Testado:** Playwright 390×844 — Bardo nível 4→5 (Level Up), Magias
Preparadas mostra "3º Círculo (18)" primeiro, depois "2º Círculo (25)",
depois "1º Círculo (23)" — confirmado via DOM que a ordem é essa mesma
sequência. Cabeçalho fixo confirmado (rolar a lista não move o texto
"Magias Preparadas — escolha 9 (4/9)"). Provocado erro de "2 trocadas"
em Truques e em Magias Preparadas — balão fixo e texto inline aparecem
vermelhos nos dois casos.

**Data/origem:** 2026-08.

## Bardo — Especialista (dobra Bônus de Proficiência em 2 perícias, níveis 2 e 9)

**Achado de dado ao implementar:** a planilha mestra nomeia a
característica como "Especialista" na coluna de progressão do nível 2,
mas como "Especialização" no nível 9 — nomes diferentes pra mesma
mecânica (confirmado com o Osmar antes de codar). `core/levelUp.ts`
ganhou `niveisComEspecialista(classe)`, que aceita os dois nomes em vez
de assumir que a característica sempre se chama igual em todo nível que
a concede — mesmo cuidado já registrado antes pra "Ataque Extra"/"Dois
Ataques Extras" etc.

**Decisão de arquitetura:** o "+2 perícias por gatilho" não vem de uma
coluna numérica em `classes.ts` (diferente de Truques Conhecidos/Magias
Preparadas, que têm tabela por nível) — é só texto na descrição da
característica ("duas... mais duas"). Por isso `LevelUpShell.tsx` usa
um incremento fixo de 2 hardcoded (comentado explicando a razão), em
vez de tentar ler de uma tabela que não existe pra esse dado.

**Mecânica — só ADIÇÃO, nunca troca:** diferente de Truques/Magias
Preparadas (que podem substituir 1 por level-up), a regra real não
menciona troca pra Especialista — uma vez escolhida, a perícia fica
especializada pra sempre. O step novo (`step === 'especialista'` em
`LevelUpShell.tsx`) trava as perícias vindas de um nível anterior
(mesmo padrão de "já tinha" de Truques, mas sem opção de desmarcar) e
só deixa escolher a diferença até bater o novo total.

**Cálculo:** `calcularPericias()` (`core/calculoPersonagem.ts`) ganhou
o parâmetro opcional `periciasEspecialista: string[]` — dobra o Bônus
de Proficiência (não o mod. de atributo) nas perícias marcadas, com a
explicação do popup ⓘ mostrando "Bônus de Proficiência (Especialista,
dobrado)". `PericiaFinal` ganhou o campo `especialista: boolean`, usado
por `PerfilTab.tsx` só pra acender um ⭐ ao lado do nome — a lista
completa das 18 perícias/3º estado visual genérico continuam de fora
(pendência separada, já registrada).

**Persistência:** `PersonagemSalvo.periciasEspecialistaAtual`, mesmo
padrão de `truquesAtual`/`magiasPreparadasAtual`.

**Testado:** Playwright 390×844 — Bardo nível 1→2 (Level Up). Truques
já estava no máximo do nível (2/2, sem interação), Magias Preparadas
pediu +1 (preenchido), Especialista mostrou "escolha 2 (0/2)" com as 5
perícias proficientes do personagem (Acrobacia, Percepção, Persuasão,
Atletismo, História — Origem + Classe). Tentativa de avançar vazio deu
erro vermelho; escolhidas Acrobacia e Percepção, resumo mostrou a linha
"Especialista → Acrobacia, Percepção". Depois de confirmar, aba Perfil
mostrou as duas com ⭐ e o bônus dobrado certo (Acrobacia mod DES +2 +
bônus dobrado +4 = +6; Percepção mod SAB +1 + bônus dobrado +4 = +5;
as outras 3 perícias sem ⭐, bônus normal).

**Data/origem:** 2026-08.

## Perfil — lista completa das 18 Perícias, marcador de proficiência, Pau pra Toda Obra, Bônus de Proficiência visível

**Fecha a pendência "Ficha/Perfil — Perícias mostram só as proficientes"** registrada desde o Especialista.

**Decisão de marcador visual:** ⚫ (proficiente) / ⚪ (sem proficiência)
antes do nome, ⭐ extra pra Especialista — o Osmar pediu emoji de
círculo preto/branco em vez de caractere puro (mais fácil de bater o
olho no celular). `core/calculoPersonagem.ts`'s `calcularPericias`
agora sempre itera as 18 `pericias` (não mais só as proficientes) e
`PericiaFinal` ganhou `proficiente: boolean` — `especialista` já
existia da entrega anterior.

**Pau pra Toda Obra implementado junto** (característica real de Bardo
nível 2, já tinha o dado na planilha, só não estava ligada): metade do
Bônus de Proficiência (arredondado pra baixo) nas perícias SEM
proficiência. Detectado via `caracteristicaDesbloqueada(classe, 'Pau
pra Toda Obra', nivel)` — mesmo helper genérico já usado por outras
características, sem hardcode de Bardo no cálculo em si. Prioridade do
bônus por perícia: Especialista (dobrado) > proficiente (inteiro) >
Pau pra Toda Obra (metade) > nenhum.

**Bônus de Proficiência virou linha própria** ("Bônus de Proficiência
+X") logo abaixo do título "Perícias" — mais simples que encaixar
numa 4ª caixa no grid de PV/CA/Iniciativa (que é fixo em 3 colunas).

**Rolar dado já funcionava pra todo mundo** — o `onClick` do
`.skillRow` sempre foi genérico (`rolarD20` com o `p.mod` calculado),
então assim que as 18 perícias passaram a vir preenchidas com o mod
certo (incluindo +0 ou metade de bônus), o dado passou a funcionar
igual pras não-proficientes sem precisar mexer na função de rolagem.

**Testado:** Playwright 390×844 — Bardo nível 1: 18 linhas de perícia
+ "Bônus de Proficiência +2" + Percepção Passiva, todas com ⚫/⚪
corretos, não-proficientes mostrando só o mod. do atributo (Pau pra
Toda Obra ainda não desbloqueado). Level Up pro nível 2 (que também
concede Pau pra Toda Obra, junto do Especialista): não-proficientes de
DES/INT/CAR subiram exatamente +1 (metade de +2, arredondado pra
baixo) — ex. Acrobacia foi de +1 pra +2, Enganação de +1 pra +2. Popup
ⓘ de uma perícia não-proficiente confirmado mostrando "Metade do Bônus
de Proficiência (Pau pra Toda Obra, arredondado pra baixo) +1" na
conta.

**Data/origem:** 2026-08.

## Bug: popup de PV na Ficha mostrava só o dado do nível 1

**Achado do Osmar:** o número grande de PV na Ficha (`pvAtual/pvMax`)
sempre esteve certo (soma tudo, cresce a cada Level Up), mas o popup ⓘ
ao lado usava `explicarPvMaximoNivel1()` direto — função pensada só
pro resumo do wizard na CRIAÇÃO (nível 1, antes de qualquer Level Up
existir). Na Ficha, isso mostrava sempre só "Dado de Vida + mod. CON"
do nível 1, nunca o que foi ganho depois.

**Decisão:** nova função `explicarPvMaximo(selection, pvMaxAtual)` —
mesma base do nível 1, mais uma linha "Ganho em Level Ups seguintes"
com a diferença pro `pvMaxAtual` real (só aparece se for > 0). Não dá
pra detalhar nível a nível (o histórico de quanto cada Level Up deu
não fica guardado, só o total acumulado em `PersonagemSalvo.pvMax`),
então a linha soma tudo de uma vez — mais honesto que fingir que tem
detalhe que não existe. `explicarPvMaximoNivel1()` original continua
intocada e em uso só no resumo do wizard (nível 1 é sempre o caso real
lá).

**Testado:** Playwright 390×844 — Guerreiro nível 1: popup mostra só
"Nível 1 (d10 + mod. CON) = 11" (sem linha de ganho, correto pra
personagem recém-criado). Level Up pro nível 2 (ganhou +7 de PV):
popup passa a mostrar "Nível 1 → 11" + "Ganho em Level Ups seguintes →
+7" + total "18", batendo com o número grande da tela.

**Data/origem:** 2026-08.

## Menu inferior vira 5 abas: Atributos / Perfil (nova) / Mochila / Magias / Combate

**Decisão:** a antiga aba "Perfil" (atributos, PV/CA/Iniciativa,
perícias, descanso, maestria em arma) foi renomeada pra **"Atributos"**
(`AtributosTab.tsx`, era `PerfilTab.tsx` — arquivo renomeado, conteúdo
idêntico). O nome "Perfil" foi liberado pra uma aba nova de verdade:
lista as habilidades REAIS do personagem, na ordem Classe → Origem →
Espécie, cada uma como card não-interativo (mesmo padrão `.opt-card`
já usado no step "Características desbloqueadas" do Level Up — zero
componente novo). "Combat" no rótulo virou "Combate" (só o texto, id
interno continua `combat`).

**Classe:** `core/levelUp.ts` ganhou `caracteristicasAcumuladas(classe,
nivelAtual)` — roda `caracteristicasDoNivel` do nível 1 até o atual e
deduplica por nome (características repetidas em vários níveis, tipo
Indomável/Surto de Ação, só contam +1 uso — não viram card duplicado).
Diferente de `caracteristicasDoNivel` (só 1 nível, usada no Level Up
pra mostrar "o que ganhei AGORA"), essa é "tudo que já tenho".

**Origem:** busca o `Talento de Origem` real (`talentosOrigem.ts` via
`origem.talentoOrigemId`) — nome + benefícios reais, com a variante
quando existir (ex. "Iniciado em Magia (Clérigo)").

**Espécie:** os `traços` reais da espécie (`especies.ts`), já vêm
prontos com nome+descrição, sem precisar de lookup.

**Testado:** Playwright 390×844 — barra de 5 abas cabe sem cortar
(largura exata do viewport, sem overflow horizontal), rótulos legíveis.
Aba Perfil de um Anão Bardo mostrou "Classe — Bardo" (Inspiração de
Bardo + Conjuração, descrições completas), "Origem — Fazendeiro"
(Vigoroso: PV máximo +2x nível...), "Espécie — Anão" (Visão no Escuro,
Resistência a Toxinas, Tenacidade Anã, Conhecimento de Pedras) — os 4
traços reais do Anão. Aba Combate confirmada funcionando sem regressão
depois da renomeação do rótulo.

**Data/origem:** 2026-08.

## Escolha de subclasse — versão placeholder (só troca o ícone, sem mecânica)

**Pedido do Osmar:** subiu os 4 ícones dos Colégios de Bardo (arte
nova) e pediu pra Lista de Personagens usar o ícone da subclasse
escolhida em vez do ícone genérico da classe — "forma mais evoluída"
do avatar. Mas a escolha de subclasse em si nunca foi implementada de
verdade (o step "Escolha de Subclasse" do Level Up sempre foi um
placeholder estático, sem persistir nada).

**Decisão — escolha "de mentirinha" por enquanto, explícita:** em vez
de esperar a implementação completa das 4 subclasses (características
mecânicas, decupagem já documentada mas não codada), o step do Level
Up agora deixa escolher entre os 4 Colégios reais e SALVA o nome
escolhido (`PersonagemSalvo.subclasseAtual`) — mas com aviso `[PH]`
explícito na tela ("Escolha ainda não implementada de verdade — só
guarda o nome... nenhuma característica mecânica existe ainda"), regra
12 do CLAUDE.md. Registrado em PENDENCIAS.md como pendência clara do
que falta pra virar de verdade.

**Dado novo:** `data/rulesets/dnd2024/subclasses.ts` — só
`{id, classeId, nome}`, sem características (isso vem depois). `id`
bate 1:1 com o arquivo `{id}-banner.png` em `assets/icones-classes/`
(reaproveita o mesmo componente `IconeClasse` e o mesmo glob de
lookup — nenhum componente novo precisou ser criado).

**Prioridade do ícone na Lista de Personagens** (`CharacterList.tsx`),
pedida pelo Osmar: imagem própria do jogador (`[PH]` — upload ainda não
existe) > ícone da subclasse da classe de maior nível > ícone da
classe de maior nível > empate de nível, classe mais atual. Hoje só
existe 1 classe por personagem (sem multiclasse), então as duas
últimas regras de desempate não têm o que desempatar ainda — a
implementação já ficou pronta pra quando multiclasse existir, sem
precisar reescrever a lógica de prioridade.

**Testado:** Playwright 390×844 — Bardo nível 2→3 (Level Up, nível que
desbloqueia subclasse). Step "Escolha de Subclasse" mostrou os 4
Colégios reais com o aviso `[PH]` em âmbar. Escolhido "Colégio da
Dança", confirmado o Level Up — Lista de Personagens passou a mostrar
o ícone do dançarino (antes mostrava o emblema genérico de Bardo).
`localStorage` confirmado com `subclasseAtual: "Colégio da Dança"`
persistido.

**Data/origem:** 2026-08.

## Ícones de classe/subclasse viram WebP (compressão, ~82% menores)

**Achado do Osmar:** os ícones 512×512 (Bardo + 4 Colégios novos)
deixaram o bundle bem mais pesado — perguntou se dava pra comprimir
sem precisar reimportar as artes originais.

**Decisão:** convertidos de PNG pra WebP (`Pillow`, qualidade 85,
`method=6`) — mesma resolução 512×512, ~82% menores (ex.: Bardo
435KB → 81KB; os 4 Colégios ficaram entre 82-89KB cada, contra
452-474KB em PNG). PNG puro com `optimize=True` (lossless) quase não
ajudou (~3-4%) — a arte gerada por IA já vinha perto do limite de
compressão sem perda; WebP com perda leve (qualidade 85) foi a troca
que realmente valeu, sem degradação visível no tamanho de emblema
exibido (~64px na Lista, ~48-72px nos cards de seleção).

**`IconeClasse.tsx`** — único lugar que referenciava esses arquivos —
trocou o glob de `*.png` pra `*.webp`; resto do componente (lookup por
`{id}-banner.webp` / `{id}.webp`) idêntico, zero mudança de API.

**Achado no processo:** Vite deduplica arquivos de conteúdo
idêntico no build — as 10 classes "em breve" (cópias do emblema do
Guerreiro) e o Guerreiro real acabam virando FISICAMENTE 1 arquivo só
no `dist/` (nome do hash reflete só uma delas), então o ganho real de
espaço no app publicado já era menor do que a soma ingênua dos 16
arquivos sugeria — mas a compressão ainda ajuda bastante nos arquivos
que são conteúdo único (Bardo + 4 Colégios).

**Testado:** Playwright 390×844 — comparação visual direta do arquivo
WebP isolado (sem UI por perto) confirma nitidez igual ao original.
Um "ícone quebrado" aparente na tela de seleção de Classe foi
investigado a fundo (`elementFromPoint`) e identificado como o botão
flutuante 🔀 ("Sortear tudo desta etapa") renderizado sem fonte de
emoji colorida neste ambiente de teste headless — nada a ver com a
troca de formato; confirmado pelo próprio Osmar.

**Data/origem:** 2026-08.
