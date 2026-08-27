// Leitura genérica de magia real do personagem — zero fixture, zero
// constante de classe hardcoded. Complementa recursosClasse.ts.

import type { Classe, RecursoClasse } from '../data/rulesets/dnd2024/classes';
import { magias, type Magia } from '../data/rulesets/dnd2024/magias';
import type { WizardSelection } from './personagem';

export interface EspacoDeMagiaAtivo {
  circulo: number;
  maximo: number;
  recuperaNoDescansoCurto: boolean;
}

const REGEX_CIRCULO = /^Espaços de Magia — (\d+)º Círculo$/;

/** O círculo de Espaço de Magia ativo no nível atual, ou null se a
 * classe não conjura (ou nenhum círculo tem espaço > 0 nesse nível).
 * Hoje só existe UM círculo ativo por vez pra qualquer personagem
 * alcançável no app (Bardo nível 1 só tem 1º círculo — 2º só destrava
 * no nível 3, e o Level Up ainda não sabe crescer Truques/Magias/
 * Espaços — ver PENDENCIAS.md "Etapa 4"). Se no futuro isso mudar
 * (2+ círculos com espaço > 0 ao mesmo tempo), esta função retorna só
 * o de menor círculo — vira limitação conhecida até a Etapa 4 tratar
 * múltiplos círculos simultâneos de verdade. */
export function espacoDeMagiaAtivo(classe: Classe | null, nivel: number): EspacoDeMagiaAtivo | null {
  if (!classe) return null;
  const candidatos = classe.recursos
    .map((r): { circulo: number; recurso: RecursoClasse } | null => {
      const m = r.nome.match(REGEX_CIRCULO);
      return m ? { circulo: Number(m[1]), recurso: r } : null;
    })
    .filter((c): c is { circulo: number; recurso: RecursoClasse } => c !== null)
    .filter((c) => (c.recurso.valorPorNivel[nivel] ?? 0) > 0)
    .sort((a, b) => a.circulo - b.circulo);

  const ativo = candidatos[0];
  if (!ativo) return null;
  return {
    circulo: ativo.circulo,
    maximo: ativo.recurso.valorPorNivel[nivel] ?? 0,
    recuperaNoDescansoCurto: (ativo.recurso.recuperaEm ?? '').toLowerCase().includes('curto'),
  };
}

function buscarMagiasPorNome(nomes: string[]): Magia[] {
  return nomes.map((nome) => magias.find((m) => m.nome === nome)).filter((m): m is Magia => m !== undefined);
}

/** Truques reais escolhidos na criação (nomes → objeto Magia completo). */
export function truquesDoPersonagem(selecao: WizardSelection): Magia[] {
  return buscarMagiasPorNome(selecao.truquesEscolhidos);
}

/** Magias preparadas reais escolhidas na criação. */
export function magiasPreparadasDoPersonagem(selecao: WizardSelection): Magia[] {
  return buscarMagiasPorNome(selecao.magiasPreparadasEscolhidas);
}
