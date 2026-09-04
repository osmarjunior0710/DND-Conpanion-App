import { describe, it, expect } from 'vitest';
import { usosSorteDoTenebroso } from './sorteDoTenebroso';

describe('usosSorteDoTenebroso', () => {
  it('mod. Carisma positivo — usa o valor direto', () => {
    expect(usosSorteDoTenebroso(3)).toBe(3);
  });

  it('mod. Carisma 0 ou negativo — nunca fica abaixo de 1', () => {
    expect(usosSorteDoTenebroso(0)).toBe(1);
    expect(usosSorteDoTenebroso(-2)).toBe(1);
  });
});
