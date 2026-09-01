# DECISOES-CLASSES.md

> Decisões de design sobre a **implementação de classes** —
> Guerreiro, Bardo (+ Colégio do Conhecimento) e o sistema geral
> de Talentos/ASI, característica por característica. Cada
> entrada aqui normalmente também mexeu em Ficha/Combat/Wizard de
> passagem — fica agrupado por classe/etapa (não por tela) porque
> é assim que fica mais fácil de achar "o que já foi feito do
> Bardo" depois. Parte da família `DECISOES-*.md` — ver o índice
> em `DECISOES-DESIGN.md`, e a seção 7 do `CLAUDE.md` pra regra de
> quando registrar uma entrada aqui.

---

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

## Ícones dos Colégios também aparecem na tela de escolha (Level Up)

Pedido rápido do Osmar: os 4 ícones novos (que já trocavam o avatar na
Lista de Personagens depois de escolhida a subclasse) agora também
aparecem nos próprios cards da tela "Escolha sua subclasse" — mesmo
padrão `.opt-card-row` + `IconeClasse` já usado na seleção de Classe
(`ClasseStep.tsx`), reaproveitado sem mudança nenhuma no componente.

**Data/origem:** 2026-08.

## Level Up: Aumento de Valor de Atributo agora aplica de verdade (bug corrigido)

**Achado do Osmar:** o step "Aumento de Atributo ou Talento" do Level
Up deixava escolher +2/+1+1 nos atributos, mas isso nunca era
aplicado — `asiEscolhas` só existia em estado solto do `LevelUpShell`,
nunca chegava no `onConfirmar`, nunca era salvo. Também não havia
validação nenhuma bloqueando avançar sem escolher — suspeito já
registrado em PENDENCIAS.md ("Detector genérico de ficha atrasada"),
confirmado agora ao investigar.

**Decisão de arquitetura — `selecao` vira estado de verdade na
Ficha:** até agora `FichaShell.tsx` tratava `personagemSalvo.selecao`
como somente-leitura (as listas "Atuais" — truques, magias, perícias —
viviam PARALELAS a ela, nunca a modificavam). Pra atributo, isso não
dá — `valorFinalAtributo()` e toda a cadeia de cálculo (CA, perícias,
PV, iniciativa) leem `selecao.atributos` direto em dezenas de lugares;
duplicar um "atributosAsiAtuais" separado exigiria replumbing de tudo
isso. Solução: `selecao` virou `useState` (inicializado de
`personagemSalvo.selecao`, persistido no mesmo `useEffect` de sempre)
— o texto do resumo do Level Up já dizia "a edição livre de valores
base trava a partir daí", confirmando que a intenção sempre foi
`selecao` evoluir com o personagem, só não editável livremente pelo
jogador depois que a ficha tem XP.

**`core/personagem.ts` ganha `aumentarAtributos(atributos, codigos)`**
— +1 por código repetido (2x no mesmo = +2), capado em 20 (regra
real). `FichaShell.tsx`'s `confirmarLevelUp` aplica isso e também
atualiza `personagem.conMod` na hora (se CON mudou, PV de Level Ups
seguintes precisa do mod novo, não do congelado na criação).

**Tela nova de distribuição, pedida com layout específico pelo
Osmar** — 3 colunas (Atributo com valor+mod atual | stepper -/+ com
o ASI daquele atributo | Total com valor+mod final), reaproveitando o
padrão `.screen`/`.header`/`.body`/`.navLayer` já usado em toda tela
cheia do Level Up. Abre ao clicar "Avançar" com "Aumentar Atributos"
escolhido e a distribuição incompleta (2 pontos, não trava exigindo
"ao selecionar o modo" — só quando o jogador tenta seguir em frente).
Regras aplicadas nos botões +/-: nunca mais de 2 pontos no total,
nunca mais de 2 no mesmo atributo, nunca passa de 20.

**Talento continua bloqueado** (Cap. 5, dado não disponível neste
ambiente — ver PENDENCIAS.md "Talentos Gerais") — escolher esse modo
não trava o avanço, mesmo padrão de antes.

**Testado:** Playwright 390×844 — Guerreiro nível 3→4 (ASI real).
Escolhido "Aumentar Atributos", tentativa de avançar sem distribuir
abriu a tela nova; 2 cliques em "+" de FOR (14→16, mod +2→+3);
Confirmar habilitado só com os 2 pontos gastos. Resumo mostrou
"Atributos → FOR +2". Depois de confirmar o Level Up, aba Atributos
confirmou FOR 17 (+3) — 16 de base + 1 de bônus de espécie/origem já
existente (CA e Perícias recalculados certos também, ex. Atletismo
foi de +2 pra +3). Reload da página confirmou persistência
(`selecao.atributos.FOR` = 16 no localStorage).

**Data/origem:** 2026-08.

## Ajustes finos pós-ASI: Espaços de Magia colapsável, Especialista com "Selecionadas previamente", ASI sem card redundante

3 ajustes pequenos pedidos pelo Osmar enquanto testava o fix do ASI acima.

**Espaços de Magia (aba Magias) — 1 linha por círculo, colapsável e
lembrando o estado:** antes cada círculo ocupava 3 linhas (nome +
ticks + texto "X/Y disponíveis — recupera no..."). Virou 1 linha só
(nome do círculo à esquerda, `TickPips` à direita, linha cinza fina
entre círculos via `border-top`), e o texto de recuperação virou um
aviso único logo abaixo do título "Espaços de Magia" (calculado uma
vez, olhando se ALGUM círculo recupera no Descanso Curto — cobre o
caso raro de mistura, embora na prática nenhuma classe hoje misture).
A seção inteira (todos os círculos juntos) agora é colapsável,
clicando no título — não cada círculo individualmente, o pedido era
"não precisa de tanta linha assim" quando a pessoa não está olhando
pra isso. Estado aberto/fechado persiste entre sessões via
`localStorage`, mas por um hook novo (`ui/hooks/useColapsavel.ts`),
não pela interface `ArmazenamentoPersonagens` — é preferência de UI
(qual seção o jogador prefere ver fechada), não dado de personagem,
não faz sentido ir pro schema de `PersonagemSalvo` nem sincronizar
pra nuvem na Fase 5.

**Especialista, 2ª escolha em diante — "Selecionadas previamente"
separado:** quando o Bardo já tinha escolhido Especialista antes (ex.
nível 2) e chega no próximo gatilho (nível 9), a tela antes misturava
as perícias já travadas com as ainda disponíveis na mesma lista linear
(só um texto "(já era)" diferenciava). Virou 2 seções com cabeçalho
próprio — "Selecionadas previamente" (as travadas, mostradas já
marcadas, sem interação) em cima, "Disponíveis" (as que ainda dá pra
escolher) embaixo. Não muda a regra (Especialista continua só
adição, nunca substitui), só deixa mais fácil de ler numa lista que
cresce a cada gatilho.

**ASI — removido o 3º card redundante:** a tela "Aumento de Atributo
ou Talento" tinha 3 cards quando "Aumentar Atributos" estava
selecionado (Aumentar Atributos / Escolher um Talento / Distribuir
pontos-Editar distribuição) — o 3º card só existia pra abrir a tela de
distribuição, um clique a mais sem necessidade. Agora clicar direto no
card "Aumentar Atributos" já abre a tela de distribuição (mesma
lógica de quando o jogador clica "Avançar" com pontos sobrando); o
próprio card passa a mostrar o resumo da distribuição (ex. "FOR +2")
quando já tem algo escolhido, em vez de precisar de um card
separado pra isso.

**Testado:** Playwright 390×844, personagem Bardo. (1) Nível 3→4:
tela "Aumento de Atributo ou Talento" mostrando só 2 cards; clique em
"Aumentar Atributos" abriu a tela de distribuição de 2 pontos direto.
(2) Nível 8→9 com `periciasEspecialistaAtual` pré-preenchido
(Arcanismo, Religião): tela mostrou "Selecionadas previamente" com as
2 perícias marcadas/travadas e "Disponíveis" com as 3 restantes.
(3) Aba Magias, Bardo nível 12: 6 círculos em 1 linha cada, aviso
único "Recupera no Descanso Longo." abaixo do título, clique no
título colapsa/expande a seção inteira; F5 na página manteve o estado
colapsado.

**Data/origem:** 2026-08.

## Talentos Fase 1 — dado importado, schema de ASI unificado

`data/rulesets/dnd2024/talentos.ts` gerado por script (Python +
openpyxl, mesmo padrão de sempre) a partir da aba "Talentos" da
planilha — panorama de dado (categorias, contagens, regras de ASI e
pré-requisito) em `DND-Regras.md` > Talentos, não repetido aqui.

**Schema de ASI virou 2 tipos, não 4** — o plano original (baseado só
em contar colunas de ASI marcadas: 0/1/2-3/6) sugeria 4 padrões de UI,
mas ao olhar os VALORES reais das colunas, só existem 2 comportamentos
distintos: `escolha-unica` (+1 num único atributo à escolha, dentre
uma lista — `atributos: Atributo[]`, cobre igualmente lista de 1/2-3/6)
e `distribuir-dois` (+2 num só ou +1 em dois — reaproveita o MESMO
seletor de ASI genérico já construído pro Level Up, ver decisão acima
"Aumento de Valor de Atributo agora aplica de verdade"). `maximo` (20
ou 30) é um campo à parte, não um 3º/4º tipo — evita duplicar a lógica
de "escolha entre N" só porque o teto do atributo muda.

**`talentosOrigem` virou derivado, não duplicado** — os 2 consumidores
existentes (`OrigemEscolhasStep.tsx`, `PerfilTab.tsx`) só liam
`.id`/`.nome`/`.beneficios`, então em vez de manter uma interface
`TalentoOrigem` separada, `talentosOrigem` agora é
`talentos.filter(t => t.categoria === 'Origem')` — mesmo array, tipo
`Talento[]` completo, zero mudança nos 2 arquivos que já consumiam.
Os 10 IDs batem exatamente com os já referenciados em `origens.ts`.

**Testado:** `npm run build` limpo. Playwright 390×844 — Bardo criado
do zero, tela "2b. Escolhas da Origem" mostrou o talento de Origem
("Sortudo") certo com descrição; aba Perfil da Ficha carregou sem
erro.

**Data/origem:** 2026-08.

## Talentos — pré-requisito de Atributo Mínimo importado (planilha corrigida pelo Osmar)

**Decisão:** `PrerequisitosTalento` ganhou `atributosMinimos:
Atributo[]` — sem mapa de valor por atributo, já que o valor mínimo
real é sempre 13 em toda a planilha (fato de regra, ver
`DND-Regras.md` > Talentos). `talentos.ts` regerado a partir da
planilha corrigida pelo Osmar (ele conferiu talento por talento,
lendo a página do livro, em vez de corrigir em massa).

**Técnica de verificação que vale reaproveitar em atualizações de
planilha futuras:** comparar célula a célula (script Python) a
planilha nova contra a versão anterior versionada no repo, em vez de
assumir o que mudou — nessa entrega confirmou que só a aba Talentos
tinha mudado (38 linhas), as outras 39 abas idênticas, então nenhum
outro dado já importado (Guerreiro, Bardo, Origens, Espécies)
precisava de reconciliação.

**Testado:** `npm run build` limpo. Conferido programaticamente:
Agressor com `atributosMinimos: ['FOR', 'DES']`, Chef e Resistente com
`atributosMinimos: []` (bate com a correção do Osmar).

**Data/origem:** 2026-08.

## Talentos Fase 2 — classificador de Benefícios não reaproveita nada existente, é novo

O plano original (`talentos-plano-implementacao.md`) descrevia a Fase
2 como "reaproveitar o classificador de Ação/Ação Bônus/Reação/Passiva
que já existe, usado em características de classe". **Isso não existe
como código no app** — a coluna "Tipo de Ação (auto, revisar)" de
`Características de Classe`/`Subclasses` na planilha foi gerada por
um processo externo (rodado uma vez, fora deste repositório, sobre o
texto do livro) e só é *lida* como dado pronto por
`caracteristicasClasse.ts` (`tipoAcao: string`) — não existe uma
função reutilizável de classificação de texto em lugar nenhum do
`core/`.

**Decisão:** escrever um classificador novo, `core/classificarTalento.ts`,
seguindo o mesmo padrão já usado em `classificarMagia.ts` (regex
heurística sobre o texto puro, computada on-the-fly — não precomputada
e salva no dado, para nunca ficar dessincronizada de `beneficios`).
Prioridade de match por frase: `Reação` > `Ação Bônus` > `Ação` >
`Passiva` (fallback). O texto de "Benefícios" é quebrado em frases
antes de classificar (`split` por fim de frase + próxima maiúscula) —
ver `DND-Regras.md` > Talentos pro porquê (um talento pode ter mais de
1 efeito na mesma célula).

**Achado de dado ao testar:** o divisor de frases inicial quebrava
errado em 2 abreviações usadas no texto de Talentos — "Salv." (de
Salvaguarda) e "mod." (de modificador), ex. "cura extra = mod.
Constituição..." virava 2 frases erradas. Corrigido com uma exceção no
regex de split pra essas 2 abreviações especificamente (únicas
encontradas em toda a aba Talentos que colidiam com fim de frase).

**Testado:** os 2 exemplos combinados com o Osmar bateram exatos —
Atirador Arcano (3 frases, todas Passiva) e Conjurador Bélico
(Passiva + Reação + Passiva). Rodado nos 75 talentos oficiais: 151
frases totais → 124 Passiva, 12 Ação Bônus, 7 Reação, 3 Ação (números
antes da correção de abreviação eram levemente diferentes — conferido
visualmente o dump completo das 75 classificações, nenhuma quebra de
frase estranha sobrou).

**Pendência que continua em aberto:** a tag "afeta cálculo" por
talento (Fase 4) ainda precisa de revisão manual — o classificador só
diz "isso parece Ação/Bônus/Reação/Passiva pelo texto", não garante
que o efeito realmente muda um número que o app calcula.

**Data/origem:** 2026-08.

## Talentos Fase 3 (parte 1) — seleção de Talento Geral no Level Up

**Decisão:** no passo de ASI do Level Up, "Escolher um Talento" agora
abre uma tela cheia nova (`TelaEscolherTalento.tsx`, mesmo padrão
visual de `SelecionarMagiaShell.tsx` — reaproveita
`LevelUpShell.module.css`) listando só os talentos `categoria: 'Geral'`
(43 no catálogo). Mesmo padrão de clique-abre-direto já estabelecido
pro card "Aumentar Atributos": tocar em "Escolher um Talento" já abre
a lista, sem etapa intermediária.

**Validação:** `nivelMinimo` e `atributosMinimos` (os 2 campos reais
importados na Fase 1) travam a opção — card fica com opacidade
reduzida, `pointer-events: none`, e mostra o motivo em vermelho (ex:
"Requer DES 13+"). Atributo Mínimo é checado contra o valor FINAL do
atributo (`valorFinalAtributo`, com bônus de espécie/origem/ASI já
aplicados), não a base — é isso que a regra real de pré-requisito
verifica. `outro` (pré-requisito em texto livre, ex: "Característica
Conjuração ou Magia de Pacto") aparece como aviso `⚠️` não-bloqueante
embaixo do talento, nunca trava a escolha — exatamente como o plano
original pedia.

**Repetição:** talentos não-repetíveis já escolhidos em Level Ups
anteriores somem da lista (`talentosGeraisAtuais`, novo campo em
`PersonagemSalvo`); repetíveis (ex: "Adepto Elemental", "Habilidoso")
continuam aparecendo.

**O que NÃO foi feito nesta entrega, de propósito (ver PENDENCIAS.md):**
o talento escolhido pode conceder ASI (`concedeAsi.tipo !== 'nenhum'`)
— isso não é aplicado ainda. Só o nome do talento é salvo. O Osmar
pediu pra dividir a Fase 3 em 2 partes; essa é a 1ª (lista +
validação + salvar/mostrar). A 2ª (aplicar o ASI do próprio talento,
reaproveitando a tela de distribuição de 2 pontos pro caso
`distribuir-dois`) fica pra próxima entrega.

**Onde aparece na Ficha:** aba Perfil ganhou uma seção nova
"Talentos" (entre Classe e Origem), listando cada talento escolhido
como `opt-card` com o texto prefixado `[PH] sem efeito mecânico
ainda —` (regra do CLAUDE.md seção 12, prefixo `[PH]` pra conteúdo
sem lógica real por trás ainda).

**Testado:** Playwright 390×844, Bardo nível 3→4. Lista mostrou
"Agressor"/"Analítico"/"Atleta" travados com "Requer DES/SAB 13+"
(atributos abaixo de 13 no personagem gerado) e "Atirador Arcano"
disponível com aviso não-bloqueante de "Característica Conjuração".
Escolhido Atirador Arcano → resumo mostrou "Talento: Atirador
Arcano" → confirmado → aba Perfil mostrou a seção "Talentos" com o
`[PH]` → F5 na página manteve tudo (persistência confirmada).

**Data/origem:** 2026-08.

## Level Up — passo de "Novas Características" não duplica característica com tela própria

**Decisão:** o passo "Novas Características" (logo depois de PV) não
mostra mais o card de uma característica que já ganha uma tela
interativa própria mais adiante no mesmo Level Up — Subclasse,
Estilo de Luta, Especialista, Aumento de Valor de Atributo/Talento,
Dádiva Épica. `LevelUpShell.tsx` monta um `Set` de nomes a excluir
(`nomesComTelaPropria`), condicionado a cada passo já estar presente
em `luSteps` (a mesma checagem que decide se o passo interativo
existe esse nível), e filtra `caracteristicasDoNivel(...)` por esse
Set antes de exibir. Característica passiva sem tela própria (ex:
"Ataque Extra" do Guerreiro) continua aparecendo normalmente — esse
passo é o único lugar que mostra ela.

**Contexto:** o Osmar notou, olhando o nível 4 de Bardo, que o passo
"Novas Características" mostrava um card de texto só anunciando
"Aumento no Valor de Atributo" e, poucas telas depois no mesmo
Level Up, a tela de escolha de verdade (Atributo ou Talento)
aparecia de novo — redundante. Ele propôs 2 opções (tirar o passo, ou
virar um hub/resumo com navegação pra cada sub-processo); optamos
pela entrega menor: manter o fluxo linear atual (bolinhas de
progresso, Voltar/Avançar), só filtrando a duplicata. Um hub de
navegação ficaria pra uma reforma maior, se um dia fizer sentido.

**Nível sem nenhuma característica de verdade** (ex: nível 4 de Bardo,
cuja única entrada era "Aumento no Valor de Atributo") agora mostra o
fallback que já existia — "Nenhuma característica nova nesse nível" —
em vez do card redundante.

**Testado:** Playwright 390×844, Bardo. Nível 3→4: card "Aumento no
Valor de Atributo" some, mostra o fallback de nível vazio. Nível 1→2
(dispara Especialista): card "Especialista" some, mas "Pau pra Toda
Obra" (outra característica do mesmo nível, sem tela própria) continua
aparecendo normalmente.

**Data/origem:** 2026-08.

## Talentos Fase 3 (parte 2) — ASI do próprio talento aplicado de verdade

**Decisão:** ao escolher um talento no Level Up que concede ASI
(`concedeAsi.tipo !== 'nenhum'`), o bônus de atributo é aplicado de
verdade agora, não só o nome salvo. Reaproveita o que já existia:

- `distribuir-dois` (só "Aumento no Valor de Atributo" hoje): abre a
  mesma tela de distribuição de 2 pontos (`telaAsi`) já usada pelo ASI
  genérico — zero UI nova, só troca o gatilho de abertura.
- `escolha-unica` com 1 atributo só na lista: aplica direto, sem
  pedir escolha (não tem escolha real).
- `escolha-unica` com 2+ atributos (ex: Atirador Arcano → INT/SAB/CAR):
  nova tela pequena `telaEscolhaAtributoTalento` — lista só os
  atributos elegíveis daquele talento, cada um mostrando "FOR 12 → 13"
  (valor atual → valor com o bônus), toque aplica direto.

Ambos os fluxos escrevem no mesmo `asiEscolhas` (estado já existente
pro ASI genérico) — o `onConfirmar` já sabia aplicar isso via
`aumentarAtributos`, só precisou trocar a condição de "só quando
`asiModo === 'atributo'`" pra "quando `asiModo === 'atributo'` OU
(`'talento'` com `asiEscolhas` preenchido)".

**Validação no "Avançar":** se o talento escolhido exige uma escolha
de ASI ainda não feita (`distribuir-dois` com pontos sobrando, ou
`escolha-unica` com 2+ opções e nada escolhido), o "Avançar" reabre a
tela certa em vez de deixar seguir sem aplicar nada — mesmo padrão já
usado pro ASI genérico.

**Resumo e card ficam explícitos:** o card "Escolher um Talento" e a
tela de Resumo mostram o nome do talento junto com o ASI aplicado
(ex: "Atirador Arcano — INT +1"), pra não ficar escondido que o
talento também mexeu num atributo.

**Testado:** Playwright 390×844, Bardo nível 3→4, 2 cenários
completos: (1) Atirador Arcano (`escolha-unica`, 3 opções) — tela de
escolha abriu, INT 12→13 aplicado, resumo mostrou "ASI do talento:
INT +1", confirmado e persistido. (2) Aumento no Valor de Atributo
(`distribuir-dois`) — tela de distribuição abriu, FOR +2 (8→10)
aplicado, resumo mostrou "ASI do talento: FOR +2", confirmado e
persistido.

**Data/origem:** 2026-08.

## Talentos — card "Escolher um Talento" deixa claro quando falta escolher o atributo

**Contexto:** o Osmar escolheu um talento com escolha de atributo
(Esmagador, FOR/CON) e saiu da tela de "Escolher Atributo" sem
terminar (voltou). O card "Escolher um Talento" continuou mostrando
só o nome do talento ("Esmagador"), sem indicar que faltava concluir
— parecia que a escolha já tinha sido "fechada" no clique, mesmo sem
ter avançado. Testado e confirmado que o fluxo **não trava**: o
"Avançar" do passo já reabre a tela de escolher atributo se ela não
foi concluída (validação que já existia desde a Fase 3 parte 2) — o
problema era só a falta de clareza visual antes disso.

**Decisão:** 2 ajustes pequenos, sem mudar a regra:
1. O texto do card passa a avisar explicitamente quando fica pendente:
   "Esmagador — falta escolher o atributo, toque pra continuar" (em
   vez de só "Esmagador", que parecia completo).
2. Clicar de novo no card nesse estado retoma direto a tela de
   escolher o atributo daquele talento (`aplicarAsiDoTalento` de
   novo), em vez de reabrir a lista inteira dos 43 talentos — não faz
   sentido escolher outro talento de novo só porque esqueceu de
   terminar o atributo do que já tinha escolhido.

**Testado:** Playwright 390×844 — escolher Esmagador, voltar sem
escolher atributo, card mostra o aviso certo; clicar de novo no card
abre a tela de atributo direto (não a lista); escolher CON aplicou
+1 de verdade e persistiu.

**Data/origem:** 2026-08.

## Talentos — correção: seleção precisa marcar e depois "Confirmar", não aplicar no toque

**Contexto:** a decisão acima (clareza de texto) **não resolveu o
problema de verdade**. Feedback direto do Osmar: "em todo lugar você
tem que escolher e depois escolher avançar, no caso da tela de
escolha entre asi/talentos... a seleção te escolhe automaticamente,
não tá seguindo o fluxo de todas as outras telas de marcar a seleção
e depois avançar, e daí o jogador fica preso". Ou seja: em
`TelaEscolherTalento` (lista de talentos) e na tela inline "Escolher
Atributo" do talento, tocar numa opção já **aplicava a escolha e
navegava embora** na hora — diferente de toda outra tela do Level Up
(inclusive a tela de distribuição do ASI genérico, `telaAsi`, que já
usava o padrão certo: toca = só marca/destaca; um botão "Confirmar"
separado é que aplica e avança).

**Decisão:** as duas telas passam a seguir o mesmo padrão de
marcar-depois-confirmar de todo o resto do wizard:
- `TelaEscolherTalento`: ganhou estado local `selecionado`
  (inicializado com o talento já escolhido antes, se houver, via nova
  prop `talentoSelecionadoInicial`). Tocar num talento só marca
  (`selected`), não chama mais `onEscolher` direto. Novo botão
  "Confirmar ✓" no `navLayer` (ao lado de "← Voltar") é que chama
  `onEscolher(selecionado)` — fica desabilitado (opacidade + sem
  clique) enquanto nada estiver marcado.
- Tela inline "Escolher Atributo" (dentro de `LevelUpShell.tsx`):
  mesmo padrão, com novo estado `atributoTalentoTemp`. Tocar num
  atributo só marca; "Confirmar ✓" aplica de fato
  (`setAsiEscolhas([atributoTalentoTemp])`) e fecha a tela; "← Voltar"
  limpa a marcação sem aplicar nada.

**Testado:** Playwright 390×844, fluxo completo — tocar em Esmagador
mantém na tela da lista (não navega); "Confirmar ✓" aí sim abre a
tela de atributo; tocar em CON mantém na tela de atributo (não
navega); "Confirmar ✓" aí sim aplica e volta pro passo de ASI/Talento;
estado final persistido correto (CON 15→16, `talentosGeraisAtual:
['esmagador']`).

**Data/origem:** 2026-08.

## Talentos/ASI — botão "Confirmar" desabilitado não parecia (nem bloqueava de verdade) desabilitado

**Contexto:** o Osmar mandou print da tela "Aumentar Atributos" com
0 pontos distribuídos ("Faltam 2") e o botão "Confirmar ✓" parecendo
habilitado (mesma cor azul sólida do resto). Investigando: os 3
botões "Confirmar" novos (distribuição de ASI, escolha de atributo do
talento, lista de talentos) usavam `style={{ opacity: 0.5,
pointerEvents: 'none' }}` inline em vez da classe global já existente
`.btn-disabled` (`opacity: 0.35`, usada em Wizard/Home/CharacterList)
— ficava mais opaco que o padrão do app, mas ainda lia como "azul
ativo". Pior: `styles.pill` (CSS module do Level Up) define
`pointer-events: auto` pra funcionar dentro do `navLayer` (que é
`pointer-events: none` no container) — como as duas classes têm a
mesma especificidade CSS, a ordem de carregamento fazia `pill` vencer
e **o botão continuava clicável mesmo "desabilitado"** (confirmado
depois com teste automatizado: clique forçado no botão sem pontos
distribuídos navegava pra frente mesmo assim).

**Decisão:** os 3 botões passam a usar a classe `.btn-disabled` (pro
visual ficar igual ao resto do app) **e** mantêm `pointerEvents:
'none'` inline como reforço (inline vence qualquer classe, garante que
`pill` não sobrescreve o bloqueio de clique mesmo com a mesma
especificidade de seletor).

**Testado:** Playwright 390×844 — `getComputedStyle` confirmando
`opacity: 0.35` e `pointerEvents: none` no botão sem seleção feita;
clique forçado (`{force:true}`) não navega. Screenshot confirma
visual agora igual ao "← Voltar" (claramente esmaecido).

**Data/origem:** 2026-08.

## Talentos/ASI — correção definitiva: sem tela própria, sem botão "Confirmar" — só o "Avançar" do passo

**Contexto:** as duas correções anteriores (texto mais claro, depois
botão "Confirmar" com bloqueio de verdade) ainda erravam o problema
de raiz. Feedback do Osmar, bem direto: (1) o app inteiro usa um
único fluxo — "Avançar" no rodapé fixo do passo é quem confirma e
navega; eu inventei um botão "Confirmar" **só** pra essas 3 telas
(lista de talentos, escolha de atributo do talento, distribuição de
ASI), quebrando a consistência sem motivo. (2) essas 3 telas também
eram **telas cheias separadas** (`telaTalento`, `telaAsi`,
`telaEscolhaAtributoTalento` — cada uma um `return` antecipado
substituindo a tela toda), diferente de todo outro passo do Level Up
(ex: "Escolha sua subclasse", "Estilo de Luta"), que renderizam a
escolha **dentro do mesmo passo**, com o "Avançar" do passo (já
existente, fixo no rodapé) sendo o único ponto de confirmação.

**Decisão:** as 3 telas deixam de existir como telas separadas.
Viram conteúdo condicional dentro do próprio passo `'asi'`, exatamente
como "subclasse"/"estiloDeLuta"/etc já funcionavam:
- Os 2 cards "Aumentar Atributos" / "Escolher um Talento" agora só
  marcam `asiModo` (nunca abrem tela nem tela nova) — mesmo padrão de
  card-de-modo usado em outro lugar do app.
- Escolhido `asiModo === 'atributo'`, a tabela de distribuir 2 pontos
  aparece **logo abaixo**, no mesmo scroll do passo (função
  `renderDistribuirPontos()`, reaproveitada também pro caso de talento
  com `concedeAsi.tipo === 'distribuir-dois'` — mesma tabela, dois
  lugares).
- Escolhido `asiModo === 'talento'`, a lista de talentos
  (`TelaEscolherTalento`, agora um componente de lista simples — sem
  header, sem nav própria, só os `opt-card`s controlados pelo pai)
  aparece embaixo; tocar num talento só marca `talentoEscolhido`. Se o
  talento escolhido concede ASI com mais de 1 atributo possível
  (`escolha-unica` com 2+ opções), a lista de atributo aparece
  **embaixo dessa lista**, no mesmo passo — tocar só marca
  `asiEscolhas`.
- `avancar()` (a função que já existia pro "Avançar" de todo passo)
  ganhou as mesmas validações de antes, mas agora só mostram aviso
  (nunca abrem tela) quando algo falta: modo não escolhido, pontos de
  atributo não completos, talento não escolhido, ASI do talento não
  completo.
- Nenhum botão "Confirmar" extra sobrou — o "Confirmar ✓" que existe
  no rodapé é só o de sempre (aparece apenas no último passo,
  "Resumo", mesmo padrão do resto do app).

**Testado:** Playwright 390×844 — confirmado que não existe mais
botão "Confirmar" na tela de ASI/Talento; marcar o modo "Talento" não
navega (lista aparece inline na mesma tela); "Avançar" sem escolher
talento mostra aviso e não navega; marcar Esmagador não navega
(escolha de atributo aparece inline); "Avançar" sem escolher o
atributo mostra aviso; marcar CON não navega; só depois de tudo
escolhido o "Avançar" de fato sai do passo. Estado final persistido
correto (CON +1, talento "esmagador" salvo).

**Data/origem:** 2026-08.

## Talentos — "Aumentar Atributos" e "Escolher um Talento" eram o mesmo talento duas vezes; vira só a lista, com passo extra pro ASI

**Contexto:** o Osmar notou 2 problemas na tela de ASI/Talento depois
da correção anterior: (1) "Aumento no Valor de Atributo" já existe
como um talento normal na planilha (`concedeAsi.tipo:
'distribuir-dois'`) — o card fixo "Aumentar Atributos" que eu tinha
no topo da tela era **o mesmo mecanismo duplicado**, só hardcoded em
vez de vir da lista de talentos. (2) a escolha de atributo do talento
(quando precisa, ex: talento que dá +1 em 2-3 atributos à escolha)
ficava "grudada" no fim da lista de talentos, dentro do mesmo passo —
difícil de perceber que precisa rolar mais pra terminar a escolha.

**Decisão:**
1. Os 2 cards fixos ("Aumentar Atributos"/"Escolher um Talento")
   somem. O passo `'asi'` agora só mostra a lista de talentos direto
   — "Aumento no Valor de Atributo" aparece nela como qualquer outro
   talento (mesmo texto oficial: "Aumenta 1 atributo em +2, OU dois
   atributos em +1 cada, à escolha (máx. 20)" — ver `DND-Regras.md` >
   Talentos).
2. Quando o talento escolhido precisa de escolha de atributo
   (`distribuir-dois`, ou `escolha-unica` com 2+ atributos), um passo
   **novo** entra dinamicamente na sequência do Level Up logo depois
   de `'asi'` — `'asiAtributo'`, com sua própria bolinha no indicador
   de progresso, calculado a cada render a partir do talento
   escolhido (`precisaEscolherAtributoDoTalento` em
   `LevelUpShell.tsx`). Isso é diferente da tentativa anterior (tela
   cheia separada): é um passo de verdade na sequência, então usa o
   "Avançar" comum de todo o resto do wizard — nenhuma tela/botão
   especial.
3. Card de cada talento ganhou uma linha "Atributos: ..." entre o
   título e a descrição (`descricaoAsi()` em `TelaEscolherTalento.tsx`),
   calculada direto de `concedeAsi` — dado real, sempre visível sem
   precisar abrir/escolher nada.
4. Pin 📌 no canto superior direito de cada card — marca o talento
   como "quero pegar isso num level up futuro" (não precisa escolher
   agora). Talentos marcados aparecem numa seção "⭐ Favoritos" no
   topo da lista (some de lá automaticamente se o jogador vier a
   escolher o talento nesse mesmo Level Up, e é limpo pra sempre da
   lista de favoritos quando o talento é de fato confirmado). Salvo
   por personagem (`talentosFavoritosAtual` em
   `armazenamentoPersonagens.ts`), não é uma preferência global do
   dispositivo — cada ficha planeja sua própria build.

**Testado:** Playwright 390×844 — confirmado que os 2 cards fixos
sumiram; a lista mostra "Aumento no Valor de Atributo" como talento
normal; a linha "Atributos:" aparece nos cards; marcar pin faz a
seção "⭐ Favoritos" aparecer; escolher um talento com ASI não navega
sozinho; "Avançar" leva pro passo novo (com nome/bolinha próprios);
distribuir os pontos e "Avançar" de novo sai do passo; resumo final
mostra "Talento" e "Atributo do talento" corretos; estado persistido
certo (CON +2, talento salvo, favorito não escolhido continua
favoritado depois de confirmar).

**Data/origem:** 2026-08.

## Talentos Fase 4 — lote 1 (Alerta, Defensivo, Arquearia, Duelismo, Mestre em Armaduras Médias)

**Contexto:** primeiro lote de Fase 4 (efeito mecânico de verdade,
depois de Fases 1-3 completas). Escolhidos por serem "1 número
isolado, plugável num cálculo que já existe" (ver PENDENCIAS.md,
ordem sugerida). Confirmado com o Osmar antes de começar: (1) os 3
talentos de categoria "Estilo de Luta" (Defensivo/Arquearia/Duelismo)
JÁ existem também em `estilosDeLuta.ts` — a lista de Talentos do Level
Up só mostra categoria "Geral", então esses 3 nunca aparecem lá; o
mecanismo de verdade tinha que entrar pelo Estilo de Luta escolhido
via classe (`personagem.estiloDeLuta`), não pelo picker de Talentos.
Perguntei se valia a pena bloquear a duplicata na lista de Talentos —
Osmar confirmou que sim ("bloquear duplicata"), mas na prática não é
preciso: a duplicata é inofensiva, nunca aparece pro jogador.

**Decisão — esquema de dado:** novo campo opcional `efeitoMecanico`
em `Talento` (`data/rulesets/dnd2024/talentos.ts`) e `EstiloDeLuta`
(`data/rulesets/dnd2024/estilosDeLuta.ts`), tipo união
`EfeitoMecanicoTalento` — cada variante carrega só os números que o
talento realmente usa (ex: `{ tipo: 'bonus-ataque-distancia', bonus: 2
}`). Esse campo **não vem da planilha** — é anotado à mão, talento por
talento, só quando a Fase 4 chega nele (aviso deixado no topo dos 2
arquivos). `core/calculoPersonagem.ts` ganhou o helper
`efeitoMecanicoDoTalento(talentosAtuais, tipo)` — procura, entre os
IDs de talento ativos, um com aquele tipo de efeito; reaproveitado
também em `core/ataque.ts` (via `efeitoDoEstiloDeLuta`, que faz o
mesmo lookup em `estilosDeLuta.ts` por `nome`, já que
`personagem.estiloDeLuta` guarda o nome, não o id).

**Decisão — Talento de Origem entra no cálculo:** Alerta é categoria
"Origem" — concedido fixo pela Origem escolhida na criação
(`origem.talentoOrigemId`), nunca passa pelo picker de Level Up, então
não vivia em `talentosGeraisAtuais`. `FichaShell.tsx` agora calcula
`talentosEfetivos = [...talentosGeraisAtuais, origemPersonagem
?.talentoOrigemId]` e passa esse array pros cálculos — não só os
talentos escolhidos em Level Up.

**Onde cada efeito entra:**
- **Alerta** (`bonus-iniciativa-bonus-proficiencia`): soma Bônus de
  Proficiência na Iniciativa — `calcularIniciativa`/`explicarIniciativa`
  ganharam parâmetros opcionais `classe`/`nivel`/`talentosAtuais`
  (a chamada no wizard, sem personagem de verdade ainda, continua sem
  eles).
- **Defensivo** (`bonus-ca-com-armadura`): +1 CA com qualquer Armadura
  equipada — `calcularCAEquipado`/`explicarCAEquipado` ganharam
  `estiloDeLutaEscolhido`/`talentosAtuais`.
- **Mestre em Armaduras Médias** (`teto-des-armadura-media`): eleva o
  teto do mod. Destreza somado na CA de 2 pra 3 com Armadura Média e
  DES 16+ — `caPelaArmadura` ganhou `tetoDesOverride`, checado contra
  `armaduraCatalogo.categoria.startsWith('Armadura Média')`.
- **Arquearia** (`bonus-ataque-distancia`): +2 no acerto com arma à
  Distância — `ataqueComArma` ganhou `estiloDeLutaEscolhido`, soma no
  `modAcerto` quando `distancia` é true.
- **Duelismo** (`bonus-dano-uma-mao-sem-outra-arma`): +2 no dano com 1
  arma corpo a corpo numa mão e nenhuma outra — `ataqueComArma` ganhou
  `outraArmaNaMaoSecundaria`; `ataqueBonusMaoSecundaria` (o ataque da
  PRÓPRIA mão secundária) sempre passa `true` nesse parâmetro, porque
  ele mesmo é "a outra arma" que desqualifica o Duelismo do ataque
  principal.

**Testado:** Playwright 390×844 — Origem Criminoso (concede Alerta),
DES 16: Iniciativa mostrou **+5** (+3 DES +2 Bônus Prof.). Nível 4,
talento Mestre em Armaduras Médias + Estilo Defensivo + Gibão de Peles
(Armadura Média) equipado, DES 16: CA mostrou **16** (12 base + 3 teto
elevado + 1 Defensivo). Estilo Arquearia + Arco Curto (DES 16):
ataque rolou **1d20 + 7** (+3 DES +2 Prof. +2 Arquearia). Estilo
Duelismo + Clava sozinha na mão principal (FOR 14): ataque rolou
**1d20 + 4** (+2 FOR +2 Prof., sem bônus — confirma que Duelismo não
mexe no acerto, só no dano, mesmo caminho de código do bônus de
Arquearia já validado).

**Data/origem:** 2026-08.

## Bardo — correções de classe base (Contra-Encantamento + Inspiração Superior)

**Contexto:** auditoria da classe Bardo (pedida pelo Osmar, comparando
contra um SDD externo) achou 0 erros nos dados já importados, mas
achou 5 lacunas de mecânica ainda não implementada (características
com descrição na Ficha mas sem lógica de código por trás). Corrigindo
as 2 mais simples primeiro, do mais simples ao mais complexo (decisão
do Osmar).

**Contra-Encantamento (nível 7, Reação):** novo item no painel de
Reação (`ReacaoPanelContent.tsx`), condicionado a
`caracteristicaDesbloqueada(classe, 'Contra-Encantamento', nivel)`.
Rola novamente uma salvaguarda com Vantagem, sem gastar recurso
nenhum. Como o alvo pode ser o próprio Bardo OU um aliado a até 9m
(cujo modificador de salvaguarda o app não tem como saber), o botão
rola só o d20 puro (com Vantagem) e pede pro jogador somar o
modificador de salvaguarda de quem está sendo protegido manualmente —
mesmo padrão já usado em Indomável (rolagem genérica, jogador aplica o
contexto).

**Decisão de infraestrutura:** o sistema de rolagem (`RollContext`)
não tinha conceito de Vantagem/Desvantagem — só rolava 1d20 por vez.
Optei (confirmado com o Osmar) por adicionar isso como capacidade
reutilizável do `rolarD20` (`vantagem?: 'vantagem' | 'desvantagem'`),
em vez de resolver só dentro do botão de Contra-Encantamento — outras
características futuras (Vantagem é super comum em D&D) vão
reaproveitar sem duplicar lógica. O overlay de rolagem (`RollOverlay`)
mostra os 2 dados rolados e qual foi usado, pra não esconder a
descartada.

**Inspiração Superior (nível 18, passiva):** ao rolar Iniciativa (novo
callback opcional `onRolarIniciativa` em `AtributosTab`), recupera
usos gastos de Inspiração de Bardo até ter 2, se tiver menos que isso
— nunca reduz usos já disponíveis, nunca passa do máximo da classe.
Lógica em `FichaShell.tsx` (`recuperarInspiracaoAoRolarIniciativa`),
mesmo padrão arquitetural das outras funções de gasto/recuperação de
recurso do Bardo já existentes no arquivo (`usarInspiracao`,
`recuperarInspiracaoComEspaco`) — ficam na Ficha, não em `core/`,
porque mexem em `useState` do React, não são cálculo puro.

**Achado da auditoria, fora de escopo desta entrega:** conferi a
planilha mestra e ela já tem as 4 características mecânicas completas
das 4 subclasses de Bardo (não só nomes, como o comentário antigo de
`subclasses.ts` dizia) — Osmar preencheu isso por fora do chat depois
da última vez que o código foi tocado. Vai ser usado quando entrarmos
no Colégio do Conhecimento.

**Data/origem:** 2026-08.

## Bardo — Segredos Mágicos (nível 10, classe base)

**O que é:** última lacuna da classe base do Bardo (das 5 achadas na
auditoria de Bardo). A partir do nível 10, sempre que o nº de Magias
Preparadas sobe, a magia nova pode vir de Bardo, Clérigo, Druida OU
Mago — conta como magia de Bardo.

**Implementação:** `core/magiasPersonagem.ts` ganhou
`magiasDisponiveisParaPreparar(classe, nivel)` — retorna só a lista da
própria classe até o nível 9; a partir do nível 10 (checado por
`caracteristicaDesbloqueada(classe, 'Segredos Mágicos', nivel)`, não
hardcoded '10' direto, pra funcionar certo se a planilha algum dia
mudar o nível), soma as listas de Clérigo/Druida/Mago sem duplicar
magia que apareça em mais de uma lista (dedupe por `id`).
`CLASSES_SEGREDOS_MAGICOS` (`['Clérigo', 'Druida', 'Mago']`) é
hand-maintained — vem do texto da própria característica, não é regra
genérica (só Bardo tem isso hoje).

Usado nos 2 lugares que hoje montam o catálogo de Magias Preparadas
pra escolher: passo "Magias Preparadas" do Level Up
(`LevelUpShell.tsx`) e a tela de "Completar Magias Preparadas"
(`CompletarMagiasShell.tsx`, corrige ficha atrasada). As duas telas
marcam com "· via Segredos Mágicos" qualquer magia da lista que não
seja nativa do Bardo (`!magia.classes.includes('Bardo')`) — transparência
pro jogador entender de onde a opção emprestada veio, sem misturar com
"já tinha"/"será removida".

Teste automatizado: `src/core/magiasPersonagem.test.ts` — nível 9 (só
lista própria) vs. nível 10 (pool cresce, sem duplicata).

Testado via Playwright: personagem Bardo nível 10, Level Up pro 11,
passo Magias Preparadas mostra magias de 6º círculo de outras classes
com a marcação "via Segredos Mágicos" ao lado das nativas.

**Data/origem:** 2026-08.

## Colégio do Conhecimento — Entrega 1 (dado + características visíveis na Ficha)

**O que é:** primeira entrega do plano de 4 combinado com o Osmar pro
Colégio do Conhecimento. Criado `data/rulesets/dnd2024/caracteristicasSubclasse.ts`
(gerado da planilha, aba "Subclasses") com as 4 características reais
(Palavras de Interrupção nv3, Proficiências Bônus nv3, Descobertas
Mágicas nv6, Perícia Inigualável nv14) — só Colégio do Conhecimento
importado por enquanto, mesmo padrão incremental de
`caracteristicasClasse.ts`. Corrigido à mão o Tipo de Ação de
"Palavras de Interrupção" pra "Reação" (a coluna "auto, revisar" da
planilha errou, texto da própria descrição confirma).

Nova função `caracteristicasSubclasseAcumuladas` (`core/levelUp.ts`) —
mesmo formato de `caracteristicasAcumuladas`, lendo do novo arquivo,
chaveada pelo NOME da subclasse (não precisa cruzar com
`classe.progressao`, cada característica já tem o próprio nível).

**Ainda não afeta mecânica** (Entregas 2-4 do plano) — essa entrega só
faz a característica aparecer de verdade na aba Perfil da Ficha, numa
seção "Subclasse — {nome}" nova, pra qualquer personagem com
`subclasseAtual` = "Colégio do Conhecimento" e nível ≥ 3. Antes disso
a escolha de subclasse era só cosmética (trocava o ícone na Lista).

Teste automatizado: `levelUp.test.ts`, `caracteristicasSubclasseAcumuladas`
(acumula por nível 3→6→14, e caso de borda sem subclasse escolhida).

Testado via Playwright: Bardo/Colégio do Conhecimento nível 14 mostra
as 4 características reais na aba Perfil.

**Data/origem:** 2026-08.

## Colégio do Conhecimento — Entregas 2 e 3 + correções de bug

**Contexto:** feedback do Osmar depois de testar a Entrega 1 — 4
problemas reais, resolvidos juntos.

**1. Bloqueio de subclasses não implementadas:** `subclasseImplementada`
(`core/levelUp.ts`) checa se a subclasse tem pelo menos 1 característica
em `caracteristicasSubclasse.ts` (genérico por dado, não hardcoded pro
nome). A tela de escolha de subclasse (`LevelUpShell.tsx`) mostra as
outras 3 subclasses de Bardo travadas ("Ainda não implementada",
opacidade reduzida, sem clique) até que ganhem dado real.

**2. Palavras de Interrupção (nv3, Reação):** novo item no painel de
Reação, condicionado a `caracteristicaSubclasseDesbloqueada(subclasse,
'Palavras de Interrupção', nivel)`. Gasta 1 uso do banco PRÓPRIO de
Inspiração de Bardo do personagem (não concede a ninguém — caminho
paralelo, mesma regra do livro), rola o dado de Inspiração
(`rolarDados`, não `rolarD20` — não é um ataque/teste, é só o dado
solto) e mostra aviso pra subtrair do resultado da criatura.

**3. Proficiências Bônus (nv3, escolha real de perícia):** nova etapa
"proficienciasBonus" no Level Up, disparada quando a subclasse
escolhida NESSE MESMO level-up (ou uma já salva) desbloqueia a
característica e o personagem ainda não tem as 3 perícias (dispara 1
vez só). Lista só as perícias em que o personagem AINDA não é
proficiente (usa `periciasProficientesDoPersonagem`, mesmo padrão do
passo "Especialista"). Escolha persistida em `periciasSubclasseBonusAtual`
(novo campo em `armazenamentoPersonagens.ts`) e alimentada de volta em
`calcularPericias` via novo parâmetro `periciasBonusExtras` — essas
perícias agora contam como proficiência de verdade (bônus inteiro, não
dobrado — Especialista continua sendo o único jeito de dobrar).

**Achado de arquitetura durante a implementação:** `subclasseEscolhida`
(estado local do Level Up) precisou ser declarado ANTES da montagem de
`luSteps` (mesmo padrão já usado por `talentoEscolhido`/
`precisaEscolherAtributoDoTalento`) — só assim o passo
"proficienciasBonus" consegue reagir à escolha de subclasse feita no
MESMO level-up (nível 3, os dois acontecem juntos).

**4. Aba Atributos — layout mais compacto:** PV, CA, Iniciativa e
Bônus de Proficiência viraram uma única linha de 4 caixas no topo
(antes: PV/CA/Iniciativa numa linha própria mais abaixo, Bônus de
Proficiência dentro da lista de Perícias). Padding reduzido em
`levelBox`/`hpBox`/`skillRow`. Atributos (FOR/DES/CON/INT/SAB/CAR)
mantidos como estavam, a pedido do Osmar.

Testado via Playwright: outras 3 subclasses aparecem travadas;
Proficiências Bônus mostra as 14 perícias ainda-não-proficientes,
trava em "3/3"; Palavras de Interrupção aparece no painel de Reação
(Bardo/Conhecimento nível 7, "1 uso restante" mostrado certo).

Teste automatizado: `calculoPersonagem.test.ts` ganhou 2 casos novos
pra `calcularPericias` com `periciasBonusExtras`.

**Data/origem:** 2026-08.

## Reação — painel mostra o contador de Inspiração de Bardo no topo

**O que é:** pedido do Osmar — o painel de Reação passou a mostrar o
mesmo contador de Inspiração de Bardo (dado + pips + "X/Y disponíveis")
que já existia no topo do painel de Ação Bônus, já que Palavras de
Interrupção também gasta esse recurso. Reaproveita o mesmo componente
`TickPips` e o mesmo bloco visual (`.slotCounter`), só que agora
renderizado nos dois painéis (`BonusPanelContent` e
`ReacaoPanelContent`) em vez de só um.

**Data/origem:** 2026-08.

## Colégio do Conhecimento — Descobertas Mágicas (nível 6)

**O que é:** 3ª das 4 características do Colégio do Conhecimento
implementada. 2 magias SEMPRE preparadas (truque ou de círculo, até o
círculo que o personagem já tem espaço), escolhidas de Clérigo, Druida
ou Mago — nunca da lista de Bardo — fora da conta normal de Magias
Preparadas. Trocável 1 por level-up (mesmo padrão de Truques).

**Implementação:**
- `core/magiasPersonagem.ts`: `poolDescobertasMagicas(circuloMaximo)`
  reaproveita a mesma constante `CLASSES_SEGREDOS_MAGICOS`
  (Clérigo/Druida/Mago) já usada por "Segredos Mágicos" — coincidência
  de regra do livro (as 2 características citam as mesmas 3 classes),
  não é o mesmo conceito, comentário deixa isso explícito.
- Novo passo "descobertasMagicas" no Level Up
  (`LevelUpShell.tsx`) — aparece toda vez que a característica já
  estiver desbloqueada (não só a primeira vez), mesmo padrão de
  Truques (pode trocar 1, não precisa mexer se não quiser).
- Novo campo persistido `magiasDescobertasMagicasAtual` em
  `armazenamentoPersonagens.ts`.
- Aba Magias (`MagiasTab.tsx`) ganhou seção própria "Descobertas
  Mágicas", separada de Truques/Magias Preparadas, com aviso "sempre
  preparadas, não contam na conta normal".
- Aba Combat: as 2 magias entram no que dá pra conjurar em Ação/Reação
  (união com Magias Preparadas normais só na hora de montar a lista
  de "o que aparece pra conjurar", os arrays de origem continuam
  separados — `magiasConjuraveis` em `FichaShell.tsx`).

Teste automatizado: `magiasPersonagem.test.ts`, `poolDescobertasMagicas`
(círculo 0 = só truques; círculo maior = inclui magias até o limite,
sem duplicata).

Testado via Playwright: Bardo/Conhecimento nível 5→6, escolhe 2 magias
de 3º círculo (Arma Elemental, Aura de Vitalidade) na tela dedicada;
aba Magias mostra a seção nova; aba Combat "Usar Magia" lista as 2
junto das magias normais de 3º círculo.

**Falta só Perícia Inigualável (nível 14) pra fechar as 4
características do Colégio do Conhecimento.**

**Data/origem:** 2026-08.

## Bug real: "Característica de Subclasse" (placeholder da planilha) mostrava texto errado

**O que era:** a planilha mestra (aba "Progressão de Classe") usa o
nome literal **"Característica de Subclasse"** em `classes.ts` nos
níveis em que o Livro do Jogador diz "veja sua subclasse" em vez de
nomear algo fixo (Bardo: nível 6 e 14; Guerreiro: nível 7, 10, 15, 18
— confirmado, mesmo padrão nas duas classes já importadas). Como
`caracteristicasClasse.ts` nunca teve (nem podia ter) uma entrada com
esse nome literal, 2 lugares mostravam esse placeholder como se fosse
uma característica de verdade, com um texto de erro genérico
("descrição ainda não importada") mesmo depois de já termos o dado
real da subclasse importado:
1. Level Up, passo "Novas Características" (nível 6 mostrava
   "Característica de Subclasse" em vez de "Descobertas Mágicas").
2. Aba Perfil, seção "Classe" (mesmo problema, e ainda **duplicado**
   com a seção "Subclasse" logo abaixo, que já mostrava a informação
   certa).

**Correção:** `core/levelUp.ts` ganhou
`NOME_PLACEHOLDER_CARACTERISTICA_SUBCLASSE` (a constante do nome
literal, hand-maintained — não muda com a planilha) e
`caracteristicasDoNivelComSubclasse(classe, nivel, nomeSubclasse)`,
que troca qualquer entrada com esse nome pela(s) característica(s)
REAL(is) daquele nível da subclasse escolhida (via
`caracteristicasSubclasseDoNivel`, nova função — igual
`caracteristicasSubclasseAcumuladas`, só que SEM acumular, só o nível
exato). Se a subclasse não tem dado ainda (ou não foi escolhida), o
placeholder continua aparecendo, mas agora com uma mensagem que
explica o motivo de verdade ("depende da subclasse escolhida — essa
subclasse ainda não tem característica de nível X importada") em vez
do texto genérico de "dado não importado".

- Level Up: `features` agora usa `caracteristicasDoNivelComSubclasse`
  em vez de `caracteristicasDoNivel`. "Descobertas Mágicas" também
  entrou em `nomesComTelaPropria` (já tem passo dedicado, não precisa
  aparecer 2x). "Perícia Inigualável" (nível 14) não tem passo
  dedicado ainda, então aparece aqui mesmo, com o texto certo — bônus
  dessa correção, sem trabalho extra.
- Aba Perfil: a seção "Classe" agora filtra o nome do placeholder de
  propósito (a informação real já vem certa pela seção "Subclasse"
  logo abaixo — mostrar 2x seria pior, não melhor).

Teste automatizado: `levelUp.test.ts`,
`caracteristicasDoNivelComSubclasse` (resolve pro nome real com
subclasse escolhida; mantém o placeholder intacto sem subclasse —
caso de borda).

Testado via Playwright: Bardo nível 13→14, passo "Novas
Características" mostra "Perícia Inigualável" com a descrição real;
aba Perfil de um Bardo nível 13 não tem mais nenhum "Característica de
Subclasse" solto.

**Data/origem:** 2026-08.

## Bônus — "Fonte de Inspiração" mostra qual círculo vai gastar

**O que é:** pedido do Osmar — no painel de Ação Bônus, o item que
gasta 1 Espaço de Magia pra recuperar 1 uso de Inspiração de Bardo
("Fonte de Inspiração"):
1. Nome renomeado pra "Fonte de Inspiração" (era "Recuperar Inspiração
   com Espaço de Magia", que virou a 2ª linha em vez do título).
2. Nova linha no final: "Espaço de magia do Xº círculo será gasto" —
   X é sempre o menor círculo com sobra (`CombatTab.tsx` calcula
   `proximoCirculoParaGastar` a partir do mesmo `espacos` já ordenado
   crescente que `gastarQualquerSlot` usa de verdade em
   `FichaShell.tsx` — a UI não inventa outra ordem, só mostra a que já
   é usada).

**Data/origem:** 2026-08.

## Colégio do Conhecimento — Perícia Inigualável (nível 14) — ÚLTIMA característica, plano fechado

**O que é:** 4ª e última característica do Colégio do Conhecimento.
Ao falhar um teste de atributo ou jogada de ataque (só do próprio
Bardo), pode gastar 1 uso do banco NORMAL de Inspiração de Bardo
(mesmo pool de "🎵 Inspiração de Bardo"/"Palavras de Interrupção", não
um recurso separado), rolar o dado e somar ao d20 — regra especial:
**se ainda assim falhar, o uso não é gasto** (único reembolso
condicional confirmado no jogo).

**Interação (decisão do Osmar):** como o app não sabe se a soma virou
sucesso ou não (isso só o jogador/mestre sabe, comparando com a CD),
o fluxo é: toque no card → rola o dado (gasto otimista, já debita 1
uso) → aparece uma confirmação "Somou o dado ao d20 e ainda assim
falhou?" com 2 botões — "Sim, ainda falhou" devolve o uso
(`devolverUsoInspiracao`, nova função em `FichaShell.tsx`, difere de
`recuperarInspiracaoComEspaco` por não gastar Espaço de Magia); "Não,
deu certo" só fecha a confirmação, mantendo o uso gasto.

Card vive na mesma área "livre" de Indomável/Mente Tática (não é
atrelado a Ação/Ação Bônus/Reação — característica reativa, sem custo
de ação, mesmo padrão dos outros 2 já existentes).

Testado via Playwright: Bardo/Conhecimento nível 14 — card aparece,
rola o dado, mostra a confirmação, "Sim, ainda falhou" devolve o uso
de verdade (1/1 → volta a mostrar clicável).

**Com isso, as 4 características do Colégio do Conhecimento (Palavras
de Interrupção, Proficiências Bônus, Descobertas Mágicas, Perícia
Inigualável) estão implementadas — plano fechado.**

**Data/origem:** 2026-08.

