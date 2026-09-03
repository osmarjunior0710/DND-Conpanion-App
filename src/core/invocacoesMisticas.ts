// Invocações Místicas do Bruxo — leitura genérica (wizard B2 + Level
// Up B4.3 usam a mesma função, não duplicam o filtro).

import { invocacoesMisticas, type InvocacaoMistica } from '../data/rulesets/dnd2024/invocacoesMisticas';

/** Invocações que o personagem já pode escolher/manter num dado nível
 * — sem pré-requisito de nível, ou com pré-requisito já alcançado.
 * Só olha nível — `invocacaoRequeridaId` (dependência entre
 * invocações) é checado à parte, ver funções abaixo, porque depende
 * do que o jogador JÁ marcou, não só do nível. */
export function invocacoesElegiveisAteNivel(nivel: number): InvocacaoMistica[] {
  return invocacoesMisticas.filter((i) => i.prerequisitos.nivelMinimo === null || i.prerequisitos.nivelMinimo <= nivel);
}

/** A invocação que `inv` exige (Pacto da Lâmina pra Lâmina Sedenta,
 * por exemplo), ou `null` quando `inv` não depende de nenhuma outra. */
export function invocacaoRequeridaDe(inv: InvocacaoMistica): InvocacaoMistica | null {
  if (!inv.prerequisitos.invocacaoRequeridaId) return null;
  return invocacoesMisticas.find((i) => i.id === inv.prerequisitos.invocacaoRequeridaId) ?? null;
}

/** `true` quando `inv` tem uma invocação-requisito e ela NÃO está entre
 * as atualmente marcadas — bloqueia escolher `inv` sozinha (regra real:
 * Lâmina Sedenta não existe sem Pacto da Lâmina, Lâmina Devoradora não
 * existe sem Lâmina Sedenta, etc.). */
export function invocacaoBloqueadaPorRequisitoAusente(inv: InvocacaoMistica, invocacoesAtuais: string[]): boolean {
  const requerida = inv.prerequisitos.invocacaoRequeridaId;
  return requerida !== null && !invocacoesAtuais.includes(requerida);
}

/** Invocações (dentre as atualmente marcadas) que dependem de `id` —
 * usado pra travar a REMOÇÃO: não dá pra tirar Pacto da Lâmina
 * enquanto Lâmina Sedenta ainda estiver marcada (regra real: pra
 * abandonar uma cadeia, precisa desmontar de trás pra frente, 1 troca
 * por level-up). */
export function invocacoesQueDependemDe(id: string, invocacoesAtuais: string[]): InvocacaoMistica[] {
  return invocacoesMisticas.filter(
    (i) => i.prerequisitos.invocacaoRequeridaId === id && invocacoesAtuais.includes(i.id),
  );
}
