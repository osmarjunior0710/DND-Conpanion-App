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
- [ ] **IM.6 — Lições dos Grandes Antigos** (concede Talento de Origem
      permanente).
- [ ] **IM.7 — Passivas de texto** (Mente Mística, Visão da Bruxa,
      Visão Diabólica — sem motor pra calcular, só tira o `[PH]`).

**Fora deste plano por enquanto** (dependem de sistemas que não
existem — Familiar, motor de dano de magia, trigger de "salvar de 0
PV"): Pacto da Corrente + Investimento do Mestre da Corrente, Punição
Mística + Sorvedouro de Vida, Presente dos Protetores + Olhar de Duas
Mentes. Registrado em `PENDENCIAS.md`.

### 3. Características nomeadas sem mecânica (Astúcia Mágica, Contatar Patrono, Arcana Mística, Dádiva Épica, Mestre Místico) — ainda não quebrado em lotes

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
- [ ] **B6 — Patrono Ínfero**: Bênção do Tenebroso, Magias de Pacto do
      Ínfero, A Sorte do Próprio Tenebroso, Resistência Ínfera, Lançar
      no Inferno.

**Fora deste plano, registrado em `PENDENCIAS.md`:** Invocações Fase 2
(mecânica real das 29), as características nomeadas do Bruxo ainda sem
mecânica (Astúcia Mágica, Contatar Patrono, Arcana Mística, Dádiva
Épica, Mestre Místico) e as outras 3 subclasses (Arquifada, Celestial,
Grande Antigo).
