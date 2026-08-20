import { atributosExemplo, personagemExemplo } from '../../../data/exampleSheet';
import { useRoll } from '../../roll/RollContext';
import styles from './PerfilTab.module.css';

interface PerfilTabProps {
  nivel: number;
  pvMax: number;
  pvAtual: number;
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
          <div style={{ fontSize: 16 }}>{nivel}</div>
        </div>
        <div className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={onAbrirLevelUp}>
          ⬆ Level Up
        </div>
      </div>

      <div className="stat-grid">
        {atributosExemplo.map((a) => (
          <div
            key={a.nome}
            className="box stat-box"
            onClick={() => rolarD20({ label: a.nome, formula: `1d20 ${a.mod >= 0 ? '+' : '-'} ${Math.abs(a.mod)}`, mod: a.mod })}
          >
            <div className="stat-name">{a.nome}</div>
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
          <div className={styles.hpNum}>{personagemExemplo.ca}</div>
        </div>
        <div
          className={`box ${styles.hpBox}`}
          onClick={() =>
            rolarD20({ label: 'Iniciativa', formula: `1d20 + ${personagemExemplo.iniciativa}`, mod: personagemExemplo.iniciativa })
          }
        >
          <div className="label">Iniciativa</div>
          <div className={styles.hpNum}>+{personagemExemplo.iniciativa} 🎲</div>
        </div>
      </div>

      <div className="section-title">Perícias (exemplo)</div>
      <div className={styles.skillRow} onClick={() => rolarD20({ label: 'Enganação', formula: '1d20 + 4', mod: 4 })}>
        <span>Enganação (CAR) 🎲</span>
        <span>+4</span>
      </div>
      <div className={styles.skillRow} onClick={() => rolarD20({ label: 'Intimidação', formula: '1d20 + 4', mod: 4 })}>
        <span>Intimidação (CAR) 🎲</span>
        <span>+4</span>
      </div>
      <div className={styles.skillRow}>
        <span>Percepção Passiva</span>
        <span>11</span>
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
      <div className="label">
        Bruxo é um caso especial de regra: Espaços de Magia (Magia de Pacto) recuperam no Descanso{' '}
        <b>Curto</b>, diferente da maioria dos conjuradores (que só recuperam no Longo). Veja o contador na aba
        Magias.
      </div>
    </>
  );
}
