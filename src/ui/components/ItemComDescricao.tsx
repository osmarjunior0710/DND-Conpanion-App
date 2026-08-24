import { useState } from 'react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import styles from './ItemComDescricao.module.css';

interface ItemComDescricaoProps {
  nome: string;
  descricao: string | null;
  /** texto a mostrar (ex: "2× Adaga") — se omitido, usa `nome` */
  rotulo?: string;
  /** 'sublinhado' (padrão): o texto inteiro fica sublinhado e clicável.
   * 'icone': o texto fica normal, com um "ⓘ" solto ao lado — pra listas
   * onde o nome do item não deveria mudar de aparência (ex: Mochila
   * com o toggle "itens detalhados" desligado). */
  variante?: 'sublinhado' | 'icone';
}

/** Termo tocável que abre um popup com nome + descrição, sem trocar de
 * tela. Padrão registrado no DECISOES-DESIGN.md ("tooltip em texto
 * sublinhado"). Se não houver descrição, renderiza só texto simples. */
export default function ItemComDescricao({ nome, descricao, rotulo, variante = 'sublinhado' }: ItemComDescricaoProps) {
  const [aberto, setAberto] = useState(false);
  useLockBodyScroll(aberto);

  if (!descricao) return <>{rotulo ?? nome}</>;

  const abrir = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAberto(true);
  };

  return (
    <>
      {variante === 'icone' ? (
        <>
          {rotulo ?? nome}
          <span className={styles.icone} onClick={abrir}>
            ⓘ
          </span>
        </>
      ) : (
        <span className={styles.termo} onClick={abrir}>
          {rotulo ?? nome}
        </span>
      )}
      {aberto && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            e.stopPropagation();
            setAberto(false);
          }}
        >
          <div className={styles.card} onClick={(e) => e.stopPropagation()}>
            <div className={styles.title}>{nome}</div>
            <div className={styles.desc}>{descricao}</div>
            <div
              className={styles.close}
              onClick={(e) => {
                e.stopPropagation();
                setAberto(false);
              }}
            >
              fechar
            </div>
          </div>
        </div>
      )}
    </>
  );
}
