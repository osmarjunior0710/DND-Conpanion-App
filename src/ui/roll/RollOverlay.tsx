import { useRoll } from './RollContext';
import styles from './RollOverlay.module.css';

export default function RollOverlay() {
  const { estado, escolherVantagemPosRolagem, fechar, bonusExtraDisponivel, aplicarBonusExtra } = useRoll();

  if (!estado) return null;

  const critClass =
    estado.critico === 'falha' ? styles.dieCritFail : estado.critico === 'sucesso' ? styles.dieCritSuccess : '';

  const temSegundoDado = estado.dado2 != null;
  const dado1Num = typeof estado.valorDado === 'number' ? estado.valorDado : null;
  const dado2Num = typeof estado.dado2 === 'number' ? estado.dado2 : null;
  let dado1Descartado = false;
  let dado2Descartado = false;
  if (dado1Num !== null && dado2Num !== null && estado.vantagem) {
    const usado = estado.vantagem === 'vantagem' ? Math.max(dado1Num, dado2Num) : Math.min(dado1Num, dado2Num);
    dado1Descartado = dado1Num !== usado;
    dado2Descartado = dado2Num !== usado;
  }

  return (
    <div className={styles.overlay} onClick={fechar}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.label}>{estado.label}</div>
        <div className={styles.diceRow}>
          <div className={`${styles.die} ${dado1Descartado ? styles.dieDescartado : critClass}`}>
            {estado.valorDado}
          </div>
          {temSegundoDado && (
            <div className={`${styles.die} ${dado2Descartado ? styles.dieDescartado : critClass}`}>
              {estado.dado2}
            </div>
          )}
        </div>
        {estado.vantagem && (
          <div className={styles.formula}>{estado.vantagem === 'vantagem' ? 'Vantagem' : 'Desvantagem'}</div>
        )}
        <div className={styles.formula}>{estado.formula}</div>
        <div className={styles.total}>{estado.fase === 'rolando' ? '—' : estado.total}</div>
        {estado.critico === 'falha' && <div className={`${styles.feedback} ${styles.feedbackCritFail}`}>😢 FALHA CRÍTICA</div>}
        {estado.critico === 'sucesso' && <div className={`${styles.feedback} ${styles.feedbackCritSuccess}`}>🎉 ACERTO CRÍTICO!</div>}
        {estado.podeEscolherVantagem && (
          <div className={styles.vantagemButtons}>
            <div
              className={`${styles.vantagemBtn} ${styles.desvantagemBtn}`}
              onClick={() => escolherVantagemPosRolagem('desvantagem')}
            >
              Desvantagem
            </div>
            <div
              className={`${styles.vantagemBtn} ${styles.vantagemBtnPositivo}`}
              onClick={() => escolherVantagemPosRolagem('vantagem')}
            >
              Vantagem
            </div>
          </div>
        )}
        {estado.categoria === 'atributoOuSalvaguarda' && estado.bonusExtra && (
          <div className={styles.bonusExtraResultado}>
            +1d{bonusExtraDisponivel?.lados ?? 10} ({estado.bonusExtra.rotulo}): {estado.bonusExtra.valor}
          </div>
        )}
        {estado.fase === 'concluido' &&
          estado.categoria === 'atributoOuSalvaguarda' &&
          !estado.bonusExtra &&
          bonusExtraDisponivel &&
          bonusExtraDisponivel.maximo > 0 && (
            <div
              className={`${styles.bonusExtraBtn} ${bonusExtraDisponivel.restantes <= 0 ? styles.bonusExtraBtnDesabilitado : ''}`}
              onClick={bonusExtraDisponivel.restantes > 0 ? aplicarBonusExtra : undefined}
            >
              🔥 {bonusExtraDisponivel.rotulo} {bonusExtraDisponivel.restantes}/{bonusExtraDisponivel.maximo}
            </div>
          )}
        <div className={styles.close} onClick={fechar}>
          FECHAR
        </div>
      </div>
    </div>
  );
}
