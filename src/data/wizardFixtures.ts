// Dados FIXOS pra Fase 0 (esqueleto navegável) — iguais aos do wireframe.
// Substituídos pela planilha mestra na Fase 1 (data/rulesets/dnd2024/).

export const alinhamentos = [
  'Leal e Bom',
  'Neutro e Bom',
  'Caótico e Bom',
  'Leal e Neutro',
  'Neutro',
  'Caótico e Neutro',
  'Leal e Mau',
  'Neutro e Mau',
  'Caótico e Mau',
];

export const arrayPadrao = [15, 14, 13, 12, 10, 8];

export const atributosOrdem = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as const;
export type Atributo = (typeof atributosOrdem)[number];

export const pvBaseClasse: Record<string, number> = {
  Bárbaro: 12,
  Guardião: 10,
  Guerreiro: 10,
  Paladino: 10,
  Bardo: 8,
  Bruxo: 8,
  Clérigo: 8,
  Druida: 8,
  Ladino: 8,
  Monge: 8,
  Feiticeiro: 6,
  Mago: 6,
};

export interface LojaItemFixture {
  nome: string;
  preco: string;
}

export const lojaItensFixture: LojaItemFixture[] = [
  { nome: 'Poção de Cura', preco: '50 PO' },
  { nome: 'Corda (15m)', preco: '1 PO' },
  { nome: 'Tocha ×5', preco: '5 PC' },
  { nome: 'Kit de Ladrão', preco: '25 PO' },
];
