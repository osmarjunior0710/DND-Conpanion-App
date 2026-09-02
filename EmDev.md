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

## Bruxo — base + Patrono Ínfero

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
- [ ] **B4** — Level Up: Truques/Magias Preparadas crescem (reaproveita
      padrão do Bardo); Invocações Místicas crescem/trocam (mesmo
      componente); ASI 4/8/12/16.
- [ ] **B5** — Combat: Usar Magia real; Astúcia Mágica; Contatar
      Patrono (nível 9); Arcana Mística (nível 11+).
- [ ] **B6 — Patrono Ínfero**: Bênção do Tenebroso, Magias de Pacto do
      Ínfero, A Sorte do Próprio Tenebroso, Resistência Ínfera, Lançar
      no Inferno.

**Fora deste plano, registrado em `PENDENCIAS.md`:** Invocações Fase 2
(mecânica real das 29) e as outras 3 subclasses (Arquifada, Celestial,
Grande Antigo).
