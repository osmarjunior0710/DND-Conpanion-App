import { useRoll } from './RollContext';
import styles from './RollOverlay.module.css';

export default function RollOverlay() {
  const { estado, fechar } = useRoll();

  if (!estado) return null;

  const dieClass =
    estado.critico === 'falha' ? styles.dieCritFail : estado.critico === 'sucesso' ? styles.dieCritSuccess : '';

  return (
    <div className={styles.overlay} onClick={fechar}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.label}>{estado.label}</div>
        <div className={`${styles.die} ${dieClass}`}>{estado.valorDado}</div>
        {estado.detalheVantagem && <div className={styles.formula}>{estado.detalheVantagem}</div>}
        <div className={styles.formula}>{estado.formula}</div>
        <div className={styles.total}>{estado.fase === 'rolando' ? '—' : estado.total}</div>
        {estado.critico === 'falha' && <div className={`${styles.feedback} ${styles.feedbackCritFail}`}>😢 FALHA CRÍTICA</div>}
        {estado.critico === 'sucesso' && <div className={`${styles.feedback} ${styles.feedbackCritSuccess}`}>🎉 ACERTO CRÍTICO!</div>}
        <div className={styles.close} onClick={fechar}>
          FECHAR
        </div>
      </div>
    </div>
  );
}
