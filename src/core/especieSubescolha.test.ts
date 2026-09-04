import { describe, it, expect } from 'vitest';
import { tipoDanoSubescolha } from './especieSubescolha';
import { especies } from '../data/rulesets/dnd2024/especies';
import { criarSelecaoInicial } from './personagem';

const draconato = especies.find((e) => e.id === 'draconato');
if (!draconato) throw new Error('Fixture "Draconato" não encontrada em data/rulesets/dnd2024/especies.ts');

describe('tipoDanoSubescolha', () => {
  it('resolve o tipo de dano da cor de dragão escolhida', () => {
    const s = { ...criarSelecaoInicial(), subescolhaEspecieEscolhida: 'Vermelho' };
    expect(tipoDanoSubescolha(draconato, s)).toBe('Ígneo');
  });

  it('retorna null quando a sub-escolha ainda não foi feita', () => {
    expect(tipoDanoSubescolha(draconato, criarSelecaoInicial())).toBeNull();
  });
});
