import { describe, it, expect } from 'vitest';
import { totalIdiomasEsperados } from './idiomas';

describe('totalIdiomasEsperados', () => {
  it('classe sem idioma extra: só os 2 da Origem', () => {
    expect(totalIdiomasEsperados('Guerreiro')).toBe(2);
  });

  it('Druida: 2 da Origem + 1 fixo (Druídico), sem escolha extra', () => {
    expect(totalIdiomasEsperados('Druida')).toBe(3);
  });

  it('Ladino: 2 da Origem + 1 fixo (Gíria dos Ladrões) + 1 escolha livre', () => {
    expect(totalIdiomasEsperados('Ladino')).toBe(4);
  });

  it('sem classe escolhida ainda: só os 2 da Origem', () => {
    expect(totalIdiomasEsperados(null)).toBe(2);
  });
});
