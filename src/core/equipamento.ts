// Equipar/Desequipar — Entrega E2 do plano de Equipamento (ver
// DECISOES-DESIGN.md). Identifica o tipo de um item da Mochila
// cruzando o nome contra os catálogos reais (armas.ts/armaduras.ts) —
// zero suposição, só o que a planilha já confirma. Itens que não
// batem com nenhum catálogo (comida, tocha, item mágico ainda não
// importado...) ficam como 'generico' — sem controle de equipar
// nessa entrega (ver PENDENCIAS.md "Vestiário genérico").

import { armas } from '../data/rulesets/dnd2024/armas';
import { armaduras } from '../data/rulesets/dnd2024/armaduras';
import type { ItemMochila } from './mochila';

export type SlotEquipamento = 'maoPrincipal' | 'maoSecundaria' | 'armadura' | 'escudo';
export type TipoEquipamento = 'arma' | 'armadura' | 'escudo' | 'generico';

export interface InfoEquipamento {
  tipo: TipoEquipamento;
  duasMaos: boolean;
  /** Dado de dano maior da propriedade Versátil (ex.: "1d10"), ou
   * `null` se a arma não for Versátil — lido de `arma.propriedades`
   * (planilha), nunca hardcoded. Ver E3.4 em DECISOES-DESIGN.md. */
  dadoVersatil: string | null;
}

export function identificarEquipamento(nome: string): InfoEquipamento {
  const arma = armas.find((a) => a.nome === nome);
  if (arma) {
    const versatil = arma.propriedades.match(/Versátil \((\d+d\d+)\)/i);
    return {
      tipo: 'arma',
      duasMaos: arma.propriedades.includes('Duas Mãos'),
      dadoVersatil: versatil ? versatil[1] : null,
    };
  }
  const armadura = armaduras.find((a) => a.nome === nome);
  if (armadura) {
    return { tipo: armadura.categoria.includes('Escudo') ? 'escudo' : 'armadura', duasMaos: false, dadoVersatil: null };
  }
  return { tipo: 'generico', duasMaos: false, dadoVersatil: null };
}

/** Slots que fazem sentido oferecer pro jogador escolher, dado o tipo
 * do item — arma de Duas Mãos só oferece "mão principal" (ocupa as
 * duas ao equipar, não precisa escolher). */
export function slotsValidos(info: InfoEquipamento): SlotEquipamento[] {
  if (info.tipo === 'arma') return info.duasMaos ? ['maoPrincipal'] : ['maoPrincipal', 'maoSecundaria'];
  if (info.tipo === 'armadura') return ['armadura'];
  if (info.tipo === 'escudo') return ['escudo'];
  return [];
}

export interface ResumoEquipado {
  maoPrincipal: ItemMochila | null;
  maoSecundaria: ItemMochila | null;
  /** true quando a mão secundária está ocupada pela arma de Duas Mãos
   * (ou por Versátil empunhada com 2 mãos, `duasMaosAtivo`) da mão
   * principal, não por um item próprio equipado nela. */
  maoSecundariaOcupadaPorDuasMaos: boolean;
  armadura: ItemMochila | null;
  escudo: ItemMochila | null;
}

export function resumoEquipado(itens: ItemMochila[]): ResumoEquipado {
  const maoPrincipal = itens.find((it) => it.slot === 'maoPrincipal') ?? null;
  const duasMaos = maoPrincipal
    ? identificarEquipamento(maoPrincipal.nome).duasMaos || maoPrincipal.duasMaosAtivo === true
    : false;
  return {
    maoPrincipal,
    maoSecundaria: itens.find((it) => it.slot === 'maoSecundaria') ?? null,
    maoSecundariaOcupadaPorDuasMaos: duasMaos,
    armadura: itens.find((it) => it.slot === 'armadura') ?? null,
    escudo: itens.find((it) => it.slot === 'escudo') ?? null,
  };
}

/** Resolve o novo array de itens depois de equipar `id` no `slot`
 * desejado — libera qualquer outro item que já ocupasse esse mesmo
 * slot, e resolve as 2 exceções de "mesma mão": arma de Duas Mãos
 * equipada na mão principal libera mão secundária e escudo; equipar
 * escudo ou arma na mão secundária libera o outro (os dois usam a
 * mesma mão, na prática). */
export function equiparNoSlot(itens: ItemMochila[], id: string, slot: SlotEquipamento): ItemMochila[] {
  const alvo = itens.find((it) => it.id === id);
  if (!alvo) return itens;
  const info = identificarEquipamento(alvo.nome);

  return itens.map((it) => {
    if (it.id === id) return { ...it, slot };
    if (it.slot === slot) return { ...it, slot: null };
    if (info.duasMaos && slot === 'maoPrincipal' && (it.slot === 'maoSecundaria' || it.slot === 'escudo')) {
      return { ...it, slot: null };
    }
    if (
      (slot === 'escudo' && it.slot === 'maoSecundaria') ||
      (slot === 'maoSecundaria' && it.slot === 'escudo')
    ) {
      return { ...it, slot: null };
    }
    // Equipar algo na Mão Secundária (ou Escudo) libera a Mão
    // Principal do modo "2 mãos" de uma arma Versátil, senão as duas
    // coisas disputariam a mesma mão.
    if ((slot === 'maoSecundaria' || slot === 'escudo') && it.slot === 'maoPrincipal' && it.duasMaosAtivo) {
      return { ...it, duasMaosAtivo: false };
    }
    return it;
  });
}

export function desequiparItem(itens: ItemMochila[], id: string): ItemMochila[] {
  return itens.map((it) => (it.id === id ? { ...it, slot: null, duasMaosAtivo: false } : it));
}

/** Liga/desliga o modo "2 mãos" de uma arma Versátil equipada na Mão
 * Principal (E3.4) — ligar libera qualquer item que estivesse na Mão
 * Secundária ou no Escudo (a mesma mão passa a segurar a arma). */
export function alternarDuasMaosVersatil(itens: ItemMochila[], id: string): ItemMochila[] {
  const alvo = itens.find((it) => it.id === id);
  if (!alvo || alvo.slot !== 'maoPrincipal') return itens;
  const info = identificarEquipamento(alvo.nome);
  if (!info.dadoVersatil) return itens;
  const ligar = !alvo.duasMaosAtivo;

  return itens.map((it) => {
    if (it.id === id) return { ...it, duasMaosAtivo: ligar };
    if (ligar && (it.slot === 'maoSecundaria' || it.slot === 'escudo')) return { ...it, slot: null };
    return it;
  });
}

export const NOME_SLOT: Record<SlotEquipamento, string> = {
  maoPrincipal: 'Mão Principal',
  maoSecundaria: 'Mão Secundária',
  armadura: 'Armadura',
  escudo: 'Escudo',
};

export type CategoriaMochila = 'arma' | 'armadura' | 'joia' | 'outros';

export const NOME_CATEGORIA_MOCHILA: Record<CategoriaMochila, string> = {
  arma: 'Armas',
  armadura: 'Armadura',
  joia: 'Jóias e Artefatos',
  outros: 'Outros',
};

/**
 * Classificação da Mochila em 4 grupos visuais (não é regra de D&D,
 * é só organização de tela — ver DECISOES-FICHA.md "Mochila —
 * decisões de arquitetura consolidadas"): Armas / Armadura (inclui
 * Escudo, mesma régua de "aumenta CA") / Jóias e Artefatos / Outros.
 *
 * "Jóias e Artefatos" sempre fica vazio hoje: nenhum item mágico
 * (anel, amuleto...) foi importado ainda (planilha não tem — ver
 * PENDENCIAS.md, E4/Sintonização). `identificarEquipamento` nunca
 * classifica nada como "joia" enquanto isso não existir — todo item
 * `'generico'` cai em "Outros" por enquanto. Quando o catálogo de
 * itens mágicos existir, essa função ganha o critério real (ex.:
 * categoria "Anel"/"Amuleto"/"Item Maravilhoso" da planilha).
 */
export function categoriaMochila(nome: string): CategoriaMochila {
  const info = identificarEquipamento(nome);
  if (info.tipo === 'arma') return 'arma';
  if (info.tipo === 'armadura' || info.tipo === 'escudo') return 'armadura';
  return 'outros';
}
