// Proficiência de arma real por classe — PENDENCIAS.md "Proficiência
// com arma equipada": até aqui `core/ataque.ts` somava o Bônus de
// Proficiência em qualquer arma, sem checar. Ficou invisível até
// agora porque nenhum personagem de teste (Guerreiro/Bardo) tinha
// arma Marcial equipada fora da proficiência — Bardo, na verdade, já
// é "só Armas Simples" no livro 2024 (proficiência com Marcial vem só
// de subclasse, ex: Treinamento Marcial do Colégio da Bravura nível
// 3), e Bruxo é igual. Dado real de `proficienciasArmaArmaduraClasse`
// (planilha, aba "Proficiências de Classe"), zero constante hardcoded
// de classe aqui.

import type { Arma } from '../data/rulesets/dnd2024/armas';
import type { Classe } from '../data/rulesets/dnd2024/classes';
import { proficienciasArmaArmaduraClasse } from '../data/rulesets/dnd2024/proficienciasArmaArmaduraClasse';

/** `true` se a classe é proficiente com a arma — lê o texto livre da
 * coluna "Proficiência com Armas" da planilha e resolve contra a
 * categoria/propriedades reais da arma. Cobre os padrões confirmados
 * até aqui: "Simples e Marciais" (tudo), "Simples" sozinho, e as 2
 * exceções por propriedade (Ladino: Acuidade OU Leve em qualquer
 * Marcial; Monge: Leve só em Marcial Corpo a Corpo). Sem entrada pra
 * classe = não proficiente (nunca assume). */
export function classeProficienteComArma(classe: Classe, arma: Arma): boolean {
  const entrada = proficienciasArmaArmaduraClasse.find((p) => p.classe === classe.nome);
  if (!entrada) return false;
  const texto = entrada.proficienciaArmas;

  if (texto.includes('Simples e Marciais')) return true;

  const simples = arma.categoria.includes('Simples');
  if (simples && texto.includes('Simples')) return true;

  const marcial = arma.categoria.includes('Marciais');
  if (!marcial) return false;

  if (texto.includes('Acuidade') && arma.propriedades.includes('Acuidade')) return true;

  if (texto.includes('Leve')) {
    const restritoACorpoACorpo = texto.includes('Corpo a Corpo com propriedade Leve');
    const categoriaOk = !restritoACorpoACorpo || arma.categoria.includes('Corpo a Corpo');
    if (categoriaOk && arma.propriedades.includes('Leve')) return true;
  }

  return false;
}
