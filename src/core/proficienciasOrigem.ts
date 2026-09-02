// Deriva quais perícias/ferramentas o personagem já tem por outra fonte
// (Origem, Classe) — usado pra marcar "já possui" na tela de escolha
// livre de proficiência de talentos como Habilidoso (ver
// PENDENCIAS.md "Origens com seleção extra no Talento de Origem").

import type { Origem } from '../data/rulesets/dnd2024/origens';
import type { WizardSelection } from './personagem';

export interface ProficienciasConcedidas {
  pericias: Set<string>;
  ferramentas: Set<string>;
}

export function proficienciasJaConcedidas(
  selection: WizardSelection,
  origem: Origem | undefined,
): ProficienciasConcedidas {
  const pericias = new Set<string>(selection.periciasClasseEscolhidas);
  const ferramentas = new Set<string>(selection.ferramentasClasseEscolhidas);

  if (origem) {
    pericias.add(origem.pericias[0]);
    pericias.add(origem.pericias[1]);

    if (origem.ferramenta.categoria === 'fixa') {
      ferramentas.add(origem.ferramenta.nome);
    } else if (selection.ferramentaOrigemEscolhida) {
      ferramentas.add(selection.ferramentaOrigemEscolhida);
    }
  }

  return { pericias, ferramentas };
}
