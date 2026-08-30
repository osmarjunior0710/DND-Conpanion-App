// Gerador de personagem de teste — botão "🎲 Personagem de Teste"
// (Home/Lista de Personagens). Pede só Classe/Origem/Espécie/Nível e
// monta uma ficha completa instantânea, sorteando tudo o resto —
// mesmo espírito do botão 🔀 "sortear tudo desta etapa" que já existe
// em cada passo do wizard (`WizardShell.tsx`), só que encadeado do
// início ao fim e, se o nível pedido for > 1, seguido de Level Ups
// automáticos (escolhas também sorteadas). Ferramenta de
// desenvolvimento/teste — não faz parte do fluxo normal de criação de
// personagem. Ver DECISOES-DESIGN.md.

import { atributosOrdem, arrayPadrao, alinhamentos, type Atributo } from '../data/wizardFixtures';
import { classes, type Classe } from '../data/rulesets/dnd2024/classes';
import { origens } from '../data/rulesets/dnd2024/origens';
import { especies } from '../data/rulesets/dnd2024/especies';
import { idiomas } from '../data/rulesets/dnd2024/idiomas';
import { subclasses } from '../data/rulesets/dnd2024/subclasses';
import { estilosDeLuta } from '../data/rulesets/dnd2024/estilosDeLuta';
import { proficienciasIniciaisClasse } from '../data/rulesets/dnd2024/classesProficienciasIniciais';
import { gruposFerramenta } from '../data/rulesets/dnd2024/ferramentas';
import { magiasDaClasse } from '../data/rulesets/dnd2024/magias';
import { talentos, type Talento } from '../data/rulesets/dnd2024/talentos';
import { armas } from '../data/rulesets/dnd2024/armas';
import { armaduras } from '../data/rulesets/dnd2024/armaduras';
import { dadoVidaValor } from '../data/levelUpFixtures';
import {
  criarSelecaoInicial,
  aumentarAtributos,
  modificador,
  valorFinalAtributo,
  type WizardSelection,
} from './personagem';
import { calcularPvMaximoNivel1, periciasProficientes } from './calculoPersonagem';
import { armasParaMaestria, quantidadeMaestriaEmArma } from './maestriaArma';
import { valorRecursoClasse } from './recursosClasse';
import { espacosDeMagiaAtivos } from './magiasPersonagem';
import { niveisComASI, niveisComEspecialista, temEstiloDeLutaTrocavel } from './levelUp';
import { gerarIdPersonagem, type PersonagemSalvo } from './armazenamentoPersonagens';
import { calcularItensIniciais, type ItemMochila } from './mochila';
import { equiparNoSlot } from './equipamento';

const nomesAleatorios = [
  'Aria Ventos-Negros',
  'Thorn Ferreiro',
  'Lyra Sombraluz',
  'Kael Pedraverde',
  'Sira Nuvem-de-Fogo',
  'Bram Duasluas',
];

function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function sorteiaUm<T>(lista: T[]): T | null {
  if (lista.length === 0) return null;
  return lista[Math.floor(Math.random() * lista.length)];
}

/** Monta uma `WizardSelection` completa e válida pra Classe/Origem/
 * Espécie escolhidas — mesma lógica dos `randomizarX` de
 * `WizardShell.tsx` (atributos, línguas, alinhamento, escolhas de
 * classe e de origem), só que compostas de uma vez em vez de
 * acionadas passo a passo pelo botão 🔀. Nível 1 sempre — quem chama
 * aplica os Level Ups depois, se o nível pedido for maior. */
function gerarSelecaoNivel1(classe: Classe, origemNome: string, especieNome: string): WizardSelection {
  let selection = criarSelecaoInicial();
  selection.classe = classe.nome;
  selection.origem = origemNome;
  selection.especie = especieNome;
  selection.nome = sorteiaUm(nomesAleatorios) ?? 'Personagem de Teste';

  // Atributos — array padrão embaralhado nos 6 atributos + ajuste
  // +1/+1/+1 em 3 atributos sorteados (mesmo padrão de
  // `randomizarAtributos`).
  const valores = embaralhar(arrayPadrao);
  const atributos = {} as Record<Atributo, number | null>;
  atributosOrdem.forEach((a, i) => {
    atributos[a] = valores[i];
  });
  selection.atributos = atributos;
  selection.bonusModo = '111';
  selection.bonusEscolhas = embaralhar([...atributosOrdem]).slice(0, 3);

  // Escolhas da Classe (estilo de luta, maestria, perícias, ferramentas,
  // equipamento inicial, truques, magias preparadas).
  const proficiencias = proficienciasIniciaisClasse[classe.id];
  if (temEstiloDeLutaTrocavel(classe, 1)) {
    selection.estiloDeLutaEscolhido = sorteiaUm(estilosDeLuta)?.nome ?? null;
  }
  const qtdMaestria = quantidadeMaestriaEmArma(classe, 1);
  if (qtdMaestria > 0) {
    selection.maestriaArmaEscolhida = embaralhar(armasParaMaestria(classe))
      .slice(0, qtdMaestria)
      .map((a) => a.nome);
  }
  if (proficiencias) {
    selection.periciasClasseEscolhidas = embaralhar(proficiencias.periciasEscolha.opcoes).slice(
      0,
      proficiencias.periciasEscolha.quantidade,
    );
    if (proficiencias.ferramentasEscolha) {
      const opcoesFerramenta = gruposFerramenta[proficiencias.ferramentasEscolha.grupo] ?? [];
      selection.ferramentasClasseEscolhidas = embaralhar(opcoesFerramenta)
        .slice(0, proficiencias.ferramentasEscolha.quantidade)
        .map((f) => f.nome);
    }
    const opcoesEquip = proficiencias.equipamentoInicial;
    selection.equipamentoClasseEscolhido = (sorteiaUm(opcoesEquip)?.rotulo ?? 'A') as 'A' | 'B' | 'C';
  }
  const maxTruques = valorRecursoClasse(classe, 'Truques Conhecidos', 1);
  if (maxTruques > 0) {
    selection.truquesEscolhidos = embaralhar(magiasDaClasse(classe.nome, 0))
      .slice(0, maxTruques)
      .map((m) => m.nome);
  }
  const maxMagias = valorRecursoClasse(classe, 'Magias Preparadas', 1);
  if (maxMagias > 0) {
    selection.magiasPreparadasEscolhidas = embaralhar(magiasDaClasse(classe.nome, 1))
      .slice(0, maxMagias)
      .map((m) => m.nome);
  }

  // Escolhas da Origem (ferramenta, quando a Origem pede escolha; opção
  // de equipamento A/B).
  const origemObj = origens.find((o) => o.nome === origemNome);
  selection.equipamentoOrigemEscolhido = Math.random() < 0.5 ? 'A' : 'B';
  if (origemObj?.ferramenta.categoria === 'escolha') {
    const opcoes = gruposFerramenta[origemObj.ferramenta.grupo] ?? [];
    selection.ferramentaOrigemEscolhida = sorteiaUm(opcoes)?.nome ?? null;
  }

  // Línguas, alinhamento — genérico, mesma lógica do wizard.
  const outrosIdiomas = idiomas.filter((i) => i.nome !== 'Comum').map((i) => i.nome);
  selection.linguas = ['Comum', ...embaralhar(outrosIdiomas).slice(0, 2)];
  selection.alinhamento = sorteiaUm(alinhamentos);

  return selection;
}

function talentoDisponivel(t: Talento, nivel: number, atributosFinais: Record<Atributo, number>): boolean {
  if (t.prerequisitos.nivelMinimo !== null && nivel < t.prerequisitos.nivelMinimo) return false;
  return t.prerequisitos.atributosMinimos.every((a) => (atributosFinais[a] ?? 10) >= 13);
}

/** Resolve o ASI de um talento (mesma decisão de
 * `LevelUpShell.aplicarAsiDoTalento`, sorteada em vez de escolhida) —
 * devolve os códigos de atributo pra `aumentarAtributos` (0, 1 ou 2
 * entradas). */
function sortearAsiDoTalento(t: Talento): Atributo[] {
  if (t.concedeAsi.tipo === 'nenhum') return [];
  if (t.concedeAsi.tipo === 'distribuir-dois') {
    const emUmSo = Math.random() < 0.5;
    const atributosPossiveis = t.concedeAsi.atributos;
    if (emUmSo) {
      const a = sorteiaUm(atributosPossiveis);
      return a ? [a, a] : [];
    }
    const dois = embaralhar(atributosPossiveis).slice(0, 2);
    return dois.length === 2 ? dois : dois.length === 1 ? [dois[0]] : [];
  }
  // escolha-unica
  const a = sorteiaUm(t.concedeAsi.atributos);
  return a ? [a] : [];
}

/** Aplica Level Ups de nível 2 até `nivelAlvo`, sorteando toda escolha
 * que o Level Up de verdade pediria (subclasse, estilo de luta,
 * truques/magias preparadas, especialista, ASI/talento) — mesmo
 * espírito do 🔀 do wizard, mas em lote. PV usa a média do dado (sem
 * rolar), por nível. Dádiva Épica fica de fora — a lista ainda não
 * existe no app (ver PENDENCIAS.md), mesmo estado do Level Up normal. */
function aplicarLevelUpsAleatorios(
  classe: Classe,
  selecaoInicial: WizardSelection,
  nivelAlvo: number,
  /** Quando informado, o PRIMEIRO nível de ASI encontrado usa esse
   * talento em vez do sorteio 50/50 — usado por
   * `gerarPersonagemComTalento` pra garantir que o personagem de teste
   * de um talento específico realmente tenha esse talento. */
  talentoForcadoId?: string,
): {
  selecao: WizardSelection;
  nivel: number;
  pvMax: number;
  subclasseAtual: string | null;
  estiloDeLutaAtual: string | null;
  truquesAtual: string[];
  magiasPreparadasAtual: string[];
  periciasEspecialistaAtual: string[];
  talentosGeraisAtual: string[];
} {
  let selecao = { ...selecaoInicial };
  let pvMax = calcularPvMaximoNivel1(selecao) ?? 0;
  let subclasseAtual: string | null = null;
  let estiloDeLutaAtual: string | null = selecao.estiloDeLutaEscolhido;
  let truquesAtual = [...selecao.truquesEscolhidos];
  let magiasPreparadasAtual = [...selecao.magiasPreparadasEscolhidas];
  let periciasEspecialistaAtual: string[] = [];
  let talentosGeraisAtual: string[] = [];

  const conValor = valorFinalAtributo(selecao, 'CON') ?? 10;
  const mediaPvPorNivel = dadoVidaValor[classe.dadoDeVida] + modificador(conValor);
  const subclassesDaClasse = subclasses.filter((s) => s.classeId === classe.id);

  for (let nivel = 2; nivel <= nivelAlvo; nivel++) {
    pvMax += mediaPvPorNivel;

    if (classe.nivelSubclasse === nivel && !subclasseAtual && subclassesDaClasse.length > 0) {
      subclasseAtual = sorteiaUm(subclassesDaClasse)?.nome ?? null;
    }

    if (temEstiloDeLutaTrocavel(classe, nivel) && !estiloDeLutaAtual) {
      estiloDeLutaAtual = sorteiaUm(estilosDeLuta)?.nome ?? null;
    }

    const maxTruques = valorRecursoClasse(classe, 'Truques Conhecidos', nivel);
    if (maxTruques > 0) {
      truquesAtual = embaralhar(magiasDaClasse(classe.nome, 0))
        .slice(0, maxTruques)
        .map((m) => m.nome);
    }

    const maxMagias = valorRecursoClasse(classe, 'Magias Preparadas', nivel);
    if (maxMagias > 0) {
      const circuloMaximo = Math.max(0, ...espacosDeMagiaAtivos(classe, nivel).map((e) => e.circulo));
      const disponiveis = magiasDaClasse(classe.nome)
        .filter((m) => m.circulo > 0 && m.circulo <= circuloMaximo);
      magiasPreparadasAtual = embaralhar(disponiveis)
        .slice(0, maxMagias)
        .map((m) => m.nome);
    }

    if (niveisComEspecialista(classe).includes(nivel)) {
      const jaProficiente = periciasProficientes(selecao);
      const candidatas = jaProficiente.filter((p) => !periciasEspecialistaAtual.includes(p));
      periciasEspecialistaAtual = [...periciasEspecialistaAtual, ...embaralhar(candidatas).slice(0, 2)];
    }

    if (niveisComASI(classe).includes(nivel)) {
      const atributosFinaisAtuais = Object.fromEntries(
        atributosOrdem.map((a) => [a, valorFinalAtributo(selecao, a) ?? 10]),
      ) as Record<Atributo, number>;
      const talentoForcado = talentoForcadoId && !talentosGeraisAtual.includes(talentoForcadoId) ? talentoForcadoId : null;
      const usarTalento = talentoForcado !== null || Math.random() < 0.5;
      const opcoesTalento = usarTalento
        ? talentos.filter(
            (t) =>
              t.categoria === 'Geral' &&
              t.id !== 'aumento-no-valor-de-atributo' &&
              (t.repetivel || !talentosGeraisAtual.includes(t.id)) &&
              talentoDisponivel(t, nivel, atributosFinaisAtuais),
          )
        : [];
      const talentoEscolhido = talentoForcado
        ? (talentos.find((t) => t.id === talentoForcado) ?? null)
        : (sorteiaUm(opcoesTalento) ?? talentos.find((t) => t.id === 'aumento-no-valor-de-atributo') ?? null);
      if (talentoEscolhido) {
        talentosGeraisAtual = [...talentosGeraisAtual, talentoEscolhido.id];
        const codigos = sortearAsiDoTalento(talentoEscolhido);
        if (codigos.length > 0) {
          selecao = { ...selecao, atributos: aumentarAtributos(selecao.atributos, codigos) };
        }
      }
    }
  }

  return {
    selecao,
    nivel: nivelAlvo,
    pvMax,
    subclasseAtual,
    estiloDeLutaAtual,
    truquesAtual,
    magiasPreparadasAtual,
    periciasEspecialistaAtual,
    talentosGeraisAtual,
  };
}

export interface OpcaoGeradorTeste {
  id: string;
  nome: string;
}

/** Opções pros 4 dropdowns do popup — só o que já está `disponivel`
 * no catálogo (mesma regra do wizard normal: nada "(em breve)"). */
export function opcoesGeradorTeste(): {
  classes: OpcaoGeradorTeste[];
  origens: OpcaoGeradorTeste[];
  especies: OpcaoGeradorTeste[];
} {
  return {
    classes: classes.filter((c) => c.disponivel).map((c) => ({ id: c.id, nome: c.nome })),
    origens: origens.filter((o) => o.disponivel).map((o) => ({ id: o.id, nome: o.nome })),
    especies: especies.filter((e) => e.disponivel).map((e) => ({ id: e.id, nome: e.nome })),
  };
}

/** Gera e devolve um `PersonagemSalvo` completo, pronto pra salvar —
 * quem chama decide se salva (`armazenamentoPersonagens.salvar`) e
 * pra onde navegar depois. Não salva sozinho, pra manter esse módulo
 * livre de efeito colateral (mais fácil de testar/reaproveitar). */
export function gerarPersonagemTeste(params: {
  classeNome: string;
  origemNome: string;
  especieNome: string;
  nivelAlvo: number;
  /** ID de um Talento Geral pra forçar no primeiro nível de ASI
   * disponível, em vez do sorteio 50/50 — ver `gerarPersonagemComTalento`. */
  talentoForcadoId?: string;
}): PersonagemSalvo {
  const classe = classes.find((c) => c.nome === params.classeNome);
  if (!classe) throw new Error(`Classe não encontrada: ${params.classeNome}`);

  const selecaoNivel1 = gerarSelecaoNivel1(classe, params.origemNome, params.especieNome);
  const nivelAlvo = Math.max(1, params.nivelAlvo);

  if (nivelAlvo === 1) {
    const pvMax = calcularPvMaximoNivel1(selecaoNivel1) ?? 0;
    return {
      id: gerarIdPersonagem(),
      criadoEm: new Date().toISOString(),
      nivel: 1,
      xp: 0,
      pvAtual: pvMax,
      pvMax,
      selecao: selecaoNivel1,
    };
  }

  const resultado = aplicarLevelUpsAleatorios(classe, selecaoNivel1, nivelAlvo, params.talentoForcadoId);
  return {
    id: gerarIdPersonagem(),
    criadoEm: new Date().toISOString(),
    nivel: resultado.nivel,
    xp: 0,
    pvAtual: resultado.pvMax,
    pvMax: resultado.pvMax,
    selecao: resultado.selecao,
    subclasseAtual: resultado.subclasseAtual,
    estiloDeLutaAtual: resultado.estiloDeLutaAtual,
    truquesAtual: resultado.truquesAtual,
    magiasPreparadasAtual: resultado.magiasPreparadasAtual,
    periciasEspecialistaAtual: resultado.periciasEspecialistaAtual,
    talentosGeraisAtual: resultado.talentosGeraisAtual,
  };
}

/** Catálogo dos talentos/estilos já com efeito mecânico de verdade
 * (Fase 4, lote 1 — ver DECISOES-DESIGN.md "Talentos Fase 4 — lote
 * 1"). Cada um vem de um lugar diferente do personagem — `tipo` diz
 * qual: `'origem'` só nasce de uma Origem específica (nunca escolhido
 * na mão), `'estiloDeLuta'` vem do Estilo de Luta da classe (Guerreiro/
 * Paladino/Guardião), `'geral'` é um Talento normal da lista de
 * Level Up. Usado por `gerarPersonagensDeTesteDosTalentos` — quando
 * a Fase 4 ganhar um novo lote, adicionar aqui também. */
export const TALENTOS_FASE4_IMPLEMENTADOS: { id: string; nome: string; tipo: 'origem' | 'estiloDeLuta' | 'geral' }[] = [
  { id: 'alerta', nome: 'Alerta', tipo: 'origem' },
  { id: 'defensivo', nome: 'Defensivo', tipo: 'estiloDeLuta' },
  { id: 'arquearia', nome: 'Arquearia', tipo: 'estiloDeLuta' },
  { id: 'duelismo', nome: 'Duelismo', tipo: 'estiloDeLuta' },
  { id: 'mestre-em-armaduras-medias', nome: 'Mestre em Armaduras Médias', tipo: 'geral' },
];

function itemEhArmaADistancia(nomeItem: string): boolean {
  return armas.find((a) => a.nome === nomeItem)?.categoria.includes('à Distância') ?? false;
}

function itemEhArmaCorpoACorpoUmaMao(nomeItem: string): boolean {
  const a = armas.find((x) => x.nome === nomeItem);
  return a !== undefined && a.categoria.includes('Corpo a Corpo') && !a.propriedades.includes('Duas Mãos');
}

function itemEhArmadura(nomeItem: string): boolean {
  return armaduras.some((a) => a.nome === nomeItem);
}

/** Garante (e já equipa) o item que cada Estilo de Luta precisa pra
 * ter algum efeito visível — sem isso, o Osmar teria que caçar o item
 * certo na Mochila e equipar na mão pra sequer conseguir testar. Se o
 * kit inicial sorteado (opção A/B/C) não tiver o item certo, troca pra
 * uma opção que tenha antes de montar a Mochila. */
function garantirEquipamentoParaEstiloDeLuta(personagem: PersonagemSalvo, classe: Classe, estiloId: string): void {
  const verificador =
    estiloId === 'arquearia'
      ? itemEhArmaADistancia
      : estiloId === 'duelismo'
        ? itemEhArmaCorpoACorpoUmaMao
        : estiloId === 'defensivo'
          ? itemEhArmadura
          : null;
  if (!verificador) return;

  let itens: ItemMochila[] = calcularItensIniciais(personagem.selecao);
  let itemAlvo = itens.find((it) => verificador(it.nome));

  if (!itemAlvo) {
    const proficiencias = proficienciasIniciaisClasse[classe.id];
    const opcaoComItem = proficiencias?.equipamentoInicial.find((o) => o.itens.some((it) => verificador(it.nome)));
    if (opcaoComItem) {
      personagem.selecao.equipamentoClasseEscolhido = opcaoComItem.rotulo as 'A' | 'B' | 'C';
      itens = calcularItensIniciais(personagem.selecao);
      itemAlvo = itens.find((it) => verificador(it.nome));
    }
  }

  if (itemAlvo) {
    const slot = estiloId === 'defensivo' ? 'armadura' : 'maoPrincipal';
    itens = equiparNoSlot(itens, itemAlvo.id, slot);
  }
  personagem.itensMochilaAtual = itens;
}

/** Gera um personagem de teste garantindo que ele TEM o talento/estilo
 * pedido (não sorteado — forçado), com o nome do personagem = nome do
 * talento, pra identificar na Lista sem abrir a ficha. Usa Classe/
 * Origem/Espécie compatíveis (a primeira `disponivel` que sirva), o
 * resto genérico/sorteado — mesmo espírito de `gerarPersonagemTeste`. */
export function gerarPersonagemComTalento(id: string): PersonagemSalvo {
  const entrada = TALENTOS_FASE4_IMPLEMENTADOS.find((t) => t.id === id);
  if (!entrada) throw new Error(`Talento/Estilo não catalogado em TALENTOS_FASE4_IMPLEMENTADOS: ${id}`);

  const especieNome = especies.find((e) => e.disponivel)?.nome;
  if (!especieNome) throw new Error('Nenhuma Espécie disponível.');

  if (entrada.tipo === 'origem') {
    const origemObj = origens.find((o) => o.disponivel && o.talentoOrigemId === id);
    if (!origemObj) throw new Error(`Nenhuma Origem disponível concede o talento "${id}".`);
    const classeNome = classes.find((c) => c.disponivel)?.nome;
    if (!classeNome) throw new Error('Nenhuma Classe disponível.');
    const personagem = gerarPersonagemTeste({ classeNome, origemNome: origemObj.nome, especieNome, nivelAlvo: 1 });
    personagem.selecao.nome = entrada.nome;
    return personagem;
  }

  if (entrada.tipo === 'estiloDeLuta') {
    const classeObj = classes.find((c) => c.disponivel && temEstiloDeLutaTrocavel(c, 1));
    if (!classeObj) throw new Error(`Nenhuma Classe disponível tem Estilo de Luta pra testar "${id}".`);
    const estiloObj = estilosDeLuta.find((e) => e.id === id);
    if (!estiloObj) throw new Error(`Estilo de Luta não encontrado: ${id}`);
    const origemNome = origens.find((o) => o.disponivel)?.nome;
    if (!origemNome) throw new Error('Nenhuma Origem disponível.');
    const personagem = gerarPersonagemTeste({ classeNome: classeObj.nome, origemNome, especieNome, nivelAlvo: 1 });
    personagem.selecao.estiloDeLutaEscolhido = estiloObj.nome;
    personagem.estiloDeLutaAtual = estiloObj.nome;
    personagem.selecao.nome = entrada.nome;
    // Sem o item certo EQUIPADO, o efeito não aparece em lugar nenhum
    // (Arquearia precisa de arma à Distância na Mão Principal;
    // Duelismo, de 1 arma corpo a corpo numa mão só; Defensivo, de
    // qualquer Armadura) — garante o kit certo e já equipa, pra não
    // obrigar o Osmar a caçar item manualmente só pra testar.
    garantirEquipamentoParaEstiloDeLuta(personagem, classeObj, id);
    return personagem;
  }

  // 'geral' — talento normal de Level Up, forçado no 1º nível de ASI.
  const classeObj = classes.find((c) => c.disponivel && niveisComASI(c).length > 0);
  if (!classeObj) throw new Error(`Nenhuma Classe disponível tem nível de ASI pra testar "${id}".`);
  const nivelAlvo = Math.min(...niveisComASI(classeObj));
  const origemNome = origens.find((o) => o.disponivel)?.nome;
  if (!origemNome) throw new Error('Nenhuma Origem disponível.');
  const personagem = gerarPersonagemTeste({
    classeNome: classeObj.nome,
    origemNome,
    especieNome,
    nivelAlvo,
    talentoForcadoId: id,
  });
  personagem.selecao.nome = entrada.nome;
  return personagem;
}

/** Gera 1 personagem de teste pra CADA talento/estilo já implementado
 * (Fase 4) — pedido direto do Osmar pra conferir todos de uma vez, sem
 * depender do sorteio acertar a combinação certa. Não salva sozinho —
 * quem chama decide (mesmo padrão de `gerarPersonagemTeste`). */
export function gerarPersonagensDeTesteDosTalentos(): PersonagemSalvo[] {
  return TALENTOS_FASE4_IMPLEMENTADOS.map((t) => gerarPersonagemComTalento(t.id));
}
