import { useState } from 'react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import styles from './TrocarArmaMaestria.module.css';

interface TrocarValorSimplesProps {
  titulo: string;
  valorAtual: string;
  opcoes: string[];
  onTrocar: (novoValor: string) => void;
}

/** Versão genérica do popup "🔄 trocar X por Y" de `TrocarArmaMaestria`
 * — mesmo padrão visual/interação, só que pra uma lista simples de
 * texto (sem dado de arma), reaproveitando o mesmo CSS module. Usado
 * hoje só por Resistência Ínfera (Bruxo), mas serve pra qualquer
 * "escolha 1 de uma lista curta" parecida no futuro. */
export default function TrocarValorSimples({ titulo, valorAtual, opcoes, onTrocar }: TrocarValorSimplesProps) {
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
        🔄
      </span>
      {aberto && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            e.stopPropagation();
            setAberto(false);
          }}
        >
          <div className={styles.card} onClick={(e) => e.stopPropagation()}>
            <div className={styles.title}>{titulo}</div>
            <div className={styles.lista}>
              {opcoes.map((opcao) => (
                <div
                  key={opcao}
                  className={`${styles.opcao} ${opcao === valorAtual ? styles.opcaoAtual : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (opcao !== valorAtual) onTrocar(opcao);
                    setAberto(false);
                  }}
                >
                  <span>{opcao}</span>
                </div>
              ))}
            </div>
            <div
              className={styles.close}
              onClick={(e) => {
                e.stopPropagation();
                setAberto(false);
              }}
            >
              cancelar
            </div>
          </div>
        </div>
      )}
    </>
  );
}
