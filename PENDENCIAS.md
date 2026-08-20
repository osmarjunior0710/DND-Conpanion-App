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

## Popup de descrição nos itens de equipamento (falta dado na planilha)

**O que é:** pedido do Osmar — todo item de um kit de origem (Adaga,
Roupas de Viagem, Saco de Dormir...) deveria ter um "i" ou nome
serrilhado tocável que abre um popup com nome + descrição do item.

**Por que foi adiado:** checado campo a campo na planilha mestra —
**nenhuma aba de equipamento geral tem coluna de descrição**:
- `Equipamento de Aventura`: só Item / Peso / Custo.
- `Kits — Conteúdo`: só Kit / Custo / Itens Incluídos (lista crua, sem
  texto por item).
- `Bugigangas`: são só resultados de tabela 1d100, não descrições de
  item de equipamento.
- `Armas` e `Armaduras` **são exceção** — têm colunas mecânicas (dano,
  propriedades, maestria / CA, força mínima, furtividade) que dão pra
  virar uma descrição de verdade.

**Estado atual:** a tela de Escolhas da Origem lista os itens normalmente
(nome + quantidade), mas **sem** ícone de info em nenhum item ainda —
nada foi importado desta leva.

**O que falta pra resolver:**
1. Importar `Armas` e `Armaduras` da planilha (únicas abas com dado
   suficiente) e ligar por nome aos itens que aparecem nos kits de
   origem/classe.
2. Construir o componente de popup reutilizável (nome no header +
   descrição) — mesma peça serve depois pra magias/talentos, é o padrão
   "tooltip em texto sublinhado / pill com ícone i" já registrado como
   adiado no `DECISOES-DESIGN.md`.
3. Decidir o que fazer com os itens de equipamento geral que **não têm**
   descrição na planilha (a maioria) — ou eles ficam sem o ícone de
   info mesmo (aceitável), ou o Osmar escreve descrições curtas à mão
   pra completar a planilha (decisão dele, não travar por isso).

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

## Espécies — formato "uma linha por traço" precisa de agrupamento

**O que é:** ao contrário de Origens (uma linha = uma origem completa), a
aba Espécies da planilha tem **uma linha por traço**, agrupadas por
espécie via uma linha-separador (`— Aasimar —`). Um traço pode ser texto
descritivo puro, um traço passivo simples, ou embutir uma escolha dentro
do próprio texto (ex: tamanho "Médio ou Pequeno, escolhido ao selecionar
esta espécie").

**Por que foi adiado:** ainda não foi feita a análise completa de quantas
espécies têm escolha embutida no texto (como o exemplo de tamanho do
Aasimar) vs. quantas são só traços fixos — isso decide o schema.

**O que falta pra resolver:** varrer as 40 espécies da planilha, listar
quais têm escolha embutida em texto (não em coluna própria) e desenhar
como isso vira um campo estruturado antes de importar.

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
