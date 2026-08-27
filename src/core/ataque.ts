// Ataque real com a arma equipada — Entrega E3.2 do Plano de Equipamento
// (ver DECISOES-DESIGN.md). Substitui o fixture [PH] fixo (Adaga) do
// "Atacar" no Combat. Zero constante de D&D hardcoded: dano/propriedade
// vêm de `data/rulesets/dnd2024/armas.ts` (planilha), bônus de
// proficiência vem de `calculoPersonagem.ts`.

import { armas, type Arma } from '../data/rulesets/dnd2024/armas';
import type { Classe } from '../data/rulesets/dnd2024/classes';
import { bonusProficiencia } from './calculoPersonagem';
import type { AtaqueInfo } from '../data/exampleCombat';

export interface AtaqueResolvido {
  nome: string;
  descricao: string;
  info: AtaqueInfo;
}

function parseDano(dano: string): { quantidade: number; lados: number; tipo: string } {
  const m = dano.match(/^(\d+)d(\d+)\s*(.*)$/i);
  if (!m) return { quantidade: 1, lados: 4, tipo: dano };
  return { quantidade: parseInt(m[1], 10), lados: parseInt(m[2], 10), tipo: m[3].trim() };
}

/**
 * Ataque Desarmado — confirmado no Apêndice C (Glossário de Regras):
 * "Seu bônus para a jogada é igual ao seu modificador de Força mais
 * seu Bônus de Proficiência. Se acertar, o alvo sofre dano Contundente
 * igual a 1 mais seu modificador de Força." Só a opção "Dano" está
 * implementada aqui — "Empurrar"/"Imobilizar" (testes de resistência,
 * sem rolagem de dano) ficam de fora por enquanto, ver PENDENCIAS.md.
 */
export function ataqueDesarmado(classe: Classe, nivel: number, forMod: number): AtaqueResolvido {
  const prof = bonusProficiencia(classe, nivel);
  return {
    nome: 'Ataque Desarmado',
    descricao: 'Soco, chute ou golpe corpo a corpo sem arma. Dano Contundente.',
    info: { modAcerto: forMod + prof, danoQuantidade: 1, danoLados: 1, danoMod: forMod, danoTipo: 'Contundente' },
  };
}

/**
 * Ataque com uma arma real do catálogo. Atributo usado: Força
 * (Corpo a Corpo) ou Destreza (à Distância) por padrão; com a
 * propriedade Acuidade, usa o maior entre os dois (Cap. 1: "a
 * propriedade Acuidade... permite que você use Força ou Destreza").
 * Assume proficiência com a arma (única classe hoje, Guerreiro, é
 * proficiente em todas — ver `core/maestriaArma.ts`); auditoria de
 * proficiência por classe/arma fica pra quando houver 2ª classe.
 */
export function ataqueComArma(arma: Arma, classe: Classe, nivel: number, forMod: number, desMod: number): AtaqueResolvido {
  const acuidade = arma.propriedades.includes('Acuidade');
  const distancia = arma.categoria.includes('à Distância');
  const atribMod = acuidade ? Math.max(forMod, desMod) : distancia ? desMod : forMod;
  const prof = bonusProficiencia(classe, nivel);
  const { quantidade, lados, tipo } = parseDano(arma.dano);
  return {
    nome: arma.nome,
    descricao: `${arma.dano}${arma.propriedades ? ` · ${arma.propriedades}` : ''}.`,
    info: { modAcerto: atribMod + prof, danoQuantidade: quantidade, danoLados: lados, danoMod: atribMod, danoTipo: tipo },
  };
}

/** Resolve o ataque disponível pelo nome do item na Mão Principal —
 * arma real do catálogo se identificar, senão Ataque Desarmado. */
export function ataqueAtual(
  nomeArmaEquipada: string | null,
  classe: Classe,
  nivel: number,
  forMod: number,
  desMod: number,
): AtaqueResolvido {
  const arma = nomeArmaEquipada ? armas.find((a) => a.nome === nomeArmaEquipada) : undefined;
  return arma ? ataqueComArma(arma, classe, nivel, forMod, desMod) : ataqueDesarmado(classe, nivel, forMod);
}
