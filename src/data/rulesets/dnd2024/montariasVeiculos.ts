// Gerado a partir de dnd-master-referencia.xlsx, aba "Montarias e
// Veículos". Linhas de cabeçalho de seção foram filtradas na
// importação. Não editar valores à mão.

export interface MontariaOuVeiculo {
  id: string;
  nome: string;
  capacidade: string | null;
  custo: string | null;
  descricao: string | null;
  fonte: string;
}

export const montariasVeiculos: MontariaOuVeiculo[] = [
  {
    id: "camelo",
    nome: "Camelo",
    capacidade: "225 kg",
    custo: "50 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "cavalo-de-carga",
    nome: "Cavalo de Carga",
    capacidade: "270 kg",
    custo: "50 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "cavalo-de-guerra",
    nome: "Cavalo de Guerra",
    capacidade: "270 kg",
    custo: "400 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "cavalo-de-montaria",
    nome: "Cavalo de Montaria",
    capacidade: "240 kg",
    custo: "75 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "elefante",
    nome: "Elefante",
    capacidade: "660 kg",
    custo: "200 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "mastim",
    nome: "Mastim",
    capacidade: "93 kg",
    custo: "25 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "mula",
    nome: "Mula",
    capacidade: "210 kg",
    custo: "8 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "ponei",
    nome: "Pônei",
    capacidade: "112 kg",
    custo: "30 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "alimentacao-por-dia",
    nome: "Alimentação por dia",
    capacidade: "5 kg",
    custo: "5 PC",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "biga",
    nome: "Biga",
    capacidade: "50 kg",
    custo: "250 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "carroca",
    nome: "Carroça",
    capacidade: "100 kg",
    custo: "15 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "carruagem",
    nome: "Carruagem",
    capacidade: "300 kg",
    custo: "100 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "estabulo-por-dia",
    nome: "Estábulo por dia",
    capacidade: "—",
    custo: "5 PP",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "sela",
    nome: "Sela",
    capacidade: "—",
    custo: "—",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "exotica",
    nome: "Exótica",
    capacidade: "20 kg",
    custo: "60 PO",
    descricao: "Sela Exótica — necessária pra montar criatura aquática ou voadora.",
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "militar",
    nome: "Militar",
    capacidade: "15 kg",
    custo: "20 PO",
    descricao: "Sela Militar — Vantagem em qualquer teste de atributo pra permanecer montado.",
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "viagem",
    nome: "Viagem",
    capacidade: "12,5 kg",
    custo: "10 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "treno",
    nome: "Trenó",
    capacidade: "150 kg",
    custo: "20 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "vagao",
    nome: "Vagão",
    capacidade: "200 kg",
    custo: "35 PO",
    descricao: null,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
];
