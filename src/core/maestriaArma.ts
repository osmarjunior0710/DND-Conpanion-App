// Maestria em Arma (Guerreiro, nível 1) — Entrega B2 do plano
// "Guerreiro 1-20" (ver DECISOES-DESIGN.md). O nº de tipos de arma com
// Maestria vem do recurso "Maestria em Arma" da classe (`classes.ts`),
// não é uma constante fixa — outras classes que ganharem esse recurso
// no futuro funcionam sem mudar código aqui.

import { armas, type Arma } from '../data/rulesets/dnd2024/armas';
import { proficienciasArmaArmaduraClasse } from '../data/rulesets/dnd2024/proficienciasArmaArmaduraClasse';
import type { Classe } from '../data/rulesets/dnd2024/classes';

export function quantidadeMaestriaEmArma(classe: Classe, nivel: number): number {
  const recurso = classe.recursos.find((r) => r.nome.startsWith('Maestria em Arma'));
  return recurso?.valorPorNivel[nivel] ?? 0;
}

/** Armas elegíveis pra Maestria — qualquer arma que a classe tenha
 * proficiência. Hoje só cobre o caso do Guerreiro ("Armas Simples e
 * Marciais" = catálogo inteiro); classes com proficiência restrita
 * (ex: Ladino, só Acuidade/Leve) ainda não têm o recurso "Maestria em
 * Arma" em `classes.ts`, então o filtro fino fica pra quando isso
 * aparecer de verdade — ver PENDENCIAS.md. */
export function armasParaMaestria(classe: Classe): Arma[] {
  const prof = proficienciasArmaArmaduraClasse.find((p) => p.classe === classe.nome);
  if (prof?.proficienciaArmas === 'Armas Simples e Marciais') return armas;
  return [];
}
