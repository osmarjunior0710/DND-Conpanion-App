// Invocações Místicas do Bruxo — leitura genérica (wizard B2 + Level
// Up B4.3 usam a mesma função, não duplicam o filtro). Fase 1 (ver
// PENDENCIAS.md "Bruxo — Invocações Místicas Fase 2"): só filtra por
// nível mínimo, nunca checa `invocacaoRequeridaId` (dependência entre
// invocações) nem aplica efeito mecânico.

import { invocacoesMisticas, type InvocacaoMistica } from '../data/rulesets/dnd2024/invocacoesMisticas';

/** Invocações que o personagem já pode escolher/manter num dado nível
 * — sem pré-requisito de nível, ou com pré-requisito já alcançado. */
export function invocacoesElegiveisAteNivel(nivel: number): InvocacaoMistica[] {
  return invocacoesMisticas.filter((i) => i.prerequisitos.nivelMinimo === null || i.prerequisitos.nivelMinimo <= nivel);
}
