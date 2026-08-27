// Sintonização de Itens Mágicos — Entrega E4.2 do Plano de
// Equipamento (ver DECISOES-DESIGN.md). Limite de 3 itens sintonizados
// ao mesmo tempo, confirmado no Cap. 6 real (ver decisão "Sistema de
// Equipamento — schema de referência"). Cruza o nome do item da
// Mochila contra o catálogo real (`itensMagicos.ts`, E4.1) — zero
// suposição sobre o que é ou não item mágico.

import { buscarItemMagico } from '../data/rulesets/dnd2024/itensMagicos';
import type { ItemMochila } from './mochila';

export const LIMITE_SINTONIZACAO = 3;

/** true quando o item (pelo nome) é um item mágico real que exige
 * Sintonização — `false` pra item comum ou item mágico que não exige
 * (ver E4.1: `requerSintonizacao` já vem interpretado do texto real
 * da planilha). */
export function itemExigeSintonizacao(nome: string): boolean {
  return buscarItemMagico(nome)?.requerSintonizacao === true;
}

export function contarSintonizados(itens: ItemMochila[]): number {
  return itens.filter((it) => it.sintonizado).length;
}

/** Liga/desliga a Sintonização de um item. Ligar quando já há 3
 * sintonizados não faz nada (trava silenciosa — a UI desabilita o
 * botão antes disso acontecer, ver `MochilaTab.tsx`). */
export function alternarSintonizacao(itens: ItemMochila[], id: string): ItemMochila[] {
  const alvo = itens.find((it) => it.id === id);
  if (!alvo) return itens;
  if (!alvo.sintonizado && contarSintonizados(itens) >= LIMITE_SINTONIZACAO) return itens;
  return itens.map((it) => (it.id === id ? { ...it, sintonizado: !it.sintonizado } : it));
}
