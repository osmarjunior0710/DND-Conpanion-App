import { useState } from 'react';
import { espacosMagiaExemplo } from '../../../data/exampleCombat';
import type { EstiloDeLuta } from '../../../data/rulesets/dnd2024/estilosDeLuta';
import { useRoll } from '../../roll/RollContext';
import InfoChip from '../../components/InfoChip';
import SidePanel from '../combat/SidePanel';
import AcaoPanelContent, { type DanoPendente } from '../combat/AcaoPanelContent';
import BonusPanelContent from '../combat/BonusPanelContent';
import ReacaoPanelContent from '../combat/ReacaoPanelContent';
import styles from './CombatTab.module.css';

export type RecursoTurno = 'acao' | 'bonus' | 'reacao';
export type EstadoRecurso = 'disponivel' | 'usada';

interface CombatTabProps {
  pvAtual: number;
  pvMax: number;
  onAlterarPv: (delta: number) => void;
  turnState: Record<RecursoTurno, EstadoRecurso>;
  onMarcarUsado: (categoria: RecursoTurno) => void;
  onFimDoTurno: () => void;
  espacosGastos: number;
  onGastarSlot: () => boolean;
  estiloDeLuta: EstiloDeLuta | null;
}

const LABELS: Record<RecursoTurno, { icone: string; nome: string }> = {
  acao: { icone: '⚔', nome: 'Ação' },
  bonus: { icone: '⚡', nome: 'Bônus' },
  reacao: { icone: '🛡', nome: 'Reação' },
};

export default function CombatTab({
  pvAtual,
  pvMax,
  onAlterarPv,
  turnState,
  onMarcarUsado,
  onFimDoTurno,
  espacosGastos,
  onGastarSlot,
  estiloDeLuta,
}: CombatTabProps) {
  const [painelAberto, setPainelAberto] = useState<RecursoTurno | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [danoPendente, setDanoPendente] = useState<DanoPendente | null>(null);
  const { rolarDados } = useRoll();

  function abrirPainel(categoria: RecursoTurno) {
    if (turnState[categoria] === 'usada') return;
    setFeedback(null);
    setDanoPendente(null);
    setPainelAberto(categoria);
  }

  function fecharPainel() {
    setPainelAberto(null);
  }

  function escolherNoPainel(categoria: RecursoTurno, nome: string, desc: string, dano?: DanoPendente) {
    onMarcarUsado(categoria);
    setPainelAberto(null);
    setFeedback(`${nome} — ${desc}`);
    setDanoPendente(dano ?? null);
  }

  function rolarDanoPendente() {
    if (!danoPendente) return;
    rolarDados({
      label: danoPendente.label,
      formula: `${danoPendente.quantidade}d${danoPendente.lados}${danoPendente.mod ? ` + ${danoPendente.mod}` : ''}`,
      quantidade: danoPendente.quantidade,
      lados: danoPendente.lados,
      mod: danoPendente.mod,
    });
  }

  function ladoDoPainel(categoria: RecursoTurno): 'left' | 'right' | 'bottom' {
    if (categoria === 'acao') return 'left';
    if (categoria === 'bonus') return 'right';
    return 'bottom';
  }

  return (
    <>
      <div className={`box-solid ${styles.hpLive}`}>
        <div>
          <div className="label">Pontos de Vida</div>
          <div className={styles.hpNum}>
            {pvAtual} / {pvMax}
          </div>
        </div>
        <div className={styles.hpBtns}>
          <div className={styles.hpBtn} onClick={() => onAlterarPv(-1)}>
            −
          </div>
          <div className={styles.hpBtn} onClick={() => onAlterarPv(1)}>
            +
          </div>
        </div>
      </div>
      <div className="label" style={{ marginBottom: 14 }}>
        ⚠️ Protótipo: cada toque muda 1 PV por vez. Um campo pra digitar quantidade de dano/cura fica pra quando o
        motor de cálculo (`core/`) entrar de verdade.
      </div>

      {estiloDeLuta && (
        <>
          <div className="section-title">Estilo de Luta</div>
          <InfoChip nome={estiloDeLuta.nome} descricao={estiloDeLuta.beneficios} />
        </>
      )}

      <div className="section-title">Ação · Ação Bônus · Reação — estado do turno</div>
      <div className={styles.splitBtns}>
        {(['acao', 'bonus', 'reacao'] as RecursoTurno[]).map((categoria) => (
          <div
            key={categoria}
            className={`${styles.splitBtn} ${styles[`splitBtn${categoria === 'acao' ? 'Acao' : categoria === 'bonus' ? 'Bonus' : 'Reacao'}`]} ${
              turnState[categoria] === 'usada' ? styles.splitBtnUsada : ''
            }`}
            onClick={() => abrirPainel(categoria)}
          >
            <div className={styles.sbIcon}>{LABELS[categoria].icone}</div>
            <div className={styles.sbLabel}>{LABELS[categoria].nome}</div>
            <div className={styles.sbState}>{turnState[categoria] === 'usada' ? 'usada' : 'ativo'}</div>
          </div>
        ))}
      </div>

      <div
        className={styles.endTurnBtn}
        onClick={() => {
          onFimDoTurno();
          setFeedback(null);
          setDanoPendente(null);
        }}
      >
        ↻ Fim do Turno — restaura os 3 botões
      </div>
      <div className="label">
        Ação abre da esquerda, Ação Bônus da direita, Reação sobe de baixo. Ao usar um, ele fica cinza/travado até
        "Fim do Turno".
      </div>

      {feedback && (
        <div className={styles.feedback}>
          {feedback}
          {danoPendente && (
            <div className="btn btn-primary" style={{ marginTop: 10, padding: '10px 14px', display: 'inline-block' }} onClick={rolarDanoPendente}>
              🎲 Rolar Dano
            </div>
          )}
        </div>
      )}

      <SidePanel
        open={painelAberto !== null}
        side={painelAberto ? ladoDoPainel(painelAberto) : 'left'}
        title={painelAberto ? `${LABELS[painelAberto].icone} ${LABELS[painelAberto].nome} — escolha uma` : ''}
        onClose={fecharPainel}
      >
        {painelAberto === 'acao' && (
          <AcaoPanelContent
            onEscolher={(nome, desc, dano) => escolherNoPainel('acao', nome, desc, dano)}
            gastarSlot={onGastarSlot}
            espacosGastos={espacosGastos}
            espacosMaximo={espacosMagiaExemplo.maximo}
          />
        )}
        {painelAberto === 'bonus' && <BonusPanelContent />}
        {painelAberto === 'reacao' && (
          <ReacaoPanelContent onEscolher={(nome, desc) => escolherNoPainel('reacao', nome, desc)} gastarSlot={onGastarSlot} />
        )}
      </SidePanel>
    </>
  );
}
