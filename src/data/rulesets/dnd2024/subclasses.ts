// Nomes de subclasse confirmados na planilha mestra / Livro do Jogador
// (D&D 5e 2024) — só o nome, sem as características mecânicas ainda
// (essas ficam pra quando a subclasse for implementada de verdade, ver
// PENDENCIAS.md "Escolha de subclasse — versão placeholder"). Cada
// `id` bate com o arquivo `{id}-banner.png` em `assets/icones-classes/`.

export interface Subclasse {
  id: string;
  classeId: string;
  nome: string;
}

export const subclasses: Subclasse[] = [
  { id: 'bardo-colegio-da-bravura', classeId: 'bardo', nome: 'Colégio da Bravura' },
  { id: 'bardo-colegio-da-danca', classeId: 'bardo', nome: 'Colégio da Dança' },
  { id: 'bardo-colegio-do-conhecimento', classeId: 'bardo', nome: 'Colégio do Conhecimento' },
  { id: 'bardo-colegio-do-glamour', classeId: 'bardo', nome: 'Colégio do Glamour' },
];
