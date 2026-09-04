// Arcana Mística (Bruxo, níveis 11/13/15/17) — 4 magias independentes
// (6º/7º/8º/9º círculo), cada uma escolhida quando o círculo
// desbloqueia. Cada uma pode ser conjurada de graça 1x por Descanso
// Longo (usos independentes entre si, não um pool). A cada level-up
// (não só nos níveis que desbloqueiam um círculo novo), o jogador pode
// trocar 1 magia de arcanum já escolhida por outra do mesmo círculo —
// mesmo limite "1 troca por level-up" já usado em Truques/Invocações,
// só que por círculo (Record) em vez de lista solta.

import type { Classe } from '../data/rulesets/dnd2024/classes';
import { caracteristicaDesbloqueada } from './levelUp';
import { magiasDaClasse, type Magia } from '../data/rulesets/dnd2024/magias';

const NOME_CARACTERISTICA_POR_CIRCULO: Record<number, string> = {
  6: 'Arcana Mística (6º círculo)',
  7: 'Arcana Mística (7º círculo)',
  8: 'Arcana Mística (8º círculo)',
  9: 'Arcana Mística (9º círculo)',
};

/** Círculos de Arcana Mística já desbloqueados no nível atual — 6, 7,
 * 8 e/ou 9, na ordem que a tabela de Bruxo concede (11/13/15/17). */
export function circulosArcanaMisticaDesbloqueados(classe: Classe, nivelAtual: number): number[] {
  return Object.entries(NOME_CARACTERISTICA_POR_CIRCULO)
    .filter(([, nome]) => caracteristicaDesbloqueada(classe, nome, nivelAtual) !== null)
    .map(([circulo]) => Number(circulo));
}

/** Magias de Bruxo do círculo exato, que o personagem ainda não
 * conhece por nenhuma outra fonte (truques/preparadas/livro das
 * sombras/outros arcana) — catálogo pra escolher o arcanum desse
 * círculo. */
export function magiasElegiveisArcanaMistica(circulo: number, jaConhecidas: string[]): Magia[] {
  return magiasDaClasse('Bruxo').filter((m) => m.circulo === circulo && !jaConhecidas.includes(m.nome));
}

/** Quantos círculos JÁ conhecidos (presentes nos dois lados) tiveram a
 * magia trocada por outra — círculo novo (só do lado `escolhidas`,
 * escolha inicial) nunca conta como troca, mesmo padrão de
 * `contarTrocas` (Truques/Invocações), só que por círculo em vez de
 * lista solta. */
export function trocasArcanaMistica(atuais: Record<number, string>, escolhidas: Record<number, string>): number {
  return Object.entries(atuais).filter(([circulo, magia]) => escolhidas[Number(circulo)] !== magia).length;
}
