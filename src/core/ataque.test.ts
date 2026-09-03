import { describe, it, expect } from 'vitest';
import { ataqueComArma } from './ataque';
import { armas } from '../data/rulesets/dnd2024/armas';
import { classes } from '../data/rulesets/dnd2024/classes';

const bruxo = classes.find((c) => c.nome === 'Bruxo')!;
const rapieira = armas.find((a) => a.nome === 'Rapieira')!;

describe('ataqueComArma — atribForcada (Pacto da Lâmina)', () => {
  it('sem atribForcada: usa Força/Destreza/Acuidade normalmente', () => {
    const r = ataqueComArma(rapieira, bruxo, 1, 1, 3, false, false, null, false);
    // Rapieira tem Acuidade — usa o maior entre Força (1) e Destreza (3).
    // Bruxo não é proficiente em Marcial (só Armas Simples), sem bônus.
    expect(r.info.modAcerto).toBe(3);
    expect(r.info.danoMod).toBe(3);
  });

  it('com atribForcada: ignora Força/Destreza/Acuidade, usa o valor fornecido (Carisma)', () => {
    const semForcar = ataqueComArma(rapieira, bruxo, 1, 1, 3, false, false, null, false);
    const comForcar = ataqueComArma(rapieira, bruxo, 1, 1, 3, false, false, null, false, 5);
    expect(comForcar.info.modAcerto).toBe(5 + (semForcar.info.modAcerto - 3));
    expect(comForcar.info.danoMod).toBe(5);
  });
});
