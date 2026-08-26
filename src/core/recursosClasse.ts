// Leitura genérica de `recursos` da classe (`classes.ts`) por nome +
// nível — usado por qualquer recurso com "banco de usos" numérico
// (Recuperar Fôlego, Maestria em Arma...). Zero constante hardcoded:
// tudo lido da progressão real importada da planilha.

import type { Classe } from '../data/rulesets/dnd2024/classes';

export function valorRecursoClasse(classe: Classe, prefixoNome: string, nivel: number): number {
  const recurso = classe.recursos.find((r) => r.nome.startsWith(prefixoNome));
  return recurso?.valorPorNivel[nivel] ?? 0;
}

/** Nº de usos de Recuperar Fôlego no nível atual — Mente Tática (nível
 * 2) gasta usos do mesmo banco, não tem contador próprio (ver
 * DECISOES-DESIGN.md "Guerreiro B3"). */
export function quantidadeRecuperarFolego(classe: Classe, nivel: number): number {
  return valorRecursoClasse(classe, 'Recuperar Fôlego', nivel);
}
