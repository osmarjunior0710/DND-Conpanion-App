import { describe, it, expect } from 'vitest';
import { truqueEspecie, magiasEspecie } from './magiasEspecie';
import { criarSelecaoInicial } from './personagem';

function selecaoElfo(subescolhaEspecieEscolhida: string | null): ReturnType<typeof criarSelecaoInicial> {
  return { ...criarSelecaoInicial(), especie: 'Elfo', subescolhaEspecieEscolhida };
}

describe('truqueEspecie', () => {
  it('resolve o truque conhecido da linhagem escolhida', () => {
    expect(truqueEspecie(selecaoElfo('Drow'))).toBe('Luzes Dançantes');
  });

  it('retorna null sem espécie/sub-escolha compatível', () => {
    expect(truqueEspecie(criarSelecaoInicial())).toBeNull();
  });
});

describe('magiasEspecie', () => {
  it('nível 1-2: nenhuma magia ainda', () => {
    expect(magiasEspecie(selecaoElfo('Alto Elfo'), 1)).toEqual([]);
    expect(magiasEspecie(selecaoElfo('Alto Elfo'), 2)).toEqual([]);
  });

  it('nível 3: desbloqueia a magia de nível 3', () => {
    expect(magiasEspecie(selecaoElfo('Alto Elfo'), 3)).toEqual(['Detectar Magia']);
  });

  it('nível 5+: acumula a de nível 3 e a de nível 5', () => {
    expect(magiasEspecie(selecaoElfo('Alto Elfo'), 5)).toEqual(['Detectar Magia', 'Passo Nebuloso']);
    expect(magiasEspecie(selecaoElfo('Alto Elfo'), 20)).toEqual(['Detectar Magia', 'Passo Nebuloso']);
  });

  it('sem sub-escolha escolhida ainda, retorna vazio mesmo em nível alto', () => {
    expect(magiasEspecie(selecaoElfo(null), 5)).toEqual([]);
  });
});
