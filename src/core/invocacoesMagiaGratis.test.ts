import { describe, it, expect } from 'vitest';
import { magiasGratisDasInvocacoes } from './invocacoesMagiaGratis';

describe('magiasGratisDasInvocacoes', () => {
  it('deriva a magia concedida por uma invocação "avontade" (ilimitado)', () => {
    const resultado = magiasGratisDasInvocacoes(['armadura-de-sombras']);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].magia.nome).toBe('Armadura Arcana');
    expect(resultado[0].recarga).toBe('ilimitado');
  });

  it('deriva a magia concedida por uma invocação "limitada" (descansoLongo)', () => {
    const resultado = magiasGratisDasInvocacoes(['presente-das-profundezas']);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].magia.nome).toBe('Respirar na Água');
    expect(resultado[0].recarga).toBe('descansoLongo');
  });

  it('ignora invocações sem magiaGratisConcedida (ex: passivas)', () => {
    expect(magiasGratisDasInvocacoes(['mente-mistica'])).toEqual([]);
  });

  it('lista vazia sem invocações', () => {
    expect(magiasGratisDasInvocacoes([])).toEqual([]);
  });

  it('várias invocações de graça ao mesmo tempo', () => {
    const resultado = magiasGratisDasInvocacoes(['salto-sobrenatural', 'passo-ascendente']);
    expect(resultado.map((r) => r.magia.nome).sort()).toEqual(['Levitação', 'Salto']);
  });
});
