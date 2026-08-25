// Forma de dado do personagem em construção (escolhas do wizard) +
// funções puras de atributo. Fica em core/ (não em ui/wizard/) porque
// isso é dado de personagem, não componente de tela — o motor de
// cálculo (calculoPersonagem.ts) e o armazenamento (armazenamentoPersonagens.ts)
// dependem deste formato.

import type { Atributo } from '../data/wizardFixtures';
import type { ItemCarrinho } from './loja';

export interface WizardSelection {
  classe: string | null;
  estiloDeLutaEscolhido: string | null;
  maestriaArmaEscolhida: string[];
  periciasClasseEscolhidas: string[];
  equipamentoClasseEscolhido: 'A' | 'B' | 'C' | null;
  origem: string | null;
  ferramentaOrigemEscolhida: string | null;
  equipamentoOrigemEscolhido: 'A' | 'B' | null;
  especie: string | null;
  linguas: string[];
  alinhamento: string | null;
  itens: ItemCarrinho[];
  atributos: Record<Atributo, number | null>;
  bonusModo: '111' | null;
  bonusEscolhas: Atributo[];
  desbloquearAtributos: boolean;
  xp: number;
  nome: string;
  aparencia: string;
  personalidade: string;
}

export function criarSelecaoInicial(): WizardSelection {
  return {
    classe: null,
    estiloDeLutaEscolhido: null,
    maestriaArmaEscolhida: [],
    periciasClasseEscolhidas: [],
    equipamentoClasseEscolhido: null,
    origem: null,
    ferramentaOrigemEscolhida: null,
    equipamentoOrigemEscolhido: null,
    especie: null,
    linguas: ['Comum'],
    alinhamento: null,
    itens: [],
    atributos: { FOR: null, DES: null, CON: null, INT: null, SAB: null, CAR: null },
    bonusModo: null,
    bonusEscolhas: [],
    desbloquearAtributos: false,
    xp: 0,
    nome: '',
    aparencia: '',
    personalidade: '',
  };
}

export function modificador(valor: number): number {
  return Math.floor((valor - 10) / 2);
}

export function modFmt(valor: number): string {
  const mod = modificador(valor);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function valorFinalAtributo(selection: WizardSelection, atributo: Atributo): number | null {
  const base = selection.atributos[atributo];
  if (base === null || base === undefined) return null;
  const bonus = selection.bonusEscolhas.filter((x) => x === atributo).length;
  return base + bonus;
}
