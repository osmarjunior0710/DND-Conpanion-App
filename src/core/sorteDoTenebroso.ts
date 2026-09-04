/** "A Sorte do Próprio Tenebroso" (Bruxo, Patrono Ínfero, nível 6) —
 * número de usos entre Descansos Longos: modificador de Carisma,
 * mínimo de 1 (nunca zero, mesmo com CAR baixo/negativo). */
export function usosSorteDoTenebroso(carMod: number): number {
  return Math.max(1, carMod);
}
