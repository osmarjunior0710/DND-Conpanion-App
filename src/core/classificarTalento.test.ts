import { describe, it, expect } from 'vitest';
import { talentoTemPlaceholder } from './classificarTalento';
import { talentos } from '../data/rulesets/dnd2024/talentos';

describe('talentoTemPlaceholder', () => {
  it('Alerta (Fase 4, tem efeitoMecanico): sem [PH]', () => {
    const t = talentos.find((x) => x.nome === 'Alerta')!;
    expect(talentoTemPlaceholder(t)).toBe(false);
  });

  it('talento sem efeitoMecanico ainda: mantém [PH]', () => {
    const t = talentos.find((x) => x.efeitoMecanico === undefined)!;
    expect(talentoTemPlaceholder(t)).toBe(true);
  });
});
