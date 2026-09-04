import { describe, it, expect } from 'vitest';
import { tiposElegiveisResistenciaInfera } from './resistenciaInfera';

describe('tiposElegiveisResistenciaInfera', () => {
  it('devolve os 12 tipos (13 tipos oficiais menos Energético)', () => {
    const tipos = tiposElegiveisResistenciaInfera();
    expect(tipos).toHaveLength(12);
  });

  it('nunca inclui Energético (regra real da característica)', () => {
    expect(tiposElegiveisResistenciaInfera()).not.toContain('Energético');
  });
});
