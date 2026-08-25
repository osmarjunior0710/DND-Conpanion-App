import { useState } from 'react';
import type { Arma } from '../../data/rulesets/dnd2024/armas';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import styles from './TrocarArmaMaestria.module.css';

interface TrocarArmaMaestriaProps {
  armaAtual: string;
  todasAsArmas: Arma[];
  jaEscolhidas: string[];
  onTrocar: (novaArma: string) => void;
}

/** Ícone "🔄" ao lado de uma arma de Maestria já escolhida — abre um
 * popup com a lista de armas elegíveis (excluindo as que já ocupam
 * outro slot de Maestria) pra trocar por essa. Regra: Guerreiro troca 1
 * arma de Maestria a cada Descanso Longo (ver DECISOES-DESIGN.md
 * "Guerreiro — 2 exceções reais"), por isso o gatilho fica dentro da
 * seção de Descanso Longo da aba Perfil, não no Level Up. */
export default function TrocarArmaMaestria({ armaAtual, todasAsArmas, jaEscolhidas, onTrocar }: TrocarArmaMaestriaProps) {
  const [aberto, setAberto] = useState(false);
  useLockBodyScroll(aberto);

  const opcoes = todasAsArmas.filter((a) => a.nome === armaAtual || !jaEscolhidas.includes(a.nome));

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
            <div className={styles.title}>Trocar {armaAtual} por…</div>
            <div className={styles.lista}>
              {opcoes.map((a) => (
                <div
                  key={a.id}
                  className={`${styles.opcao} ${a.nome === armaAtual ? styles.opcaoAtual : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (a.nome !== armaAtual) onTrocar(a.nome);
                    setAberto(false);
                  }}
                >
                  <span>{a.nome}</span>
                  <span className={styles.detalhe}>
                    {a.dano} · {a.maestria}
                  </span>
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
