import { useState } from 'react';
import styles from './PanelRows.module.css';

interface ReacaoPanelContentProps {
  onEscolher: (nome: string, desc: string) => void;
  gastarSlot: () => boolean;
  conjura: boolean;
}

export default function ReacaoPanelContent({ onEscolher, gastarSlot, conjura }: ReacaoPanelContentProps) {
  const [aviso, setAviso] = useState<string | null>(null);

  function usarEscudoArcano() {
    const ok = gastarSlot();
    if (!ok) {
      setAviso('Sem Espaços de Magia disponíveis. Faça um Descanso Curto pra recuperar.');
      return;
    }
    onEscolher('[PH] ✨ Escudo Arcano', '1º círculo · +5 CA até o início do seu próximo turno.');
  }

  return (
    <>
      {conjura && (
        <>
          <div className={styles.row} onClick={usarEscudoArcano}>
            <div className={styles.rowName}>[PH] ✨ Escudo Arcano</div>
            <div className={styles.rowDesc}>
              1º círculo · gasta um Espaço de Magia · +5 CA até o início do seu próximo turno. [PH] fixture de
              exemplo — ainda não é a lista real de magias da classe conjuradora.
            </div>
          </div>
          {aviso && (
            <div className="label" style={{ color: 'var(--warn)', marginBottom: 8 }}>
              {aviso}
            </div>
          )}
        </>
      )}
      <div
        className={styles.row}
        onClick={() =>
          onEscolher(
            '⚔ Ataque de Oportunidade',
            'Disponível por padrão pra qualquer personagem, quando um inimigo visível sai do seu alcance.',
          )
        }
      >
        <div className={styles.rowName}>⚔ Ataque de Oportunidade</div>
        <div className={styles.rowDesc}>Disponível por padrão pra qualquer personagem, sem precisar de característica de classe</div>
      </div>
    </>
  );
}
