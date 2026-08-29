# CLAUDE.md

> Este arquivo contém regras permanentes deste projeto. Leia por completo
> antes de qualquer trabalho, mesmo que pareça repetitivo — o contexto da
> conversa se perde com o tempo, este arquivo não.
>
> Este arquivo é o "coração" do projeto: regras fixas, que não mudam com
> frequência. Decisões de design que evoluem com o tempo ficam em
> `DECISOES-DESIGN.md` — leia esse arquivo também, e **atualize-o** sempre
> que tomar ou aprender algo sobre uma decisão de design (ver seção 7).
> Coisas adiadas de propósito (ainda não resolvidas) ficam em
> `PENDENCIAS.md` — leia esse também, e **atualize-o** sempre que adiar
> algo ou resolver algo que estava lá (ver seção 11).

## 1. Quem está do outro lado

O responsável pelo produto (Osmar) **não sabe programar**. Ele só consegue
avaliar entregas testando na tela do celular — nunca leia um relatório
técnico e "confie". Isso muda como você deve trabalhar:

- Nunca diga que algo "deveria funcionar" sem dar um passo a passo de como
  testar na tela.
- Nunca entregue mudanças grandes de uma vez. Prefira sempre a menor
  entrega que já seja testável sozinha.
- Ao final de toda entrega relevante, responda sem que ele precise pedir:
  1. O que exatamente mudou (lista de arquivos, 1 frase cada)
  2. Como testar isso sozinho, sem ler código (passo a passo na tela)
  3. Isso quebra algo que já funcionava antes?
  4. Isso foi testado em largura de celular (~390px) primeiro? Tem algo
     pequeno demais pra tocar com o dedo?

## 2. Fonte de verdade de comportamento: o wireframe

`wireframe-app-rpg-v2.html` é a especificação de comportamento deste
projeto. Toda tela, transição e interação que você construir deve
reproduzir o que está ali — incluindo o Layout C da aba Combat (painel de
Ação/Ação Bônus/Reação, estado Ativo vs Usada, contador de Espaços de
Magia). Não invente fluxo novo sem confirmar antes. Se algo não estiver
claro no wireframe, pergunte — não assuma.

## 3. Fonte de verdade de dados: a planilha, nunca os PDFs

`dnd-master-referencia.xlsx`, na raiz do repositório, é a fonte de dados
de regras (classes, magias, talentos, equipamento, condições). Os PDFs
originais dos livros **não existem neste repositório** de propósito.
Nunca tente buscar regra em outro lugar (memória própria, web) — se a
planilha não tiver algo, pare e avise exatamente o que está faltando.

**Antes de começar qualquer entrega que toque em dado de regra**
(classes, subclasses, origens, espécies, talentos, magias, equipamento,
condições, progressão) — mesmo que pareça que o dado já foi importado
antes — **abra `dnd-master-referencia.xlsx` e confira a aba relevante
primeiro**, comparando com o que já existe em `src/data/`. O Osmar edita
essa planilha por fora das conversas com o Claude Code (corrige,
completa, reorganiza abas) — o histórico de chat perde essa evolução,
a planilha não. Se encontrar diferença entre o que está importado e o
que a planilha tem agora, trate como um bug de dado desatualizado:
avise o Osmar, não silenciosamente ignore nem silenciosamente
sobrescreva sem dizer o que mudou.

## 4. Arquitetura em camadas — não negociável

- `data/` — conteúdo de regras (JSON/TS gerado a partir da planilha). Zero
  lógica aqui.
- `core/` — motor de cálculo (CA, PV, modificadores, economia de ação).
  Zero constante de D&D hardcoded — tudo lido de `data/`. TypeScript
  obrigatório aqui.
- `ui/` — componentes React. Nenhuma regra de D&D deve viver aqui; UI só
  exibe o que `core/` calcula.
- Armazenamento (local hoje, nuvem no futuro) fica atrás de uma interface
  trocável — nunca acesse `localStorage` direto de dentro de componentes.

## 5. Mobile/Tablet first — ordem de construção, não checklist final

Construa e teste em largura de celular (~390px) **primeiro**. Tablet e
desktop são "esticar depois", nunca o ponto de partida. Toda área
clicável precisa ser grande o suficiente pro dedo, não pro cursor. Nunca
esconda informação importante atrás de hover.

## 5.1 Ordem de construção de UI: M3 primeiro, pele RPG depois

Ao implementar qualquer componente/tela nova, siga sempre esta ordem:
1. Estrutura e comportamento seguindo Material Design 3
   (m3.material.io) — espaçamento, states, motion, acessibilidade,
   padrões de componente (bottom sheet, FAB, seleção, etc.).
2. Só depois, aplicar a pele temática de RPG por cima (textura,
   tipografia old-school, paleta dourada/bronze — ver
   `DECISOES-DESIGN.md` pra detalhes já registrados).
Isso é um processo padrão, não uma escolha caso a caso — vale pra toda
tela nova daqui pra frente.

## 6. Antes de escrever qualquer código

Proponha um plano de entregas pequenas e espere aprovação. Nunca comece a
implementar sem esse plano ter sido confirmado.

## 7. Regra de atualização do DECISOES-DESIGN.md

Sempre que você tomar (ou o usuário tomar, com sua ajuda) uma decisão de
design que não é óbvia a partir do código — por que um padrão de UI foi
escolhido, por que uma regra de D&D foi simplificada de um jeito
específico, o que já foi tentado e descartado — registre em
`DECISOES-DESIGN.md`, não só no chat. O chat se perde; esse arquivo não.
Antes de propor uma solução de UI ou de regra que pareça uma decisão de
design (não só uma correção técnica óbvia), **consulte esse arquivo
primeiro** pra não repetir uma decisão que já foi tomada e revertida antes.

## 8. Lacunas de dados conhecidas (não travam o projeto)

Estas informações ainda não foram extraídas dos livros. Se uma entrega
depender de uma delas, avise o Osmar especificamente qual — ele resolve
sob demanda:
- Auditoria de Ação Bônus/Reação nas 337 linhas de Subclasses da planilha
- Talentos com ativação em combate (quais concedem Ação Bônus/Reação)
- Confirmar se número de idiomas concedidos é sempre 2 ou varia por
  Origem/Espécie — **resolvido:** não varia, planilha não tem coluna de
  idioma em Origem/Espécie. Ver `DECISOES-DESIGN.md`.
- Idioma extra concedido por característica de Classe nível 1 (além dos
  2+Comum da Origem): confirmado que Druida (Druídico, fixo) e Ladino
  (Gíria dos Ladrões + 1 à escolha) concedem — ainda não implementado
  na Ficha/wizard (só a tela de Línguas da Origem existe hoje). As
  outras 10 classes ainda não foram auditadas linha a linha na aba
  "Características de Classe". Ver `PENDENCIAS.md`.
- **~24 células de "Descrição Completa" (Características de Classe e
  Subclasses) têm conteúdo duplicado de outra aba colado dentro** — ver
  `auditoria-planilha-mestra.md` (arquivo do Osmar, não faz parte do
  repositório) pra lista completa. NÃO usar essas células como estão;
  extrair só a descrição própria da característica antes de importar,
  do mesmo jeito que já foi feito com Bruxo/Mestre Místico (referência
  de correção no mesmo arquivo). Nenhuma célula do Guerreiro (nível 1-20
  na classe base) está nessa lista — só afeta subclasses dele
  (Cavaleiro Místico nível 3, Mestre da Batalha nível 18), que ainda não
  foram importadas.

~~Bônus de Proficiência por nível~~ — já estava na planilha mestra (aba
Progressão de Classe), removido.
~~Tabela de XP por nível~~ — já existe na planilha (aba Evolução do
Personagem), removido.
~~Proficiências de arma/armadura/escudo por classe~~ — extraída dos
livros pelo Osmar, nova aba "Proficiências de Classe" na planilha,
removido. Ver `DECISOES-DESIGN.md`.
~~Fórmula exata de capacidade de carga (Força × multiplicador)~~ —
confirmada na planilha mestra, aba "Glossário de Regras" (termo
"Capacidade de Carga"): Força × 7 kg pra Tamanho Pequeno/Médio (única
combinação usada pelas espécies jogáveis do projeto hoje). Corrige o
valor anterior (Força × 7,5 kg), que tinha sido estimado de memória
antes da planilha ser conferida. Ver `DECISOES-DESIGN.md`.
~~Popup de descrição de Armas e Armaduras~~ — planilha ganhou coluna
"Descrição" nas duas abas, importado e ligado. Removido.
~~Progressão de círculo dos meio-conjuradores (Guardião/Paladino)~~ —
confirmada linha a linha, idêntica entre as duas classes, removido. Ver
`DECISOES-DESIGN.md`.

## 9. Escopo do produto (não expandir sem confirmar)

- Só D&D 5e (regras 2024), sem abstração para outros sistemas.
- Uso pessoal — Osmar e o grupo de mesa dele. Sem lançamento público, sem
  monetização, sem paywall.
- Login/nuvem (Supabase) só entra na Fase 5, depois de tudo local estar
  testado e aprovado.

## 10. Carimbo de versão visível (obrigatório em toda entrega)

Toda entrega publicada precisa mostrar, em algum ponto fixo da tela
(rodapé discreto), um carimbo de versão no formato:

```
v{AAAA}{MM}_{HHmm}
```

- `AAAA` = ano, `MM` = mês, `HHmm` = hora e minuto, **do momento do
  commit/push**, sempre em **horário de Brasília (UTC-3)** — não o
  horário do servidor onde o Claude Code roda, que costuma ser UTC.
- Exemplo: `v202608_1100` = ano 2026, mês 08, 11h00 (Brasília).
- Fonte única: `src/version.ts`, exportando a constante `APP_VERSION`.
- **Antes de cada `git push`**, atualize `src/version.ts` com o horário
  atual em Brasília (`TZ='America/Sao_Paulo' date +"%Y%m_%H%M"`) e
  inclua esse arquivo no commit.
- Motivo: o Osmar usa esse carimbo pra confirmar rapidamente, no celular,
  se o navegador carregou a versão nova ou se ainda está servindo cache
  antigo — sem precisar adivinhar.

## 11. Regra de atualização do PENDENCIAS.md

Sempre que uma entrega adiar algo de propósito — um dado que a planilha
não tem completo ainda, uma UI que precisa de mais desenho antes de
implementar, uma exceção estrutural que apareceu mas não trava a entrega
atual — registre em `PENDENCIAS.md` o que é, por que foi adiado, e o que
falta pra resolver. Isso vale tanto pra dados (ex: uma origem/classe que
precisa de uma seleção que ainda não tem tela) quanto pra decisões de
arquitetura deixadas em aberto (ex: multiclasse). Quando algo da lista for
resolvido, mova a entrada pra `DECISOES-DESIGN.md` (como decisão tomada)
e remova de `PENDENCIAS.md` — não deixe as duas listas com a mesma coisa.
Antes de propor uma entrega nova que toque em dado de regra (origens,
classes, espécies, talentos, magias), **consulte esse arquivo primeiro**
pra não reabrir uma pendência que já tinha contexto registrado.

## 12. Marcação de conteúdo placeholder — prefixo `[PH]`

Qualquer texto visível na tela que **não** venha de regra real
validada — dado fixture/exemplo (ex: `data/exampleCombat.ts`), número
inventado só pra preencher espaço, ou qualquer coisa colocada só pra
o layout não ficar vazio enquanto a lógica de verdade não existe —
precisa começar com `[PH]` no próprio texto exibido (ex: "🗡 Atacar
`[PH]` valores de exemplo (Adaga +4)"). Isso vale tanto pro nome
quanto pra descrição, o que fizer mais sentido pro caso.

- **Objetivo:** o Osmar consegue olhar qualquer tela e saber na hora
  o que já foi revisado/é regra real (sem `[PH]`) vs. o que ainda é
  espaço reservado esperando dado/lógica de verdade (com `[PH]`) —
  sem precisar perguntar ou ler código.
- **Ao substituir o placeholder por lógica/dado real, remova o
  `[PH]`** — não deixe as duas coisas ao mesmo tempo.
- **Regra permanente daqui pra frente:** sempre que, durante qualquer
  entrega, você notar um texto na tela que se encaixa nessa definição
  e ainda não tem `[PH]`, adicione — mesmo que não tenha sido pedido
  especificamente pra essa tela. Não espere uma revisão formal pra
  marcar.
- Ações genéricas do Cap. 1 (Ajudar, Analisar, Correr, etc.) **não**
  são placeholder — são texto de regra real, mesmo sem cálculo por
  trás ainda. `[PH]` é só pra número/nome inventado, não pra texto de
  regra correto com pouca interatividade.
