// Inspiração de Bardo — regra confirmada na característica de classe
// (caracteristicasClasse.ts, "Inspiração de Bardo" + "Fonte de
// Inspiração"): usos = mod. de Carisma (mín. 1), não uma tabela por
// nível (a única tabela que existe é o TAMANHO do dado, já coberto
// por `valorRecursoClasse` via "Dados de Inspiração de Bardo"). Por
// isso vive num arquivo próprio, não em recursosClasse.ts (que é só
// leitura de tabela por nível).

import type { Classe } from '../data/rulesets/dnd2024/classes';
import { caracteristicaDesbloqueada } from './levelUp';
import { modificador, valorFinalAtributo, type WizardSelection } from './personagem';
import { valorRecursoClasse } from './recursosClasse';

/** Máximo de usos de Inspiração de Bardo, ou 0 se a classe não tiver
 * essa característica desbloqueada no nível atual. */
export function usosInspiracaoMaximo(selecao: WizardSelection, classe: Classe | null, nivel: number): number {
  if (!classe || !caracteristicaDesbloqueada(classe, 'Inspiração de Bardo', nivel)) return 0;
  const carValor = valorFinalAtributo(selecao, 'CAR');
  if (carValor === null) return 0;
  return Math.max(1, modificador(carValor));
}

/** Tamanho do dado de Inspiração de Bardo no nível atual (6/8/10/12). */
export function dadoInspiracao(classe: Classe | null, nivel: number): number {
  if (!classe) return 0;
  return valorRecursoClasse(classe, 'Dados de Inspiração de Bardo', nivel);
}

/** "Fonte de Inspiração" (nível 5): restaura também no Descanso Curto
 * e permite gastar 1 Espaço de Magia pra recuperar 1 uso. */
export function fonteDeInspiracaoDesbloqueada(classe: Classe | null, nivel: number): boolean {
  if (!classe) return false;
  return caracteristicaDesbloqueada(classe, 'Fonte de Inspiração', nivel) !== null;
}
