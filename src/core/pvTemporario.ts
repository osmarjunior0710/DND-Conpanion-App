// PV Temporário (regra real, Glossário do Livro do Jogador): dano
// desconta primeiro do PV Temporário, só o excedente desconta do PV
// normal; cura NUNCA soma em PV Temporário (só no PV normal, até o
// máximo); ganhar PV Temporário de novo NÃO soma com o que já tem —
// fica o maior valor entre os dois.

export function aplicarAlteracaoPv(
  pvAtual: number,
  pvMax: number,
  pvTemporario: number,
  delta: number,
): { pvAtual: number; pvTemporario: number } {
  if (delta >= 0) {
    return { pvAtual: Math.min(pvMax, pvAtual + delta), pvTemporario };
  }
  let dano = -delta;
  const absorvidoPeloTemp = Math.min(pvTemporario, dano);
  dano -= absorvidoPeloTemp;
  return {
    pvAtual: Math.max(0, pvAtual - dano),
    pvTemporario: pvTemporario - absorvidoPeloTemp,
  };
}

export function ganharPvTemporario(pvTemporarioAtual: number, valorConcedido: number): number {
  return Math.max(pvTemporarioAtual, valorConcedido);
}
