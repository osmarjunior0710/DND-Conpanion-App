import { describe, it, expect } from 'vitest';
import { bonusProficiencia } from './calculoPersonagem';
import { classes } from '../data/rulesets/dnd2024/classes';

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
