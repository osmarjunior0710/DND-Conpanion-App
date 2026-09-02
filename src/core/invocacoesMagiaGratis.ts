import { invocacoesMisticas } from '../data/rulesets/dnd2024/invocacoesMisticas';
import { magias, type Magia } from '../data/rulesets/dnd2024/magias';

export interface MagiaGratisDeInvocacao {
  invocacaoId: string;
  invocacaoNome: string;
  magia: Magia;
  /** 'ilimitado' = sem contador, sempre disponível; 'descansoLongo' =
   * só 1x, trava até o próximo Descanso Longo (ver `magiasGratisGastas`
   * em `FichaShell.tsx`). */
  recarga: 'ilimitado' | 'descansoLongo';
  /** Só Vigor Ínfero: PV Temporário concedido a cada uso (pega o maior
   * valor entre o atual e este, não soma — ver `ganharPvTemporario`).
   * `null` nas outras. */
  pvTemporarioConcedido: number | null;
}

/** Deriva as magias concedidas "de graça" (sem gastar Espaço de Pacto)
 * pelas Invocações Místicas atuais do personagem — Fase 2 do padrão
 * "Conjura X sem gastar um espaço de magia" (ver DECISOES-CLASSES.md).
 * Sempre recalculado a partir de `invocacoesMisticasAtuais`, nunca
 * persistido — a lista É a fonte de verdade. */
export function magiasGratisDasInvocacoes(invocacoesAtuais: string[]): MagiaGratisDeInvocacao[] {
  const resultado: MagiaGratisDeInvocacao[] = [];
  for (const id of invocacoesAtuais) {
    const invocacao = invocacoesMisticas.find((i) => i.id === id);
    if (!invocacao?.magiaGratisConcedida) continue;
    const magia = magias.find((m) => m.nome === invocacao.magiaGratisConcedida!.nome);
    if (!magia) continue;
    resultado.push({
      invocacaoId: invocacao.id,
      invocacaoNome: invocacao.nome,
      magia,
      recarga: invocacao.magiaGratisConcedida.recarga,
      pvTemporarioConcedido: invocacao.pvTemporarioConcedido,
    });
  }
  return resultado;
}
