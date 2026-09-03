// Astúcia Mágica (Bruxo, nível 2) — "Ao final de um rito esotérico de
// 1 minuto, recupera os espaços de magia das Magias de Pacto gastos
// em um número igual à metade da sua quantidade máxima (arredondado
// pra cima). Pode usar de novo após um Descanso Longo." Mestre
// Místico (nível 20) troca "metade" por "todos".

/** Quantos espaços de Pacto a Astúcia Mágica recupera — nunca mais do
 * que o personagem realmente tem gasto (não gera espaço negativo). */
export function espacosARecuperar(maximoTotal: number, gastoAtual: number, mestreMistico: boolean): number {
  if (mestreMistico) return gastoAtual;
  return Math.min(gastoAtual, Math.ceil(maximoTotal / 2));
}
