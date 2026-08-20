import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { personagemExemplo } from '../../data/exampleSheet';
import { espacosMagiaExemplo } from '../../data/exampleCombat';
import styles from './FichaShell.module.css';
import PerfilTab from './tabs/PerfilTab';
import MochilaTab from './tabs/MochilaTab';
import MagiasTab from './tabs/MagiasTab';
import CombatTab, { type EstadoRecurso, type RecursoTurno } from './tabs/CombatTab';

type TabName = 'perfil' | 'mochila' | 'magias' | 'combat';

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
  const [tab, setTab] = useState<TabName>('perfil');
  const [pvAtual, setPvAtual] = useState(personagemExemplo.pvMax);
  const [xpBloqueado, setXpBloqueado] = useState(false);
  const [restStatus, setRestStatus] = useState<string | null>(null);
  const [turnState, setTurnState] = useState<Record<RecursoTurno, EstadoRecurso>>(turnoInicial);
  const [espacosGastos, setEspacosGastos] = useState(0);

  function alterarPv(delta: number) {
    setPvAtual((v) => Math.max(0, Math.min(personagemExemplo.pvMax, v + delta)));
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
    setPvAtual(personagemExemplo.pvMax);
    setEspacosGastos(0);
    fimDoTurno();
    setRestStatus(`Descanso Longo: PV restaurado para ${personagemExemplo.pvMax}/${personagemExemplo.pvMax} e Espaços de Magia recuperados.`);
  }

  function descansoCurto() {
    setEspacosGastos(0);
    setRestStatus('Descanso Curto: Espaços de Magia (Magia de Pacto) recuperados. PV não recupera automaticamente por descanso curto.');
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <span className="back" onClick={() => navigate('/lista')}>
          ←
        </span>
        <div>
          <div className={styles.name}>{personagemExemplo.nome}</div>
          <div className={styles.meta}>
            {personagemExemplo.especie} {personagemExemplo.classe} · Nível {personagemExemplo.nivel} · CA{' '}
            {personagemExemplo.ca}
          </div>
        </div>
      </div>

      <div className={`${styles.editBanner} ${xpBloqueado ? styles.editBannerLocked : ''}`}>
        <span>
          {xpBloqueado
            ? '🔒 Ficha com XP — edição de valores base travada (level-up ainda libera mudanças)'
            : '✏️ Edição livre — sem XP registrado ainda'}
        </span>
        <span className={styles.editToggle} onClick={() => setXpBloqueado((v) => !v)}>
          simular +XP
        </span>
      </div>

      <div className={styles.tabContent}>
        {tab === 'perfil' && (
          <PerfilTab
            pvAtual={pvAtual}
            xpBloqueado={xpBloqueado}
            onDescansoLongo={descansoLongo}
            onDescansoCurto={descansoCurto}
            restStatus={restStatus}
          />
        )}
        {tab === 'mochila' && <MochilaTab />}
        {tab === 'magias' && <MagiasTab espacosGastos={espacosGastos} />}
        {tab === 'combat' && (
          <CombatTab
            pvAtual={pvAtual}
            onAlterarPv={alterarPv}
            turnState={turnState}
            onMarcarUsado={marcarUsado}
            onFimDoTurno={fimDoTurno}
            espacosGastos={espacosGastos}
            onGastarSlot={gastarSlot}
          />
        )}
      </div>

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
  );
}
