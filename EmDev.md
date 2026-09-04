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
- [ ] **2. Draconato** — piloto da natureza `identidade_permanente`:
      estruturar Herança Dracônica (10 dragões × tipo de dano) num
      array próprio, tela de escolha na "Escolhas da Espécie", resolver
      Ataque de Sopro/Resistência a Dano pelo tipo escolhido
      (`traçosVinculadosASubescolha`, sem duplicar valor fixo).
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

Começando agora pelo item 1 (Humano).
