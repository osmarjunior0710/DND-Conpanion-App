# EmDev.md

> Plano da entrega que está em andamento **agora**. Diferente da
> família `DECISOES-*.md` (decisão já tomada, permanente) e de
> `PENDENCIAS.md` (adiado de propósito), este arquivo é só o
> checklist de trabalho de uma entrega sendo executada — ver seção 14
> do `CLAUDE.md` pra regra completa.
>
> Fica vazio entre entregas. Quando todos os passos de um plano
> viram `[x]`, o conteúdo é apagado — não acumula plano antigo.

---

## Sentidos Especiais (Visão no Escuro, às Cegas, Verdadeira, Sismiconsciência) — dado estruturado — FEITA

- [x] `src/data/rulesets/dnd2024/sentidos.ts` (novo) — `TipoSentido`
      (visaoNoEscuro/visaoAsCegas/visaoVerdadeira/sismiconsciencia,
      sem Comum) + nomes de exibição.
- [x] `TracoEspecie` e `InvocacaoMistica` ganharam campo
      `sentidoConcedido: { tipo, alcanceMetros } | null`.
- [x] Marcados os traços "Visão no Escuro" das 8 espécies que têm isso
      importado (Anão/Orc = 36m, hoje jogáveis; demais 18m, ainda "em
      breve") — NÃO inclui "Conhecimento de Pedras" do Anão (ativado,
      Ação Bônus, usos limitados — não é sentido passivo).
- [x] Marcados Visão da Bruxa (Verdadeira, 9m) e Visão Diabólica (no
      Escuro, 36m) do Bruxo.
- [x] Novo `core/sentidos.ts` (testado) — junta espécie + Invocações
      atuais, pega o MAIOR valor por tipo entre as fontes.
- [x] Nova seção "Sentidos" na aba Atributos, antes de "Descanso" — só
      aparece com pelo menos 1 valor > 0. Confirmado via Playwright:
      Anão mostra "Visão no Escuro — 36m"; Humano sem nada não mostra a
      seção; Bruxo com Visão da Bruxa + Visão Diabólica mostra os 2
      tipos juntos (Escuro 36m, Verdadeira 9m) sem duplicar/somar.

## Bruxo — Pendências pós-base, ordem escolhida pelo Osmar: Pacto do Tomo → Invocações Fase 2 → características nomeadas → subclasses restantes

B6 (Patrono Ínfero) fica pausado até essa lista fechar — decisão do
Osmar (2026-09), não esquecido.

### 1. Pacto do Tomo (regra completa em `DND-Regras.md`)

- [x] **PT.1** — Wizard: passo condicional "1c. Livro das Sombras" (só
      aparece se `pacto-do-tomo` estiver entre as Invocações
      escolhidas) — escolhe 3 truques + 2 magias de 1º círculo com
      Ritual, de qualquer classe, que o personagem ainda não tenha.
      Confirmado via Playwright: passo aparece/some certo, catálogo
      mostra a classe de origem de cada magia, valida exatamente
      3+2 antes de avançar. Ficha ganhou seção "Livro das Sombras" na
      aba Magias (mesmo padrão visual de "Descobertas Mágicas",
      reaproveita `usarMagiaTemAcaoAutomatizada`/ícones automaticamente).
- [x] **PT.2** — Botão "Reconjurar o Livro das Sombras" na aba Magias
      (dentro da própria seção do livro, não perto de Descanso — mais
      descobrível) — reabre tela de escolha livre (sem trava de "só 1
      troca", regra real: não é fixo) pré-marcada com o livro atual.
      Confirmado via Playwright: abre com 3/2 pré-marcados, Confirmar
      atualiza o livro na Ficha.

### 2. Invocações Místicas Fase 2 (efeito mecânico das 27 restantes — Pacto do Tomo já feito)

Agrupadas por proximidade de implementação (ver DECISOES-CLASSES.md
quando a entrada for escrita), ordem aprovada pelo Osmar:

- [x] **IM.1 — Grupo A: "Conjura X sem gastar espaço" (10 invocações).**
      Armadura de Sombras, Lamento das Sepulturas, Máscara das Muitas
      Faces, Mestre das Infindáveis Formas, Passo Ascendente, Salto
      Sobrenatural, Uno com as Sombras, Visões de Reinos Distantes,
      Visões Nebulosas (todas `avontade`, ilimitadas) + Presente das
      Profundezas (`limitada`, 1x até o próximo Descanso Longo — mesmo
      padrão "gasto até descanso" do Pacto do Tomo). Novo campo
      `magiaGratisConcedida` em `invocacoesMisticas.ts` + novo
      `core/invocacoesMagiaGratis.ts` (testado) + seção "Magias das
      Invocações" na aba Magias. Confirmado via Playwright: as 3
      aparecem, `usar` funciona, Respirar na Água trava até Descanso
      Longo (ilimitadas não travam).
- [x] **IM.2 — Vigor Ínfero.** Novo `core/pvTemporario.ts` (testado) —
      `aplicarAlteracaoPv` (dano desconta do PV Temporário primeiro, só
      o excedente desconta do PV normal; cura nunca soma em PV
      Temporário) + `ganharPvTemporario` (pega o maior valor, não
      soma). Novo campo `pvTemporarioAtual` persistido, badge "+N temp"
      na aba Combate ao lado de "Pontos de Vida". Vigor Ínfero ganhou
      campo próprio `pvTemporarioConcedido` (12 = 2d4+4 máximo, sem
      rolar) — mantém botão "Usar" de verdade mesmo sendo `avontade`
      (ilimitada), diferente das outras 9 do IM.1, porque cada uso
      pode atualizar o PV Temporário. Confirmado via Playwright: 12 PV
      Temp concedidos, -5 de dano vira 7 temp (PV normal intacto),
      +10 de dano zera o temp e vaza 3 pro PV normal (30→27) — conta
      bate exatamente com a regra.
- [x] **IM.3 — Lança Mística — ADIADA, virou pendência** (Osmar: "deixa
      esse como pendência e voltamos depois quanto tiver dano e
      distância"). Ver `PENDENCIAS.md` ("Lança Mística"). Junto com
      Explosão Agonizante/Repulsiva, todo o Grupo B fica pra quando o
      motor de dano/alcance de magia existir.
- [x] **IM.4 — Pacto da Lâmina.** `ItemMochila.armaDePacto`, novo
      `core/pactoDaLamina.ts` (testado — `vincularArmaDePacto`/
      `desvincularArmaDePacto`), `ataqueComArma`/`ataqueAtual` ganharam
      `atribForcada` (testado), seção "Pacto da Lâmina" na aba Magias.
      Confirmado via Playwright: vincular Rapieira equipa sozinho na
      Mão Principal (aba Mochila), "Atacar" no Combat rola `1d20 + 3`
      (Carisma 17, sem Força/Destreza, sem bônus de proficiência —
      Bruxo não é proficiente em Marcial). Fora do escopo (sem uso
      mecânico no app hoje): "vincular arma mágica tocada" e "servir
      de Foco de Conjuração".
- [x] **IM.5 — Lâmina Sedenta + Lâmina Devoradora.** Nova função pura
      `ataqueExtraDoPactoDaLamina` em `core/pactoDaLamina.ts` (testada) +
      `numAtaques` em `FichaShell.tsx` virou
      `Math.max(numeroDeAtaques(classe, nível), 1 + extra)`. Zero UI
      nova — o botão "Atacar" do Guerreiro já mostrava "(ataque N/M)".
      Confirmado via Playwright: Bruxo nível 12 com Pacto da Lâmina +
      Lâmina Sedenta + Lâmina Devoradora, arma de pacto equipada,
      mostra "Atacar — Rapieira (ataque 1/3)".
- [ ] **IM.6 — Lições dos Grandes Antigos — PAUSADA**, ver PENDENCIAS.md
      ("Invocação Mística 'repetível' — mecanismo genérico"). Plano de
      implementação em si já mapeado (reaproveita a tela de Talento
      Geral do Level Up, filtro por categoria "Origem"), mas o Osmar
      pediu pra construir primeiro o suporte genérico a invocação
      repetível com escolha extra por instância, em vez de fazer essa
      como escolha única sabendo que vai precisar refazer.
- [x] **IM.7 — Corrige `[PH]` de Invocações na aba Perfil.** Nova
      `invocacaoTemPlaceholder(inv)` em `core/invocacoesMisticas.ts`
      (testada) — sem `[PH]` quando `magiaGratisConcedida`/
      `pvTemporarioConcedido`/`sentidoConcedido` não forem `null`, ou o
      id tiver mecânica própria (`pacto-da-lamina`/`lamina-sedenta`/
      `lamina-devoradora`/`pacto-do-tomo`), ou for passiva de texto
      puro (`mente-mistica`; Visão da Bruxa/Diabólica já saíram
      sozinhas via `sentidoConcedido`). `PerfilTab.tsx` usa essa função
      em vez do `[PH]` fixo. Confirmado via Playwright: Armadura de
      Sombras/Pacto da Lâmina/Mente Mística sem `[PH]`, Lança Mística
      continua com `[PH]` (ainda depende do motor de dano/alcance).

**Fora deste plano por enquanto** (dependem de sistemas que não
existem — Familiar, motor de dano de magia, trigger de "salvar de 0
PV"): Pacto da Corrente + Investimento do Mestre da Corrente, Punição
Mística + Sorvedouro de Vida, Presente dos Protetores + Olhar de Duas
Mentes. Registrado em `PENDENCIAS.md`.

### 3. Características nomeadas sem mecânica (Astúcia Mágica, Contatar Patrono, Arcana Mística, Dádiva Épica, Mestre Místico)

Ordem aprovada pelo Osmar ("vamos"): 1) Dádiva Épica → 2) Astúcia
Mágica + Mestre Místico → 3) Contatar Patrono → 4) Arcana Mística.
Pedido extra: sempre que aparecer algo no caminho que ainda não tem
efeito mecânico de verdade (ex: os talentos de Dádiva Épica em si),
marcar `[PH]` — não deixar implícito.

- [x] **1. Dádiva Épica (nível 19) — FEITA.** `TelaEscolherTalento.tsx`
      ganhou prop `categoria` (reaproveitada pelo passo `asi` sem
      mudar comportamento, e pelo novo passo `dadivaEpica`, sem
      aplicar ASI). `LevelUpShell.tsx`/`FichaShell.tsx` levam a
      escolha até `talentosGeraisAtuais`. Corrigido também o mesmo bug
      do IM.7 nos Talentos: `PerfilTab.tsx` mostrava `[PH]` fixo em
      todo Talento, mesmo nos 5 que já têm `efeitoMecanico` real (Fase
      4) — nova `talentoTemPlaceholder(t)` em `core/classificarTalento.ts`
      (testada) resolve. Confirmado via Playwright: Bruxo nível 18→19
      escolhe "Dádiva da Fortitude" na tela real (não mais a caixa
      "próxima entrega"), aparece em Perfil marcada `[PH]` (nenhuma
      Dádiva Épica tem efeito mecânico ainda, como esperado).
- [x] **2. Astúcia Mágica (nível 2) + Mestre Místico (nível 20) — FEITA.**
      Nova `espacosARecuperar(maximoTotal, gastoAtual, mestreMistico)`
      em `core/astuciaMagica.ts` (testada). Novo estado
      `astuciaMagicaGasta` (persistido, reseta só no Descanso Longo) +
      botão na aba Magias perto de "Espaços de Magia". Confirmado via
      Playwright: Bruxo nível 2 com 2/2 espaços gastos recupera 1
      (metade, arredondado pra cima) e trava até o próximo Descanso
      Longo; Bruxo nível 20 (Mestre Místico) com 4/4 gastos recupera
      os 4 (tudo, não só metade).
- [x] **3. Contatar Patrono (nível 9) — FEITA.** Contato Extraplanar
      sempre preparada + conjurável de graça (sucesso automático na
      salvaguarda) 1x por Descanso Longo. Novo estado
      `contatarPatronoGasto` (persistido, reseta só no Descanso
      Longo) + seção "Contatar Patrono" na aba Magias (pill padrão +
      botão "Usar de graça"/"Usada"). Confirmado via Playwright: Bruxo
      nível 9 mostra a seção com Contato Extraplanar, "Usar de graça"
      funciona e trava depois de usado.
- [x] **4. Arcana Mística (níveis 11/13/15/17) — FEITA.** 4 magias
      independentes (6º/7º/8º/9º círculo), cada 1 conjurável de graça
      1x por Descanso Longo. Só a escolha inicial quando desbloqueia;
      trocar arcanum depois fica pra outra entrega (PENDENCIAS.md).
      Novo `core/arcanaMistica.ts` (testado). Level Up ganhou o passo
      `arcanaMistica` (só nos níveis certos). Aba Magias ganhou a
      seção com 1 botão "Usar de graça"/"Usada" por círculo já
      escolhido. Confirmado via Playwright: Bruxo 10→11 escolheu
      "Caldeirão Borbulhante de Tasha" (6º círculo) na tela real,
      apareceu na aba Magias e travou depois de usar.

**Com o item 4 feito, as 4 características nomeadas (Astúcia Mágica/
Mestre Místico, Contatar Patrono, Dádiva Épica, Arcana Mística) estão
completas.** Só falta o item 4 da lista principal (subclasses
restantes: Arquifada, Celestial, Grande Antigo) pra fechar toda a
lista "Pendências pós-base" do Bruxo.

### 4. Patrono Arquifada, Celestial, Grande Antigo — ainda não quebrado em lotes

---

## Bruxo — base + Patrono Ínfero (PAUSADO — só falta B6, ver acima)

Fonte: SDD completo (4 patronos) + PDF do livro (Cap. 3, seção Bruxo,
p. 69-79) conferidos contra `dnd-master-referencia.xlsx` — tudo bate,
exceto 1 divergência do SDD já corrigida (ver `DECISOES-CLASSES.md`
quando a entrada for escrita): "Magias Psíquicas" é do Patrono O
Grande Antigo, não do Patrono Ínfero (planilha já estava certa).

- [x] **B0** — `core/ataque.ts` passa a checar proficiência de arma
      real (hoje assume sempre true — inofensivo em Guerreiro/Bardo,
      quebra no Bruxo, que só é proficiente em Armas Simples).
- [x] **B1** — Dados: `classes.ts` (progressão 1-20), `caracteristicasClasse.ts`
      (10 características base), proficiências (Simples/Leve),
      equipamento inicial, catálogo das 28 Invocações Místicas (dado
      puro, sem UI), stub das 4 subclasses (nome/ícone).
- [x] **B2** — Criação de personagem (wizard): Bruxo selecionável,
      escolhas de perícia/truque/magia preparada/equipamento; escolha
      da 1ª Invocação Mística (Fase 1 — lista simples, sem
      pré-requisito/mecânica ainda).
- [x] **B3** — Ficha/aba Magias: Espaço de Pacto (pool único
      quantidade+círculo, upcast automático, recupera Descanso Curto
      OU Longo).
- [x] **B4.1** — Level Up: Truques e Magias Preparadas crescem.
      Confirmado via Playwright (nível 3→4→5): Truques "escolha 3
      (2/3)" pré-marcado, Magias Preparadas idem — zero código novo,
      só reaproveitou `valorRecursoClasse`/`espacosDeMagiaAtivos`.
- [x] **B4.2** — Level Up: ASI nos níveis 4/8/12/16. Confirmado: passo
      "Atributo ou Talento" aparece certinho no nível 4 (com os
      requisitos de talento reconhecendo Magia de Pacto do Bruxo) e
      some no nível 5 — zero código novo.
- [x] **B4.3** — Level Up: Invocações Místicas crescem e trocam. Novo
      `core/invocacoesMisticas.ts`'s `invocacoesElegiveisAteNivel` +
      passo "Invocações Místicas" no Level Up (mesmo padrão de
      Truques). De brinde: Perfil da Ficha ganhou seção mostrando as
      invocações atuais (não existia lugar nenhum mostrando isso
      antes). Continua Fase 1 (sem dependência/mecânica).
- [x] **B5 — Usar Magia real no Combat.** Confirmado via Playwright
      (nível 3): painel de Ação → "Usar Magia" mostra Truques/Magias
      Preparadas reais agrupados por círculo, "2º: 2/2" do pool único
      de Pacto, gasta espaço de verdade, Escudo Arcano (Reação) some
      do painel de Ação corretamente — zero código novo, mesmo
      reaproveito total de B4.1/B4.2 (`personagemConjura` já reconhece
      Bruxo pelo recurso "Magias Preparadas", `SelecionarMagiaShell` já
      era genérico desde o Bardo). Astúcia Mágica/Contatar Patrono/
      Arcana Mística/Dádiva Épica/Mestre Místico (as características
      nomeadas que faltam) viram "especialização" — ver PENDENCIAS.md,
      mesmo tratamento do Bardo (grosso funcionando primeiro).
- **B6 — Patrono Ínfero** (despausado — "escolha de subclasse" no
      Level Up nível 3 já é real desde o B1/B4.3, mesmo mecanismo
      genérico do Bardo; só faltava o dado + a mecânica de cada
      característica):
  - [x] **B6.1 — Dado.** 5 características importadas em
        `caracteristicasSubclasse.ts` (conferidas contra a planilha
        mestra, aba "Subclasses") — Bênção do Tenebroso, Magias de
        Pacto do Ínfero (+ campo estruturado `magiasFixasPorNivel`,
        as 10 magias conferidas contra o catálogo), A Sorte do Próprio
        Tenebroso, Resistência Ínfera, Lançar no Inferno (limpo o
        texto do Clérigo colado no final + 1 typo de palavra quebrada
        "t em"→"tem", mesmo bug já documentado no CLAUDE.md seção 8).
        Confirmado via Playwright: as 5 aparecem certas na aba Perfil
        pra um Bruxo com Patrono Ínfero escolhido, sem contaminação.
  - [x] **B6.2 — Bênção do Tenebroso — FEITA.** Nova
        `valorBencaoDoTenebroso(carMod, nivel)` em
        `core/bencaoDoTenebroso.ts` (testada) — mín. 1 PV Temp.
        Reaproveita `ganharPvTemporario` (motor do Vigor Ínfero) —
        botão manual no Combat, sem teto de usos (dispara toda vez que
        o jogador clicar, regra real não tem limite). Confirmado via
        Playwright: Bruxo CAR 16 (+3) nível 5 → botão concede
        exatamente +8 PV Temp.
  - [x] **B6.3 — Magias de Pacto do Ínfero — FEITA.** Nova
        `magiasPactoDoInfero(nivel)` em `core/magiasPactoDoInfero.ts`
        (testada) — lê `magiasFixasPorNivel` (já importado no B6.1) e
        acumula por degrau (3/5/7/9). Nova seção "Magias de Pacto do
        Ínfero" na aba Magias (mesmo padrão visual de "Descobertas
        Mágicas" — sempre preparadas, fora do limite normal, mas ainda
        gastam Espaço de Pacto de verdade ao conjurar). Entram também
        em `magiasConjuraveis` (painéis de Ação/Reação do Combat).
        Confirmado via Playwright: Bruxo Patrono Ínfero nível 1 sem
        seção, nível 3 mostra só as 4 do primeiro degrau, nível 9
        acumula as 10 (3+5+7+9) sem duplicar.
  - [x] **B6.4 — A Sorte do Próprio Tenebroso — FEITA.** Nova
        `usosSorteDoTenebroso(carMod)` em `core/sorteDoTenebroso.ts`
        (testada) — mín. 1 uso. Mesmo padrão de Indomável (usos
        limitados, reseta só no Descanso Longo) — novo card no Combat
        rola 1d10 avulso (mesmo mecanismo de "Mente Tática"), com aviso
        pra somar numa jogada de teste de atributo ou salvaguarda antes
        do efeito acontecer.
  - [ ] **B6.5 — Resistência Ínfera.** Escolha de tipo de dano ao
        descansar — informativo (sem motor de dano recebido ainda).
  - [ ] **B6.6 — Lançar no Inferno.** Ataque especial 1x/Descanso
        Longo, com opção de gastar 1 espaço de Pacto pra repetir.

**Fora deste plano, registrado em `PENDENCIAS.md`:** Invocações Fase 2
(mecânica real das 29), as características nomeadas do Bruxo ainda sem
mecânica (Astúcia Mágica, Contatar Patrono, Arcana Mística, Dádiva
Épica, Mestre Místico) e as outras 3 subclasses (Arquifada, Celestial,
Grande Antigo).
