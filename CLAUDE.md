# CLAUDE.md

> Este arquivo contém regras permanentes deste projeto. Leia por completo
> antes de qualquer trabalho, mesmo que pareça repetitivo — o contexto da
> conversa se perde com o tempo, este arquivo não.
>
> Este arquivo é o "coração" do projeto: regras fixas, que não mudam com
> frequência. Decisões de design que evoluem com o tempo ficam em
> `DECISOES-DESIGN.md` — leia esse arquivo também, e **atualize-o** sempre
> que tomar ou aprender algo sobre uma decisão de design (ver seção 7).

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

`dnd-master-referencia.xlsx` é a fonte de dados de regras (classes,
magias, talentos, equipamento, condições). Os PDFs originais dos livros
**não existem neste repositório** de propósito. Nunca tente buscar regra
em outro lugar (memória própria, web) — se a planilha não tiver algo, pare
e avise exatamente o que está faltando.

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
- Tabela de XP necessário por nível
- Bônus de Proficiência por nível (tabela de escala)
- Fórmula exata de capacidade de carga (Força × multiplicador)
- Auditoria de Ação Bônus/Reação nas 337 linhas de Subclasses da planilha
- Talentos com ativação em combate (quais concedem Ação Bônus/Reação)

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
  commit/push** (não do momento em que o código foi escrito).
- Exemplo: `v202608_1100` = ano 2026, mês 08, 11h00.
- Fonte única: `src/version.ts`, exportando a constante `APP_VERSION`.
- **Antes de cada `git push`**, atualize `src/version.ts` com o horário
  atual (`date +"%Y%m_%H%M"`) e inclua esse arquivo no commit.
- Motivo: o Osmar usa esse carimbo pra confirmar rapidamente, no celular,
  se o navegador carregou a versão nova ou se ainda está servindo cache
  antigo — sem precisar adivinhar.
