import { describe, it, expect } from 'vitest';
import { dividirTextoComMagias } from './TextoComMagias';

describe('dividirTextoComMagias', () => {
  it('separa o nome de magia mencionado do resto do texto', () => {
    const partes = dividirTextoComMagias('Conjura Armadura Arcana em si sem gastar um espaço de magia.', [
      'Armadura Arcana',
    ]);
    expect(partes).toEqual([
      { texto: 'Conjura ', magia: false },
      { texto: 'Armadura Arcana', magia: true },
      { texto: ' em si sem gastar um espaço de magia.', magia: false },
    ]);
  });

  it('sem nomes de magia, devolve o texto inteiro como 1 pedaço só', () => {
    expect(dividirTextoComMagias('Vantagem em salvaguardas de Constituição.', [])).toEqual([
      { texto: 'Vantagem em salvaguardas de Constituição.', magia: false },
    ]);
  });
});
