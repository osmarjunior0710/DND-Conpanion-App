import { useState } from 'react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import styles from './InfoChip.module.css';

interface InfoChipProps {
  nome: string;
  descricao: string | null;
}

/** Botão tonal (M3) pra qualquer coisa "concedida" (talento, perícia...):
 * mostra o nome + "ⓘ" quando há descrição; toque abre um popup central
 * com nome + texto. Sem descrição, o chip aparece sem o ícone e não é
 * clicável — mesmo padrão de popup do ItemComDescricao, só que com
 * visual de chip em vez de texto sublinhado (uso diferente: coisas
 * "garantidas" numa lista curta, não itens dentro de um parágrafo). */
export default function InfoChip({ nome, descricao }: InfoChipProps) {
  const [aberto, setAberto] = useState(false);
  useLockBodyScroll(aberto);

  return (
    <>
      <span
        className={`${styles.chip} ${descricao ? styles.chipClicavel : ''}`}
        onClick={() => descricao && setAberto(true)}
      >
        {nome}
        {descricao && <span className={styles.infoIcon}>ⓘ</span>}
      </span>
      {aberto && (
        <div className={styles.overlay} onClick={() => setAberto(false)}>
          <div className={styles.card} onClick={(e) => e.stopPropagation()}>
            <div className={styles.title}>{nome}</div>
            <div className={styles.desc}>{descricao}</div>
            <div className={styles.close} onClick={() => setAberto(false)}>
              fechar
            </div>
          </div>
        </div>
      )}
    </>
  );
}
