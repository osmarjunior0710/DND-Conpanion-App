import { describe, it, expect } from 'vitest';
import {
  bonusProficiencia,
  calcularCA,
  calcularCAEquipado,
  calcularPvMaximoNivel1,
  calcularIniciativa,
  calcularPercepcaoPassiva,
} from './calculoPersonagem';
import { classes } from '../data/rulesets/dnd2024/classes';
import { criarSelecaoInicial, type WizardSelection } from './personagem';
import type { ItemMochila } from './mochila';

const guerreiro = classes.find((c) => c.nome === 'Guerreiro');
if (!guerreiro) throw new Error('Fixture "Guerreiro" não encontrada em data/rulesets/dnd2024/classes.ts');

describe('bonusProficiencia', () => {
  it('nível 1 é sempre +2 (regra oficial pra qualquer classe)', () => {
    expect(bonusProficiencia(guerreiro, 1)).toBe(2);
  });

  it('sobe conforme a tabela de progressão da classe (Guerreiro nível 5 = +3, nível 9 = +4)', () => {
    expect(bonusProficiencia(guerreiro, 5)).toBe(3);
    expect(bonusProficiencia(guerreiro, 9)).toBe(4);
  });

  it('cai pro nível 1 quando o nível pedido não existe na tabela (fallback de borda)', () => {
    expect(bonusProficiencia(guerreiro, 999)).toBe(bonusProficiencia(guerreiro, 1));
  });
});

/** Guerreiro d10 (mod. CON +1), DES 14 (mod. +2), SAB 12 (mod. +1) —
 * fixture reaproveitada nos testes abaixo, `overrides` só pra mudar o
 * que cada teste precisa (perícia proficiente, etc). */
function selecaoGuerreiro(overrides: Partial<WizardSelection> = {}): WizardSelection {
  const s = criarSelecaoInicial();
  s.classe = 'Guerreiro';
  s.atributos = { FOR: 15, DES: 14, CON: 13, INT: 10, SAB: 12, CAR: 8 };
  return { ...s, ...overrides };
}

function itemEquipado(nome: string, slot: ItemMochila['slot']): ItemMochila {
  return { id: nome, nome, quantidade: 1, peso: null, origemDoItem: 'Manual', slot };
}

describe('calcularPvMaximoNivel1', () => {
  it('usa o dado de vida MÁXIMO da classe + mod. Constituição (nunca rola nem tira média no nível 1)', () => {
    expect(calcularPvMaximoNivel1(selecaoGuerreiro())).toBe(10 + 1); // d10 + mod. CON 13 (+1)
  });

  it('retorna null quando falta Constituição ou Classe (personagem em criação)', () => {
    expect(calcularPvMaximoNivel1(criarSelecaoInicial())).toBeNull();
  });
});

describe('calcularCA (criação, resumo do wizard)', () => {
  it('sem armadura escolhida no equipamento inicial: 10 + mod. Destreza', () => {
    expect(calcularCA(selecaoGuerreiro())).toBe(12); // DES 14 -> mod +2
  });
});

describe('calcularCAEquipado (Ficha, pós-criação)', () => {
  it('sem nada equipado: 10 + mod. Destreza (padrão "sem armadura")', () => {
    expect(calcularCAEquipado([], 14)).toBe(12);
  });

  it('armadura Leve sem teto de Destreza: base + mod. Destreza inteiro, mesmo alto', () => {
    const itens = [itemEquipado('Couro Batido', 'armadura')];
    expect(calcularCAEquipado(itens, 18)).toBe(12 + 4); // DES 18 -> mod +4, Couro Batido não tem teto
  });

  it('armadura Média com teto (máx. 2): mod. Destreza capado mesmo com Destreza alta', () => {
    const itens = [itemEquipado('Gibão de Peles', 'armadura')];
    expect(calcularCAEquipado(itens, 18)).toBe(12 + 2); // capado em +2, não +4
  });

  it('Escudo soma +2 além da armadura', () => {
    const itens = [itemEquipado('Couro Batido', 'armadura'), itemEquipado('Escudo', 'escudo')];
    expect(calcularCAEquipado(itens, 14)).toBe(12 + 2 + 2); // DES 14 -> mod +2
  });

  it('Estilo de Luta Defensivo soma +1 SÓ quando alguma Armadura está equipada', () => {
    const itens = [itemEquipado('Couro Batido', 'armadura')];
    expect(calcularCAEquipado(itens, 14, 'Defensivo')).toBe(12 + 2 + 1);
  });

  it('Defensivo sem nenhuma Armadura equipada não soma nada (regra real: precisa estar "usando armadura")', () => {
    expect(calcularCAEquipado([], 14, 'Defensivo')).toBe(12);
  });

  it('Mestre em Armaduras Médias eleva o teto de Destreza de 2 pra 3, com Armadura Média e Destreza 16+', () => {
    const itens = [itemEquipado('Gibão de Peles', 'armadura')];
    expect(calcularCAEquipado(itens, 16, null, ['mestre-em-armaduras-medias'])).toBe(12 + 3); // mod +3, dentro do novo teto
  });

  it('Mestre em Armaduras Médias não faz efeito se a Destreza for menor que 16', () => {
    const itens = [itemEquipado('Gibão de Peles', 'armadura')];
    expect(calcularCAEquipado(itens, 14, null, ['mestre-em-armaduras-medias'])).toBe(12 + 2); // continua no teto normal
  });
});

describe('calcularIniciativa', () => {
  it('sem o talento Alerta: só o mod. Destreza', () => {
    expect(calcularIniciativa(selecaoGuerreiro())).toBe(2); // DES 14 -> mod +2
  });

  it('com o talento Alerta: soma o Bônus de Proficiência do nível', () => {
    expect(calcularIniciativa(selecaoGuerreiro(), guerreiro, 1, ['alerta'])).toBe(2 + 2); // nível 1 = +2 de prof.
  });
});

describe('calcularPercepcaoPassiva', () => {
  it('sem proficiência em Percepção: 10 + mod. Sabedoria', () => {
    expect(calcularPercepcaoPassiva(selecaoGuerreiro(), 1)).toBe(11); // SAB 12 -> mod +1
  });

  it('com proficiência em Percepção: soma o Bônus de Proficiência do nível', () => {
    const s = selecaoGuerreiro({ periciasClasseEscolhidas: ['Percepção'] });
    expect(calcularPercepcaoPassiva(s, 1)).toBe(11 + 2);
  });
});
