# DECISOES-DADOS.md

> Decisões de design sobre a **camada `data/`** — schema de
> import da planilha mestra (Origens/Espécies/Classes/Magias/
> Talentos), padrão de pasta/formato, correções de planilha.
> Fato de regra de D&D já confirmado (não decisão de design) vai
> em `DND-Regras.md`, não aqui — ver seção 3.1 do `CLAUDE.md`.
> Parte da família `DECISOES-*.md` — ver o índice em
> `DECISOES-DESIGN.md`, e a seção 7 do `CLAUDE.md` pra regra de
> quando registrar uma entrada aqui.

---

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

## Planilha mestra ganha coluna "Descrição Curta (app, card de seleção)" na aba Antecedentes

**Contexto:** as 16 descrições curtas novas de Origem (ver decisão
acima) foram escritas direto no código
(`descricoesOrigensCurtas.ts`) — o Osmar pediu pra também salvar na
planilha mestra, coluna nova, pra não perder esse texto lá (mesmo
raciocínio de sempre: planilha é a fonte, o código deriva dela).

**Decisão:** nova coluna **K** na aba "Antecedentes" da
`dnd-master-referencia.xlsx`, título "Descrição Curta (app, card de
seleção)", com comentário na célula do cabeçalho deixando claro que é
resumo próprio (não trecho literal do livro, diferente do resto da
aba) — mesma frase usada em `descricoesOrigensCurtas.ts`, 1 linha por
Origem, mesma ordem das linhas já existentes (A2:A17). Arquivo não tem
nenhuma fórmula (confirmado: 0 fórmulas em todas as 40 abas), então
não precisou de recálculo.

**Data/origem:** 2026-08.

## Magias — Upcast estruturado (só a planilha, ainda sem motor/UI)

**O que é:** o Osmar pediu ajuda pra estruturar o "Upcast" (efeito de
conjurar em círculo mais alto) das 132 magias que já tinham texto
livre na coluna "Upcast" da planilha mestra — o texto tinha sido
digitado à mão a partir do livro e ele não tinha certeza se era
"por círculo" ou não pra cada uma. Escopo combinado com o Osmar via
pergunta: **só estruturar o dado nesta entrega** — extrair o Dano
Base de cada magia e ligar isso a um motor de rolagem de dados de
verdade fica pra uma entrega separada, futura.

**Como foi feito:** extraí o texto de "Usando um Espaço de Magia de
Círculo Superior" dos 3 PDFs de Magias (Cap. 7 do Livro do Jogador)
que o Osmar anexou, casando cada trecho com o nome da magia
correspondente na planilha. O PDF tem layout em 2 colunas que às
vezes embaralha a ordem de leitura automática — usei o **círculo da
própria magia (coluna "Círculo" já existente) como checagem
cruzada**: por regra, "acima de X" no upcast É SEMPRE o círculo da
própria magia, então qualquer trecho extraído com X diferente do
círculo da magia era sinal de erro de leitura (achei e corrigi 3
casos assim: Lâmina Flamejante, Arma Elemental, Guardiões
Espirituais — a extração automática tinha pego o texto do vizinho
errado). Pros casos onde o PDF ficou ambíguo mesmo depois de
recortar o texto certo, usei o texto que o Osmar já tinha digitado na
planilha como fonte (ele já tinha lido o livro certo pra digitar,
só faltava estruturar).

**Estrutura nova (aba "Magias", colunas N a S, a coluna "Upcast"
antiga em M ficou intacta pra comparação):**
- `Upcast_Tipo`: um de 5 valores —
  - **Dado por Círculo** (64 magias, ex: Bola de Fogo "+1d6 por
    círculo acima de 3") — usa `Upcast_Dado` (ex: "1d6") e
    `Upcast_CirculoBase` (o "acima de X").
  - **Alvo por Círculo** (25 magias, ex: Mísseis Mágicos "+1 dardo
    por círculo acima de 1") — usa `Upcast_Alvos` (quantos por
    círculo, quase sempre 1, mas Forma Etérea é 3) e
    `Upcast_CirculoBase`.
  - **Flat por Círculo** (13 magias, ex: Armadura de Agathys "+5 PV
    temp e +5 dano por círculo acima de 1" — número fixo, sem dado)
    — usa `Upcast_Flat` e `Upcast_CirculoBase`.
  - **Fórmula Própria** (12 magias, ex: as magias "Invocar X" e
    Dissipar Magia) — o efeito já escala sozinho pelo círculo do
    espaço usado, sem bônus adicional a somar; não usa nenhuma das
    colunas numéricas.
  - **Outro (texto livre)** (18 magias com regra não-linear demais
    pra caber num dos tipos acima sem perder precisão — ex:
    duração que salta pra um valor fixo em círculos específicos
    "6º:10 dias / 7º:30 dias / 8º:180 dias", ou efeitos com DOIS
    dados diferentes tipo Mão de Bigby — Punho Cerrado +2d8, Mão
    Esmagadora +2d6).
  - **Nenhum** (258 magias — truques e magias sem upcast, confirmado
    contra o "-" que o Osmar já tinha marcado).
- `Upcast_Texto`: sempre preenchido (menos "Nenhum") com a frase
  limpa e verificada, pra exibir na UI mesmo nos casos "Outro" onde
  não dá pra rodar dado automaticamente.

**Por que esse recorte de 5 tipos:** o pedido do Osmar foi "jogador
vê o resultado final (mais dados), a gente precisa rodar os dados
direito" — os 3 primeiros tipos (Dado/Alvo/Flat por Círculo, 102
magias) cobrem exatamente isso de forma genérica (fórmula: valor
base + (círculo usado − CirculoBase) × Upcast_Dado/Alvos/Flat).
"Fórmula Própria" e "Outro" ficam de fora do cálculo automático de
propósito — forçar esses 30 casos numa fórmula genérica ia exigir
inventar exceção em cima de exceção, e o texto livre já resolve a
exibição.

**Bug de dado encontrado e reportado ao Osmar (não corrigido por
mim):** 55 IDs na aba "Magias" são reaproveitados entre magias
diferentes (ex: as 14 magias "Invocar X" têm todas o mesmo ID
`Magik_Invo`). Não afeta o app hoje — `data/rulesets/dnd2024/magias.ts`
gera o próprio `id` a partir do nome (slug), nunca leu essa coluna da
planilha — mas fica registrado caso vire problema em outro uso futuro
da planilha.

**Fora de escopo desta entrega (ver `PENDENCIAS.md`):** Dano Base de
cada magia (pra somar com o Upcast e rodar o dado completo) e o
motor/UI que realmente executa a rolagem na Ficha.

**Data/origem:** 2026-09.

