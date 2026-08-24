import type { AtributoFinal, PericiaFinal } from '../../../core/calculoPersonagem';
import { useRoll } from '../../roll/RollContext';
import styles from './PerfilTab.module.css';

interface PerfilTabProps {
  nivel: number;
  pvMax: number;
  pvAtual: number;
  ca: number | null;
  iniciativa: number | null;
  percepcaoPassiva: number | null;
  atributos: AtributoFinal[];
  pericias: PericiaFinal[];
  xpBloqueado: boolean;
  onDescansoLongo: () => void;
  onDescansoCurto: () => void;
  restStatus: string | null;
  onAbrirLevelUp: () => void;
}

export default function PerfilTab({
  nivel,
  pvMax,
  pvAtual,
  ca,
  iniciativa,
  percepcaoPassiva,
  atributos,
  pericias,
  xpBloqueado,
  onDescansoLongo,
  onDescansoCurto,
  restStatus,
  onAbrirLevelUp,
}: PerfilTabProps) {
  const { rolarD20 } = useRoll();

  return (
    <>
      <div className={`box-solid ${styles.levelBox}`}>
        <div>
          <div className="label">nível atual</div>
          <div style={{ fontSize: 18 }}>{nivel}</div>
        </div>
        <div className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={onAbrirLevelUp}>
          ⬆ Level Up
        </div>
      </div>

      <div className="stat-grid">
        {atributos.map((a) => (
          <div
            key={a.atributo}
            className="box stat-box"
            onClick={() => rolarD20({ label: a.atributo, formula: `1d20 ${a.mod >= 0 ? '+' : '-'} ${Math.abs(a.mod)}`, mod: a.mod })}
          >
            <div className="stat-name">{a.atributo}</div>
            <div className="stat-mod">
              {a.mod >= 0 ? '+' : ''}
              {a.mod}
            </div>
            <div className="stat-val">{a.valor}</div>
          </div>
        ))}
      </div>

      <div className={styles.hpRow}>
        <div className={`box ${styles.hpBox}`}>
          <div className="label">PV</div>
          <div className={styles.hpNum}>
            {pvAtual}/{pvMax}
          </div>
        </div>
        <div className={`box ${styles.hpBox}`}>
          <div className="label">CA</div>
          <div className={styles.hpNum}>{ca ?? '—'}</div>
        </div>
        <div
          className={`box ${styles.hpBox}`}
          onClick={() =>
            iniciativa !== null && rolarD20({ label: 'Iniciativa', formula: `1d20 + ${iniciativa}`, mod: iniciativa })
          }
        >
          <div className="label">Iniciativa</div>
          <div className={styles.hpNum}>
            {iniciativa !== null ? `${iniciativa >= 0 ? '+' : ''}${iniciativa} 🎲` : '—'}
          </div>
        </div>
      </div>

      <div className="section-title">Perícias</div>
      {pericias.map((p) => (
        <div
          key={p.nome}
          className={styles.skillRow}
          onClick={() => rolarD20({ label: p.nome, formula: `1d20 ${p.mod >= 0 ? '+' : '-'} ${Math.abs(p.mod)}`, mod: p.mod })}
        >
          <span>
            {p.nome} ({p.atributo}) 🎲
          </span>
          <span>
            {p.mod >= 0 ? '+' : ''}
            {p.mod}
          </span>
        </div>
      ))}
      <div className={styles.skillRow}>
        <span>Percepção Passiva</span>
        <span>{percepcaoPassiva ?? '—'}</span>
      </div>
      <div className="label" style={{ marginTop: 6, marginBottom: 12 }}>
        toque num atributo, perícia ou iniciativa pra rolar o dado.
      </div>

      {!xpBloqueado ? (
        <div className="label" style={{ marginBottom: 12 }}>
          Valores estáticos: editáveis normalmente enquanto ficha não tiver XP.
        </div>
      ) : (
        <div className="label" style={{ marginBottom: 12, color: 'var(--warn)' }}>
          Ficha com XP: valores base travados, exceto via level-up oficial.
        </div>
      )}

      <div className="section-title">Descanso</div>
      <div className={styles.actionGrid}>
        <div className={`box ${styles.actionBtn}`} onClick={onDescansoCurto}>
          <div className={styles.aName}>Descanso Curto</div>
          <div className={styles.aType}>1 hora</div>
        </div>
        <div className={`box ${styles.actionBtn}`} onClick={onDescansoLongo}>
          <div className={styles.aName}>Descanso Longo</div>
          <div className={styles.aType}>8 horas</div>
        </div>
      </div>
      {restStatus && <div className={styles.restStatus}>{restStatus}</div>}
    </>
  );
}
