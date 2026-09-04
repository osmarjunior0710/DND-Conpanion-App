// Gerado a partir de dnd-master-referencia.xlsx, aba "Glossário de
// Regras", termo "Tipos de Dano" — os 13 tipos oficiais (2024), cada
// um com seus exemplos reais do livro.

export interface TipoDeDano {
  nome: string;
  exemplos: string;
}

export const tiposDeDano: TipoDeDano[] = [
  { nome: 'Ácido', exemplos: 'Líquidos corrosivos, enzimas digestivas' },
  { nome: 'Contundente', exemplos: 'Objetos contundentes, constrição, queda' },
  { nome: 'Cortante', exemplos: 'Garras, objetos cortantes' },
  { nome: 'Elétrico', exemplos: 'Eletricidade' },
  { nome: 'Energético', exemplos: 'Energia mágica pura' },
  { nome: 'Gélido', exemplos: 'Água gelada, explosões de gelo' },
  { nome: 'Ígneo', exemplos: 'Chamas, calor insuportável' },
  { nome: 'Necrótico', exemplos: 'Energia que consome a vida' },
  { nome: 'Perfurante', exemplos: 'Presas, objetos perfurantes' },
  { nome: 'Psíquico', exemplos: 'Energia dilacerante para a mente' },
  { nome: 'Radiante', exemplos: 'Energia sagrada, radiação abrasadora' },
  { nome: 'Trovejante', exemplos: 'Som contundente' },
  { nome: 'Venenoso', exemplos: 'Gás tóxico, veneno' },
];
