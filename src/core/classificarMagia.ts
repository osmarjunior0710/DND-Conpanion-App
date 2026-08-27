import type { Magia } from '../data/rulesets/dnd2024/magias';

// Classificador heurístico (regex sobre descricaoCurta/componentes, não
// tag manual por magia — 390 entradas, não escala revisar 1 a 1). Objetivo
// é ajudar o jogador a achar magia de ataque/cura/custo mais rápido, não
// uma regra de mecânica — classificação errada ocasional é aceitável
// (corrigido sob demanda se aparecer, ver DECISOES-DESIGN.md).
const REGEX_ATAQUE = /\bataques?\b[^."]{0,30}:/i;
const REGEX_CURA = /\bcura(m)?\b/i;
const REGEX_RECUPERA_PV = /recuper\w*\s+(todo|metade|\d)/i;
const REGEX_CUSTO_COMPONENTE = /\d+[^.)]{0,20}\b(po|pp|pc)\b/i;

export interface ClassificacaoMagia {
  ataque: boolean;
  cura: boolean;
  custoComponente: boolean;
}

export function classificarMagia(magia: Magia): ClassificacaoMagia {
  const desc = magia.descricaoCurta ?? '';
  const descSemNegativaCura = desc.replace(/não recuper\w*/gi, '');
  return {
    ataque: REGEX_ATAQUE.test(desc),
    cura: REGEX_CURA.test(desc) || REGEX_RECUPERA_PV.test(descSemNegativaCura),
    custoComponente: REGEX_CUSTO_COMPONENTE.test(magia.componentes ?? ''),
  };
}

export const ICONE_ATAQUE = '⚔️';
export const ICONE_CURA = '❤️‍🩹';
export const ICONE_CUSTO_COMPONENTE = '🪙';

export function iconesMagia(magia: Magia): string {
  const c = classificarMagia(magia);
  let icones = '';
  if (c.ataque) icones += ICONE_ATAQUE;
  if (c.cura) icones += ICONE_CURA;
  if (c.custoComponente) icones += ICONE_CUSTO_COMPONENTE;
  return icones;
}
