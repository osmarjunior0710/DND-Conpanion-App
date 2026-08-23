// Motor de cálculo da Ficha — Entrega A1. Fórmulas especificadas em
// PENDENCIAS.md ("Motor de cálculo da Ficha final ainda não existe").
// Zero constante de D&D hardcoded aqui: tudo lido de data/rulesets/.

import { classes, type Classe } from '../data/rulesets/dnd2024/classes';
import { origens } from '../data/rulesets/dnd2024/origens';
import { armaduras } from '../data/rulesets/dnd2024/armaduras';
import { proficienciasIniciaisClasse } from '../data/rulesets/dnd2024/classesProficienciasIniciais';
import { modificador, valorFinalAtributo, type WizardSelection } from './personagem';

export function classeDaSelecao(selection: WizardSelection): Classe | null {
  return classes.find((c) => c.nome === selection.classe) ?? null;
}

function parseDadoDeVida(dado: string): number {
  return parseInt(dado.replace(/[^0-9]/g, ''), 10) || 8;
}

export function bonusProficiencia(classe: Classe, nivel: number): number {
  const linha = classe.progressao.find((p) => p.nivel === nivel) ?? classe.progressao[0];
  return parseInt(linha.bonusProficiencia.replace(/[^0-9]/g, ''), 10) || 2;
}

/**
 * Nível 1 nunca rola nem tira média — dado de vida MÁXIMO + mod. CON.
 * Exceções de classe pra PV (nenhuma conhecida hoje) entrariam aqui.
 */
export function calcularPvMaximoNivel1(selection: WizardSelection): number | null {
  const classe = classeDaSelecao(selection);
  const conValor = valorFinalAtributo(selection, 'CON');
  if (!classe || conValor === null) return null;
  return parseDadoDeVida(classe.dadoDeVida) + modificador(conValor);
}

/** Item de armadura (se houver) escolhido no equipamento inicial da classe. */
function armaduraEquipadaInicial(selection: WizardSelection): (typeof armaduras)[number] | null {
  const classe = classeDaSelecao(selection);
  if (!classe || !selection.equipamentoClasseEscolhido) return null;
  const proficiencias = proficienciasIniciaisClasse[classe.id];
  if (!proficiencias) return null;
  const opcao = proficiencias.equipamentoInicial.find((o) => o.rotulo === selection.equipamentoClasseEscolhido);
  if (!opcao) return null;
  for (const item of opcao.itens) {
    const armadura = armaduras.find((a) => a.nome === item.nome);
    if (armadura) return armadura;
  }
  return null;
}

function caPelaArmadura(classeArmadura: string, desMod: number): number {
  const fixo = classeArmadura.match(/^(\d+)$/);
  if (fixo) return parseInt(fixo[1], 10);
  const comTeto = classeArmadura.match(/^(\d+)\s*\+\s*modificador de Des\s*\(máx\.?\s*(\d+)\)$/i);
  if (comTeto) return parseInt(comTeto[1], 10) + Math.min(desMod, parseInt(comTeto[2], 10));
  const semTeto = classeArmadura.match(/^(\d+)\s*\+\s*modificador de Des$/i);
  if (semTeto) return parseInt(semTeto[1], 10) + desMod;
  return 10 + desMod;
}

/**
 * CA nível 1. Exceções de classe (Bárbaro/Monge, ver DECISOES-DESIGN.md
 * "Cálculo de CA") entram aqui como lookup por classeId, checado ANTES
 * da fórmula padrão — nenhuma das duas está importada ainda, então não
 * há entrada no lookup por enquanto.
 */
export function calcularCA(selection: WizardSelection): number | null {
  const desValor = valorFinalAtributo(selection, 'DES');
  if (desValor === null) return null;
  const desMod = modificador(desValor);
  const armadura = armaduraEquipadaInicial(selection);
  if (!armadura) return 10 + desMod;
  return caPelaArmadura(armadura.classeArmadura, desMod);
}

function proficienteEmPericia(selection: WizardSelection, pericia: string): boolean {
  const origem = origens.find((o) => o.nome === selection.origem);
  if (origem?.pericias.includes(pericia)) return true;
  return selection.periciasClasseEscolhidas.includes(pericia);
}

export function calcularPercepcaoPassiva(selection: WizardSelection): number | null {
  const sabValor = valorFinalAtributo(selection, 'SAB');
  const classe = classeDaSelecao(selection);
  if (sabValor === null || !classe) return null;
  const proficiente = proficienteEmPericia(selection, 'Percepção');
  const bonus = proficiente ? bonusProficiencia(classe, 1) : 0;
  return 10 + modificador(sabValor) + bonus;
}

export function calcularIniciativa(selection: WizardSelection): number | null {
  const desValor = valorFinalAtributo(selection, 'DES');
  if (desValor === null) return null;
  return modificador(desValor);
}

/** Soma o ouro residual de Origem + Classe pra opção escolhida em cada uma. */
export function calcularOuroInicial(selection: WizardSelection): number {
  let total = 0;
  const origem = origens.find((o) => o.nome === selection.origem);
  if (origem && selection.equipamentoOrigemEscolhido) {
    total +=
      selection.equipamentoOrigemEscolhido === 'A'
        ? origem.equipamentoOpcaoA.ouro
        : origem.equipamentoOpcaoB.ouro;
  }
  const classe = classeDaSelecao(selection);
  if (classe && selection.equipamentoClasseEscolhido) {
    const proficiencias = proficienciasIniciaisClasse[classe.id];
    const opcao = proficiencias?.equipamentoInicial.find((o) => o.rotulo === selection.equipamentoClasseEscolhido);
    if (opcao) total += opcao.ouro;
  }
  return total;
}
