// PV Temporário — parte é regra real (Glossário do Livro do Jogador):
// dano desconta primeiro do PV Temporário, só o excedente desconta do
// PV normal; ganhar PV Temporário de uma habilidade (`ganharPvTemporario`)
// NÃO soma com o que já tem, fica o maior valor entre os dois.
//
// "Cura só vira PV Temporário depois de já estar no máximo" é HOUSE
// RULE do Osmar, não regra oficial (RAW o excedente de cura acima do
// máximo é simplesmente perdido) — registrado como decisão de design,
// não em DND-Regras.md. O PV enche até o máximo primeiro — se a cura
// cruza o máximo NESSE mesmo clique, o excedente desse clique é
// descartado (não vira Temporário). Só um clique de cura feito com o
// personagem JÁ no máximo é que soma inteiro em PV Temporário — ex:
// 90/100 + cura de 15 = 100/100 (os 5 que passariam do máximo são
// descartados); clicar de novo já em 100/100 com +5 aí sim vira +5 PV
// Temporário.

export function aplicarAlteracaoPv(
  pvAtual: number,
  pvMax: number,
  pvTemporario: number,
  delta: number,
): { pvAtual: number; pvTemporario: number } {
  if (delta >= 0) {
    if (pvAtual >= pvMax) {
      return { pvAtual: pvMax, pvTemporario: pvTemporario + delta };
    }
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
