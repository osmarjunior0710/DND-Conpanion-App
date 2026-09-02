import { describe, it, expect } from 'vitest';
import { proficienciasJaConcedidas } from './proficienciasOrigem';
import { origens } from '../data/rulesets/dnd2024/origens';
import { criarSelecaoInicial } from './personagem';

const nobre = origens.find((o) => o.id === 'nobre');
if (!nobre) throw new Error('Fixture "nobre" não encontrada em data/rulesets/dnd2024/origens.ts');

describe('proficienciasJaConcedidas', () => {
  it('inclui as 2 perícias fixas da origem e a ferramenta escolhida (caso normal — Nobre)', () => {
    const s = { ...criarSelecaoInicial(), origem: 'Nobre', ferramentaOrigemEscolhida: 'Baralho' };
    const r = proficienciasJaConcedidas(s, nobre);
    expect(r.pericias.has('História')).toBe(true);
    expect(r.pericias.has('Persuasão')).toBe(true);
    expect(r.ferramentas.has('Baralho')).toBe(true);
  });

  it('ferramenta de escolha ainda não escolhida não entra no conjunto (borda — nada travado ainda)', () => {
    const s = { ...criarSelecaoInicial(), origem: 'Nobre', ferramentaOrigemEscolhida: null };
    const r = proficienciasJaConcedidas(s, nobre);
    expect(r.ferramentas.size).toBe(0);
  });

  it('sem origem selecionada, só considera o que a classe já concedeu', () => {
    const s = { ...criarSelecaoInicial(), periciasClasseEscolhidas: ['Atletismo'] };
    const r = proficienciasJaConcedidas(s, undefined);
    expect(r.pericias.has('Atletismo')).toBe(true);
    expect(r.pericias.size).toBe(1);
  });
});
