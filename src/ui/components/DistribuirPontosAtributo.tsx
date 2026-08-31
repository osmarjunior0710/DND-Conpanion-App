import { atributosOrdem, type Atributo } from '../../data/wizardFixtures';
import { modificador } from '../../core/personagem';
import styles from './DistribuirPontosAtributo.module.css';

interface DistribuirPontosAtributoProps {
  /** Total de pontos a distribuir (ex: 2 no Level Up "Aumento no Valor
   * de Atributo", 3 no ajuste de Antecedente "+2/+1"). */
  pontosTotal: number;
  /** 1 entrada do atributo por ponto já aplicado nele (ex:
   * `['FOR', 'FOR', 'DES']` = +2 em FOR, +1 em DES) — mesmo formato de
   * `WizardSelection.bonusEscolhas`. */
  escolhas: Atributo[];
  /** Valor BASE de cada atributo (sem o ajuste sendo distribuído aqui)
   * — usado só pra mostrar "valor atual → valor com o ajuste". */
  atributosBase: Record<Atributo, number | null>;
  onIncrementar: (a: Atributo) => void;
  onDecrementar: (a: Atributo) => void;
  /** Atributos travados (ex: fora da lista de elegíveis do
   * Antecedente) — aparecem esmaecidos, sem +/- clicável. */
  atributoTravado?: (a: Atributo) => boolean;
}

/** Tabela "Atributo · ASI (+/-) · Total" reaproveitada em qualquer tela
 * que precise distribuir N pontos entre atributos, no máximo 2 no
 * mesmo (regra real do livro pros dois casos que usam isso: ASI de
 * Level Up e ajuste +2/+1 de Antecedente na criação) — nasceu como
 * função local de `LevelUpShell.tsx`, extraída aqui pra dar pra
 * reaproveitar na criação de personagem sem duplicar a UI. */
export default function DistribuirPontosAtributo({
  pontosTotal,
  escolhas,
  atributosBase,
  onIncrementar,
  onDecrementar,
  atributoTravado,
}: DistribuirPontosAtributoProps) {
  const pontosGastos = escolhas.length;
  const pontosRestantes = pontosTotal - pontosGastos;

  function pontosNoAtributo(a: Atributo): number {
    return escolhas.filter((x) => x === a).length;
  }

  return (
    <>
      <div className="label" style={{ marginTop: 14, marginBottom: 10 }}>
        Distribua {pontosTotal} pontos — no máximo 2 no mesmo atributo (regra real: +2 num só, ou +1 em dois).
        Faltam {pontosRestantes}.
      </div>
      <div className={styles.headerRow}>
        <span>Atributo</span>
        <span>Ajuste</span>
        <span>Total</span>
      </div>
      {atributosOrdem.map((a) => {
        const base = atributosBase[a] ?? 10;
        const nesse = pontosNoAtributo(a);
        const total = base + nesse;
        const travado = atributoTravado?.(a) ?? false;
        return (
          <div key={a} className={styles.row}>
            <span>
              {a} {base} ({modificador(base) >= 0 ? '+' : ''}
              {modificador(base)})
            </span>
            <span className={styles.stepper}>
              <div
                className={styles.btn}
                style={travado || nesse === 0 ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
                onClick={() => onDecrementar(a)}
              >
                −
              </div>
              <span>{nesse}</span>
              <div
                className={styles.btn}
                style={
                  travado || pontosRestantes === 0 || nesse >= 2 || base + nesse >= 20
                    ? { opacity: 0.4, pointerEvents: 'none' }
                    : undefined
                }
                onClick={() => onIncrementar(a)}
              >
                +
              </div>
            </span>
            <span>
              {total} ({modificador(total) >= 0 ? '+' : ''}
              {modificador(total)})
            </span>
          </div>
        );
      })}
    </>
  );
}
