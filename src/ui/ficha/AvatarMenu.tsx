import { useState } from 'react';
import styles from './AvatarMenu.module.css';

interface AvatarMenuProps {
  itensDetalhados: boolean;
  onToggleItensDetalhados: () => void;
}

/** Avatar no canto superior direito da Ficha — toque abre um menu
 * dropdown com preferências de exibição. Hoje só tem "Itens
 * detalhados" (Mochila), mas o menu já nasce pronto pra receber mais
 * preferências depois sem precisar de outro ponto de entrada na UI. */
export default function AvatarMenu({ itensDetalhados, onToggleItensDetalhados }: AvatarMenuProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className={styles.wrap}>
      <div className={styles.avatar} onClick={() => setAberto((v) => !v)}>
        👤
      </div>
      {aberto && (
        <>
          <div className={styles.backdrop} onClick={() => setAberto(false)} />
          <div className={styles.menu}>
            <div className={styles.menuTitle}>Preferências</div>
            <div className={styles.menuRow} onClick={onToggleItensDetalhados}>
              <div className={styles.menuRowText}>
                <div className={styles.menuRowLabel}>Itens detalhados</div>
                <div className={styles.menuRowDesc}>Mostra a descrição de cada item direto na Mochila</div>
              </div>
              <div className={`${styles.switchTrack} ${itensDetalhados ? styles.switchOn : ''}`}>
                <div className={styles.switchThumb} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
