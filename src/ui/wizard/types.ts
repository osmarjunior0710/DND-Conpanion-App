import type { Atributo } from '../../data/wizardFixtures';

export interface WizardSelection {
  classe: string | null;
  origem: string | null;
  ferramentaOrigemEscolhida: string | null;
  equipamentoOrigemEscolhido: 'A' | 'B' | null;
  especie: string | null;
  linguas: string[];
  alinhamento: string | null;
  itens: string[];
  atributos: Record<Atributo, number | null>;
  bonusModo: '111' | null;
  bonusEscolhas: Atributo[];
  xp: number;
  nome: string;
  aparencia: string;
  personalidade: string;
}

export function criarSelecaoInicial(): WizardSelection {
  return {
    classe: null,
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
    xp: 0,
    nome: '',
    aparencia: '',
    personalidade: '',
  };
}

export function modFmt(valor: number): string {
  const mod = Math.floor((valor - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function valorFinalAtributo(selection: WizardSelection, atributo: Atributo): number | null {
  const base = selection.atributos[atributo];
  if (base === null || base === undefined) return null;
  const bonus = selection.bonusEscolhas.filter((x) => x === atributo).length;
  return base + bonus;
}
