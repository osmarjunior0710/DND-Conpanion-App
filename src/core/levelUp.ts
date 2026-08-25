// Motor de Level Up — Entrega B1 (plano "Guerreiro 1-20", ver
// DECISOES-DESIGN.md). Tudo derivado da progressão real da classe
// (`classes.ts`, já importada da planilha) e de `caracteristicasClasse.ts`
// — zero constante de D&D hardcoded, zero suposição fixa por classe.

import { caracteristicasClasse } from '../data/rulesets/dnd2024/caracteristicasClasse';
import type { Classe } from '../data/rulesets/dnd2024/classes';

export interface CaracteristicaNivel {
  nome: string;
  descricao: string | null;
}

/** Níveis em que a classe ganha "Aumento no Valor de Atributo" — lido
 * direto da progressão real da classe, não uma tabela fixa. Guerreiro
 * tem 6 níveis de ASI (4,6,8,12,14,16), diferente da maioria das
 * outras classes (5 níveis) — variação real confirmada no livro, ver
 * DECISOES-DESIGN.md "Guerreiro — plano de implementação completa". */
export function niveisComASI(classe: Classe): number[] {
  return classe.progressao.filter((p) => p.caracteristicas.includes('Aumento no Valor de Atributo')).map((p) => p.nivel);
}

/** Níveis em que a classe concede uma "Dádiva Épica" — categoria de
 * escolha exclusiva de nível único (só nível 19 no Guerreiro hoje). */
export function niveisComDadivaEpica(classe: Classe): number[] {
  return classe.progressao.filter((p) => p.caracteristicas.includes('Dádiva Épica')).map((p) => p.nivel);
}

/** True se a classe já concedeu "Estilo de Luta" em algum nível até
 * `nivelAtual` (inclusive) — regra confirmada no livro: "sempre que
 * atinge um nível [de Guerreiro], você pode substituir o talento que
 * escolheu por um talento diferente de Estilo de Luta" (não é escolha
 * única do nível 1, é reconsiderável em todo level-up daí em diante).
 * Generalizado por nome de característica, não hardcoded pra
 * Guerreiro — Guardião/Paladino também têm "Estilo de Luta" (concedido
 * no nível 2 deles); quando forem importados, isso já funciona sem
 * mudar código. */
export function temEstiloDeLutaTrocavel(classe: Classe, nivelAtual: number): boolean {
  return classe.progressao.some((p) => p.nivel <= nivelAtual && p.caracteristicas.includes('Estilo de Luta'));
}

/** Características (com descrição real, quando `caracteristicasClasse.ts`
 * já tiver o nível importado) desbloqueadas num nível específico da
 * classe. Níveis sem descrição própria ainda (ex: "Aumento no Valor de
 * Atributo" repetido, "Característica de Subclasse" placeholder) voltam
 * com `descricao: null` — quem renderiza decide o que mostrar nesse caso.
 *
 * Algumas características (ex: "Indomável") são re-listadas em níveis
 * mais altos na progressão só pra indicar um uso extra do mesmo recurso,
 * não uma descrição nova — `caracteristicasClasse.ts` só tem UMA entrada
 * (no nível em que a característica foi introduzida). Por isso a busca
 * pega a entrada de maior nível ≤ nível atual, não uma igualdade exata. */
export function caracteristicasDoNivel(classe: Classe, nivel: number): CaracteristicaNivel[] {
  const linha = classe.progressao.find((p) => p.nivel === nivel);
  if (!linha) return [];
  return linha.caracteristicas.map((nome) => {
    const candidatos = caracteristicasClasse.filter(
      (c) => c.classe === classe.nome && c.nome === nome && c.nivel <= nivel,
    );
    const detalhe = candidatos.sort((a, b) => b.nivel - a.nivel)[0];
    return { nome, descricao: detalhe?.descricao ?? null };
  });
}
