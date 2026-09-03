// Pacto da Lâmina (Invocação Mística do Bruxo, IM.4) — "Como Ação
// Bônus, cria/vincula uma arma de pacto (Simples ou Marcial)... usa
// Carisma pra ataque/dano com ela." A arma vive na Mochila como
// qualquer outra (reaproveita `equiparNoSlot` pra equipar na Mão
// Principal), mas é conjurada, não possuída de verdade — desvincular
// remove o item por completo, em vez de só desequipar.
//
// Fora de escopo por enquanto (ver PENDENCIAS.md se necessário):
// "vincular arma mágica tocada" e "servir de Foco de Conjuração" — sem
// uso mecânico no app hoje.

import type { ItemMochila } from './mochila';
import { buscarPesoItem } from '../data/rulesets/dnd2024/buscarDescricaoItem';
import { equiparNoSlot } from './equipamento';

let contadorId = 0;
function gerarIdArmaDePacto(): string {
  contadorId += 1;
  return `arma-de-pacto-${Date.now()}-${contadorId}`;
}

export function armaDePactoAtual(itens: ItemMochila[]): ItemMochila | null {
  return itens.find((it) => it.armaDePacto) ?? null;
}

/** Vincula uma nova arma de pacto — substitui qualquer arma de pacto
 * anterior (só existe 1 por vez) e já equipa na Mão Principal. */
export function vincularArmaDePacto(itens: ItemMochila[], nomeArma: string): ItemMochila[] {
  const semArmaDePactoAnterior = itens.filter((it) => !it.armaDePacto);
  const novoItem: ItemMochila = {
    id: gerarIdArmaDePacto(),
    nome: nomeArma,
    quantidade: 1,
    peso: buscarPesoItem(nomeArma),
    origemDoItem: 'Manual',
    armaDePacto: true,
  };
  return equiparNoSlot([...semArmaDePactoAnterior, novoItem], novoItem.id, 'maoPrincipal');
}

/** Desvincula a arma de pacto atual — ela desaparece (não fica
 * guardada na Mochila, é conjurada). Sem efeito se não houver nenhuma. */
export function desvincularArmaDePacto(itens: ItemMochila[]): ItemMochila[] {
  return itens.filter((it) => !it.armaDePacto);
}
