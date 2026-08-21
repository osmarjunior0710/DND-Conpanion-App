// Gerado a partir de dnd-master-referencia.xlsx, aba "Idiomas".
// Não editar valores à mão.

export type TipoIdioma = 'Comum' | 'Raro';

export interface Idioma {
  id: string;
  nome: string;
  nomeIngles: string;
  tipo: TipoIdioma;
  origemFaladoPor: string;
  fonte: string;
}

export const idiomas: Idioma[] = [
  {
    id: "comum",
    nome: "Comum",
    nomeIngles: "Common",
    tipo: "Comum",
    origemFaladoPor: "Sigil (origem); falado por praticamente todos os povos",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "linguadesinaiscomum",
    nome: "Língua de Sinais Comum",
    nomeIngles: "Common Sign Language",
    tipo: "Comum",
    origemFaladoPor: "Sigil",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "draconico",
    nome: "Dracônico",
    nomeIngles: "Draconic",
    tipo: "Comum",
    origemFaladoPor: "Dragões",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "anao",
    nome: "Anão",
    nomeIngles: "Dwarvish",
    tipo: "Comum",
    origemFaladoPor: "Anões",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "elfico",
    nome: "Élfico",
    nomeIngles: "Elvish",
    tipo: "Comum",
    origemFaladoPor: "Elfos",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "gigante",
    nome: "Gigante",
    nomeIngles: "Giant",
    tipo: "Comum",
    origemFaladoPor: "Gigantes",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "gnomico",
    nome: "Gnômico",
    nomeIngles: "Gnomish",
    tipo: "Comum",
    origemFaladoPor: "Gnomos",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "goblin",
    nome: "Goblin",
    nomeIngles: "Goblin",
    tipo: "Comum",
    origemFaladoPor: "Goblinoides",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "pequenino",
    nome: "Pequenino",
    nomeIngles: "Halfling",
    tipo: "Comum",
    origemFaladoPor: "Pequeninos",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "orc",
    nome: "Orc",
    nomeIngles: "Orc",
    tipo: "Comum",
    origemFaladoPor: "Orcs",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "abissal",
    nome: "Abissal",
    nomeIngles: "Abyssal",
    tipo: "Raro",
    origemFaladoPor: "Demônios do Abismo",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "celestial",
    nome: "Celestial",
    nomeIngles: "Celestial",
    tipo: "Raro",
    origemFaladoPor: "Celestiais",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "dialetoobscuro",
    nome: "Dialeto Obscuro",
    nomeIngles: "Deep Speech",
    tipo: "Raro",
    origemFaladoPor: "Aberrações",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "druidico",
    nome: "Druídico",
    nomeIngles: "Druidic",
    tipo: "Raro",
    origemFaladoPor: "Círculos druídicos",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "giriadosladroes",
    nome: "Gíria dos Ladrões",
    nomeIngles: "Thieves' Cant",
    tipo: "Raro",
    origemFaladoPor: "Várias guildas criminosas",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "infernal",
    nome: "Infernal",
    nomeIngles: "Infernal",
    tipo: "Raro",
    origemFaladoPor: "Diabos dos Nove Infernos",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "primordialaquanauranignanterran",
    nome: "Primordial (Aquan/Auran/Ignan/Terran)",
    nomeIngles: "Primordial",
    tipo: "Raro",
    origemFaladoPor: "Elementais",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "silvestre",
    nome: "Silvestre",
    nomeIngles: "Sylvan",
    tipo: "Raro",
    origemFaladoPor: "A Faéria",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
  {
    id: "subcomum",
    nome: "Subcomum",
    nomeIngles: "Undercommon",
    tipo: "Raro",
    origemFaladoPor: "A Umbraeterna",
    fonte: "Livro do Jogador (D&D 5e 2024)",
  },
];
