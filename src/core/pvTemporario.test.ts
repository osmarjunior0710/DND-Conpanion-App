import { describe, it, expect } from 'vitest';
import { aplicarAlteracaoPv, ganharPvTemporario } from './pvTemporario';

describe('aplicarAlteracaoPv', () => {
  it('dano menor que o PV Temporário só desconta do Temporário', () => {
    const r = aplicarAlteracaoPv(20, 30, 12, -5);
    expect(r).toEqual({ pvAtual: 20, pvTemporario: 7 });
  });

  it('dano maior que o PV Temporário zera o Temporário e desconta o resto do PV normal', () => {
    const r = aplicarAlteracaoPv(20, 30, 5, -8);
    expect(r).toEqual({ pvAtual: 17, pvTemporario: 0 });
  });

  it('dano sem PV Temporário desconta direto do PV normal, sem ficar negativo', () => {
    const r = aplicarAlteracaoPv(3, 30, 0, -10);
    expect(r).toEqual({ pvAtual: 0, pvTemporario: 0 });
  });

  it('cura nunca soma em PV Temporário, só no PV normal (até o máximo)', () => {
    const r = aplicarAlteracaoPv(25, 30, 12, 10);
    expect(r).toEqual({ pvAtual: 30, pvTemporario: 12 });
  });
});

describe('ganharPvTemporario', () => {
  it('novo valor maior que o atual substitui (não soma)', () => {
    expect(ganharPvTemporario(3, 12)).toBe(12);
  });

  it('novo valor menor que o atual mantém o atual', () => {
    expect(ganharPvTemporario(12, 5)).toBe(12);
  });
});
