# EmDev.md

> Plano do foco que está em andamento **agora** (ver ciclo de foco,
> seção 6 do `CLAUDE.md`). Diferente da família `DECISOES-*.md`
> (decisão já tomada, permanente) e de `PENDENCIAS.md` (adiado de
> propósito ou travado estruturalmente), este arquivo é só o checklist
> de trabalho do foco sendo executado agora.
>
> Fica vazio entre focos. Quando um foco fecha (seção 6.3), o conteúdo
> é apagado — não acumula plano antigo.

---

## Foco: Espécies (raças) — habilitar as 7 que faltam

Hoje só Anão, Orc e Pequenino estão liberadas. Conferido contra a
planilha (aba Espécies, sem mudança de estrutura) e contra o PDF do
Cap. 4 do Livro do Jogador (fornecido pelo Osmar) — o texto de
`especies.ts` bate 100% com o livro, incluindo as tabelas de
sub-escolha (Herança Dracônica, Linhagem Élfica, Linhagem Gnômica,
Ancestralidade Gigante, Legados Ínferos, Revelação Celestial). Não
falta dado, falta estruturar o texto corrido em campos próprios + tela
de escolha, espécie por espécie.

Ordem de entrega (menor/mais simples primeiro, reaproveitando padrão
sempre que possível — ver 6.1):

- [x] **1. Humano** — sem sub-escolha real, só 3 traços simples:
  - [x] Tamanho (Médio ou Pequeno) — seletor novo de 2 opções, mesmo
        padrão do "Equipamento A ou B" do `OrigemEscolhasStep.tsx`.
  - [x] Hábil (perícia à escolha) — reaproveita o padrão de checkbox
        de `TalentoOrigemEscolhasStep.tsx`.
  - [x] Versátil (talento de Origem à escolha) — reaproveita
        `TelaEscolherTalento.tsx` com `categoria="Origem"`.
  - [x] Marcar `disponivel: true` no dado, tirar do texto "(em breve)".
  - Testado com Playwright (gerador de Personagem de Teste): Humano
    aparece na lista de espécies, perícia e talento escolhidos batem
    na tela de Perfil ("Hábil — escolhida: X", "Versátil — escolhido:
    Y"). `npx tsc -b`, `npm test -- --run` (162 testes) e
    `npm run build` passando.
- [x] **2. Draconato** — piloto da natureza `identidade_permanente`:
      Herança Dracônica estruturada em `Especie.opcoesSubescolha` (novo
      campo genérico, reaproveitável pro Golias), tela de escolha das
      10 cores de dragão na "Escolhas da Espécie", Ataque de
      Sopro/Resistência a Dano resolvidos em tempo de leitura pelo tipo
      de dano da cor escolhida (`core/especieSubescolha.ts`, com
      teste) — nunca duplicado como valor fixo.
  - Testado com Playwright: wizard bloqueia avançar sem escolher a cor
    ("Complete as escolhas da espécie"), tela de escolha mostra as 10
    cores com o tipo de dano de cada uma, e a Ficha (aba Perfil) mostra
    "Herança Dracônica: Cobre"/"Azul" e "Ataque de Sopro (Tipo de dano:
    Elétrico)" resolvidos corretamente pra 2 cores diferentes. `npx tsc
    -b`, `npm test -- --run` (164 testes) e `npm run build` passando.
- [ ] **3. Golias** — mesma natureza `identidade_permanente`,
      reaproveitando o padrão do Draconato (Ancestralidade Gigante, 5
      opções com usos = Bônus de Proficiência).
- [ ] **4. Elfo** — piloto da natureza `linhagem_com_progressao_magica`:
      Linhagem Élfica (3 opções), magia de círculo superior automática
      nos níveis 3 e 5 — precisa "conversar" com o motor de level-up.
- [ ] **5. Gnomo** — mesma natureza, versão mais simples (Linhagem
      Gnômica, 2 opções, só nível 1, sem progressão 3/5).
- [ ] **6. Tiferino** — mesma natureza, reaproveitando o padrão de
      Elfo/Gnomo (Legados Ínferos, 3 opções, progressão 3/5 como Elfo).
- [ ] **7. Aasimar** — natureza `escolha_reutilizavel` (Revelação
      Celestial): não é escolha do wizard, é escolha repetida toda vez
      que a habilidade é usada em combate. **Perguntar ao Osmar onde
      fica e como o jogador ativa antes de codar** (regra do
      `LICOES-RAPIDAS.md`), deixado por último de propósito por causa
      disso.
- [ ] **8. Mapeamento de traços ATIVOS de espécie pra Combat** —
      achado no meio do foco (Ataque de Sopro do Draconato só aparece
      como texto na aba Perfil hoje, igual todo outro traço — nenhum
      traço ativo de espécie tem botão/ação em Combat ainda, nem os
      já liberados). Combinado com o Osmar: primeiro terminar de
      colocar as 10 espécies no sistema (itens 1-7), depois voltar
      nisto de uma vez só — não é trava estrutural (não depende de
      nada fora deste foco), é só decisão de ordem. Levantamento feito
      agora pra não perder o mapeamento:

  **Precisam de UI ativa em Combat (botão + rastreio de usos):**
  - Anão — Conhecimento de Pedras (Ação Bônus, usos = Bônus de
    Proficiência, recarrega Descanso Longo).
  - Orc — Pico de Adrenalina (Ação Bônus, usos = Bônus de
    Proficiência, recarrega Curto OU Longo — mesmo padrão de trava já
    resolvido em Resistência Ínfera do Bruxo); Vigor Implacável (não é
    "botão", é reativo — dispara sozinho ao cair a 0 PV, mas precisa
    rastrear "já usado neste Descanso Longo" pra saber se ainda vale).
  - Pequenino — Sorte (reroll em resultado 1 no d20 — parecido com o
    padrão `BonusExtraProvider` já usado pra Sorte do Tenebroso/
    Indomável, mas é REROLL, não bônus somado — precisa de variante
    nova do mecanismo).
  - Aasimar — Mãos Curativas (Ação Usar Magia, cura, 1x/Descanso
    Longo); Revelação Celestial (já é o item 7 acima, 3 sub-opções por
    uso).
  - Draconato — Ataque de Sopro (substitui um ataque, Cone/Linha,
    salvaguarda de Destreza, dano escala por nível, usos = Bônus de
    Proficiência, Descanso Longo — precisa de modal parecido com
    "Lançar no Inferno"); Voo Dracônico (Ação Bônus, nível 5+,
    1x/Descanso Longo).
  - Gnomo — Gnomo do Bosque (Falar com Animais grátis, usos = Bônus de
    Proficiência, Descanso Longo); Gnomo das Rochas (fabricar
    dispositivo — mais utilidade/downtime que combate, prioridade
    baixa).
  - Golias — Ancestralidade Gigante (5 opções bem diferentes entre si:
    dano extra ao acertar, reação pra reduzir dano, teleporte por Ação
    Bônus, derrubar ao acertar, reação de dano — usos = Bônus de
    Proficiência, Descanso Longo); Forma Grande (Ação Bônus, nível 5+,
    1x/Descanso Longo).

  **Só passivo/descritivo — não precisa de UI em Combat, texto na
  aba Perfil já resolve:** Visão no Escuro (todas — já é
  `sentidoConcedido`), Resistência a Toxinas/Celestial/a Dano,
  Tenacidade Anã, Corajoso, Agilidade Pequenina, Furtividade Natural,
  Eficiente, Ancestralidade Feérica, Sentidos Aguçados, Transe,
  Astúcia de Gnomo, Porte Poderoso, Presença Sobrenatural, Portador da
  Luz (concede truque — entra na lista de magias normal, não é UI de
  espécie própria), benefício de nível 1 de Linhagem Élfica/Legado
  Ínfero (Alto Elfo/Drow/Elfo Silvestre e os 3 Legados Ínferos — truque
  concedido + efeito passivo, sem botão de ativar).

Começando agora pelo item 1 (Humano).
