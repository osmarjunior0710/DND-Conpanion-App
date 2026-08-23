# PENDENCIAS.md

> Marcadores de "vamos voltar aqui depois". Diferente do
> `DECISOES-DESIGN.md` (que registra o que já foi decidido), este arquivo
> registra o que **ainda não foi resolvido** — coisas adiadas de propósito
> pra não travar uma entrega, mas que precisam ser retomadas em algum
> momento.
>
> Regra de uso: sempre que adiar uma decisão ou implementação "pra depois"
> durante uma entrega, registre aqui — o que é, por que foi adiado, e o
> que falta pra resolver. Ao resolver algo desta lista, mova a entrada pra
> `DECISOES-DESIGN.md` (como decisão tomada) e remova daqui.

---

## Motor de cálculo da Ficha final ainda não existe (spec pronta pra Entrega A)

**O que é:** uma auditoria completa de criação de personagem (feita com
apoio do Claude, chat separado) comparou passo a passo o que o wizard
faz hoje contra a regra oficial. Conclusão principal: **quase nada
disso é "está errado"** — é que a Ficha final ainda não tem motor de
cálculo nenhum (`core/` não existe, `ResumoStep.tsx` só tem um cálculo
solto de PV que nem chega a ser salvo em lugar nenhum — ver pendência
"Motor de cálculo/armazenamento da Ficha" que já discutimos). Esta
entrada é a especificação do que essa Entrega A precisa cobrir, já
verificada contra a planilha onde dava pra verificar:

**Já confirmado correto, não precisa mexer:**
- Ordem: array padrão de atributos é distribuído **antes** do ajuste de
  origem (+1/+1/+1) — já assim no wizard.
- Fórmula de modificador `floor((valor - 10) / 2)` — já implementada em
  `modFmt`/`valorFinalAtributo`.
- Idiomas: "2 à escolha" é regra fixa (planilha não tem coluna de
  idioma em Origem/Espécie pra variar) — ver DECISOES-DESIGN.md.

**Fórmulas que a Entrega A (motor de cálculo) precisa implementar:**
1. **PV máximo** (nível 1): `dado de vida MÁXIMO da classe + mod. CON`
   (nunca rola nem faz média no nível 1 — isso só entra a partir do
   nível 2, no level-up).
2. **CA:** ver decisão "Cálculo de CA — Bárbaro e Monge têm regra
   própria" no `DECISOES-DESIGN.md` — função centralizada, checa
   exceção de classe antes da fórmula padrão por categoria de armadura.
   Precisa dos dados de Armas/Armaduras (ainda não importados — mesma
   pendência de popup de descrição já registrada).
3. **Percepção Passiva:** `10 + mod. SAB + Bônus de Proficiência (SE
   proficiente em Percepção)` — hoje o protótipo solto só soma mod. SAB,
   sem checar proficiência.
4. **Iniciativa:** `mod. DES` (nenhuma das 12 classes dá bônus extra no
   nível 1, não é exceção a tratar agora).
5. **Bônus de Ataque de Magia / CD de Magia** (só classes conjuradoras):
   `mod. do atributo de conjuração + Bônus de Proficiência` (ataque) e
   `8 + mod. do atributo de conjuração + Bônus de Proficiência` (CD). O
   atributo de conjuração já está implícito no `atributoPrimario` de
   cada classe.
6. **Ouro inicial** (pra tela de Loja): soma do que Classe + Origem
   concederam — se a opção escolhida foi "só ouro" (Opção B de Origem,
   Opção C de Classe), soma o valor cheio; se foi opção com itens, soma
   o campo `ouro` residual daquele pacote (ex: Guerreiro Opção A tem 4
   PO restantes). Hoje a Loja usa itens fixos de exemplo, não calcula
   nada disso.
7. **Itens no inventário:** itens de Origem + Classe + Loja precisam
   aparecer juntos na Mochila, cada um com a tag `origemDoItem` (decisão
   já registrada, ainda não implementada de verdade).

**Checklist de coisas que só fazem sentido depois de mais classes/dados
existirem** (não travam a Entrega A, testar quando chegar a vez):
- Kit inicial de Classe somando ao inventário certo (Guerreiro já dá
  pra testar assim que a Mochila ligar em dado real).
- Sub-escolha de Espécie não perguntar de novo no level-up
  (`linhagem_com_progressao_magica`) nem aparecer no wizard
  (`escolha_reutilizavel`) — só relevante quando essas espécies forem
  desbloqueadas (ainda "em breve").
- Traços vinculados à sub-escolha (ex: dano do Ataque de Sopro do
  Draconato) resolvidos em tempo de leitura — mesma condição acima.

**Data/origem:** 2026-08, auditoria completa feita antes de começar a
Entrega A (armazenamento + motor de cálculo).

## Faltam 11 classes (só Guerreiro importado)

**O que é:** Guerreiro foi a classe-piloto (mais simples: sem magia,
sem subclasse até nível 3). As outras 11 (Bárbaro, Bardo, Bruxo,
Clérigo, Druida, Feiticeiro, Guardião, Ladino, Mago, Monge, Paladino)
ficam "(em breve)" na lista de Classe do wizard.

**O que falta pra resolver:** pra cada classe nova, repetir o mesmo
processo do Guerreiro — 1) importar núcleo + progressão da planilha
(`classes.ts`), 2) importar características por nível da planilha
(`caracteristicasClasse.ts`), 3) conferir se a planilha já tem tudo que
a classe precisa (verificar se sub-recursos tipo "Fúrias" do Bárbaro
seguem o mesmo formato de "Bônus de X: N" na coluna "Recursos da
Classe"), 4) pedir/usar o PDF do Cap. 3 pra proficiências e equipamento
inicial de classe (mesma exceção documentada usada no Guerreiro).
Guardião e Paladino compartilham a tabela de conjuração (ver
DECISOES-DESIGN.md) — importar uma vez só quando chegar a vez delas.

## Características de Guerreiro nos níveis 2, 5, 20 tiveram texto de tabela removido na importação

**O que é:** na planilha, as descrições de "Mente Tática" (nível 2),
"Ataque Extra" (nível 5) e "Três Ataques Extras" (nível 20) vêm com a
tabela "Características de Guerreiro" colada dentro do texto da célula
(problema de extração do PDF pra planilha). Removi o trecho colado ao
importar pra `caracteristicasClasse.ts`, mantendo só o parágrafo de
regra — não afeta a ficha nível 1 (nenhuma dessas é nível 1), mas é
bom checar se o mesmo tipo de vazamento aparece em outras classes
quando forem importadas.

**O que falta pra resolver:** nada urgente — só ficar atento ao mesmo
padrão de vazamento de tabela ao importar as próximas 11 classes, e
avisar o Osmar se a aba "Características de Classe" tiver esse problema
espalhado (pode valer a pena ele corrigir a extração original do PDF
pra planilha, em vez de eu limpar célula por célula).

## Estilo de Luta escolhido ainda não aparece na Ficha/Combat

**O que é:** o jogador escolhe o Estilo de Luta no wizard (nível 1 do
Guerreiro), mas isso ainda não é lido em nenhum lugar da Ficha (nem no
resumo, nem na aba Combat). Igual equipamento/perícias de classe — a
ficha final ainda não consome os campos novos do wizard
(`estiloDeLutaEscolhido`, `periciasClasseEscolhidas`,
`equipamentoClasseEscolhido`).

**Por que foi adiado:** essa entrega focou em ter a **coleta** do dado
funcionando no wizard; conectar isso na Ficha (perícias marcadas,
equipamento na Mochila, Estilo de Luta na aba Combat) é o próximo passo
do "fluxo completo" que o Osmar pediu pra priorizar.

**O que falta pra resolver:** ligar `periciasClasseEscolhidas` +
perícias de Origem na aba Perfil da Ficha; itens de
`equipamentoClasseEscolhido` na Mochila (junto com os de Origem, que já
têm o mesmo problema — ver decisão "Itens de origem/classe já nascem no
formato de Mochila", ainda não conectada de verdade); Estilo de Luta
como uma característica visível (provavelmente InfoChip) na aba Combat
ou Perfil.

## Design da tela "Escolhas da Espécie" ainda tá estranho

**O que é:** o Osmar notou que o layout da tela "3b. Escolhas da
Espécie" (tamanho/deslocamento/tipo de criatura em summary-row + traços
em InfoChip embaixo) ainda não está bom visualmente — não deu pra
apontar exatamente o quê, só que "tá estranho".

**Por que foi adiado de propósito:** prioridade agora é fechar um fluxo
completo de construção → ficha (todas as etapas do wizard levando a uma
ficha final navegável), pra cada entrega nova (Classe, Talentos,
Perícias de classe, etc.) já nascer com validação visual de ponta a
ponta — o Osmar quer conseguir olhar a ficha final e comparar, não só a
tela isolada do wizard. Polir o design de uma tela isolada antes disso
significa retrabalho quando o fluxo completo mudar o contexto ao redor
dela.

**O que falta pra resolver:** quando o fluxo completo (wizard → ficha)
estiver de pé, revisar a tela de Escolhas da Espécie com o Osmar,
pedindo pra ele apontar especificamente o que incomoda (espaçamento?
hierarquia? os InfoChips amontoados?) antes de redesenhar.

## Outros overlays fixos podem ter o mesmo bug de scroll vazando atrás

**O que é:** o popup de InfoChip/ItemComDescricao tinha um bug de scroll
vazando pra trás do modal em mobile — corrigido com o hook
`useLockBodyScroll` (ver DECISOES-DESIGN.md). Só apliquei esse hook nesses
dois componentes, que foram os reportados. O app tem outros overlays de
tela cheia com `position: fixed` que **podem** ter o mesmo problema, mas
ainda não foram testados/reportados: `RollOverlay`, `LevelUpShell` (o
overlay de Level Up), e os painéis `SidePanel` da aba Combat
(Ação/Ação Bônus/Reação).

**Por que não apliquei já:** esses três só aparecem dentro da Ficha, que
ainda não foi tão testada em celular real quanto o wizard — não quero
aplicar uma correção "no escuro" sem confirmar que o bug realmente
acontece lá também (o `useLockBodyScroll` é seguro de aplicar, mas cada
aplicação merece um teste rápido).

**O que falta pra resolver:** se o Osmar notar o mesmo sintoma (fundo
"deslocando" ou tela de trás rolando) em algum desses três, aplicar o
mesmo `useLockBodyScroll(aberto)` no componente correspondente.

## Osmar vai padronizar colunas de descrição na planilha (short + completa)

**O que é:** Osmar pretende passar pela planilha mestra e adicionar, de
propósito, colunas de **descrição curta** e **descrição completa** nas
abas que ainda não têm — resolvendo de raiz o problema de descrição
inconsistente entre abas (algumas têm campo de texto corrido pronto,
outras só têm colunas mecânicas, outras não têm nada). Ele comentou isso
espontaneamente, incomodado com a inconsistência atual.

**Por que isso importa pra mim (Claude) quando a planilha nova chegar:**
reimportar **todas** as abas que ganharem colunas novas, não só a que
motivou o pedido.

**Já resolvido nesta rodada (2ª planilha revisada pelo Osmar):**
- **Armas** e **Armaduras** ganharam coluna "Descrição" — curta e
  ilustrativa por design (não é a regra completa, é resumo de leitura
  rápida). Importada e ligada no popup. Ver decisão em
  `DECISOES-DESIGN.md`.
- Aba nova **"Proficiências de Classe"** — arma/armadura por classe,
  importada.
- **Espécies** — a coluna "Descrição Curta (auto, revisar)" já está em
  uso no card da lista (`introducaoCurta`), a pedido do Osmar, mesmo
  sendo gerada automaticamente e ainda sem revisão manual linha a linha.
  A tela de detalhe continua com o texto completo. Ver decisão em
  `DECISOES-DESIGN.md`.

**Ainda pendente:**
- **Talentos de Origem** (`talentos.ts`) e **Antecedentes**
  (`origens.ts`) ainda não ganharam coluna curta/narrativa própria —
  `descricoesOrigens.ts` continua sendo a exceção manual transcrita do
  livro até a planilha ganhar isso.
- Características de Classe/Subclasses/Opções de Classe/Glossário de
  Regras também ganharam "Descrição Curta (auto, revisar)" — ainda não
  usadas em tela nenhuma (essas classes/subclasses nem foram importadas
  ainda, exceto Guerreiro nível 1, que já está limpo). Aplicar o mesmo
  tratamento de Espécies quando fizer sentido pra tela em questão.

## Origens com seleção extra no Talento de Origem (Habilidoso, Iniciado em Magia)

**O que é:** dos 10 Talentos de Origem usados nas 16 origens do Livro do
Jogador 2024, 2 pedem uma escolha adicional no momento de pegar a origem,
não só "ganhar o benefício":

- **Habilidoso** (origens: Nobre, Escriba, Charlatão) — escolhe 3
  perícias ou ferramentas livremente, em qualquer combinação.
- **Iniciado em Magia** (origens: Acólito, Guia, Sábio) — a classe já
  vem fixa no nome da origem (ex: "Iniciado em Magia (Clérigo)"), mas
  ainda pede escolher 2 truques + 1 magia de 1º círculo daquela lista de
  classe, e qual atributo conjurador usar (Int/Sab/Car).

**Por que foi adiado:** a importação das outras 14 origens (schema
uniforme, sem seleção extra) não devia esperar por uma UI de seleção de
perícia livre / magia de lista, que é mais trabalho de tela do que de
dado.

**Estado atual:** essas 5 origens (Nobre, Escriba, Charlatão, Acólito,
Guia, Sábio) aparecem na lista de origens do wizard marcadas **"(em
breve)"**, e ficam **não-selecionáveis** (mesmo tratamento visual que
"🛠 Ferramentas de GM" na Home) até essa UI existir.

**O que falta pra resolver:**
1. Desenhar a tela/componente de "escolha livre de perícia/ferramenta"
   (reutilizável — mesmo padrão serve pra Habilidoso e pra qualquer outro
   talento que peça a mesma coisa no futuro).
2. Desenhar a tela/componente de "escolha de truque + magia de uma lista
   de classe" (reutilizável — mesmo padrão serve pra Iniciado em Magia e
   depois pra escolha de magias conhecidas de classes conjuradoras).
3. Depois de ambos existirem, tirar o "(em breve)" dessas 5 origens.

## Espécies com sub-escolha ainda não têm as opções estruturadas (Aasimar, Draconato, Elfo, Gnomo, Golias, Tiferino)

**O que é:** das 10 espécies do Livro do Jogador 2024 (não são 40 como eu
tinha registrado errado antes — só 10), **Anão, Orc e Pequenino** já
estão importadas e selecionáveis no wizard (sem sub-escolha nenhuma,
`disponivel: true`). As outras 7 ficam "(em breve)": Humano (concede
perícia/talento à escolha livre, mesmo problema do Habilidoso — ver
pendência acima) e 6 espécies com sub-escolha de linhagem/herança
(Aasimar, Draconato, Elfo, Gnomo, Golias, Tiferino — schema da
sub-escolha já definido em `DECISOES-DESIGN.md`, ver "Dados — Espécies
têm 3 naturezas diferentes de sub-escolha").

**Por que foi adiado:** as opções de cada sub-escolha (as 10 cores de
dragão do Draconato, as 3 linhagens do Elfo, as 6 ancestralidades do
Golias, etc.) **existem** na planilha, mas embutidas como texto corrido
dentro da descrição do traço (ex: "Tabela Herança Dracônica (Dragão:
Tipo de Dano) — Azul: Elétrico; Branco: Gélido; ..."), não como linhas
próprias — precisam ser extraídas/parseadas antes de virarem uma lista
selecionável na UI.

**O que falta pra resolver:**
1. Pra cada uma das 6 espécies, parsear o texto embutido da sub-escolha
   pra uma lista estruturada de opções (nome + efeito).
2. Desenhar a UI de escolha — provavelmente reutilizável entre as 3
   naturezas de sub-escolha (`identidade_permanente`,
   `linhagem_com_progressao_magica`, `escolha_reutilizavel`), mas cada
   natureza aparece em lugar diferente (wizard vs. aba Combat) e
   `linhagem_com_progressao_magica` precisa avisar o motor de level-up
   pra desbloquear magia nos níveis 3/5.
3. Depois de ambos existirem, tirar o "(em breve)" dessas espécies.

## Classes/Subclasses — variação estrutural grande, ainda sem schema

**O que é:** diferente de Origens, as abas de Classe (Progressão de
Classe, Características de Classe, Opções de Classe) têm texto livre
rico, recursos limitados variados (Fúrias, Espaços de Magia, Maestria em
Armas...), e ao menos uma célula com uma tabela inteira colada dentro do
texto da descrição (visto na característica "Maestria em Arma" do
Bárbaro) — precisa de limpeza antes de virar dado estruturado.

**Por que foi adiado:** Origens era o ponto de partida mais simples
(schema uniforme confirmado); Classes é reconhecidamente a parte mais
complexa da planilha e fica de propósito pra depois de Origens e
Espécies estarem resolvidas.

**O que falta pra resolver:** tudo — ainda não começou a análise
campo-a-campo de Classes. Quando chegar a vez, repetir o mesmo processo
usado em Origens (ler a planilha primeiro, confirmar o que é uniforme vs.
exceção, só depois desenhar schema).

## Personagem multiclasse — schema da ficha ainda assume 1 classe só

**O que é:** existe uma aba **Multiclasse** na planilha (pré-requisito de
atributo mínimo por classe pra poder multiclassar). O wizard e a ficha
atuais (Fase 0) assumem 1 classe por personagem.

**Por que foi adiado:** Fase 0 é esqueleto navegável com dados fixos —
multiclasse é uma feature de regra, não de navegação. Resolver isso exige
decisão de schema de ficha (como representar "2 progressões de classe
diferentes numa ficha só") que ainda não foi tomada.

**O que falta pra resolver:** nada urgente agora — só não fechar o schema
de `core/`/ficha de um jeito que assuma "sempre 1 classe" de forma rígida
demais, pra não precisar reescrever tudo quando isso for implementado.

## App inteiro não escala pra tablet/desktop — só os ícones de Classe foram corrigidos

**O que é:** o Osmar reportou que em telas largas ("quando vai pra web")
os ícones de classe ficavam minúsculos, porque `#root` não tem
`max-width` nenhum — o card estica pra ocupar a largura toda da tela,
mas o ícone continuava com um tamanho fixo em pixel. Corrigido só pro
ícone (`.opt-card-img` e `.opt-card-img-banner` agora usam
`clamp()` com base em `vw`, então crescem de verdade em telas maiores
— testado em 390px/768px/1440px).

**Por que foi adiado (o resto):** o app inteiro (fonte, espaçamento,
padding dos cards, todo o resto dos componentes) ainda usa só `px`
fixo, sem nenhum `clamp()`/`vw`/media query — funciona bem no celular
(que é o alvo principal, regra 5 do `CLAUDE.md`), mas em tablet/desktop
o layout todo (não só o ícone) fica com muito espaço em branco e texto
proporcionalmente pequeno. Consertar isso passa por decidir um sistema
de escala responsiva pro projeto inteiro (breakpoints? clamp() em
tudo? largura máxima de conteúdo centralizada?) — não é uma correção
pontual, é uma decisão de design que vale a pena tomar de propósito,
não corrigir tela por tela conforme reclamação aparecer.

**O que falta pra resolver:** o Osmar decidir a abordagem (perguntar
antes de implementar, regra 6 do `CLAUDE.md`) e aplicar de forma
sistemática — provavelmente melhor de fazer depois que o fluxo
wizard→ficha estiver fechado (prioridade atual registrada em
`DECISOES-DESIGN.md`), já que mexe em CSS espalhado pelo app inteiro.
