import { useState } from 'react';
import styles from './AvatarMenu.module.css';

interface AvatarMenuProps {
  itensDetalhados: boolean;
  onToggleItensDetalhados: () => void;
  pesoAtivo: boolean;
  onTogglePeso: () => void;
}

/** Avatar no canto superior direito da Ficha — toque abre um menu
 * dropdown com preferências de exibição da Mochila. O menu já nasce
 * pronto pra receber mais preferências depois sem precisar de outro
 * ponto de entrada na UI. */
export default function AvatarMenu({ itensDetalhados, onToggleItensDetalhados, pesoAtivo, onTogglePeso }: AvatarMenuProps) {
  const [aberto, setAberto] = useState(false);

  const preferencias = [
    {
      label: 'Itens detalhados',
      desc: 'Mostra a descrição de cada item direto na Mochila',
      valor: itensDetalhados,
      onToggle: onToggleItensDetalhados,
    },
    {
      label: 'Peso da Mochila',
      desc: 'Mostra o peso de cada item e a barra de carga',
      valor: pesoAtivo,
      onToggle: onTogglePeso,
    },
  ];

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
            {preferencias.map((p) => (
              <div key={p.label} className={styles.menuRow} onClick={p.onToggle}>
                <div className={styles.menuRowText}>
                  <div className={styles.menuRowLabel}>{p.label}</div>
                  <div className={styles.menuRowDesc}>{p.desc}</div>
                </div>
                <div className={`${styles.switchTrack} ${p.valor ? styles.switchOn : ''}`}>
                  <div className={styles.switchThumb} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
