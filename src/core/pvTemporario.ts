// PV Temporário — parte é regra real (Glossário do Livro do Jogador):
// dano desconta primeiro do PV Temporário, só o excedente desconta do
// PV normal; ganhar PV Temporário de uma habilidade (`ganharPvTemporario`)
// NÃO soma com o que já tem, fica o maior valor entre os dois.
//
// "Cura que transborda vira PV Temporário" é HOUSE RULE do Osmar, não
// regra oficial (RAW o excedente de cura acima do máximo é perdido) —
// registrado como decisão de design, não em DND-Regras.md. Enche o PV
// normal até o máximo primeiro; o que sobrar da cura SOMA (não é
// "pega o maior") no PV Temporário — ex: 90/100 + cura de 15 = 100 PV
// + 5 PV Temporário (ou +5 em cima do que já tinha de Temporário).

export function aplicarAlteracaoPv(
  pvAtual: number,
  pvMax: number,
  pvTemporario: number,
  delta: number,
): { pvAtual: number; pvTemporario: number } {
  if (delta >= 0) {
    const pvAposCura = pvAtual + delta;
    if (pvAposCura <= pvMax) {
      return { pvAtual: pvAposCura, pvTemporario };
    }
    const transbordo = pvAposCura - pvMax;
    return { pvAtual: pvMax, pvTemporario: pvTemporario + transbordo };
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
