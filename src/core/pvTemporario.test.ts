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

  it('cura que não passa do máximo só enche o PV normal, sem mexer no Temporário', () => {
    const r = aplicarAlteracaoPv(25, 30, 12, 4);
    expect(r).toEqual({ pvAtual: 29, pvTemporario: 12 });
  });

  it('cura que cruza o máximo neste clique: enche até o máximo, o excedente deste clique é descartado', () => {
    const r = aplicarAlteracaoPv(90, 100, 0, 15);
    expect(r).toEqual({ pvAtual: 100, pvTemporario: 0 });
  });

  it('cura que cruza o máximo não mexe em PV Temporário que já existia', () => {
    const r = aplicarAlteracaoPv(90, 100, 12, 15);
    expect(r).toEqual({ pvAtual: 100, pvTemporario: 12 });
  });

  it('já no máximo (house rule): cura vira PV Temporário inteiro, somando com o que já tinha', () => {
    const r = aplicarAlteracaoPv(100, 100, 0, 5);
    expect(r).toEqual({ pvAtual: 100, pvTemporario: 5 });
  });

  it('já no máximo e já com PV Temporário: nova cura SOMA (não é "pega o maior")', () => {
    const r = aplicarAlteracaoPv(100, 100, 12, 5);
    expect(r).toEqual({ pvAtual: 100, pvTemporario: 17 });
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
