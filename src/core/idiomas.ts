import { idiomaExtraClasse } from '../data/rulesets/dnd2024/idiomaExtraClasse';

/** Total de idiomas esperados (sem contar Comum) — 2 da Origem +
 * qualquer idioma extra concedido por característica de Classe nível 1
 * (fixo + escolha livre, ver `idiomaExtraClasse.ts`). */
export function totalIdiomasEsperados(classeNome: string | null): number {
  const extra = classeNome ? idiomaExtraClasse[classeNome] : undefined;
  return 2 + (extra?.fixo.length ?? 0) + (extra?.escolhaLivre ?? 0);
}
