import { useState } from 'react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import styles from './InfoValor.module.css';

interface InfoValorProps {
  titulo: string;
  explicacao: string;
}

/** "ⓘ" clicável ao lado de um número calculado automaticamente — abre
 * um popup mostrando a conta por trás do valor. Mesmo padrão de popup
 * de InfoChip/ItemComDescricao, só que o gatilho é um ícone solto (pra
 * ficar colado num número), não um chip nem texto sublinhado. */
export default function InfoValor({ titulo, explicacao }: InfoValorProps) {
  const [aberto, setAberto] = useState(false);
  useLockBodyScroll(aberto);

  return (
    <>
      <span
        className={styles.icon}
        onClick={(e) => {
          e.stopPropagation();
          setAberto(true);
        }}
      >
        ⓘ
      </span>
      {aberto && (
        <div className={styles.overlay} onClick={() => setAberto(false)}>
          <div className={styles.card} onClick={(e) => e.stopPropagation()}>
            <div className={styles.title}>{titulo}</div>
            <div className={styles.desc}>{explicacao}</div>
            <div className={styles.close} onClick={() => setAberto(false)}>
              fechar
            </div>
          </div>
        </div>
      )}
    </>
  );
}
