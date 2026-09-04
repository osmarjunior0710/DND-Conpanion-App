// Deriva se o personagem tem fonte própria de conjuração — decisão
// registrada em DECISOES-DESIGN.md ("Magia de item vs magia natural" +
// "Aba Magias sempre visível, nunca escondida por classe"). Olha a
// classe atual E a espécie (Linhagem Élfica do Elfo e afins concedem
// truque/magia mesmo numa classe sem conjuração — ex.: Guerreiro Elfo
// ainda conjura o truque da linhagem), mas fica pronta pra somar
// outras fontes assim que existirem de verdade no app:
// - Multiclasse (pendência em aberto, ver PENDENCIAS.md).
// - Talento de Origem que concede magia (ex: "Iniciado em Magia" — dá
//   2 truques + 1 magia de 1º círculo; concedido por Acólito/Guia/
//   Sábio). Essas 3 origens já têm o talento certo no dado
//   (`origens.ts`), mas estão `disponivel: false` — a tela de
//   escolher truque/magia da lista ainda não existe (ver pendência
//   "Origens com seleção extra no Talento de Origem"). Inalcançável
//   na prática hoje, por isso não entra ainda no cálculo abaixo.
// Item mágico com magia NUNCA entra aqui — é sistema separado
// (Mochila + ação "Usar Objeto"), não afeta essa resposta.

import type { Classe } from '../data/rulesets/dnd2024/classes';
import type { WizardSelection } from './personagem';
import { temMagiaDeEspecie } from './magiasEspecie';

/** Convenção assumida pra detectar recurso de conjuração: nome do
 * `RecursoClasse` menciona "Espaços de Magia" ou "Magias Preparadas"
 * — mesma nomenclatura já usada no protótipo fixture
 * (`exampleCombat.ts`) e na decisão de conjuração de meio-conjuradores
 * (Guardião/Paladino). Ainda não validado contra dado real de nenhuma
 * classe conjuradora importada — revisar quando a 1ª (Mago ou
 * Clérigo) entrar. */
export function personagemConjura(classe: Classe | null, selecao?: WizardSelection): boolean {
  const classeConjura = classe ? classe.recursos.some((r) => r.nome.includes('Espaços de Magia') || r.nome.includes('Magias Preparadas')) : false;
  if (classeConjura) return true;
  return selecao ? temMagiaDeEspecie(selecao) : false;
}
