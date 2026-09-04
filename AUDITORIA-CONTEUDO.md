# AUDITORIA-CONTEUDO.md

> Plano de auditoria de conteúdo (magias, itens, armas, armaduras,
> itens mágicos e o resto do catálogo) — pedido do Osmar em 2026-09
> depois de perceber que o app cobre bem "personagem jogando com o
> catálogo que já existe", mas não tem padrão nenhum pra "conteúdo
> novo entrando no jogo" (item mágico dado pelo mestre, arma custom) e
> nem uma classificação real de mecânica de magia (ataque × salvaguarda
> × dano × cura). Este arquivo existe pra outra sessão/bot conseguir
> continuar esse trabalho sem depender do histórico da conversa que o
> originou.

## 0. Leia isto antes de qualquer coisa

Se você é uma sessão nova (bot diferente, ou este mesmo Claude Code
depois de perder o contexto), **leia `CLAUDE.md` inteiro primeiro** —
as regras de lá são permanentes e valem pra este trabalho também, sem
exceção. As mais importantes pra esta auditoria especificamente:

- **Fonte de dado é só `dnd-master-referencia.xlsx`** (raiz do
  repositório). Os PDFs dos livros **não existem neste repositório de
  propósito** — nunca busque regra na memória, na web, ou em qualquer
  lugar que não seja essa planilha. Se a planilha não tiver algo,
  **pare e anote como lacuna** — não invente, não complete "pelo que
  você sabe de D&D 5e".
- **Esta é uma auditoria de LEVANTAMENTO, não uma entrega de código.**
  O resultado esperado é um relatório de achados (pode ser direto
  neste arquivo, numa seção nova, ou um arquivo companheiro — decida o
  que for mais legível) — não é pra sair implementando schema novo ou
  mexendo em `src/data/` por conta própria. Depois do levantamento,
  quem decide os próximos passos é o Osmar (com ajuda do Claude Code),
  seguindo a Fase 2 abaixo.
- O Osmar **não sabe programar** — qualquer achado precisa ser
  explicado em termos de "o que falta pra o jogo funcionar direito",
  não em jargão técnico solto.

## 1. O padrão que estamos fechando: Descrição Completa × Descrição Curta

Pedido explícito do Osmar, encaixado nesta auditoria porque é o mesmo
trabalho de "passar por cada tipo de conteúdo, aba por aba": **toda
entrada de catálogo (magia, item, arma, armadura, talento, traço de
espécie, etc.) deveria ter as duas coisas**, não só uma:

- **Descrição Completa — texto literal, sem alteração.** Cópia exata
  do texto da coluna correspondente na planilha (ex: "Descrição
  Completa" da aba Magias), sem resumir, sem reescrever, sem cortar —
  a única edição permitida é a já documentada em `CLAUDE.md` seção 8
  (célula com conteúdo de outra aba colado por engano dentro dela —
  isso é limpeza de bug de extração, não "alteração de conteúdo", e já
  tem precedente: ver `caracteristicasSubclasse.ts`, característica
  "Lançar no Inferno"). Se a planilha não tiver uma coluna de
  descrição completa pra um tipo de conteúdo (ex: **Itens Mágicos** —
  confirmado nesta auditoria que a aba só tem "Efeito Resumido", sem
  nenhuma coluna de texto completo), **isso é uma lacuna de dado pra
  reportar ao Osmar**, não pra inventar um texto completo por conta
  própria.
- **Descrição Curta — resumo PRÓPRIO (não é trecho do livro), cobrindo
  as informações principais e relevantes.** Objetivo: alguém decidir
  se quer usar/equipar/conjurar aquilo sem precisar abrir a descrição
  completa. Tem que caber num card de seleção sem rolagem gigante (1–3
  frases, mesmo padrão das outras curtas já existentes — ver
  exemplos abaixo). "Principais e relevantes" quer dizer: o que muda
  mecanicamente (dano, CD, duração, bônus, restrição de uso), não só
  clima/flavor.

**Já existe esse padrão implementado em 2 lugares — use como
referência de qualidade, não reinvente o formato:**
- `src/data/rulesets/dnd2024/magias.ts` — campos `descricaoCompleta` +
  `descricaoCurta` nas 390 magias já importadas.
- `src/data/rulesets/dnd2024/especies.ts` (`introducao` +
  `introducaoCurta`) e `descricoesOrigensCurtas.ts` (par de
  `descricoesOrigens.ts`) — mesmo padrão, comentário no topo do
  arquivo já explica a regra ("resumo próprio, não trecho literal do
  livro").

### 1.1 O que a auditoria de amanhã precisa levantar sobre isso, por tipo de conteúdo

Pra cada linha da tabela da seção 2 abaixo, responder:
1. **A planilha tem coluna de descrição completa?** Se sim, o dado
   importado em `src/data/` bate exatamente com o texto da célula (sem
   corte/paráfrase não-documentada)? Se não, listar como lacuna.
2. **Existe descrição curta hoje?** Se sim, é um resumo próprio de
   qualidade (cobre a informação mecânica principal) ou é só o começo
   do texto completo cortado (isso NÃO conta como curta de verdade)?
3. **Se não existe curta ainda**, isso entra na lista de trabalho —
   mas **não escrever a curta nesta auditoria**, só marcar que falta
   (escrever 390+ resumos de qualidade é trabalho de implementação,
   Fase 3, não de levantamento).

## 2. Inventário por tipo de conteúdo — tabela de partida

Preenchida com o que já foi confirmado nesta conversa (2026-09) — a
auditoria de amanhã deve **conferir cada linha de novo** (o Osmar edita
a planilha por fora, pode ter mudado) e completar as que não foram
checadas ainda.

| Conteúdo | Aba da planilha | Arquivo em `src/data/` | Completa? | Curta? | Observação |
|---|---|---|---|---|---|
| Magias | Magias | `magias.ts` | ✅ `descricaoCompleta` | ✅ `descricaoCurta` | Padrão de referência — conferir amostra de qualidade das curtas mesmo assim. |
| Espécies (introdução) | Espécies | `especies.ts` | ✅ `introducao` | ✅ `introducaoCurta` | Padrão de referência. Traços individuais (`TracoEspecie.descricao`) só têm 1 campo — checar se precisam de curta também. |
| Origens | Antecedentes | `descricoesOrigens.ts` + `descricoesOrigensCurtas.ts` | ✅ | ✅ | Padrão de referência (arquivos separados, não campo dentro de `Origem`). |
| Armas | Armas | `armas.ts` | ⚠️ só `descricao` (1 campo) | ❌ não existe | Checar se a planilha tem 1 coluna só ou se dá pra separar completa/curta. |
| Armaduras | Armaduras | `armaduras.ts` | ⚠️ só `descricao` (1 campo) | ❌ não existe | Mesma checagem de Armas. |
| Equipamento de Aventura | Equipamento de Aventura | `equipamentoAventura.ts` | ⚠️ só `descricao` (1 campo) | ❌ não existe | — |
| Ferramentas | Ferramentas | `ferramentas.ts` (`OpcaoFerramenta`) | ⚠️ só `descricao` (1 campo) | ❌ não existe | — |
| Itens Mágicos | Itens Mágicos | `itensMagicos.ts` | ❌ planilha só tem "Efeito Resumido" | ⚠️ `efeitoResumido` já funciona como curta | **Confirmar com o Osmar se a planilha tem/vai ganhar uma coluna de texto completo** — sem isso não tem o que importar de "completa". |
| Talentos | Talentos | `talentos.ts` | ⚠️ só `beneficios` (1 campo) | ❌ não existe | — |
| Condições | Condições | *(não importado ainda)* | — | — | Nem sequer tem arquivo em `src/data/` — checar se algum lugar da Ficha precisa disso (ex: aplicar condição a um personagem). |
| Bugigangas | Bugigangas | *(não importado ainda)* | — | — | Confirmar se é conteúdo relevante pro escopo do app hoje. |
| Munição | Munição | *(não importado ainda)* | — | — | Idem. |
| Focos e Símbolos | Focos e Símbolos | *(não importado ainda)* | — | — | Idem — relevante pra Foco de Conjuração, hoje sem UI própria (ver PENDENCIAS.md). |
| Kits — Conteúdo | Kits — Conteúdo | *(não importado ainda)* | — | — | Idem. |
| Montarias e Veículos | Montarias e Veículos | `montariasVeiculos.ts` | ⚠️ não conferido nesta conversa | ⚠️ não conferido | Checar na auditoria. |
| Talentos de Dádiva Épica / Origem / Estilo de Luta | Talentos (mesma aba, campo Categoria) | `talentos.ts` | (mesma linha de Talentos acima) | | Já filtrado por `categoria` no dado — não é aba separada. |

**Fora do escopo desta auditoria** (não são "card de conteúdo pro
jogador", são referência/tabela de mestre): Progressão de Classe,
Magias Preparadas por Classe, Propriedades de Maestria, Opções de
Classe, Glossário de Regras, Estatísticas de Criaturas, Evolução do
Personagem, Regras Rápidas, Multiclasse, Tesouro por ND, Itens Mágicos
Inteligentes, Artefatos, Outras Recompensas, Proficiências de Classe,
Magias — UA Psion (não-oficial — fora do escopo do produto, ver
CLAUDE.md seção 9 "só D&D 5e regras 2024").

## 3. O outro problema junto: classificação mecânica de Magia

Hoje `core/classificarMagia.ts` **advinha** por regex em cima do texto
da `descricaoCurta` se uma magia é de ataque (jogador rola d20 pra
acertar), de salvaguarda (o alvo rola pra resistir), de cura, ou tem
custo de componente material — o próprio comentário no código admite
que a classificação pode errar ocasionalmente. Não existe nenhuma
coluna estruturada na aba Magias pra isso (`Círculo`, `Escola`,
`Classes`, `Tempo de Conjuração`, `Alcance`, `Componentes`, `Duração`,
`Descrição Completa`, `Fonte`, `Descrição Curta`, `Upcast*` — nenhuma
diz "tipo de rolagem").

**Levantar na auditoria:** dá pra extrair isso de forma confiável só
lendo o texto da Descrição Completa/Curta (então o classificador pode
ficar melhor sem precisar de dado novo), ou precisa mesmo de uma
coluna nova que só o Osmar consegue preencher (ele edita a planilha
por fora das conversas)? Se for a segunda opção, **não é bloqueante**
— reportar como pendência formal, o Osmar decide se vale o esforço de
preencher ~390 linhas.

### 3.1 Direção recomendada pro que estruturar em Magias (discutida com o Osmar, 2026-09)

O Upcast já foi estruturado (colunas N-S da aba Magias, ver
`DECISOES-DADOS.md` "Magias — Upcast estruturado") e o Dano Base já
está registrado como pendência formal (`PENDENCIAS.md` "Motor de
rolagem de dano de Magia") — a auditoria não precisa reabrir essas
duas, só confirmar que continuam valendo. O que falta acrescentar à
lista de campos a estruturar, no mesmo espírito (colunas novas,
mesmo processo de cruzar PDF + planilha já usado no Upcast):

- **`DanoBase_Dado` + `DanoBase_Tipo`** — a peça que falta pra fechar
  o motor de rolagem junto com o Upcast já feito (dado + tipo de dano
  no círculo mínimo da magia, ex: Bola de Fogo = 8d6 Ígneo no 3º
  círculo).
- **`AtaqueOuSalvaguarda`** — um de: Ataque à Distância / Ataque
  Corpo-a-Corpo / Salvaguarda de [atributo] / Nenhum. Sem isso não dá
  pra saber se a magia soma o modificador de acerto do personagem
  (rola d20 pra acertar) ou pede uma CD pro alvo resistir — informação
  que hoje só existe implícita no texto e é adivinhada por regex em
  `core/classificarMagia.ts` (ver seção 3 acima).
- **Alcance dobrado por Aprimoramento de Truque** — vários truques já
  têm esse texto na Descrição Completa (ex: "Acudir os Moribundos"
  dobra o alcance nos níveis 5/11/17); só vale estruturar se/quando o
  motor for calcular alcance de verdade — registrar como observação,
  não bloqueante agora.

**O que fica de fora de propósito:** qualquer efeito condicional,
narrativo ou não-linear demais (mesmo espírito dos 18 casos
`Upcast_Tipo = "Outro"` já aceitos como texto livre) — não vale
inventar taxonomia nova pra cobrir 100% das 390 magias, só o
suficiente pra rodar dano/acerto/CD das magias mais comuns em combate.

## 4. O outro problema junto: criar/receber item novo (arma, item mágico)

Confirmado nesta conversa: `core/mochila.ts`'s `criarItemManual(nome,
quantidade)` só cria "nome + quantidade" solto — não vira algo
equipável (sem dado de dano, propriedades, bônus de CA). A única forma
de dar um Item Mágico (dos 288 já catalogados em `itensMagicos.ts`) a
um personagem hoje é digitar o nome exato na caixa de texto livre de
"Adicionar item" da Mochila, que reconhece pelo nome contra o
catálogo — não tem tela de "escolher da lista".

Isso já estava parcialmente anotado em `PENDENCIAS.md` (seção de
Equipamento, "Catálogo pra 'Adicionar item' na Mochila, com tipos
estruturados") — **não duplicar entrada, só linkar** quando a Fase 2
desenhar o schema de verdade.

### 4.1 Direção recomendada pro que estruturar em Itens Mágicos (discutida com o Osmar, 2026-09)

Posição confirmada do Osmar: **não é objetivo implementar a função
mecânica dos 288 itens mágicos catalogados** — o que importa é que os
itens realmente usados em combate tenham a função básica cobrindo,
o resto fica como texto em `efeitoResumido`/info (mesmo tratamento
que hoje). `itensMagicos.ts` hoje é 100% texto solto, sem nenhum campo
estruturado — a lista abaixo é o "20% que cobre a maioria dos itens
usados em mesa", não uma tentativa de cobrir tudo:

- **`bonusItem: number | null`** — o caso mais comum e mais valioso:
  arma/armadura/escudo +1/+2/+3, soma direto em acerto+dano ou CA.
  Sozinho já cobre boa parte dos itens "ativos" mais comuns.
- **`tipoItem` categorizado** (além da `categoria` solta que já
  existe: Poção, Anel, etc.) — algo como `arma` | `armadura` |
  `escudo` | `consumível` (poção/pergaminho, some do inventário ao
  usar) | `passivo` (efeito sempre ligado, sem ação do jogador) |
  `ativo-com-carga`. Decide qual componente de UI o item usa (ex:
  consumível vira "usar 1x e remover da mochila", ativo-com-carga
  precisa de contador de cargas — mesmo padrão de `TickPips` já usado
  em Espaços de Magia).
- **`cargas: { max: number; recarga: string } | null`** — bastante
  item mágico (varinhas, bastões, alguns anéis) funciona por carga;
  sem isso cada um vira texto solto de novo, igual hoje.

**O que fica de fora de propósito:** qualquer efeito único,
condicional ou muito narrativo (a maioria dos itens Raro+/Lendário) —
esses continuam só como texto em `efeitoResumido`, sem campo
estruturado, até o Osmar pedir um item específico.

## 5. Fases do trabalho

### Fase 1 — Levantamento (é isto que roda amanhã)

Passar aba por aba da tabela da seção 2, confirmando cada checagem da
seção 1.1, e devolver um relatório (pode ser uma seção nova neste
arquivo, ou atualizar a tabela da seção 2 diretamente) com:
- O que já está OK (não precisa de trabalho).
- O que falta e é possível resolver só com o dado que a planilha já
  tem (ex: separar completa/curta de um campo único).
- O que falta e depende do Osmar completar a planilha primeiro (dado
  que não existe em lugar nenhum ainda).

**Não implementar nada nesta fase.** Zero código, zero edição de
`src/data/`.

### Fase 2 — Decisões de schema (com o Osmar, depois do relatório da Fase 1)

- Desenhar o schema comum de "completa + curta" pros tipos que ainda
  não têm (Armas, Armaduras, Equipamento de Aventura, Ferramentas,
  Talentos, Itens Mágicos se a planilha ganhar coluna nova).
- Decidir a taxonomia de classificação de Magia (ataque/salvaguarda/
  dano/cura) — de texto ou de coluna nova.
- Desenhar como um jogador "recebe"/cria um item novo (mágico ou
  homebrew) que já nasce equipável, reaproveitando `armas.ts`/
  `armaduras.ts` como schema de referência (CLAUDE.md seção 6.1 — não
  inventar um formato paralelo).

### Fase 3 — Entregas pequenas de verdade

Cada uma testável sozinha no celular, seguindo `CLAUDE.md` seção 6
(propor plano, esperar aprovação, menor entrega possível) — quebrada
em partes só depois que a Fase 2 estiver decidida.

## 6. Referências cruzadas (não duplicar informação)

- `PENDENCIAS.md` — item de Equipamento ("Catálogo pra 'Adicionar
  item'...") já tem contexto de arquitetura sobre isso.
- `DECISOES-DESIGN.md` — "Origem — card de seleção resumido" já
  documenta a decisão original de completa×curta pra Origens.
- `CLAUDE.md` seção 3 — fonte de dado (planilha, nunca livro/memória).
- `CLAUDE.md` seção 8 — lacunas de dado já conhecidas (conferir antes
  de reportar uma lacuna como "nova", pode já estar lá).
