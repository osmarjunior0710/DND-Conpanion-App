import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { armazenamentoPersonagens, type PersonagemSalvo } from '../../core/armazenamentoPersonagens';
import { garantirPersonagemDemo, ID_PERSONAGEM_DEMO } from '../../core/personagemDemo';
import { useColapsavel } from '../hooks/useColapsavel';
import {
  bonusProficiencia,
  calcularAtributosFinais,
  calcularCAEquipado,
  calcularIniciativa,
  calcularPercepcaoPassiva,
  calcularPericias,
  calcularProficienciasFerramenta,
  calcularPvMaximoNivel1,
  classeDaSelecao,
  explicarCAEquipado,
  explicarIniciativa,
  explicarPercepcaoPassiva,
  explicarPvMaximo,
  periciasProficientes,
} from '../../core/calculoPersonagem';
import { aumentarAtributos, modificador, valorFinalAtributo, type WizardSelection } from '../../core/personagem';
import { atributosOrdem, type Atributo } from '../../data/wizardFixtures';
import {
  calcularCapacidadeMaxima,
  calcularItensIniciais,
  criarItemManual,
  explicarCapacidadeMaxima,
  type ItemMochila,
} from '../../core/mochila';
import {
  alternarDuasMaosVersatil,
  desequiparItem as desequiparItemPuro,
  equiparNoSlot,
  resumoEquipado,
  type SlotEquipamento,
} from '../../core/equipamento';
import { ataqueAtual, ataqueBonusMaoSecundaria } from '../../core/ataque';
import { alternarSintonizacao } from '../../core/sintonizacao';
import { armasParaMaestria as listarArmasParaMaestria } from '../../core/maestriaArma';
import { quantidadeRecuperarFolego } from '../../core/recursosClasse';
import { personagemConjura } from '../../core/conjuracao';
import {
  espacosDeMagiaAtivos,
  ehMagiaDeReacao,
  modAcertoConjuracao as calcularModAcertoConjuracao,
  truquesDoPersonagem,
  magiasPreparadasDoPersonagem,
  deficitTruques,
  deficitMagiasPreparadas,
  magiasDisponiveisParaPreparar,
  poolDescobertasMagicas,
} from '../../core/magiasPersonagem';
import { usosInspiracaoMaximo, dadoInspiracao, fonteDeInspiracaoDesbloqueada } from '../../core/inspiracaoBardo';
import {
  caracteristicaDesbloqueada,
  caracteristicaSubclasseDesbloqueada,
  contarRepeticoesCaracteristica,
  numeroDeAtaques,
} from '../../core/levelUp';
import { estilosDeLuta } from '../../data/rulesets/dnd2024/estilosDeLuta';
import { origens } from '../../data/rulesets/dnd2024/origens';
import { magiasDaClasse } from '../../data/rulesets/dnd2024/magias';
import AvatarMenu from './AvatarMenu';
import styles from './FichaShell.module.css';
import AtributosTab from './tabs/AtributosTab';
import PerfilTab from './tabs/PerfilTab';
import MochilaTab from './tabs/MochilaTab';
import MagiasTab from './tabs/MagiasTab';
import CombatTab, { type EstadoRecurso, type RecursoTurno } from './tabs/CombatTab';
import LevelUpShell, { type PersonagemNivel } from './levelup/LevelUpShell';
import CompletarMagiasShell from './levelup/CompletarMagiasShell';
import LivroDasSombrasShell from './levelup/LivroDasSombrasShell';

type TabName = 'atributos' | 'perfil' | 'mochila' | 'magias' | 'combat';

const ORDEM_ABAS: TabName[] = ['atributos', 'perfil', 'mochila', 'magias', 'combat'];

const TABS: { id: TabName; label: string; icon: string }[] = [
  { id: 'atributos', label: 'Atributos', icon: '🧬' },
  { id: 'perfil', label: 'Perfil', icon: '📜' },
  { id: 'mochila', label: 'Mochila', icon: '🎒' },
  { id: 'magias', label: 'Magias', icon: '📖' },
  { id: 'combat', label: 'Combate', icon: '⚔' },
];

const turnoInicial: Record<RecursoTurno, EstadoRecurso> = {
  acao: 'disponivel',
  bonus: 'disponivel',
  reacao: 'disponivel',
};

export default function FichaShell() {
  const navigate = useNavigate();
  const { id } = useParams();
  const personagemSalvo = id === ID_PERSONAGEM_DEMO ? garantirPersonagemDemo() : id ? armazenamentoPersonagens.buscar(id) : null;

  if (!personagemSalvo) {
    return (
      <div className={styles.screen}>
        <div className={styles.header}>
          <span className="back" onClick={() => navigate('/lista')}>
            ←
          </span>
          <div className={styles.name}>Personagem não encontrado</div>
        </div>
        <div className="label" style={{ padding: 16 }}>
          Esse personagem não existe (ou foi salvo num navegador diferente — o armazenamento hoje é só local,
          nuvem entra mais pra frente). Volte pra lista e escolha outro.
        </div>
      </div>
    );
  }

  return <FichaConteudo personagemSalvo={personagemSalvo} />;
}

function FichaConteudo({ personagemSalvo }: { personagemSalvo: PersonagemSalvo }) {
  const navigate = useNavigate();
  const [selecao, setSelecao] = useState<WizardSelection>(personagemSalvo.selecao);
  const classe = classeDaSelecao(selecao);
  const conValor = selecao.atributos.CON;

  const [tab, setTab] = useState<TabName>('atributos');
  const [personagem, setPersonagem] = useState<PersonagemNivel>({
    nivel: personagemSalvo.nivel,
    pvMax: personagemSalvo.pvMax ?? calcularPvMaximoNivel1(selecao) ?? personagemSalvo.pvAtual,
    dadoVida: classe?.dadoDeVida ?? 'd8',
    conMod: conValor !== null ? modificador(conValor) : 0,
    subclasse: personagemSalvo.subclasseAtual ?? null,
    estiloDeLuta: personagemSalvo.estiloDeLutaAtual ?? selecao.estiloDeLutaEscolhido,
  });
  const [pvAtual, setPvAtual] = useState(personagemSalvo.pvAtual);
  const [maestriaArma, setMaestriaArma] = useState<string[]>(personagemSalvo.maestriaArmaAtual ?? selecao.maestriaArmaEscolhida);
  const [truquesAtuais, setTruquesAtuais] = useState<string[]>(personagemSalvo.truquesAtual ?? selecao.truquesEscolhidos);
  const [magiasPreparadasAtuais, setMagiasPreparadasAtuais] = useState<string[]>(
    personagemSalvo.magiasPreparadasAtual ?? selecao.magiasPreparadasEscolhidas,
  );
  const [invocacoesMisticasAtuais, setInvocacoesMisticasAtuais] = useState<string[]>(
    personagemSalvo.invocacoesMisticasAtual ?? selecao.invocacoesMisticasEscolhidas,
  );
  const [periciasEspecialistaAtuais, setPericiasEspecialistaAtuais] = useState<string[]>(
    personagemSalvo.periciasEspecialistaAtual ?? [],
  );
  const [periciasSubclasseBonusAtuais, setPericiasSubclasseBonusAtuais] = useState<string[]>(
    personagemSalvo.periciasSubclasseBonusAtual ?? [],
  );
  const [magiasDescobertasMagicasAtuais, setMagiasDescobertasMagicasAtuais] = useState<string[]>(
    personagemSalvo.magiasDescobertasMagicasAtual ?? [],
  );
  const [livroDasSombrasAtuais, setLivroDasSombrasAtuais] = useState<string[]>(
    personagemSalvo.livroDasSombrasAtual ?? [...selecao.livroDasSombrasTruques, ...selecao.livroDasSombrasMagias],
  );
  const [talentosGeraisAtuais, setTalentosGeraisAtuais] = useState<string[]>(personagemSalvo.talentosGeraisAtual ?? []);
  const [talentosFavoritos, setTalentosFavoritos] = useState<string[]>(personagemSalvo.talentosFavoritosAtual ?? []);
  const [folegoGasto, setFolegoGasto] = useState(personagemSalvo.folegoGasto ?? 0);
  const [indomavelGasto, setIndomavelGasto] = useState(personagemSalvo.indomavelGasto ?? 0);
  const [surtoGasto, setSurtoGasto] = useState(personagemSalvo.surtoGasto ?? 0);
  const [inspiracaoGasto, setInspiracaoGasto] = useState(personagemSalvo.inspiracaoGasto ?? 0);
  const [surtoUsadoTurno, setSurtoUsadoTurno] = useState(false);
  const [restStatus, setRestStatus] = useState<string | null>(null);
  const [turnState, setTurnState] = useState<Record<RecursoTurno, EstadoRecurso>>(turnoInicial);
  const [espacosGastosPorCirculo, setEspacosGastosPorCirculo] = useState<Record<number, number>>(() => {
    if (personagemSalvo.espacosGastosPorCirculo) return personagemSalvo.espacosGastosPorCirculo;
    // Migração de personagem salvo antes da Etapa 4.2 (só existia 1
    // círculo simultâneo possível) — o valor antigo vira o gasto do
    // círculo que já estava ativo na época.
    if (personagemSalvo.espacosGastos) {
      const circuloAntigo = espacosDeMagiaAtivos(classeDaSelecao(selecao), personagemSalvo.nivel)[0]?.circulo;
      if (circuloAntigo !== undefined) return { [circuloAntigo]: personagemSalvo.espacosGastos };
    }
    return {};
  });
  const [itensMochila, setItensMochila] = useState<ItemMochila[]>(
    personagemSalvo.itensMochilaAtual ?? calcularItensIniciais(selecao),
  );
  const [levelUpAberto, setLevelUpAberto] = useState(false);
  const [completarAberto, setCompletarAberto] = useState<'truques' | 'magiasPreparadas' | null>(null);
  const [livroDasSombrasAberto, setLivroDasSombrasAberto] = useState(false);
  const [levelUpHpModo, setLevelUpHpModo] = useState<'media' | 'rolar' | null>(personagemSalvo.levelUpHpModo ?? null);
  const [levelUpHpRolado, setLevelUpHpRolado] = useState<number | null>(personagemSalvo.levelUpHpRolado ?? null);
  const [itensDetalhados, setItensDetalhados] = useColapsavel('itens-detalhados', false);
  const [pesoAtivo, setPesoAtivo] = useState(true);
  const touchX = useRef(0);

  const desValor = valorFinalAtributo(selecao, 'DES') ?? 10;
  // Talentos que entram no cálculo (Fase 4): os escolhidos em Level
  // Up (`talentosGeraisAtuais`) MAIS o Talento de Origem, ganho fixo
  // na criação (ex: Alerta) — nunca passa pelo picker de Level Up,
  // então não vive em `talentosGeraisAtuais`.
  const origemPersonagem = origens.find((o) => o.nome === selecao.origem) ?? null;
  const talentosEfetivos = origemPersonagem
    ? [...talentosGeraisAtuais, origemPersonagem.talentoOrigemId]
    : talentosGeraisAtuais;
  const ca = calcularCAEquipado(itensMochila, desValor, personagem.estiloDeLuta, talentosEfetivos);
  const iniciativa = calcularIniciativa(selecao, classe, personagem.nivel, talentosEfetivos);
  const percepcaoPassiva = calcularPercepcaoPassiva(selecao, personagem.nivel);
  const atributos = calcularAtributosFinais(selecao);
  const atributosFinaisAtuais = Object.fromEntries(
    atributosOrdem.map((a) => [a, valorFinalAtributo(selecao, a) ?? 10]),
  ) as Record<Atributo, number>;
  const pericias = calcularPericias(selecao, personagem.nivel, periciasEspecialistaAtuais, periciasSubclasseBonusAtuais);
  const proficienciasFerramenta = calcularProficienciasFerramenta(selecao, personagem.nivel);
  const bonusProficienciaAtual = classe ? bonusProficiencia(classe, personagem.nivel) : 0;
  const capacidadeMaxima = calcularCapacidadeMaxima(selecao);
  const explicacaoCapacidadeMaxima = explicarCapacidadeMaxima(selecao);
  const explicacaoPv = explicarPvMaximo(selecao, personagem.pvMax);
  const explicacaoCa = explicarCAEquipado(itensMochila, desValor, personagem.estiloDeLuta, talentosEfetivos);
  const explicacaoIniciativa = explicarIniciativa(selecao, classe, personagem.nivel, talentosEfetivos);
  const explicacaoPercepcaoPassiva = explicarPercepcaoPassiva(selecao, personagem.nivel);
  const estiloDeLuta = estilosDeLuta.find((e) => e.nome === personagem.estiloDeLuta) ?? null;
  const usosFolegoMaximo = classe ? quantidadeRecuperarFolego(classe, personagem.nivel) : 0;
  const usosFolegoRestantes = Math.max(0, usosFolegoMaximo - folegoGasto);
  const conjura = personagemConjura(classe);
  const espacos = espacosDeMagiaAtivos(classe, personagem.nivel);
  const truques = truquesDoPersonagem(truquesAtuais);
  const magiasPreparadas = magiasPreparadasDoPersonagem(magiasPreparadasAtuais);
  const magiasDescobertasMagicas = magiasPreparadasDoPersonagem(magiasDescobertasMagicasAtuais);
  const livroDasSombras = magiasPreparadasDoPersonagem(livroDasSombrasAtuais);
  const faltamTruques = deficitTruques(classe, personagem.nivel, truquesAtuais);
  const faltamMagiasPreparadas = deficitMagiasPreparadas(classe, personagem.nivel, magiasPreparadasAtuais);
  // Descobertas Mágicas/Livro das Sombras contam como magia sempre
  // preparada (fora do limite normal) — entram no que dá pra conjurar
  // em combate, mas são arrays PRÓPRIOS separados, só unidos aqui pra
  // montar a lista de "o que aparece nos painéis de Ação/Reação".
  const magiasConjuraveis = [...magiasPreparadas, ...magiasDescobertasMagicas, ...livroDasSombras];
  const magiasPreparadasReacao = magiasConjuraveis.filter(ehMagiaDeReacao);
  const magiasPreparadasAcao = magiasConjuraveis.filter((m) => !ehMagiaDeReacao(m));
  const modAcertoConjuracao = calcularModAcertoConjuracao(selecao, classe, personagem.nivel);
  const usosInspiracaoMax = usosInspiracaoMaximo(selecao, classe, personagem.nivel);
  const usosInspiracaoRestantes = Math.max(0, usosInspiracaoMax - inspiracaoGasto);
  const tamanhoDadoInspiracao = dadoInspiracao(classe, personagem.nivel);
  const fonteDeInspiracao = fonteDeInspiracaoDesbloqueada(classe, personagem.nivel);
  const numAtaques = classe ? numeroDeAtaques(classe, personagem.nivel) : 1;
  const indomavelMaximo = classe ? contarRepeticoesCaracteristica(classe, 'Indomável', personagem.nivel) : 0;
  const indomavelRestantes = Math.max(0, indomavelMaximo - indomavelGasto);
  const surtoMaximo = classe ? contarRepeticoesCaracteristica(classe, 'Surto de Ação', personagem.nivel) : 0;
  const surtoRestantes = Math.max(0, surtoMaximo - surtoGasto);
  const mestreTatico = classe ? caracteristicaDesbloqueada(classe, 'Mestre Tático', personagem.nivel) : null;
  const ataquesEstudados = classe ? caracteristicaDesbloqueada(classe, 'Ataques Estudados', personagem.nivel) : null;
  const ajusteTatico = classe ? caracteristicaDesbloqueada(classe, 'Ajuste Tático', personagem.nivel) : null;
  const contraEncantamentoDisponivel = classe ? caracteristicaDesbloqueada(classe, 'Contra-Encantamento', personagem.nivel) !== null : false;
  const inspiracaoSuperiorDesbloqueada = classe ? caracteristicaDesbloqueada(classe, 'Inspiração Superior', personagem.nivel) !== null : false;
  const palavrasDeInterrupcaoDisponivel = caracteristicaSubclasseDesbloqueada(personagem.subclasse, 'Palavras de Interrupção', personagem.nivel);
  const periciaInigualavelDisponivel = caracteristicaSubclasseDesbloqueada(personagem.subclasse, 'Perícia Inigualável', personagem.nivel);
  const forMod = atributos.find((a) => a.atributo === 'FOR')?.mod ?? 0;
  const desMod = atributos.find((a) => a.atributo === 'DES')?.mod ?? 0;
  const equipadoAtual = resumoEquipado(itensMochila);
  const armaEquipada = equipadoAtual.maoPrincipal;
  const ataque = classe
    ? ataqueAtual(
        armaEquipada?.nome ?? null,
        classe,
        personagem.nivel,
        forMod,
        desMod,
        armaEquipada?.duasMaosAtivo === true,
        personagem.estiloDeLuta,
        equipadoAtual.maoSecundaria !== null,
      )
    : null;
  const ataqueBonus = classe
    ? ataqueBonusMaoSecundaria(
        armaEquipada?.nome ?? null,
        equipadoAtual.maoSecundaria?.nome ?? null,
        classe,
        personagem.nivel,
        forMod,
        desMod,
        personagem.estiloDeLuta,
      )
    : null;

  // Salva progresso automaticamente a cada mudança relevante — Level
  // Up, Descanso, troca de arma de Maestria, uso de Recuperar
  // Fôlego/Indomável/Surto de Ação. Sem isso, um F5 na Ficha depois de
  // subir de nível voltava tudo pro estado da criação (só nivel/xp/
  // pvAtual eram salvos, o resto só existia em estado do React). Não
  // inclui turnState/surtoUsadoTurno de propósito — são "estado do
  // turno atual", esperado resetar como qualquer app de mesa.
  useEffect(() => {
    armazenamentoPersonagens.salvar({
      ...personagemSalvo,
      selecao,
      nivel: personagem.nivel,
      pvAtual,
      pvMax: personagem.pvMax,
      subclasseAtual: personagem.subclasse,
      estiloDeLutaAtual: personagem.estiloDeLuta,
      maestriaArmaAtual: maestriaArma,
      folegoGasto,
      indomavelGasto,
      surtoGasto,
      espacosGastosPorCirculo,
      inspiracaoGasto,
      truquesAtual: truquesAtuais,
      magiasPreparadasAtual: magiasPreparadasAtuais,
      invocacoesMisticasAtual: invocacoesMisticasAtuais,
      periciasEspecialistaAtual: periciasEspecialistaAtuais,
      periciasSubclasseBonusAtual: periciasSubclasseBonusAtuais,
      magiasDescobertasMagicasAtual: magiasDescobertasMagicasAtuais,
      livroDasSombrasAtual: livroDasSombrasAtuais,
      talentosGeraisAtual: talentosGeraisAtuais,
      talentosFavoritosAtual: talentosFavoritos,
      itensMochilaAtual: itensMochila,
      levelUpHpModo,
      levelUpHpRolado,
    });
  }, [
    personagemSalvo,
    selecao,
    personagem.nivel,
    personagem.pvMax,
    personagem.subclasse,
    personagem.estiloDeLuta,
    pvAtual,
    maestriaArma,
    folegoGasto,
    indomavelGasto,
    surtoGasto,
    espacosGastosPorCirculo,
    inspiracaoGasto,
    truquesAtuais,
    magiasPreparadasAtuais,
    invocacoesMisticasAtuais,
    periciasEspecialistaAtuais,
    periciasSubclasseBonusAtuais,
    magiasDescobertasMagicasAtuais,
    livroDasSombrasAtuais,
    talentosGeraisAtuais,
    talentosFavoritos,
    itensMochila,
    levelUpHpModo,
    levelUpHpRolado,
  ]);

  function toggleFavoritoTalento(id: string) {
    setTalentosFavoritos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function alterarPv(delta: number) {
    setPvAtual((v) => Math.max(0, Math.min(personagem.pvMax, v + delta)));
  }

  function marcarUsado(categoria: RecursoTurno) {
    setTurnState((prev) => ({ ...prev, [categoria]: 'usada' }));
  }

  function fimDoTurno() {
    setTurnState(turnoInicial);
    setSurtoUsadoTurno(false);
  }

  function gastarSlotCirculo(circulo: number): boolean {
    const def = espacos.find((e) => e.circulo === circulo);
    const gasto = espacosGastosPorCirculo[circulo] ?? 0;
    if (!def || gasto >= def.maximo) return false;
    setEspacosGastosPorCirculo((prev) => ({ ...prev, [circulo]: (prev[circulo] ?? 0) + 1 }));
    return true;
  }

  /** Pra ações que gastam "1 Espaço de Magia" sem se importar de qual
   * círculo (ex: Fonte de Inspiração) — usa o de menor círculo com
   * espaço sobrando. */
  function gastarQualquerSlot(): boolean {
    for (const e of espacos) {
      const gasto = espacosGastosPorCirculo[e.circulo] ?? 0;
      if (gasto < e.maximo) return gastarSlotCirculo(e.circulo);
    }
    return false;
  }

  function usarInspiracao(): boolean {
    if (usosInspiracaoRestantes <= 0) return false;
    setInspiracaoGasto((v) => v + 1);
    return true;
  }

  function recuperarInspiracaoComEspaco(): boolean {
    if (inspiracaoGasto <= 0) return false;
    if (!gastarQualquerSlot()) return false;
    setInspiracaoGasto((v) => Math.max(0, v - 1));
    return true;
  }

  /** "Perícia Inigualável" (Colégio do Conhecimento, nv14): devolve 1
   * uso de Inspiração de Bardo SEM gastar Espaço de Magia — reembolso
   * condicional de quando o teste/ataque continua falhando mesmo
   * depois de somar o dado (regra pede rolar antes de saber se vai
   * gastar de verdade, por isso o gasto é otimista e essa função só
   * desfaz se o jogador confirmar que ainda falhou). */
  function devolverUsoInspiracao() {
    setInspiracaoGasto((v) => Math.max(0, v - 1));
  }

  /** "Inspiração Superior" (nv18): ao rolar Iniciativa, recupera usos
   * gastos de Inspiração de Bardo até ter 2, se tiver menos que isso —
   * nunca reduz usos já disponíveis, nunca passa do máximo da classe. */
  function recuperarInspiracaoAoRolarIniciativa() {
    if (!inspiracaoSuperiorDesbloqueada) return;
    setInspiracaoGasto((atual) => {
      const restantesAlvo = Math.min(usosInspiracaoMax, 2);
      const restantesAtual = Math.max(0, usosInspiracaoMax - atual);
      if (restantesAtual >= restantesAlvo) return atual;
      return usosInspiracaoMax - restantesAlvo;
    });
  }

  function descansoLongo() {
    setPvAtual(personagem.pvMax);
    setEspacosGastosPorCirculo({});
    setFolegoGasto(0);
    setIndomavelGasto(0);
    setSurtoGasto(0);
    setInspiracaoGasto(0);
    fimDoTurno();
    setRestStatus(`Descanso Longo: PV restaurado para ${personagem.pvMax}/${personagem.pvMax}, Espaços de Magia, Recuperar Fôlego, Indomável, Surto de Ação e Inspiração de Bardo recuperados.`);
  }

  function descansoCurto() {
    const circulosQueRecuperam = espacos.filter((e) => e.recuperaNoDescansoCurto).map((e) => e.circulo);
    if (circulosQueRecuperam.length > 0) {
      setEspacosGastosPorCirculo((prev) => {
        const proximo = { ...prev };
        for (const c of circulosQueRecuperam) proximo[c] = 0;
        return proximo;
      });
    }
    if (fonteDeInspiracao) setInspiracaoGasto(0);
    setFolegoGasto((v) => Math.max(0, v - 1));
    setRestStatus(
      `Descanso Curto: ${circulosQueRecuperam.length > 0 ? 'Espaços de Magia recuperados, ' : ''}${fonteDeInspiracao ? 'Inspiração de Bardo recuperada, ' : ''}1 uso de Recuperar Fôlego devolvido. PV não recupera automaticamente por descanso curto.`,
    );
  }

  function trocarArmaMaestria(armaAntiga: string, armaNova: string) {
    setMaestriaArma((prev) => prev.map((a) => (a === armaAntiga ? armaNova : a)));
  }

  function alterarQuantidadeItem(id: string, delta: number) {
    setItensMochila((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantidade: Math.max(0, it.quantidade + delta) } : it)),
    );
  }

  function removerItemMochila(id: string) {
    setItensMochila((prev) => prev.filter((it) => it.id !== id));
  }

  function adicionarItemMochila(nome: string, quantidade: number) {
    setItensMochila((prev) => [...prev, criarItemManual(nome, quantidade)]);
  }

  function equiparItem(id: string, slot: SlotEquipamento) {
    setItensMochila((prev) => equiparNoSlot(prev, id, slot));
  }

  function desequiparItem(id: string) {
    setItensMochila((prev) => desequiparItemPuro(prev, id));
  }

  function alternarDuasMaos(id: string) {
    setItensMochila((prev) => alternarDuasMaosVersatil(prev, id));
  }

  function alternarSintonizacaoItem(id: string) {
    setItensMochila((prev) => alternarSintonizacao(prev, id));
  }

  function usarUsoFolego(): boolean {
    if (usosFolegoRestantes <= 0) return false;
    setFolegoGasto((v) => v + 1);
    return true;
  }

  function usarIndomavel(): boolean {
    if (indomavelRestantes <= 0) return false;
    setIndomavelGasto((v) => v + 1);
    return true;
  }

  function usarSurto(): boolean {
    if (surtoRestantes <= 0 || surtoUsadoTurno) return false;
    setSurtoGasto((v) => v + 1);
    setSurtoUsadoTurno(true);
    return true;
  }

  function confirmarLevelUp(resultado: {
    novoNivel: number;
    pvGanho: number;
    subclasseEscolhida: string | null;
    estiloDeLutaEscolhido: string | null;
    truquesEscolhidos: string[] | null;
    magiasPreparadasEscolhidas: string[] | null;
    invocacoesMisticasEscolhidas: string[] | null;
    periciasEspecialistaEscolhidas: string[] | null;
    periciasSubclasseBonusEscolhidas: string[] | null;
    magiasDescobertasMagicasEscolhidas: string[] | null;
    atributosAumentados: Atributo[] | null;
    talentoGeralEscolhido: string | null;
  }) {
    const novosAtributos = resultado.atributosAumentados
      ? aumentarAtributos(selecao.atributos, resultado.atributosAumentados)
      : null;
    if (novosAtributos) setSelecao((prev) => ({ ...prev, atributos: novosAtributos }));
    const novoConValor = novosAtributos?.CON;
    setPersonagem((prev) => ({
      ...prev,
      nivel: resultado.novoNivel,
      pvMax: prev.pvMax + resultado.pvGanho,
      subclasse: resultado.subclasseEscolhida ?? prev.subclasse,
      estiloDeLuta: resultado.estiloDeLutaEscolhido ?? prev.estiloDeLuta,
      conMod: novoConValor !== null && novoConValor !== undefined ? modificador(novoConValor) : prev.conMod,
    }));
    setPvAtual((v) => v + resultado.pvGanho);
    if (resultado.truquesEscolhidos) setTruquesAtuais(resultado.truquesEscolhidos);
    if (resultado.magiasPreparadasEscolhidas) setMagiasPreparadasAtuais(resultado.magiasPreparadasEscolhidas);
    if (resultado.invocacoesMisticasEscolhidas) setInvocacoesMisticasAtuais(resultado.invocacoesMisticasEscolhidas);
    if (resultado.periciasEspecialistaEscolhidas) setPericiasEspecialistaAtuais(resultado.periciasEspecialistaEscolhidas);
    if (resultado.periciasSubclasseBonusEscolhidas) setPericiasSubclasseBonusAtuais(resultado.periciasSubclasseBonusEscolhidas);
    if (resultado.magiasDescobertasMagicasEscolhidas) setMagiasDescobertasMagicasAtuais(resultado.magiasDescobertasMagicasEscolhidas);
    if (resultado.talentoGeralEscolhido) {
      setTalentosGeraisAtuais((prev) => [...prev, resultado.talentoGeralEscolhido!]);
      // Já foi escolhido de verdade — não faz mais sentido continuar
      // "planejado" na seção de Favoritos.
      setTalentosFavoritos((prev) => prev.filter((id) => id !== resultado.talentoGeralEscolhido));
    }
    setLevelUpHpModo(null);
    setLevelUpHpRolado(null);
    setLevelUpAberto(false);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchX.current;
    const idx = ORDEM_ABAS.indexOf(tab);
    if (dx < -50 && idx < ORDEM_ABAS.length - 1) setTab(ORDEM_ABAS[idx + 1]);
    if (dx > 50 && idx > 0) setTab(ORDEM_ABAS[idx - 1]);
  }

  if (levelUpAberto && classe) {
    return (
      <LevelUpShell
        personagem={personagem}
        classe={classe}
        onFechar={() => setLevelUpAberto(false)}
        onConfirmar={confirmarLevelUp}
        hpModo={levelUpHpModo}
        onHpModoChange={setLevelUpHpModo}
        hpRolado={levelUpHpRolado}
        onHpRoladoChange={setLevelUpHpRolado}
        truquesAtuais={truquesAtuais}
        truquesDaClasse={magiasDaClasse(classe.nome, 0)}
        magiasPreparadasAtuais={magiasPreparadasAtuais}
        magiasDaClasseDisponiveis={magiasDisponiveisParaPreparar(classe, personagem.nivel + 1)}
        invocacoesMisticasAtuais={invocacoesMisticasAtuais}
        periciasEspecialistaAtuais={periciasEspecialistaAtuais}
        periciasProficientesDoPersonagem={[...periciasProficientes(selecao), ...periciasSubclasseBonusAtuais]}
        periciasSubclasseBonusAtuais={periciasSubclasseBonusAtuais}
        magiasDescobertasMagicasAtuais={magiasDescobertasMagicasAtuais}
        poolDescobertasMagicas={poolDescobertasMagicas(9)}
        atributosAtuais={selecao.atributos}
        atributosFinaisAtuais={atributosFinaisAtuais}
        talentosGeraisAtuais={talentosGeraisAtuais}
        talentosFavoritosAtuais={talentosFavoritos}
        onToggleFavoritoTalento={toggleFavoritoTalento}
      />
    );
  }

  if (completarAberto === 'truques' && classe) {
    return (
      <CompletarMagiasShell
        titulo="Truques"
        atuais={truquesAtuais}
        catalogo={magiasDaClasse(classe.nome, 0)}
        deficit={faltamTruques}
        onFechar={() => setCompletarAberto(null)}
        onConfirmar={(novaLista) => {
          setTruquesAtuais(novaLista);
          setCompletarAberto(null);
        }}
      />
    );
  }

  if (completarAberto === 'magiasPreparadas' && classe) {
    const circuloMaximo = Math.max(0, ...espacosDeMagiaAtivos(classe, personagem.nivel).map((e) => e.circulo));
    return (
      <CompletarMagiasShell
        titulo="Magias Preparadas"
        atuais={magiasPreparadasAtuais}
        catalogo={magiasDisponiveisParaPreparar(classe, personagem.nivel).filter((m) => m.circulo <= circuloMaximo)}
        classeNome={classe.nome}
        deficit={faltamMagiasPreparadas}
        onFechar={() => setCompletarAberto(null)}
        onConfirmar={(novaLista) => {
          setMagiasPreparadasAtuais(novaLista);
          setCompletarAberto(null);
        }}
      />
    );
  }

  if (livroDasSombrasAberto) {
    return (
      <LivroDasSombrasShell
        atuais={livroDasSombrasAtuais}
        truquesConhecidos={truquesAtuais}
        magiasPreparadasConhecidas={magiasPreparadasAtuais}
        onFechar={() => setLivroDasSombrasAberto(false)}
        onConfirmar={(novaLista) => {
          setLivroDasSombrasAtuais(novaLista);
          setLivroDasSombrasAberto(false);
        }}
      />
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <span className="back" onClick={() => navigate('/lista')}>
          ←
        </span>
        <div>
          <div className={styles.name}>{selecao.nome || '(sem nome)'}</div>
          <div className={styles.meta}>
            {selecao.especie ?? '—'} {selecao.classe ?? '—'}
            {personagem.subclasse ? ` (${personagem.subclasse})` : ''} · Nível {personagem.nivel} · CA{' '}
            {ca ?? '—'}
          </div>
        </div>
        <AvatarMenu
          itensDetalhados={itensDetalhados}
          onToggleItensDetalhados={() => setItensDetalhados(!itensDetalhados)}
          pesoAtivo={pesoAtivo}
          onTogglePeso={() => setPesoAtivo((v) => !v)}
        />
      </div>

      <div className={styles.tabContent} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {tab === 'atributos' && (
          <AtributosTab
            nivel={personagem.nivel}
            pvMax={personagem.pvMax}
            pvAtual={pvAtual}
            ca={ca}
            iniciativa={iniciativa}
            percepcaoPassiva={percepcaoPassiva}
            bonusProficiencia={bonusProficienciaAtual}
            explicacaoPv={explicacaoPv}
            explicacaoCa={explicacaoCa}
            explicacaoIniciativa={explicacaoIniciativa}
            explicacaoPercepcaoPassiva={explicacaoPercepcaoPassiva}
            atributos={atributos}
            pericias={pericias}
            proficienciasFerramenta={proficienciasFerramenta}
            onDescansoLongo={descansoLongo}
            onDescansoCurto={descansoCurto}
            restStatus={restStatus}
            onAbrirLevelUp={() => setLevelUpAberto(true)}
            maestriaArma={maestriaArma}
            armasParaMaestria={classe ? listarArmasParaMaestria(classe) : []}
            onTrocarArmaMaestria={trocarArmaMaestria}
            onRolarIniciativa={inspiracaoSuperiorDesbloqueada ? recuperarInspiracaoAoRolarIniciativa : undefined}
          />
        )}
        {tab === 'perfil' && (
          <PerfilTab
            selecao={selecao}
            classe={classe}
            nivel={personagem.nivel}
            subclasse={personagem.subclasse}
            talentosGeraisAtuais={talentosGeraisAtuais}
            invocacoesMisticasAtuais={invocacoesMisticasAtuais}
          />
        )}
        {tab === 'mochila' && (
          <MochilaTab
            itens={itensMochila}
            itensDetalhados={itensDetalhados}
            pesoAtivo={pesoAtivo}
            capacidadeMaxima={capacidadeMaxima}
            explicacaoCapacidadeMaxima={explicacaoCapacidadeMaxima}
            onAlterarQuantidade={alterarQuantidadeItem}
            onRemoverItem={removerItemMochila}
            onAdicionarItem={adicionarItemMochila}
            onEquipar={equiparItem}
            onDesequipar={desequiparItem}
            onAlternarDuasMaos={alternarDuasMaos}
            onAlternarSintonizacao={alternarSintonizacaoItem}
          />
        )}
        {tab === 'magias' && (
          <MagiasTab
            classe={classe}
            nivel={personagem.nivel}
            espacosGastosPorCirculo={espacosGastosPorCirculo}
            onGastarSlotCirculo={gastarSlotCirculo}
            modAcertoConjuracao={modAcertoConjuracao}
            conjura={conjura}
            truquesAtuais={truquesAtuais}
            magiasPreparadasAtuais={magiasPreparadasAtuais}
            magiasDescobertasMagicasAtuais={magiasDescobertasMagicasAtuais}
            livroDasSombrasAtuais={livroDasSombrasAtuais}
            temPactoDoTomo={invocacoesMisticasAtuais.includes('pacto-do-tomo')}
            onReconjurarLivro={() => setLivroDasSombrasAberto(true)}
            faltamTruques={faltamTruques}
            faltamMagiasPreparadas={faltamMagiasPreparadas}
            onCompletarTruques={() => setCompletarAberto('truques')}
            onCompletarMagiasPreparadas={() => setCompletarAberto('magiasPreparadas')}
          />
        )}
        {tab === 'combat' && (
          <CombatTab
            pvAtual={pvAtual}
            pvMax={personagem.pvMax}
            onAlterarPv={alterarPv}
            turnState={turnState}
            onMarcarUsado={marcarUsado}
            onFimDoTurno={fimDoTurno}
            espacos={espacos}
            espacosGastosPorCirculo={espacosGastosPorCirculo}
            onGastarSlotCirculo={gastarSlotCirculo}
            estiloDeLuta={estiloDeLuta}
            nivel={personagem.nivel}
            usosFolegoMaximo={usosFolegoMaximo}
            usosFolegoRestantes={usosFolegoRestantes}
            onUsarUsoFolego={usarUsoFolego}
            conjura={conjura}
            truques={truques}
            magiasPreparadasAcao={magiasPreparadasAcao}
            magiasPreparadasReacao={magiasPreparadasReacao}
            modAcertoConjuracao={modAcertoConjuracao}
            numAtaques={numAtaques}
            indomavelMaximo={indomavelMaximo}
            indomavelRestantes={indomavelRestantes}
            onUsarIndomavel={usarIndomavel}
            surtoMaximo={surtoMaximo}
            surtoRestantes={surtoRestantes}
            surtoUsadoTurno={surtoUsadoTurno}
            onUsarSurto={usarSurto}
            mestreTatico={mestreTatico}
            ataquesEstudados={ataquesEstudados}
            ajusteTatico={ajusteTatico}
            ataqueAtual={ataque}
            ataqueBonus={ataqueBonus}
            usosInspiracaoMaximo={usosInspiracaoMax}
            usosInspiracaoRestantes={usosInspiracaoRestantes}
            tamanhoDadoInspiracao={tamanhoDadoInspiracao}
            fonteDeInspiracao={fonteDeInspiracao}
            onUsarInspiracao={usarInspiracao}
            onRecuperarInspiracaoComEspaco={recuperarInspiracaoComEspaco}
            contraEncantamentoDisponivel={contraEncantamentoDisponivel}
            palavrasDeInterrupcaoDisponivel={palavrasDeInterrupcaoDisponivel}
            periciaInigualavelDisponivel={periciaInigualavelDisponivel}
            onDevolverUsoInspiracao={devolverUsoInspiracao}
            iniciativaMod={iniciativa}
            onRolarIniciativa={inspiracaoSuperiorDesbloqueada ? recuperarInspiracaoAoRolarIniciativa : undefined}
          />
        )}
      </div>

      <div className={styles.tabbarLayer}>
        <div className={styles.tabbar}>
          {TABS.map((t) => (
            <div
              key={t.id}
              className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className={styles.tabIcon}>{t.icon}</span>
              {t.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
