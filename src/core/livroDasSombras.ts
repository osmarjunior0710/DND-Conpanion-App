import { magias, type Magia } from '../data/rulesets/dnd2024/magias';

/** Truques + magias de 1º círculo com o marcador Ritual, elegíveis pro
 * Livro das Sombras (Invocação Mística "Pacto do Tomo" do Bruxo — ver
 * DND-Regras.md). Regra real: de QUALQUER classe (não só Bruxo), e o
 * personagem não pode já ter a magia preparada — por isso ambas
 * recebem `jaConhecidos` (Truques + Magias Preparadas atuais do
 * Bruxo) e filtram fora o que já é conhecido. */

export function truquesElegiveisLivroDasSombras(jaConhecidos: string[]): Magia[] {
  return magias.filter((m) => m.circulo === 0 && !jaConhecidos.includes(m.nome));
}

export function magiasRituaisElegiveisLivroDasSombras(jaConhecidos: string[]): Magia[] {
  return magias.filter((m) => m.circulo === 1 && (m.tempoConjuracao?.includes('Ritual') ?? false) && !jaConhecidos.includes(m.nome));
}
