// Ficha de exemplo FIXA pra Fase 0 (esqueleto navegável) — o Bruxo
// Tiefling do wireframe. Ainda não vem do wizard nem da planilha mestra
// (isso entra na Fase 1).

export interface AtributoExemplo {
  nome: string;
  mod: number;
  valor: number;
}

export const atributosExemplo: AtributoExemplo[] = [
  { nome: 'FOR', mod: -1, valor: 8 },
  { nome: 'DES', mod: 2, valor: 15 },
  { nome: 'CON', mod: 2, valor: 15 },
  { nome: 'INT', mod: 0, valor: 10 },
  { nome: 'SAB', mod: 1, valor: 12 },
  { nome: 'CAR', mod: 2, valor: 15 },
];

export const personagemExemplo = {
  nome: "osmarmelojunior's Character",
  especie: 'Tiefling',
  classe: 'Bruxo',
  dadoVida: 'd8',
  nivel: 1,
  pvMax: 14,
  ca: 13,
  iniciativa: 2,
};

export interface ItemEquipadoExemplo {
  nome: string;
  peso: string;
}

export const itensEquipadosExemplo: ItemEquipadoExemplo[] = [
  { nome: '🗡 Adaga (mão principal)', peso: '0,5 kg' },
  { nome: '🧥 Armadura de Couro', peso: '4,5 kg' },
];

export const cargaExemplo = {
  atual: 18.5,
  maxima: 40,
};
