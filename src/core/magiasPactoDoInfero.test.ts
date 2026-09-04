import { describe, it, expect } from 'vitest';
import { magiasPactoDoInfero } from './magiasPactoDoInfero';

describe('magiasPactoDoInfero', () => {
  it('nível 1: ainda não bateu o primeiro degrau (3)', () => {
    expect(magiasPactoDoInfero(1)).toEqual([]);
  });

  it('nível 3: só o primeiro degrau', () => {
    expect(magiasPactoDoInfero(3).sort()).toEqual(['Comando', 'Mãos Flamejantes', 'Raio Ardente', 'Sugestão'].sort());
  });

  it('nível 4: continua só o primeiro degrau (não pula pro seguinte antes da hora)', () => {
    expect(magiasPactoDoInfero(4).sort()).toEqual(['Comando', 'Mãos Flamejantes', 'Raio Ardente', 'Sugestão'].sort());
  });

  it('nível 9: acumula todos os 4 degraus (3/5/7/9)', () => {
    expect(magiasPactoDoInfero(9).sort()).toEqual(
      [
        'Comando',
        'Mãos Flamejantes',
        'Raio Ardente',
        'Sugestão',
        'Bola de Fogo',
        'Nuvem Fétida',
        'Escudo Ardente',
        'Muralha de Fogo',
        'Missão',
        'Praga de Insetos',
      ].sort(),
    );
  });

  it('nível 20: continua com os 10 (não há degrau além do 9)', () => {
    expect(magiasPactoDoInfero(20)).toHaveLength(10);
  });
});
