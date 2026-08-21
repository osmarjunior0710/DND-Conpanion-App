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
quando ela for reenviada, reimportar **todas** as abas que ganharem essas
colunas novas, não só a que motivou o pedido — em especial:
- **Armas** e **Armaduras** (item acima, ainda sem popup de descrição).
- **Talentos de Origem** (`talentos.ts`) — hoje usa a coluna
  `beneficios` corrida como descrição; se ganhar uma versão "curta"
  separada, dá pra usar a curta no InfoChip e manter a completa em algum
  lugar de mais detalhe.
- **Antecedentes** (`origens.ts`) — se ganhar coluna de descrição
  narrativa própria, `descricoesOrigens.ts` (hoje uma exceção manual
  transcrita do livro) pode ser aposentado e o campo migrado pra dentro
  do gerador normal a partir da planilha. Ver decisão registrada em
  `DECISOES-DESIGN.md`.
- Qualquer outra aba nova que ganhar as colunas (Espécies, Classes, etc.
  quando chegar a vez delas).

**Estado atual:** nada a fazer ainda — é só um aviso de intenção, a
planilha ainda não foi atualizada. Quando o Osmar reenviar o arquivo,
reler a estrutura de todas as abas antes de reimportar (não assumir que
só a aba mencionada mudou).

## Popup de descrição só falta pra Armas e Armaduras (Equipamento de Aventura já resolvido)

**O que é:** o popup de descrição tocável (nome sublinhado → popup com
nome + texto) já funciona pra **Equipamento de Aventura** (98 itens,
Osmar atualizou a planilha com a coluna Descrição) e **Montarias e
Veículos** (19 itens, só 2 com descrição real — Sela Militar e Sela
Exótica, o resto é só capacidade/custo mesmo). Itens de arma/armadura
(Adaga, Armadura de Couro...) ainda aparecem como texto simples, sem
popup, porque **Armas** e **Armaduras** ainda não foram importadas da
planilha (essas abas têm colunas mecânicas — dano, propriedades, CA,
força mínima — em vez de um campo de texto corrido; dá pra virar
descrição, mas ainda não foi feito).

**O que falta pra resolver:**
1. Importar `Armas` e `Armaduras` da planilha, montando uma frase de
   descrição a partir das colunas mecânicas de cada uma.
2. Ligar esses itens no mesmo índice de busca por nome que já existe em
   `data/rulesets/dnd2024/buscarDescricaoItem.ts` (hoje só cobre
   Equipamento de Aventura + Montarias/Veículos).
3. `Kits — Conteúdo` e `Bugigangas` continuam sem coluna de descrição
   própria na planilha — não é falha de importação, é como a planilha
   está (Bugigangas é tabela de sabor narrativo, o próprio texto já é
   a "descrição"; Kits são só listas cruas de itens que remetem aos
   itens individuais, que aí sim têm descrição pelo caminho normal).

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
