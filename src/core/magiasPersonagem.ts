// Leitura genérica de magia real do personagem — zero fixture, zero
// constante de classe hardcoded. Complementa recursosClasse.ts.

import type { Atributo } from '../data/wizardFixtures';
import type { Classe, RecursoClasse } from '../data/rulesets/dnd2024/classes';
import { magias, type Magia } from '../data/rulesets/dnd2024/magias';
import { bonusProficiencia } from './calculoPersonagem';
import { modificador, valorFinalAtributo, type WizardSelection } from './personagem';

/** Nome completo (como aparece em `Classe.atributoPrimario`) → código
 * de 3 letras. Só cobre os atributos que já apareceram como primário
 * de conjuração de alguma classe com dado real importado — cresce
 * conforme mais classes conjuradoras entrarem. Guerreiro
 * ("Força ou Destreza") não bate com nenhuma entrada de propósito —
 * não conjura, então não precisa de atributo de conjuração. */
const ATRIBUTO_POR_NOME: Record<string, Atributo> = {
  Carisma: 'CAR',
};

export interface EspacoDeMagiaAtivo {
  circulo: number;
  maximo: number;
  recuperaNoDescansoCurto: boolean;
}

const REGEX_CIRCULO = /^Espaços de Magia — (\d+)º Círculo$/;

/** TODOS os círculos de Espaço de Magia ativos no nível atual (Etapa
 * 4.2) — array vazio se a classe não conjura. Bardo ganha o 2º
 * círculo no nível 3 sem perder o 1º, então a partir daí isso retorna
 * 2 entradas simultâneas; ordenado por círculo crescente. */
export function espacosDeMagiaAtivos(classe: Classe | null, nivel: number): EspacoDeMagiaAtivo[] {
  if (!classe) return [];
  return classe.recursos
    .map((r): { circulo: number; recurso: RecursoClasse } | null => {
      const m = r.nome.match(REGEX_CIRCULO);
      return m ? { circulo: Number(m[1]), recurso: r } : null;
    })
    .filter((c): c is { circulo: number; recurso: RecursoClasse } => c !== null)
    .filter((c) => (c.recurso.valorPorNivel[nivel] ?? 0) > 0)
    .sort((a, b) => a.circulo - b.circulo)
    .map((c) => ({
      circulo: c.circulo,
      maximo: c.recurso.valorPorNivel[nivel] ?? 0,
      recuperaNoDescansoCurto: (c.recurso.recuperaEm ?? '').toLowerCase().includes('curto'),
    }));
}

function buscarMagiasPorNome(nomes: string[]): Magia[] {
  return nomes.map((nome) => magias.find((m) => m.nome === nome)).filter((m): m is Magia => m !== undefined);
}

/** Truques reais do personagem (nomes → objeto Magia completo). Recebe
 * os nomes diretamente (não `WizardSelection`) porque, a partir da
 * Etapa 4.1 (Level Up), a lista pode ter mudado depois da criação —
 * `FichaShell` guarda isso em estado próprio (`truquesAtuais`), não
 * mais direto de `selecao.truquesEscolhidos` (que é só o retrato da
 * criação, congelado). */
export function truquesDoPersonagem(nomes: string[]): Magia[] {
  return buscarMagiasPorNome(nomes);
}

/** Magias preparadas reais escolhidas na criação. Ainda lê direto de
 * `selecao` — cresce/troca no Level Up é Etapa 4.3, não feita. */
export function magiasPreparadasDoPersonagem(selecao: WizardSelection): Magia[] {
  return buscarMagiasPorNome(selecao.magiasPreparadasEscolhidas);
}

/** Quantos nomes da lista ORIGINAL não estão mais na lista FINAL —
 * "trocas" feitas. Usado pra validar a regra "pode substituir 1 por
 * level-up" (Truques hoje, Magias Preparadas na Etapa 4.3): o total
 * final já é travado no máximo do nível pela própria tela de seleção,
 * então só falta impedir mais de 1 removido. */
export function contarTrocas(originais: string[], finais: string[]): number {
  return originais.filter((nome) => !finais.includes(nome)).length;
}

/** Todas as magias marcadas com Tempo de Conjuração "Reação" começam
 * com esse texto na planilha (confirmado nas 4 ocorrências reais) —
 * heurística simples, mesmo padrão de `classificarMagia`. */
export function ehMagiaDeReacao(magia: Magia): boolean {
  return (magia.tempoConjuracao ?? '').startsWith('Reação');
}

/** Bônus de acerto de conjuração (mod. do atributo + bônus de
 * proficiência) — null se a classe não tiver atributo de conjuração
 * mapeado (ver `ATRIBUTO_POR_NOME`). */
export function modAcertoConjuracao(selecao: WizardSelection, classe: Classe | null, nivel: number): number | null {
  if (!classe) return null;
  const atributo = ATRIBUTO_POR_NOME[classe.atributoPrimario];
  if (!atributo) return null;
  const valor = valorFinalAtributo(selecao, atributo);
  if (valor === null) return null;
  return modificador(valor) + bonusProficiencia(classe, nivel);
}
