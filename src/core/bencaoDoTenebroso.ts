// Bênção do Tenebroso (Bruxo, Patrono Ínfero, nível 3) — "Ao reduzir
// um inimigo a 0 Pontos de Vida (ou aliado a 3m fizer isso), você
// adquire Pontos de Vida Temporários iguais ao seu modificador de
// Carisma mais seu nível de Bruxo (mínimo de 1)." Sem teto de usos —
// dispara toda vez que a condição acontece, por isso não tem estado
// de "gasto" pra rastrear, só o valor concedido.

export function valorBencaoDoTenebroso(carMod: number, nivel: number): number {
  return Math.max(1, carMod + nivel);
}
