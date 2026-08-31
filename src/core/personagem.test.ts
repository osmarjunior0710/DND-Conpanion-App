import { describe, it, expect } from 'vitest';
import { modificador, valorFinalAtributo, criarSelecaoInicial } from './personagem';

describe('modificador', () => {
  it('calcula o modificador padrão (fórmula oficial: piso de (valor-10)/2)', () => {
    expect(modificador(10)).toBe(0);
    expect(modificador(11)).toBe(0);
    expect(modificador(12)).toBe(1);
    expect(modificador(20)).toBe(5);
  });

  it('cobre valores ímpares abaixo de 10 (piso arredonda pra baixo, não pra zero)', () => {
    expect(modificador(8)).toBe(-1);
    expect(modificador(9)).toBe(-1);
  });

  it('cobre os extremos do jogo (1 e 30)', () => {
    expect(modificador(1)).toBe(-5);
    expect(modificador(30)).toBe(10);
  });
});

describe('valorFinalAtributo', () => {
  it('retorna null quando o atributo ainda não foi preenchido (personagem em criação)', () => {
    const selection = criarSelecaoInicial();
    expect(valorFinalAtributo(selection, 'FOR')).toBeNull();
  });

  it('soma o valor base sem nenhum bônus de antecedente aplicado', () => {
    const selection = criarSelecaoInicial();
    selection.atributos.FOR = 15;
    expect(valorFinalAtributo(selection, 'FOR')).toBe(15);
  });

  it('soma +1 por cada vez que o atributo aparece em bonusEscolhas (ajuste 111 do antecedente)', () => {
    const selection = criarSelecaoInicial();
    selection.atributos.FOR = 15;
    selection.bonusEscolhas = ['FOR'];
    expect(valorFinalAtributo(selection, 'FOR')).toBe(16);
  });

  it('permite +2 no mesmo atributo (2 entradas em bonusEscolhas)', () => {
    const selection = criarSelecaoInicial();
    selection.atributos.DES = 8;
    selection.bonusEscolhas = ['DES', 'DES'];
    expect(valorFinalAtributo(selection, 'DES')).toBe(10);
  });
});
