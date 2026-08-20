// Dados FIXOS pra Fase 0 (esqueleto navegável) — iguais aos do wireframe.
// Substituídos pela planilha mestra na Fase 1 (data/rulesets/dnd2024/).

export interface ClasseFixture {
  nome: string;
  desc: string;
  dadoVida: string;
  complexidade: string;
}

export const classesFixture: ClasseFixture[] = [
  { nome: 'Bárbaro', desc: 'Batalha e fúria primitiva.', dadoVida: 'd12', complexidade: 'Média' },
  { nome: 'Bruxo', desc: 'Poder através de um pacto com uma entidade.', dadoVida: 'd8', complexidade: 'Alta' },
  { nome: 'Guerreiro', desc: 'Mestre de armas e táticas de combate.', dadoVida: 'd10', complexidade: 'Baixa' },
  { nome: 'Mago', desc: 'Magia através de estudo e livros arcanos.', dadoVida: 'd6', complexidade: 'Média' },
];

export interface OrigemFixture {
  nome: string;
  desc: string;
}

export const origensFixture: OrigemFixture[] = [
  { nome: 'Acólito', desc: 'Serviu num templo, conhece rituais e hierarquia religiosa.' },
  { nome: 'Criminoso', desc: 'Viveu à margem da lei, bom em contatos duvidosos.' },
  { nome: 'Marinheiro', desc: 'Anos no mar, conhece navegação e portos.' },
];

export interface EspecieFixture {
  nome: string;
  desc: string;
}

export const especiesFixture: EspecieFixture[] = [
  { nome: 'Humano', desc: 'Versátil, adaptável, um talento extra no nível 1.' },
  { nome: 'Elfo', desc: 'Sentidos aguçados, imune a sono mágico.' },
  { nome: 'Tiefling', desc: 'Herança infernal, resistência a fogo, magia inata.' },
  { nome: 'Anão', desc: 'Resiliente, visão no escuro, resistência a veneno.' },
];

export const linguasDisponiveis = ['Comum', 'Élfico', 'Anão', 'Infernal', 'Celestial', 'Abissal'];

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
