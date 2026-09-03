import { describe, it, expect } from 'vitest';
import { armaDePactoAtual, vincularArmaDePacto, desvincularArmaDePacto } from './pactoDaLamina';
import type { ItemMochila } from './mochila';

describe('vincularArmaDePacto', () => {
  it('cria a arma já equipada na Mão Principal', () => {
    const itens = vincularArmaDePacto([], 'Rapieira');
    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({ nome: 'Rapieira', armaDePacto: true, slot: 'maoPrincipal' });
  });

  it('substitui a arma de pacto anterior (só existe 1 por vez)', () => {
    const comArmaAntiga: ItemMochila[] = [
      { id: 'a1', nome: 'Adaga', quantidade: 1, peso: '0,5 kg', origemDoItem: 'Manual', armaDePacto: true, slot: 'maoPrincipal' },
    ];
    const itens = vincularArmaDePacto(comArmaAntiga, 'Machado de Guerra');
    expect(itens.filter((it) => it.armaDePacto)).toHaveLength(1);
    expect(armaDePactoAtual(itens)?.nome).toBe('Machado de Guerra');
  });

  it('libera item que já estava na Mão Principal (mesmo slot)', () => {
    const comArmaEquipada: ItemMochila[] = [
      { id: 'm1', nome: 'Espada Longa', quantidade: 1, peso: '1,5 kg', origemDoItem: 'Loja', slot: 'maoPrincipal' },
    ];
    const itens = vincularArmaDePacto(comArmaEquipada, 'Rapieira');
    const espadaLonga = itens.find((it) => it.nome === 'Espada Longa');
    expect(espadaLonga?.slot).toBeFalsy();
  });
});

describe('desvincularArmaDePacto', () => {
  it('remove a arma de pacto por completo (não fica guardada)', () => {
    const itens: ItemMochila[] = [
      { id: 'a1', nome: 'Rapieira', quantidade: 1, peso: '1 kg', origemDoItem: 'Manual', armaDePacto: true, slot: 'maoPrincipal' },
      { id: 'a2', nome: 'Poção de Cura', quantidade: 1, peso: '0,5 kg', origemDoItem: 'Loja' },
    ];
    const resultado = desvincularArmaDePacto(itens);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nome).toBe('Poção de Cura');
  });

  it('sem arma de pacto: não muda nada', () => {
    const itens: ItemMochila[] = [{ id: 'a2', nome: 'Poção de Cura', quantidade: 1, peso: '0,5 kg', origemDoItem: 'Loja' }];
    expect(desvincularArmaDePacto(itens)).toEqual(itens);
  });
});

describe('armaDePactoAtual', () => {
  it('null quando não há arma de pacto', () => {
    expect(armaDePactoAtual([{ id: 'a2', nome: 'Poção de Cura', quantidade: 1, peso: null, origemDoItem: 'Loja' }])).toBeNull();
  });
});
