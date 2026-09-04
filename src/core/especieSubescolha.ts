// Resolve o efeito da opção de sub-escolha `identidade_permanente`
// escolhida (ex.: cor de dragão do Draconato, ancestralidade do
// Golias) — nunca duplicado como valor fixo em algum traço, sempre
// lido daqui em tempo de exibição.

import type { Especie, TracoEspecie } from '../data/rulesets/dnd2024/especies';
import type { WizardSelection } from './personagem';

export function tipoDanoSubescolha(especie: Especie, selection: WizardSelection): string | null {
  const opcao = especie.opcoesSubescolha?.find((o) => o.nome === selection.subescolhaEspecieEscolhida);
  return opcao?.tipoDano ?? null;
}

/** Texto de exibição de um traço, com a opção de sub-escolha escolhida
 * resolvida quando aplicável — o texto original do traço nunca é
 * alterado, só complementado. Cobre os 2 formatos de traço
 * `identidade_permanente` (ver `TracoEspecie`):
 * - `usaTipoDanoDaSubescolha`: traço à parte cujo efeito só faz
 *   sentido com o tipo de dano resolvido (Ataque de Sopro/Resistência
 *   a Dano do Draconato).
 * - `usaDescricaoEfeitoDaSubescolha`: o próprio traço já lista todas
 *   as opções (Ancestralidade Gigante do Golias) — mostra qual foi
 *   escolhida, sem repetir a lista inteira. */
export function descricaoTracoResolvida(traco: TracoEspecie, especie: Especie, selection: WizardSelection): string {
  const opcao = especie.opcoesSubescolha?.find((o) => o.nome === selection.subescolhaEspecieEscolhida);
  if (traco.usaTipoDanoDaSubescolha && opcao?.tipoDano) {
    return `${traco.descricao} (Tipo de dano: ${opcao.tipoDano})`;
  }
  if (traco.usaDescricaoEfeitoDaSubescolha && opcao?.descricaoEfeito) {
    return `${traco.descricao} — Benefício escolhido: ${opcao.nome}. ${opcao.descricaoEfeito}`;
  }
  return traco.descricao;
}
