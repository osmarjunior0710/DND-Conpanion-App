import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { personagemExemplo } from '../../data/exampleSheet';
import styles from './FichaShell.module.css';
import PerfilTab from './tabs/PerfilTab';
import MochilaTab from './tabs/MochilaTab';

type TabName = 'perfil' | 'mochila' | 'magias' | 'combat';

const TABS: { id: TabName; label: string; icon: string }[] = [
  { id: 'perfil', label: 'Perfil', icon: '🧬' },
  { id: 'mochila', label: 'Mochila', icon: '🎒' },
  { id: 'magias', label: 'Magias', icon: '📖' },
  { id: 'combat', label: 'Combat', icon: '⚔' },
];

export default function FichaShell() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabName>('perfil');
  const [pvAtual, setPvAtual] = useState(personagemExemplo.pvMax);
  const [xpBloqueado, setXpBloqueado] = useState(false);
  const [restStatus, setRestStatus] = useState<string | null>(null);

  function descansoLongo() {
    setPvAtual(personagemExemplo.pvMax);
    setRestStatus(`Descanso Longo: PV restaurado para ${personagemExemplo.pvMax}/${personagemExemplo.pvMax}.`);
  }

  function descansoCurto() {
    setRestStatus(
      'Descanso Curto: nada pra recuperar ainda nesta ficha de exemplo — Espaços de Magia chegam na aba Magias (entrega 0.6).',
    );
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
        {tab === 'magias' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-faint)', fontSize: 12 }}>
            Aba Magias (espaços de magia, truques) chega na entrega 0.6.
          </div>
        )}
        {tab === 'combat' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-faint)', fontSize: 12 }}>
            Aba Combat (Layout C — Ação/Ação Bônus/Reação) chega na entrega 0.6.
          </div>
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
