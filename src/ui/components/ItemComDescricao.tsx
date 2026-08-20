import { useState } from 'react';
import styles from './ItemComDescricao.module.css';

interface ItemComDescricaoProps {
  nome: string;
  descricao: string | null;
  /** texto a mostrar (ex: "2× Adaga") — se omitido, usa `nome` */
  rotulo?: string;
}

/** Termo tocável que abre um popup com nome + descrição, sem trocar de
 * tela. Padrão registrado no DECISOES-DESIGN.md ("tooltip em texto
 * sublinhado"). Se não houver descrição, renderiza só texto simples. */
export default function ItemComDescricao({ nome, descricao, rotulo }: ItemComDescricaoProps) {
  const [aberto, setAberto] = useState(false);

  if (!descricao) return <>{rotulo ?? nome}</>;

  return (
    <>
      <span
        className={styles.termo}
        onClick={(e) => {
          e.stopPropagation();
          setAberto(true);
        }}
      >
        {rotulo ?? nome}
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
