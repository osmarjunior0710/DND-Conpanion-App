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
