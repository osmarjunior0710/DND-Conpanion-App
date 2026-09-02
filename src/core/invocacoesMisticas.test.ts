import { describe, it, expect } from 'vitest';
import { invocacoesElegiveisAteNivel } from './invocacoesMisticas';

describe('invocacoesElegiveisAteNivel', () => {
  it('nível 1: só as 5 sem pré-requisito de nível', () => {
    const elegiveis = invocacoesElegiveisAteNivel(1);
    expect(elegiveis.map((i) => i.id).sort()).toEqual(
      ['armadura-de-sombras', 'mente-mistica', 'pacto-da-corrente', 'pacto-da-lamina', 'pacto-do-tomo'].sort(),
    );
  });

  it('nível 5: soma as que pedem nível 2 e nível 5, ainda sem as de nível 7+', () => {
    const elegiveis = invocacoesElegiveisAteNivel(5);
    expect(elegiveis.some((i) => i.id === 'explosao-agonizante')).toBe(true); // nível 2
    expect(elegiveis.some((i) => i.id === 'lamina-sedenta')).toBe(true); // nível 5
    expect(elegiveis.some((i) => i.id === 'lamento-das-sepulturas')).toBe(false); // nível 7
  });

  it('borda: nível 0 devolve só as sem pré-requisito nenhum', () => {
    const elegiveis = invocacoesElegiveisAteNivel(0);
    expect(elegiveis.length).toBe(5);
  });
});
