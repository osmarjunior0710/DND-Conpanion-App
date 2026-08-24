// Mochila — Entrega A4. Junta os itens que Origem + Classe concederam
// no wizard, no formato que a aba Mochila espera (decisão "Itens de
// origem/classe já nascem no formato de Mochila", DECISOES-DESIGN.md).

import { origens } from '../data/rulesets/dnd2024/origens';
import { proficienciasIniciaisClasse } from '../data/rulesets/dnd2024/classesProficienciasIniciais';
import { buscarPesoItem } from '../data/rulesets/dnd2024/buscarDescricaoItem';
import { classeDaSelecao } from './calculoPersonagem';
import type { WizardSelection } from './personagem';

export interface ItemMochila {
  nome: string;
  quantidade: number;
  peso: string | null;
  origemDoItem: 'Origem' | 'Classe';
}

/** Placeholders de grupo de ferramenta (ver origens.ts) que precisam
 * virar o nome real escolhido no wizard. */
const PLACEHOLDERS_FERRAMENTA = ['Instrumento Musical', 'Ferramentas de Artesão', 'Kit de Jogos'];

/**
 * Kits de Equipamento de Aventura (ex: "Kit de Explorador de
 * Masmorras") vêm como 1 item na planilha, mas o texto "Contém: ..."
 * da própria descrição lista os itens de verdade que estão dentro —
 * o jogador consome cada um separado (a Tocha acaba, a Corda pode ser
 * cortada), não faz sentido a Mochila mostrar "1× Kit" depois que a
 * compra já foi feita. Desagregado à mão, verificado item a item
 * contra o nome exato de cada um em equipamentoAventura.ts (alguns têm
 * nome diferente do texto da descrição, ex: "Cantil" na descrição é
 * "Cantil (cheio)" como item de verdade).
 *
 * Só "Kit de Explorador de Masmorras" está verificado (é o único que o
 * Guerreiro usa). Os outros 6 kits com "Contém:" na planilha
 * (Artista/Assaltante/Aventureiro/Diplomata/Erudito/Sacerdote) ainda
 * não foram desagregados — ver PENDENCIAS.md. Kit de Curandeiro e Kit
 * de Escalada NÃO são desagregáveis (são item único de uso próprio,
 * não um saco de itens).
 */
const DESAGREGACAO_KITS: Record<string, { nome: string; quantidade: number }[]> = {
  'Kit de Explorador de Masmorras': [
    { nome: 'Caixa para Fogo', quantidade: 1 },
    { nome: 'Cantil (cheio)', quantidade: 1 },
    { nome: 'Corda', quantidade: 1 },
    { nome: 'Estrepes', quantidade: 1 },
    { nome: 'Mochila', quantidade: 1 },
    { nome: 'Óleo', quantidade: 2 },
    { nome: 'Pé de Cabra', quantidade: 1 },
    { nome: 'Rações', quantidade: 10 },
    { nome: 'Tocha', quantidade: 10 },
  ],
};

function adicionarItem(itens: ItemMochila[], nome: string, quantidade: number, origemDoItem: 'Origem' | 'Classe') {
  const componentes = DESAGREGACAO_KITS[nome];
  if (componentes) {
    for (const c of componentes) {
      itens.push({
        nome: c.nome,
        quantidade: c.quantidade * quantidade,
        peso: buscarPesoItem(c.nome),
        origemDoItem,
      });
    }
    return;
  }
  itens.push({ nome, quantidade, peso: buscarPesoItem(nome), origemDoItem });
}

export function calcularItensIniciais(selection: WizardSelection): ItemMochila[] {
  const itens: ItemMochila[] = [];

  const origem = origens.find((o) => o.nome === selection.origem);
  if (origem && selection.equipamentoOrigemEscolhido === 'A') {
    for (const item of origem.equipamentoOpcaoA.itens) {
      const nome =
        PLACEHOLDERS_FERRAMENTA.includes(item.nome) && selection.ferramentaOrigemEscolhida
          ? selection.ferramentaOrigemEscolhida
          : item.nome;
      adicionarItem(itens, nome, item.quantidade, 'Origem');
    }
  }

  const classe = classeDaSelecao(selection);
  if (classe && selection.equipamentoClasseEscolhido) {
    const proficiencias = proficienciasIniciaisClasse[classe.id];
    const opcao = proficiencias?.equipamentoInicial.find((o) => o.rotulo === selection.equipamentoClasseEscolhido);
    if (opcao) {
      for (const item of opcao.itens) {
        adicionarItem(itens, item.nome, item.quantidade, 'Classe');
      }
    }
  }

  return itens;
}

/** "12,5 kg" → 12.5. "—" (sem peso, item negligenciável) → 0. Peso
 * desconhecido (não cadastrado na planilha) → null. */
function parseKg(peso: string): number | null {
  if (peso.trim() === '—') return 0;
  const match = peso.match(/([\d.,]+)\s*kg/i);
  if (!match) return null;
  return parseFloat(match[1].replace(',', '.'));
}

/** Peso da LINHA (peso unitário × quantidade), formatado — ex: "1×" em
 * "8× Azagaia" a 1 kg cada mostrava só "1 kg" antes, o que parecia
 * "não calcular nada"; agora mostra "8 kg" (o total daquela linha). */
export function pesoDaLinha(item: ItemMochila): string {
  if (!item.peso) return '— (sem peso cadastrado)';
  const valor = parseKg(item.peso);
  if (valor === null) return '— (sem peso cadastrado)';
  const total = Math.round(valor * item.quantidade * 100) / 100;
  return `${total.toString().replace('.', ',')} kg`;
}

export interface CargaTotal {
  kg: number;
  itensSemPeso: number;
}

/** Soma o peso de todos os itens (× quantidade). Itens sem peso
 * cadastrado na planilha entram na contagem `itensSemPeso` em vez de
 * serem tratados como 0 kg — não é pra fingir uma carga exata que a
 * gente não tem como calcular direito ainda. */
export function calcularCargaTotal(itens: ItemMochila[]): CargaTotal {
  let kg = 0;
  let itensSemPeso = 0;
  for (const item of itens) {
    if (!item.peso) {
      itensSemPeso += 1;
      continue;
    }
    const valor = parseKg(item.peso);
    if (valor === null) {
      itensSemPeso += 1;
      continue;
    }
    kg += valor * item.quantidade;
  }
  return { kg: Math.round(kg * 10) / 10, itensSemPeso };
}
