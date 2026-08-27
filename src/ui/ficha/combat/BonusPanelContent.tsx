import type { AtaqueResolvido } from '../../../core/ataque';
import styles from './PanelRows.module.css';

interface BonusPanelContentProps {
  usosFolegoMaximo: number;
  usosFolegoRestantes: number;
  onUsarRecuperarFolego: () => void;
  ataqueBonus: AtaqueResolvido | null;
  onUsarAtaqueBonus: () => void;
}

export default function BonusPanelContent({
  usosFolegoMaximo,
  usosFolegoRestantes,
  onUsarRecuperarFolego,
  ataqueBonus,
  onUsarAtaqueBonus,
}: BonusPanelContentProps) {
  if (usosFolegoMaximo === 0 && !ataqueBonus) {
    return (
      <div className="box" style={{ padding: 14, color: 'var(--text-faint)', fontSize: 13, textAlign: 'center' }}>
        Nenhuma ação bônus disponível pra este personagem no nível atual.
      </div>
    );
  }

  const semUsos = usosFolegoRestantes <= 0;

  return (
    <>
      {ataqueBonus && (
        <div className={styles.row} onClick={onUsarAtaqueBonus}>
          <div className={styles.rowName}>🗡 Atacar — {ataqueBonus.nome} (Mão Secundária)</div>
          <div className={styles.rowDesc}>
            {ataqueBonus.descricao} Propriedade Leve nas duas mãos: sem bônus de atributo no dano (a menos que seja
            negativo).
          </div>
        </div>
      )}
      {usosFolegoMaximo > 0 && (
        <>
          <div className={styles.slotCounter}>
            <span>Recuperar Fôlego:</span>
            {Array.from({ length: usosFolegoMaximo }).map((_, i) => (
              <div key={i} className={`${styles.slotPipLg} ${i >= usosFolegoRestantes ? styles.slotPipLgGasto : ''}`} />
            ))}
            <span style={{ color: 'var(--text-faint)' }}>
              {usosFolegoRestantes}/{usosFolegoMaximo} disponíveis
            </span>
          </div>
          <div
            className={styles.row}
            style={semUsos ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
            onClick={onUsarRecuperarFolego}
          >
            <div className={styles.rowName}>🩹 Recuperar Fôlego</div>
            <div className={styles.rowDesc}>
              Recupera 1d10 + seu nível de Guerreiro em Pontos de Vida. Gasta 1 uso — 1 volta no Descanso Curto, todos
              no Descanso Longo.
            </div>
          </div>
          {semUsos && (
            <div className="label" style={{ marginTop: 6 }}>
              sem usos disponíveis — descanse pra recuperar.
            </div>
          )}
        </>
      )}
    </>
  );
}
