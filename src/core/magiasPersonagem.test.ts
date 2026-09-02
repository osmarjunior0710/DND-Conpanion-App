import { describe, it, expect } from 'vitest';
import { espacosDeMagiaAtivos, magiasDisponiveisParaPreparar, poolDescobertasMagicas } from './magiasPersonagem';
import { classes } from '../data/rulesets/dnd2024/classes';

const bardo = classes.find((c) => c.nome === 'Bardo');
if (!bardo) throw new Error('Fixture "Bardo" não encontrada em data/rulesets/dnd2024/classes.ts');
const bruxo = classes.find((c) => c.nome === 'Bruxo');
if (!bruxo) throw new Error('Fixture "Bruxo" não encontrada em data/rulesets/dnd2024/classes.ts');

describe('espacosDeMagiaAtivos', () => {
  it('Bardo (1 recurso por círculo): nível 3 tem 1º E 2º círculo simultâneos', () => {
    const espacos = espacosDeMagiaAtivos(bardo, 3);
    expect(espacos.map((e) => e.circulo)).toEqual([1, 2]);
    expect(espacos.every((e) => !e.recuperaNoDescansoCurto)).toBe(true);
  });

  it('Bruxo (pool único): sempre devolve 1 item só, com o círculo do espaço do nível — nível 5 = 3º círculo', () => {
    const espacos = espacosDeMagiaAtivos(bruxo, 5);
    expect(espacos).toHaveLength(1);
    expect(espacos[0]).toMatchObject({ circulo: 3, maximo: 2, recuperaNoDescansoCurto: true });
  });

  it('borda: nível fora da tabela / classe null devolve array vazio, nunca quebra', () => {
    expect(espacosDeMagiaAtivos(null, 5)).toEqual([]);
    expect(espacosDeMagiaAtivos(bruxo, 999)).toEqual([]);
  });
});

describe('magiasDisponiveisParaPreparar', () => {
  it('antes do nível 10 (sem Segredos Mágicos): só magias da própria classe', () => {
    const pool = magiasDisponiveisParaPreparar(bardo, 9);
    expect(pool.length).toBeGreaterThan(0);
    expect(pool.every((m) => m.classes.includes('Bardo'))).toBe(true);
  });

  it('a partir do nível 10 (Segredos Mágicos): pool cresce com Clérigo/Druida/Mago, sem duplicar magia', () => {
    const poolAntes = magiasDisponiveisParaPreparar(bardo, 9);
    const poolDepois = magiasDisponiveisParaPreparar(bardo, 10);
    expect(poolDepois.length).toBeGreaterThan(poolAntes.length);
    expect(poolDepois.some((m) => !m.classes.includes('Bardo'))).toBe(true);
    const ids = poolDepois.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('poolDescobertasMagicas', () => {
  it('circuloMaximo 0 (só truque disponível): traz truques de Clérigo/Druida/Mago, nenhuma magia de círculo', () => {
    const pool = poolDescobertasMagicas(0);
    expect(pool.length).toBeGreaterThan(0);
    expect(pool.every((m) => m.circulo === 0)).toBe(true);
    const classesPermitidas = ['Clérigo', 'Druida', 'Mago'];
    expect(pool.every((m) => m.classes.some((c) => classesPermitidas.includes(c)))).toBe(true);
  });

  it('circuloMaximo maior: inclui magias de círculo até o limite, sem duplicar, sem passar do limite', () => {
    const pool = poolDescobertasMagicas(3);
    expect(pool.some((m) => m.circulo > 0)).toBe(true);
    expect(pool.every((m) => m.circulo <= 3)).toBe(true);
    const ids = pool.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
