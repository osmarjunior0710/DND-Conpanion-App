import { describe, it, expect } from 'vitest';
import { circulosArcanaMisticaDesbloqueados, magiasElegiveisArcanaMistica, trocasArcanaMistica } from './arcanaMistica';
import { classes } from '../data/rulesets/dnd2024/classes';

const bruxo = classes.find((c) => c.nome === 'Bruxo')!;

describe('circulosArcanaMisticaDesbloqueados', () => {
  it('nível 10: nenhum círculo desbloqueado ainda', () => {
    expect(circulosArcanaMisticaDesbloqueados(bruxo, 10)).toEqual([]);
  });

  it('nível 11: só o 6º círculo', () => {
    expect(circulosArcanaMisticaDesbloqueados(bruxo, 11)).toEqual([6]);
  });

  it('nível 14 (entre 13 e 15): 6º e 7º, ainda sem 8º', () => {
    expect(circulosArcanaMisticaDesbloqueados(bruxo, 14)).toEqual([6, 7]);
  });

  it('nível 20: todos os 4 círculos', () => {
    expect(circulosArcanaMisticaDesbloqueados(bruxo, 20)).toEqual([6, 7, 8, 9]);
  });
});

describe('magiasElegiveisArcanaMistica', () => {
  it('só devolve magias do círculo exato', () => {
    const opcoes = magiasElegiveisArcanaMistica(6, []);
    expect(opcoes.length).toBeGreaterThan(0);
    expect(opcoes.every((m) => m.circulo === 6)).toBe(true);
  });

  it('exclui magias já conhecidas', () => {
    const opcoes = magiasElegiveisArcanaMistica(6, []);
    const primeira = opcoes[0].nome;
    const semEla = magiasElegiveisArcanaMistica(6, [primeira]);
    expect(semEla.some((m) => m.nome === primeira)).toBe(false);
  });
});

describe('trocasArcanaMistica', () => {
  it('nenhuma troca: escolhidas idêntico a atuais', () => {
    const atuais = { 6: 'Bola de Fogo' };
    expect(trocasArcanaMistica(atuais, { ...atuais })).toBe(0);
  });

  it('círculo novo (só do lado escolhidas) não conta como troca', () => {
    const atuais = { 6: 'Bola de Fogo' };
    const escolhidas = { 6: 'Bola de Fogo', 7: 'Teia' };
    expect(trocasArcanaMistica(atuais, escolhidas)).toBe(0);
  });

  it('círculo já conhecido com magia diferente conta 1 troca', () => {
    const atuais = { 6: 'Bola de Fogo' };
    const escolhidas = { 6: 'Nuvem Fétida' };
    expect(trocasArcanaMistica(atuais, escolhidas)).toBe(1);
  });

  it('2 círculos trocados ao mesmo tempo conta 2', () => {
    const atuais = { 6: 'Bola de Fogo', 7: 'Teia' };
    const escolhidas = { 6: 'Nuvem Fétida', 7: 'Voo' };
    expect(trocasArcanaMistica(atuais, escolhidas)).toBe(2);
  });
});
