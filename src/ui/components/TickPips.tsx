import styles from './TickPips.module.css';

interface TickPipsProps {
  /** Quanto o recurso tem no total (ex: máximo de Espaços de Magia). */
  total: number;
  /** Quanto já foi gasto/usado — esvazia de trás pra frente, como um
   * tanque de combustível (o último quadradinho é o primeiro a ficar
   * cinza). */
  usados: number;
  tamanho?: 'sm' | 'lg';
}

/** Ticks/pips padronizados pra qualquer recurso "N usos, alguns já
 * gastos" (Espaços de Magia, Recuperar Fôlego, Inspiração de Bardo...).
 * Regra única em todo o app: quadradinho preenchido de azul = ainda
 * disponível; cinza = já gasto. Sempre esvazia do ÚLTIMO pro primeiro
 * (índice mais alto fica cinza primeiro), nunca do primeiro pro
 * último — ver DECISOES-DESIGN.md. */
export default function TickPips({ total, usados, tamanho = 'sm' }: TickPipsProps) {
  return (
    <div className={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`${styles.pip} ${styles[tamanho]} ${i >= total - usados ? styles.pipUsado : ''}`} />
      ))}
    </div>
  );
}
