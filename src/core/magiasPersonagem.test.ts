import { describe, it, expect } from 'vitest';
import { magiasDisponiveisParaPreparar, poolDescobertasMagicas } from './magiasPersonagem';
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
