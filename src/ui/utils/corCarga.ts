// Cor da barra de peso (Loja e Mochila da Ficha) — mesmo esquema nos
// dois lugares, degradê por faixa de percentual de uso da capacidade
// máxima de carga. `percentual` pode passar de 100 (sobrecarregado) —
// não é clampado aqui, só na largura visual da barra (isso é decisão
// de quem desenha a barra, não desta função).
export function corDaCarga(percentual: number): string {
  if (percentual <= 75) return '#2f8f52'; // verde
  if (percentual <= 85) return '#c9a227'; // amarelo
  if (percentual <= 95) return '#c9711f'; // laranja
  if (percentual <= 100) return '#b3261e'; // vermelho
  return '#7a1611'; // vermelho escuro (acima de 100%)
}
