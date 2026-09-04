import { useState, type ReactNode } from 'react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import styles from './TrocarArmaMaestria.module.css';

interface TrocarValorSimplesProps {
  titulo: string;
  valorAtual: string;
  opcoes: string[];
  onTrocar: (novoValor: string) => void;
  /** `true` = ícone fica opaco e não abre o popup (ex: já trocado
   * desde o último Descanso, travado até o próximo). */
  desabilitado?: boolean;
  /** Como desenhar cada opção — default é o nome puro. Passar isso
   * quando a opção precisar de algo mais rico (ex: pill+ⓘ de magia via
   * `MagiaComDescricao`) — se o conteúdo customizado tiver o próprio
   * `onClick` (como a pill tem, pra abrir a descrição), ele já usa
   * `stopPropagation`, então tocar nele não seleciona a opção por
   * engano; tocar no resto da linha seleciona normalmente. */
  renderOpcao?: (opcao: string) => ReactNode;
}

/** Versão genérica do popup "🔄 trocar X por Y" de `TrocarArmaMaestria`
 * — mesmo padrão visual/interação, só que pra uma lista simples de
 * texto (sem dado de arma), reaproveitando o mesmo CSS module. Usado
 * hoje só por Resistência Ínfera (Bruxo), mas serve pra qualquer
 * "escolha 1 de uma lista curta" parecida no futuro. */
export default function TrocarValorSimples({ titulo, valorAtual, opcoes, onTrocar, desabilitado, renderOpcao }: TrocarValorSimplesProps) {
  const [aberto, setAberto] = useState(false);
  useLockBodyScroll(aberto);

  return (
    <>
      <span
        className={styles.icon}
        style={desabilitado ? { opacity: 0.35, pointerEvents: 'none' } : undefined}
        onClick={(e) => {
          e.stopPropagation();
          if (!desabilitado) setAberto(true);
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
                  <span>{renderOpcao ? renderOpcao(opcao) : opcao}</span>
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
