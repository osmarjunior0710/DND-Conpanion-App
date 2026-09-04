import { describe, it, expect } from 'vitest';
import { valorBencaoDoTenebroso } from './bencaoDoTenebroso';

describe('valorBencaoDoTenebroso', () => {
  it('mod. Carisma positivo + nível', () => {
    expect(valorBencaoDoTenebroso(3, 5)).toBe(8);
  });

  it('mod. Carisma negativo: nunca fica abaixo de 1', () => {
    expect(valorBencaoDoTenebroso(-1, 1)).toBe(1); // -1+1=0, mínimo 1
  });

  it('mod. Carisma bem negativo: ainda mínimo 1', () => {
    expect(valorBencaoDoTenebroso(-5, 3)).toBe(1); // -5+3=-2, mínimo 1
  });

  it('nível alto, mod. 0', () => {
    expect(valorBencaoDoTenebroso(0, 20)).toBe(20);
  });
});
