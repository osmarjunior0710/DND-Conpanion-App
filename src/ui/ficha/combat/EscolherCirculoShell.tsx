import type { Magia } from '../../../data/rulesets/dnd2024/magias';
import type { EspacoDeMagiaAtivo } from '../../../core/magiasPersonagem';
import MagiaComDescricao from '../../components/MagiaComDescricao';
import styles from '../levelup/LevelUpShell.module.css';

interface EscolherCirculoShellProps {
  magia: Magia;
  circulosDisponiveis: number[];
  espacos: EspacoDeMagiaAtivo[];
  espacosGastosPorCirculo: Record<number, number>;
  onVoltar: () => void;
  onConjurar: (circulo: number) => void;
}

/** Tela cheia (Tela 3 do fluxo "Usar Magia") — só aparece quando a
 * magia tem mais de 1 círculo disponível pra upar (ver
 * `circulosDisponiveisParaConjurar`); com 1 só, `AcaoPanelContent`
 * pula direto pra conjurar. Mostra o texto real da magia (que já traz
 * "Upcast: +Xd8 por círculo" pras ~130 magias que escalam, ver
 * `descricaoCurta`) — o cálculo exato por círculo escolhido fica pra
 * quando a planilha tiver esse dado estruturado (ver PENDENCIAS.md
 * "Upcast — efeito calculado por círculo"), por enquanto o jogador lê
 * o texto e faz a conta. */
export default function EscolherCirculoShell({
  magia,
  circulosDisponiveis,
  espacos,
  espacosGastosPorCirculo,
  onVoltar,
  onConjurar,
}: EscolherCirculoShellProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.stepName}>Conjurar {magia.nome}</div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="opt-card" style={{ cursor: 'default', marginBottom: 12 }}>
          <div className="opt-card-name">
            <MagiaComDescricao magia={magia} variante="icone" />
          </div>
          {magia.descricaoCurta && <div className="opt-card-desc">{magia.descricaoCurta}</div>}
        </div>

        <div className="section-title">Em qual círculo?</div>
        <div className="label" style={{ marginBottom: 8 }}>
          Escolha o espaço de magia pra gastar — círculos mais altos custam mais caro, mas costumam melhorar o
          efeito (veja o texto acima).
        </div>
        {circulosDisponiveis.map((circulo) => {
          const def = espacos.find((e) => e.circulo === circulo);
          const gasto = espacosGastosPorCirculo[circulo] ?? 0;
          const disponiveis = def ? def.maximo - gasto : 0;
          return (
            <div key={circulo} className="opt-card" onClick={() => onConjurar(circulo)}>
              <div className="opt-card-name">{circulo}º Círculo</div>
              <div className="opt-card-desc">{disponiveis}/{def?.maximo ?? 0} espaços disponíveis</div>
            </div>
          );
        })}
      </div>

      <div className={styles.navLayer}>
        <div className={`btn ${styles.pill}`} onClick={onVoltar}>
          ← Voltar
        </div>
      </div>
    </div>
  );
}
