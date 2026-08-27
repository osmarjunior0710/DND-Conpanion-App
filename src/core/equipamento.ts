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
}

export function identificarEquipamento(nome: string): InfoEquipamento {
  const arma = armas.find((a) => a.nome === nome);
  if (arma) return { tipo: 'arma', duasMaos: arma.propriedades.includes('Duas Mãos') };
  const armadura = armaduras.find((a) => a.nome === nome);
  if (armadura) return { tipo: armadura.categoria.includes('Escudo') ? 'escudo' : 'armadura', duasMaos: false };
  return { tipo: 'generico', duasMaos: false };
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
   * da mão principal, não por um item próprio equipado nela. */
  maoSecundariaOcupadaPorDuasMaos: boolean;
  armadura: ItemMochila | null;
  escudo: ItemMochila | null;
}

export function resumoEquipado(itens: ItemMochila[]): ResumoEquipado {
  const maoPrincipal = itens.find((it) => it.slot === 'maoPrincipal') ?? null;
  const duasMaos = maoPrincipal ? identificarEquipamento(maoPrincipal.nome).duasMaos : false;
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
    return it;
  });
}

export function desequiparItem(itens: ItemMochila[], id: string): ItemMochila[] {
  return itens.map((it) => (it.id === id ? { ...it, slot: null } : it));
}

export const NOME_SLOT: Record<SlotEquipamento, string> = {
  maoPrincipal: 'Mão Principal',
  maoSecundaria: 'Mão Secundária',
  armadura: 'Armadura',
  escudo: 'Escudo',
};
