import { describe, it, expect } from 'vitest';
import { magiasDisponiveisParaPreparar } from './magiasPersonagem';
import { classes } from '../data/rulesets/dnd2024/classes';

const bardo = classes.find((c) => c.nome === 'Bardo');
if (!bardo) throw new Error('Fixture "Bardo" não encontrada em data/rulesets/dnd2024/classes.ts');

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
