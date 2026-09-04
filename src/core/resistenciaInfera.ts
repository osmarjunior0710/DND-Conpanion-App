import { tiposDeDano } from '../data/rulesets/dnd2024/tiposDeDano';

/** "Resistência Ínfera" (Bruxo, Patrono Ínfero, nível 10) — qualquer
 * tipo de dano exceto Energético. */
export function tiposElegiveisResistenciaInfera(): string[] {
  return tiposDeDano.filter((t) => t.nome !== 'Energético').map((t) => t.nome);
}
