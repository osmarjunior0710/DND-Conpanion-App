// Média de PV por dado de vida (metade arredondada pra cima + 1, regra
// padrão de "usar a média" no level-up) — não é dado específico de
// classe, é a mesma conta pra qualquer dado, então fica como utilitário
// pequeno em vez de repetir em core/.
export const dadoVidaValor: Record<string, number> = { d6: 4, d8: 5, d10: 6, d12: 7 };
