export interface ExampleCharacter {
  id: string;
  nome: string;
  especie: string;
  classe: string;
  nivel: number;
  pvAtual: number;
  pvMax: number;
  faded?: boolean;
}

export const exampleCharacters: ExampleCharacter[] = [
  {
    id: 'osmar-bruxo',
    nome: "osmarmelojunior's Character",
    especie: 'Tiefling',
    classe: 'Bruxo',
    nivel: 1,
    pvAtual: 14,
    pvMax: 14,
  },
  {
    id: 'exemplo-guerreiro',
    nome: '(personagem de exemplo)',
    especie: 'Anão',
    classe: 'Guerreiro',
    nivel: 3,
    pvAtual: 21,
    pvMax: 28,
    faded: true,
  },
];
