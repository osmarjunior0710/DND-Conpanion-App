import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { espacosMagiaExemplo } from '../../data/exampleCombat';
import { armazenamentoPersonagens, type PersonagemSalvo } from '../../core/armazenamentoPersonagens';
import {
  calcularAtributosFinais,
  calcularCA,
  calcularIniciativa,
  calcularPercepcaoPassiva,
  calcularPericias,
  calcularPvMaximoNivel1,
  classeDaSelecao,
  explicarCA,
  explicarIniciativa,
  explicarPercepcaoPassiva,
  explicarPvMaximoNivel1,
} from '../../core/calculoPersonagem';
import { modificador } from '../../core/personagem';
import { calcularCapacidadeMaxima, calcularItensIniciais, explicarCapacidadeMaxima } from '../../core/mochila';
import { armasParaMaestria as listarArmasParaMaestria } from '../../core/maestriaArma';
import { quantidadeRecuperarFolego } from '../../core/recursosClasse';
import { estilosDeLuta } from '../../data/rulesets/dnd2024/estilosDeLuta';
import AvatarMenu from './AvatarMenu';
import styles from './FichaShell.module.css';
import PerfilTab from './tabs/PerfilTab';
import MochilaTab from './tabs/MochilaTab';
import MagiasTab from './tabs/MagiasTab';
import CombatTab, { type EstadoRecurso, type RecursoTurno } from './tabs/CombatTab';
import LevelUpShell, { type PersonagemNivel } from './levelup/LevelUpShell';

type TabName = 'perfil' | 'mochila' | 'magias' | 'combat';

const ORDEM_ABAS: TabName[] = ['perfil', 'mochila', 'magias', 'combat'];

const TABS: { id: TabName; label: string; icon: string }[] = [
  { id: 'perfil', label: 'Perfil', icon: '🧬' },
  { id: 'mochila', label: 'Mochila', icon: '🎒' },
  { id: 'magias', label: 'Magias', icon: '📖' },
  { id: 'combat', label: 'Combat', icon: '⚔' },
];

const turnoInicial: Record<RecursoTurno, EstadoRecurso> = {
  acao: 'disponivel',
  bonus: 'disponivel',
  reacao: 'disponivel',
};

export default function FichaShell() {
  const navigate = useNavigate();
  const { id } = useParams();
  const personagemSalvo = id ? armazenamentoPersonagens.buscar(id) : null;

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
  const selecao = personagemSalvo.selecao;
  const classe = classeDaSelecao(selecao);
  const conValor = selecao.atributos.CON;

  const [tab, setTab] = useState<TabName>('perfil');
  const [personagem, setPersonagem] = useState<PersonagemNivel>({
    nivel: personagemSalvo.nivel,
    pvMax: calcularPvMaximoNivel1(selecao) ?? personagemSalvo.pvAtual,
    dadoVida: classe?.dadoDeVida ?? 'd8',
    conMod: conValor !== null ? modificador(conValor) : 0,
    subclasse: null,
    estiloDeLuta: selecao.estiloDeLutaEscolhido,
  });
  const [pvAtual, setPvAtual] = useState(personagemSalvo.pvAtual);
  const [maestriaArma, setMaestriaArma] = useState<string[]>(selecao.maestriaArmaEscolhida);
  const [folegoGasto, setFolegoGasto] = useState(0);
  const [restStatus, setRestStatus] = useState<string | null>(null);
  const [turnState, setTurnState] = useState<Record<RecursoTurno, EstadoRecurso>>(turnoInicial);
  const [espacosGastos, setEspacosGastos] = useState(0);
  const [levelUpAberto, setLevelUpAberto] = useState(false);
  const [itensDetalhados, setItensDetalhados] = useState(false);
  const [pesoAtivo, setPesoAtivo] = useState(true);
  const touchX = useRef(0);

  const ca = calcularCA(selecao);
  const iniciativa = calcularIniciativa(selecao);
  const percepcaoPassiva = calcularPercepcaoPassiva(selecao, personagem.nivel);
  const atributos = calcularAtributosFinais(selecao);
  const pericias = calcularPericias(selecao, personagem.nivel);
  const itensMochila = calcularItensIniciais(selecao);
  const capacidadeMaxima = calcularCapacidadeMaxima(selecao);
  const explicacaoCapacidadeMaxima = explicarCapacidadeMaxima(selecao);
  const explicacaoPv = explicarPvMaximoNivel1(selecao);
  const explicacaoCa = explicarCA(selecao);
  const explicacaoIniciativa = explicarIniciativa(selecao);
  const explicacaoPercepcaoPassiva = explicarPercepcaoPassiva(selecao, personagem.nivel);
  const estiloDeLuta = estilosDeLuta.find((e) => e.nome === personagem.estiloDeLuta) ?? null;
  const usosFolegoMaximo = classe ? quantidadeRecuperarFolego(classe, personagem.nivel) : 0;
  const usosFolegoRestantes = Math.max(0, usosFolegoMaximo - folegoGasto);

  function alterarPv(delta: number) {
    setPvAtual((v) => Math.max(0, Math.min(personagem.pvMax, v + delta)));
  }

  function marcarUsado(categoria: RecursoTurno) {
    setTurnState((prev) => ({ ...prev, [categoria]: 'usada' }));
  }

  function fimDoTurno() {
    setTurnState(turnoInicial);
  }

  function gastarSlot(): boolean {
    if (espacosGastos >= espacosMagiaExemplo.maximo) return false;
    setEspacosGastos((v) => v + 1);
    return true;
  }

  function descansoLongo() {
    setPvAtual(personagem.pvMax);
    setEspacosGastos(0);
    setFolegoGasto(0);
    fimDoTurno();
    setRestStatus(`Descanso Longo: PV restaurado para ${personagem.pvMax}/${personagem.pvMax}, Espaços de Magia e Recuperar Fôlego recuperados.`);
  }

  function descansoCurto() {
    setEspacosGastos(0);
    setFolegoGasto((v) => Math.max(0, v - 1));
    setRestStatus('Descanso Curto: Espaços de Magia (Magia de Pacto) recuperados e 1 uso de Recuperar Fôlego devolvido. PV não recupera automaticamente por descanso curto.');
  }

  function trocarArmaMaestria(armaAntiga: string, armaNova: string) {
    setMaestriaArma((prev) => prev.map((a) => (a === armaAntiga ? armaNova : a)));
  }

  function usarUsoFolego(): boolean {
    if (usosFolegoRestantes <= 0) return false;
    setFolegoGasto((v) => v + 1);
    return true;
  }

  function confirmarLevelUp(resultado: {
    novoNivel: number;
    pvGanho: number;
    subclasseEscolhida: string | null;
    estiloDeLutaEscolhido: string | null;
  }) {
    setPersonagem((prev) => ({
      ...prev,
      nivel: resultado.novoNivel,
      pvMax: prev.pvMax + resultado.pvGanho,
      subclasse: resultado.subclasseEscolhida ?? prev.subclasse,
      estiloDeLuta: resultado.estiloDeLutaEscolhido ?? prev.estiloDeLuta,
    }));
    setPvAtual((v) => v + resultado.pvGanho);
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
          onToggleItensDetalhados={() => setItensDetalhados((v) => !v)}
          pesoAtivo={pesoAtivo}
          onTogglePeso={() => setPesoAtivo((v) => !v)}
        />
      </div>

      <div className={styles.tabContent} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {tab === 'perfil' && (
          <PerfilTab
            nivel={personagem.nivel}
            pvMax={personagem.pvMax}
            pvAtual={pvAtual}
            ca={ca}
            iniciativa={iniciativa}
            percepcaoPassiva={percepcaoPassiva}
            explicacaoPv={explicacaoPv}
            explicacaoCa={explicacaoCa}
            explicacaoIniciativa={explicacaoIniciativa}
            explicacaoPercepcaoPassiva={explicacaoPercepcaoPassiva}
            atributos={atributos}
            pericias={pericias}
            onDescansoLongo={descansoLongo}
            onDescansoCurto={descansoCurto}
            restStatus={restStatus}
            onAbrirLevelUp={() => setLevelUpAberto(true)}
            maestriaArma={maestriaArma}
            armasParaMaestria={classe ? listarArmasParaMaestria(classe) : []}
            onTrocarArmaMaestria={trocarArmaMaestria}
          />
        )}
        {tab === 'mochila' && (
          <MochilaTab
            itens={itensMochila}
            itensDetalhados={itensDetalhados}
            pesoAtivo={pesoAtivo}
            capacidadeMaxima={capacidadeMaxima}
            explicacaoCapacidadeMaxima={explicacaoCapacidadeMaxima}
          />
        )}
        {tab === 'magias' && <MagiasTab espacosGastos={espacosGastos} />}
        {tab === 'combat' && (
          <CombatTab
            pvAtual={pvAtual}
            pvMax={personagem.pvMax}
            onAlterarPv={alterarPv}
            turnState={turnState}
            onMarcarUsado={marcarUsado}
            onFimDoTurno={fimDoTurno}
            espacosGastos={espacosGastos}
            onGastarSlot={gastarSlot}
            estiloDeLuta={estiloDeLuta}
            nivel={personagem.nivel}
            usosFolegoMaximo={usosFolegoMaximo}
            usosFolegoRestantes={usosFolegoRestantes}
            onUsarUsoFolego={usarUsoFolego}
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
