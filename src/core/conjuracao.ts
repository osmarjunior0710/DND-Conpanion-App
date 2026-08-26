// Deriva se o personagem tem fonte própria de conjuração — decisão
// registrada em DECISOES-DESIGN.md ("Magia de item vs magia natural" +
// "Aba Magias sempre visível, nunca escondida por classe"). Hoje só
// olha a classe atual (nenhuma classe conjuradora foi importada ainda
// — Guerreiro é a única), mas fica pronta pra somar multiclasse assim
// que isso existir no app. Item mágico com magia NUNCA entra aqui — é
// sistema separado (Mochila + ação "Usar Objeto"), não afeta essa
// resposta.

import type { Classe } from '../data/rulesets/dnd2024/classes';

/** Convenção assumida pra detectar recurso de conjuração: nome do
 * `RecursoClasse` menciona "Espaços de Magia" ou "Magias Preparadas"
 * — mesma nomenclatura já usada no protótipo fixture
 * (`exampleCombat.ts`) e na decisão de conjuração de meio-conjuradores
 * (Guardião/Paladino). Ainda não validado contra dado real de nenhuma
 * classe conjuradora importada — revisar quando a 1ª (Mago ou
 * Clérigo) entrar. */
export function personagemConjura(classe: Classe | null): boolean {
  if (!classe) return false;
  return classe.recursos.some((r) => r.nome.includes('Espaços de Magia') || r.nome.includes('Magias Preparadas'));
}
