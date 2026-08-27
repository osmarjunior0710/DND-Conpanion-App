import { useState } from 'react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import type { Magia } from '../../data/rulesets/dnd2024/magias';
import styles from './MagiaComDescricao.module.css';

interface MagiaComDescricaoProps {
  magia: Magia;
  /** texto a mostrar (ex: nome já formatado) — se omitido, usa `magia.nome` */
  rotulo?: string;
  /** ver ItemComDescricao — mesmo padrão de gatilho */
  variante?: 'sublinhado' | 'icone';
}

function tipoMagia(circulo: number): string {
  return circulo === 0 ? 'Truque' : `${circulo}º Círculo`;
}

/** Card padronizado pra qualquer magia/truque — sempre os mesmos campos,
 * na mesma ordem, com toggle Desc. curta/longa (padrão da versão anterior
 * do app). Ainda só usado pra Magias; PENDENCIAS.md tem a nota de
 * replicar esse padrão pra Itens/Armas/Armaduras/Itens Mágicos depois. */
export default function MagiaComDescricao({ magia, rotulo, variante = 'sublinhado' }: MagiaComDescricaoProps) {
  const [aberto, setAberto] = useState(false);
  const [descLonga, setDescLonga] = useState(false);
  useLockBodyScroll(aberto);

  const temAmbasDescricoes =
    !!magia.descricaoCurta && !!magia.descricaoCompleta && magia.descricaoCurta !== magia.descricaoCompleta;
  const descricaoAtual = (descLonga ? magia.descricaoCompleta : magia.descricaoCurta) ?? magia.descricaoCompleta ?? magia.descricaoCurta;

  const abrir = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDescLonga(false);
    setAberto(true);
  };

  return (
    <>
      {variante === 'icone' ? (
        <>
          {rotulo ?? magia.nome}
          <span className={styles.icone} onClick={abrir}>
            ⓘ
          </span>
        </>
      ) : (
        <span className={styles.termo} onClick={abrir}>
          {rotulo ?? magia.nome}
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
            <div className={styles.title}>{magia.nome}</div>
            <div className={styles.tipo}>{tipoMagia(magia.circulo)}</div>

            {temAmbasDescricoes && (
              <div className={styles.toggleRow}>
                <div className={`${styles.toggleBtn} ${!descLonga ? styles.toggleBtnAtivo : ''}`} onClick={() => setDescLonga(false)}>
                  Desc. curta
                </div>
                <div className={`${styles.toggleBtn} ${descLonga ? styles.toggleBtnAtivo : ''}`} onClick={() => setDescLonga(true)}>
                  Desc. longa
                </div>
              </div>
            )}

            <div className={styles.meta}>
              {(magia.tempoConjuracao || magia.alcance) && (
                <div className={styles.metaRow}>
                  {magia.tempoConjuracao && (
                    <span>
                      <strong>Tempo:</strong> {magia.tempoConjuracao}
                    </span>
                  )}
                  {magia.alcance && (
                    <span>
                      <strong>Alcance:</strong> {magia.alcance}
                    </span>
                  )}
                </div>
              )}
              {magia.componentes && (
                <div className={styles.metaRow}>
                  <strong>Componentes:</strong> {magia.componentes}
                </div>
              )}
              {magia.duracao && (
                <div className={styles.metaRow}>
                  <strong>Duração:</strong> {magia.duracao}
                </div>
              )}
            </div>

            {descricaoAtual && <div className={styles.desc}>{descricaoAtual}</div>}

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
