import { describe, it, expect } from 'vitest';
import { truquesElegiveisLivroDasSombras, magiasRituaisElegiveisLivroDasSombras } from './livroDasSombras';

describe('truquesElegiveisLivroDasSombras', () => {
  it('lista truques de qualquer classe, excluindo os já conhecidos', () => {
    const todos = truquesElegiveisLivroDasSombras([]);
    expect(todos.every((m) => m.circulo === 0)).toBe(true);
    expect(todos.length).toBeGreaterThan(0);

    const nomeConhecido = todos[0].nome;
    const semEsse = truquesElegiveisLivroDasSombras([nomeConhecido]);
    expect(semEsse.find((m) => m.nome === nomeConhecido)).toBeUndefined();
  });
});

describe('magiasRituaisElegiveisLivroDasSombras', () => {
  it('só inclui magias de 1º círculo com marcador Ritual no tempo de conjuração', () => {
    const rituais = magiasRituaisElegiveisLivroDasSombras([]);
    expect(rituais.length).toBeGreaterThan(0);
    expect(rituais.every((m) => m.circulo === 1)).toBe(true);
    expect(rituais.every((m) => m.tempoConjuracao?.includes('Ritual'))).toBe(true);
  });

  it('exclui magia já conhecida', () => {
    const rituais = magiasRituaisElegiveisLivroDasSombras([]);
    const nomeConhecido = rituais[0].nome;
    const semEssa = magiasRituaisElegiveisLivroDasSombras([nomeConhecido]);
    expect(semEssa.find((m) => m.nome === nomeConhecido)).toBeUndefined();
  });
});
