# DECISOES-FICHA.md

> Decisões de design sobre a **Ficha do personagem** fora do
> Combat — abas Perfil/Atributos/Mochila/Magias, Loja, Equipamento,
> Itens Mágicos, Level Up (overlay em cima da Ficha), auto-save.
> Parte da família `DECISOES-*.md` — ver o índice em
> `DECISOES-DESIGN.md` pra saber em qual arquivo procurar cada
> assunto, e a seção 7 do `CLAUDE.md` pra regra de quando
> registrar uma entrada aqui.

---

## Descansos — pertencem à aba Perfil, não à aba Combat

**Decisão:** botões de Descanso Curto/Longo ficam na aba Perfil.

**Contexto:** inicialmente estavam na aba Combat junto com as ações de
turno, mas descanso não é uma ação de turno — é algo que acontece entre
ou depois de combates. Misturar os dois confundia o propósito da aba
Combat (que deveria ser só "o que eu faço agora, no meu turno").

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

## Aba Magias ganha conjuração de verdade (não só a aba Combat)

**Decisão:** a lista de Truques/Magias Preparadas na aba Magias virou
uma grade de 3 colunas — Nome | Círculo (ou "Truque") | botão "Usar" —
em vez de nome + escola/círculo como texto solto sem ação nenhuma.
"Usar" reaproveita o mesmo mecanismo já construído pro painel de Ação
do Combat: truque conjura na hora (sem gastar espaço); magia de
círculo 1+ abre `EscolherCirculoShell` (a mesma Tela 3 do Combat, com
upcast real) antes de gastar o espaço. Rola ataque de magia via
`RollContext` (contexto global, funciona em qualquer aba) quando
`classificarMagia(m).ataque` for true, exatamente como o Combat já
fazia.

**Contexto:** pedido do Osmar — o jogador pode querer conjurar uma
magia fora do fluxo estrito de turno de combate (ex: uso utilitário
no meio da campanha), e a aba Magias existia só como catálogo de
leitura, sem nenhuma ação de verdade.

**Reuso, não duplicação:** `EscolherCirculoShell` já vivia em
`ui/ficha/combat/` mas não tem nada específico de Combat — é só um
componente de UI que recebe `magia`/`espacos`/callbacks, então
`MagiasTab.tsx` importa direto de lá em vez de duplicar o componente.
`gastarSlotCirculo` (função de `FichaShell.tsx`) e `modAcertoConjuracao`
já existiam pro Combat — só precisaram ser passados como prop novo pra
`MagiasTab` também.

**O que NÃO mudou:** o painel de Ação do Combat continua com seu
próprio fluxo de 2 telas (`SelecionarMagiaShell` + `EscolherCirculoShell`)
pra listar/filtrar — a aba Magias não precisa da 1ª tela porque já
lista tudo direto (não tem problema de rolagem infinita ali, a lista já
existe agrupada por Truques/Preparadas).

**Testado:** Playwright 390×844, Bardo nível 5. Layout de 3 colunas
confirmado. "Usar" numa magia preparada de 1º círculo abriu a Tela 3
com os 3 círculos disponíveis (upcast); escolhido 1º círculo, o pip
correspondente ficou gasto (4/4 → 3/4) e persistiu. "Usar" num truque
não-ofensivo (Zombaria Perversa — na real é magia de salvaguarda, não
de ataque, `classificarMagia` corretamente não rolou nada) não abriu
popup nenhum, como esperado pra truque.

**Data/origem:** 2026-08.

