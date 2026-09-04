// Resolve o tipo de dano da opção de sub-escolha `identidade_permanente`
// escolhida (ex.: cor de dragão do Draconato) — nunca duplicado como
// valor fixo em algum traço, sempre lido daqui em tempo de exibição.

import type { Especie } from '../data/rulesets/dnd2024/especies';
import type { WizardSelection } from './personagem';

export function tipoDanoSubescolha(especie: Especie, selection: WizardSelection): string | null {
  const opcao = especie.opcoesSubescolha?.find((o) => o.nome === selection.subescolhaEspecieEscolhida);
  return opcao?.tipoDano ?? null;
}
