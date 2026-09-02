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
// "Salv." é a abreviação usada em ~155 das 390 descrições curtas
// sempre que a magia pede salvaguarda do alvo (confirmado por
// amostragem) — heurística igual às outras, erro ocasional aceitável.
const REGEX_SALVAGUARDA = /\bSalv\./;

export interface ClassificacaoMagia {
  ataque: boolean;
  cura: boolean;
  custoComponente: boolean;
  /** Pede salvaguarda do alvo — usado só pra saber se falta mecânica
   * automatizável no Combat (ver `usarMagiaTemAcaoAutomatizada`), não
   * é uma categoria mostrada como ícone. */
  salvaguarda: boolean;
}

export function classificarMagia(magia: Magia): ClassificacaoMagia {
  const desc = magia.descricaoCurta ?? '';
  const descSemNegativaCura = desc.replace(/não recuper\w*/gi, '');
  return {
    ataque: REGEX_ATAQUE.test(desc),
    cura: REGEX_CURA.test(desc) || REGEX_RECUPERA_PV.test(descSemNegativaCura),
    custoComponente: REGEX_CUSTO_COMPONENTE.test(magia.componentes ?? ''),
    salvaguarda: REGEX_SALVAGUARDA.test(desc),
  };
}

/** `false` = truque (círculo 0) sem NENHUMA jogada que o Combat sabe
 * automatizar hoje — só pede salvaguarda do ALVO (não do conjurador),
 * mecânica de teste de resistência de terceiro que ainda não existe
 * no app (mesma lacuna do Ataque Desarmado — Empurrar/Imobilizar, ver
 * PENDENCIAS.md "Magia/truque de salvaguarda sem jogada automatizável").
 * `true` pra tudo que já tem algum caminho (ataque rola d20; cura e
 * utilidade em geral não precisam de jogada nenhuma, "Usar" sem fazer
 * nada é o comportamento certo pra elas). Só vale pra truque — magia
 * preparada sempre "faz algo" ao usar (gasta o espaço), mesmo sendo
 * de salvaguarda. */
export function usarMagiaTemAcaoAutomatizada(magia: Magia): boolean {
  if (magia.circulo !== 0) return true;
  const c = classificarMagia(magia);
  return c.ataque || !c.salvaguarda;
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
