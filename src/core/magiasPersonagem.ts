// Leitura genérica de magia real do personagem — zero fixture, zero
// constante de classe hardcoded. Complementa recursosClasse.ts.

import type { Atributo } from '../data/wizardFixtures';
import type { Classe, RecursoClasse } from '../data/rulesets/dnd2024/classes';
import { magias, type Magia } from '../data/rulesets/dnd2024/magias';
import { bonusProficiencia } from './calculoPersonagem';
import { modificador, valorFinalAtributo, type WizardSelection } from './personagem';
import { valorRecursoClasse } from './recursosClasse';

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

/** Magias preparadas reais do personagem. Recebe os nomes diretamente
 * (mesma razão de `truquesDoPersonagem`) — a partir da Etapa 4.3 a
 * lista pode ter mudado depois da criação (`FichaShell` guarda em
 * `magiasPreparadasAtuais`, não mais direto de
 * `selecao.magiasPreparadasEscolhidas`). */
export function magiasPreparadasDoPersonagem(nomes: string[]): Magia[] {
  return buscarMagiasPorNome(nomes);
}

/** Quantos nomes da lista ORIGINAL não estão mais na lista FINAL —
 * "trocas" feitas. Usado pra validar a regra "pode substituir 1 por
 * level-up" (Truques hoje, Magias Preparadas na Etapa 4.3): o total
 * final já é travado no máximo do nível pela própria tela de seleção,
 * então só falta impedir mais de 1 removido. */
export function contarTrocas(originais: string[], finais: string[]): number {
  return originais.filter((nome) => !finais.includes(nome)).length;
}

/** Quantos Truques/Magias Preparadas estão faltando pro nível atual —
 * "deveria ter" (tabela real da classe) menos "tem de verdade". Nunca
 * negativo. Detecta personagem "atrasado" (ex: Level Up que passou
 * sem escolher Truques/Magias, por bug ou por ter subido de nível
 * antes dessa tela existir) — ver PENDENCIAS.md "Detector genérico de
 * ficha atrasada" pro contexto maior (isso aqui é só o caso de
 * Truques/Magias, não um mecanismo genérico ainda). */
export function deficitTruques(classe: Classe | null, nivel: number, truquesAtuais: string[]): number {
  if (!classe) return 0;
  return Math.max(0, valorRecursoClasse(classe, 'Truques Conhecidos', nivel) - truquesAtuais.length);
}

export function deficitMagiasPreparadas(classe: Classe | null, nivel: number, magiasPreparadasAtuais: string[]): number {
  if (!classe) return 0;
  return Math.max(0, valorRecursoClasse(classe, 'Magias Preparadas', nivel) - magiasPreparadasAtuais.length);
}

export interface GrupoDeMagias {
  circulo: number;
  label: string;
  magias: Magia[];
}

/** Agrupa uma lista de magias por círculo — Truques (círculo 0) vira
 * um grupo próprio "Truques", os demais viram "Xº Círculo". Grupos do
 * círculo mais alto disponível pro mais baixo (o jogador normalmente
 * está de olho no que acabou de destravar), magias em ordem
 * alfabética dentro de cada grupo. Usado nas telas de escolha (Level
 * Up e "completar") pra não misturar círculos diferentes numa lista
 * só. */
export function agruparMagiasPorCirculo(magias: Magia[]): GrupoDeMagias[] {
  const porCirculo = new Map<number, Magia[]>();
  for (const m of magias) {
    const lista = porCirculo.get(m.circulo) ?? [];
    lista.push(m);
    porCirculo.set(m.circulo, lista);
  }
  return [...porCirculo.entries()]
    .sort(([a], [b]) => b - a)
    .map(([circulo, lista]) => ({
      circulo,
      label: circulo === 0 ? 'Truques' : `${circulo}º Círculo`,
      magias: [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    }));
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
