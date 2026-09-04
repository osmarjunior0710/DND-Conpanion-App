import { caracteristicasSubclasse } from '../data/rulesets/dnd2024/caracteristicasSubclasse';

/** Nomes das magias de "Magias de Pacto do Ínfero" (Bruxo, Patrono
 * Ínfero) já desbloqueadas no nível atual — lista fixa, sem escolha do
 * jogador, acumulando cada faixa (3/5/7/9) conforme o nível sobe.
 * Retorna `[]` se a característica não existir no dado (nunca deveria
 * acontecer) ou se o nível ainda não bateu o primeiro degrau (3). */
export function magiasPactoDoInfero(nivel: number): string[] {
  const caracteristica = caracteristicasSubclasse.find(
    (c) => c.classe === 'Bruxo' && c.subclasse === 'Patrono Ínfero' && c.nome === 'Magias de Pacto do Ínfero',
  );
  if (!caracteristica?.magiasFixasPorNivel) return [];
  const resultado: string[] = [];
  for (const [nivelDegrau, nomes] of Object.entries(caracteristica.magiasFixasPorNivel)) {
    if (nivel >= Number(nivelDegrau)) resultado.push(...nomes);
  }
  return resultado;
}
