import { describe, it, expect } from 'vitest';
import {
  niveisComASI,
  niveisComDadivaEpica,
  temEstiloDeLutaTrocavel,
  numeroDeAtaques,
  caracteristicasSubclasseAcumuladas,
  caracteristicasDoNivelComSubclasse,
  NOME_PLACEHOLDER_CARACTERISTICA_SUBCLASSE,
} from './levelUp';
import { classes } from '../data/rulesets/dnd2024/classes';

const guerreiro = classes.find((c) => c.nome === 'Guerreiro');
if (!guerreiro) throw new Error('Fixture "Guerreiro" não encontrada em data/rulesets/dnd2024/classes.ts');
const bardo = classes.find((c) => c.nome === 'Bardo');
if (!bardo) throw new Error('Fixture "Bardo" não encontrada em data/rulesets/dnd2024/classes.ts');

describe('niveisComASI (reconhece por ID estável, não por nome de exibição)', () => {
  it('lista os 6 níveis de ASI do Guerreiro (4,6,8,12,14,16)', () => {
    expect(niveisComASI(guerreiro)).toEqual([4, 6, 8, 12, 14, 16]);
  });

  it('retorna vazio pra uma classe sem progressão nenhuma (caso de borda)', () => {
    expect(niveisComASI({ ...guerreiro, progressao: [] })).toEqual([]);
  });
});

describe('niveisComDadivaEpica', () => {
  it('Guerreiro só ganha Dádiva Épica no nível 19', () => {
    expect(niveisComDadivaEpica(guerreiro)).toEqual([19]);
  });
});

describe('temEstiloDeLutaTrocavel', () => {
  it('true a partir do nível 1 (Guerreiro ganha Estilo de Luta já no nível 1)', () => {
    expect(temEstiloDeLutaTrocavel(guerreiro, 1)).toBe(true);
  });

  it('false pra um nível antes de a classe ter chegado lá (caso de borda: nível 0)', () => {
    expect(temEstiloDeLutaTrocavel(guerreiro, 0)).toBe(false);
  });
});

describe('numeroDeAtaques', () => {
  it('1 ataque antes do nível 5 (ainda sem Ataque Extra)', () => {
    expect(numeroDeAtaques(guerreiro, 4)).toBe(1);
  });

  it('escala 2 -> 3 -> 4 ataques nos saltos reais do Guerreiro (níveis 5, 11, 20)', () => {
    expect(numeroDeAtaques(guerreiro, 5)).toBe(2);
    expect(numeroDeAtaques(guerreiro, 11)).toBe(3);
    expect(numeroDeAtaques(guerreiro, 20)).toBe(4);
  });
});

describe('caracteristicasSubclasseAcumuladas', () => {
  it('acumula por nível — Colégio do Conhecimento no 3 tem 2, no 6 tem 3, no 14 tem as 4', () => {
    expect(caracteristicasSubclasseAcumuladas('Colégio do Conhecimento', 3).map((c) => c.nome)).toEqual([
      'Palavras de Interrupção',
      'Proficiências Bônus',
    ]);
    expect(caracteristicasSubclasseAcumuladas('Colégio do Conhecimento', 6)).toHaveLength(3);
    expect(caracteristicasSubclasseAcumuladas('Colégio do Conhecimento', 14)).toHaveLength(4);
  });

  it('retorna vazio sem subclasse escolhida (caso de borda: null)', () => {
    expect(caracteristicasSubclasseAcumuladas(null, 20)).toEqual([]);
  });
});

describe('caracteristicasDoNivelComSubclasse', () => {
  it('Bardo nível 6 com Colégio do Conhecimento: troca o placeholder pela característica real (Descobertas Mágicas)', () => {
    const resultado = caracteristicasDoNivelComSubclasse(bardo, 6, 'Colégio do Conhecimento');
    expect(resultado.map((c) => c.nome)).toEqual(['Descobertas Mágicas']);
    expect(resultado[0].descricao).not.toBeNull();
  });

  it('caso de borda: sem subclasse escolhida, o placeholder fica como está (não quebra, não inventa texto)', () => {
    const resultado = caracteristicasDoNivelComSubclasse(bardo, 6, null);
    expect(resultado.map((c) => c.nome)).toEqual([NOME_PLACEHOLDER_CARACTERISTICA_SUBCLASSE]);
    expect(resultado[0].descricao).toBeNull();
  });
});
