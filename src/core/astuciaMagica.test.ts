import { describe, it, expect } from 'vitest';
import { espacosARecuperar } from './astuciaMagica';

describe('espacosARecuperar', () => {
  it('sem Mestre Místico: recupera metade do máximo, arredondado pra cima', () => {
    expect(espacosARecuperar(3, 3, false)).toBe(2); // ceil(3/2) = 2
    expect(espacosARecuperar(4, 4, false)).toBe(2); // ceil(4/2) = 2
  });

  it('nunca recupera mais do que o que está gasto de verdade', () => {
    expect(espacosARecuperar(3, 1, false)).toBe(1); // metade seria 2, mas só tem 1 gasto
  });

  it('nada gasto: recupera 0', () => {
    expect(espacosARecuperar(3, 0, false)).toBe(0);
  });

  it('com Mestre Místico: recupera tudo que está gasto, não só metade', () => {
    expect(espacosARecuperar(3, 3, true)).toBe(3);
    expect(espacosARecuperar(3, 1, true)).toBe(1);
  });

  it('borda: máximo 1 espaço, arredonda ceil(0.5) pra 1', () => {
    expect(espacosARecuperar(1, 1, false)).toBe(1);
  });
});
