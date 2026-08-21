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

**Pendência conhecida:** hoje o jogador escolhe livremente quais 3
atributos recebem o ajuste. Por regra, deveria travar nos 3 atributos que
o antecedente específico indica — isso ainda não está ligado ao dado real
de antecedente.

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
