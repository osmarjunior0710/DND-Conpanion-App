import { useState } from 'react';
import type { EstiloDeLuta } from '../../../data/rulesets/dnd2024/estilosDeLuta';
import type { Magia } from '../../../data/rulesets/dnd2024/magias';
import type { CaracteristicaNivel } from '../../../core/levelUp';
import type { AtaqueResolvido } from '../../../core/ataque';
import type { EspacoDeMagiaAtivo } from '../../../core/magiasPersonagem';
import { useRoll } from '../../roll/RollContext';
import InfoChip from '../../components/InfoChip';
import LinearProgressBar from '../../components/LinearProgressBar';
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
  espacos: EspacoDeMagiaAtivo[];
  espacosGastosPorCirculo: Record<number, number>;
  onGastarSlotCirculo: (circulo: number) => boolean;
  estiloDeLuta: EstiloDeLuta | null;
  nivel: number;
  usosFolegoMaximo: number;
  usosFolegoRestantes: number;
  onUsarUsoFolego: () => boolean;
  conjura: boolean;
  truques: Magia[];
  magiasPreparadasAcao: Magia[];
  magiasPreparadasReacao: Magia[];
  modAcertoConjuracao: number | null;
  numAtaques: number;
  indomavelMaximo: number;
  indomavelRestantes: number;
  onUsarIndomavel: () => boolean;
  surtoMaximo: number;
  surtoRestantes: number;
  surtoUsadoTurno: boolean;
  onUsarSurto: () => boolean;
  mestreTatico: CaracteristicaNivel | null;
  ataquesEstudados: CaracteristicaNivel | null;
  ajusteTatico: CaracteristicaNivel | null;
  ataqueAtual: AtaqueResolvido | null;
  ataqueBonus: AtaqueResolvido | null;
  usosInspiracaoMaximo: number;
  usosInspiracaoRestantes: number;
  tamanhoDadoInspiracao: number;
  fonteDeInspiracao: boolean;
  onUsarInspiracao: () => boolean;
  onRecuperarInspiracaoComEspaco: () => boolean;
  contraEncantamentoDisponivel: boolean;
  palavrasDeInterrupcaoDisponivel: boolean;
  iniciativaMod: number | null;
  onRolarIniciativa?: () => void;
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
  espacos,
  espacosGastosPorCirculo,
  onGastarSlotCirculo,
  estiloDeLuta,
  nivel,
  usosFolegoMaximo,
  usosFolegoRestantes,
  onUsarUsoFolego,
  conjura,
  truques,
  magiasPreparadasAcao,
  magiasPreparadasReacao,
  modAcertoConjuracao,
  numAtaques,
  indomavelMaximo,
  indomavelRestantes,
  onUsarIndomavel,
  surtoMaximo,
  surtoRestantes,
  surtoUsadoTurno,
  onUsarSurto,
  mestreTatico,
  ataquesEstudados,
  ajusteTatico,
  ataqueAtual,
  ataqueBonus,
  usosInspiracaoMaximo,
  usosInspiracaoRestantes,
  tamanhoDadoInspiracao,
  fonteDeInspiracao,
  onUsarInspiracao,
  onRecuperarInspiracaoComEspaco,
  contraEncantamentoDisponivel,
  palavrasDeInterrupcaoDisponivel,
  iniciativaMod,
  onRolarIniciativa,
}: CombatTabProps) {
  const [painelAberto, setPainelAberto] = useState<RecursoTurno | null>(null);
  const [detalhesAtivo, setDetalhesAtivo] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [danoPendente, setDanoPendente] = useState<DanoPendente | null>(null);
  const [ataquesFeitos, setAtaquesFeitos] = useState(0);
  const [iniciativaValor, setIniciativaValor] = useState<number | null>(null);
  const { rolarD20, rolarDados } = useRoll();

  function alternarIniciativa() {
    if (iniciativaValor !== null) {
      setIniciativaValor(null);
      return;
    }
    if (iniciativaMod === null) return;
    rolarD20({
      label: 'Iniciativa',
      formula: `1d20 + ${iniciativaMod}`,
      mod: iniciativaMod,
      onResultado: (total) => setIniciativaValor(total),
    });
    onRolarIniciativa?.();
  }

  function fimDoTurno() {
    onFimDoTurno();
    setFeedback(null);
    setDanoPendente(null);
    setAtaquesFeitos(0);
  }

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

  function usarRecuperarFolego() {
    if (!onUsarUsoFolego()) return;
    rolarDados({
      label: 'Recuperar Fôlego (cura)',
      formula: `1d10 + ${nivel}`,
      quantidade: 1,
      lados: 10,
      mod: nivel,
      onResultado: (total) => onAlterarPv(total),
    });
    onMarcarUsado('bonus');
    setPainelAberto(null);
    setFeedback('🩹 Recuperar Fôlego — cura aplicada ao seu PV automaticamente.');
  }

  function usarInspiracaoBardo() {
    if (!onUsarInspiracao()) return;
    onMarcarUsado('bonus');
    setPainelAberto(null);
    setFeedback(
      `🎵 Inspiração de Bardo — conceda 1 dado de Inspiração (d${tamanhoDadoInspiracao}) pra uma criatura que veja/ouça você a até 18m. Ela pode somar o dado a 1 D20 que falhar, dentro de 1h.`,
    );
  }

  function recuperarInspiracaoComEspaco() {
    if (!onRecuperarInspiracaoComEspaco()) return;
    setFeedback('🎵 Inspiração de Bardo — 1 uso recuperado gastando 1 Espaço de Magia (sem ação necessária).');
  }

  function usarAtaqueMaoSecundaria() {
    if (!ataqueBonus) return;
    rolarD20({
      label: `Ataque — ${ataqueBonus.nome} (Mão Secundária)`,
      formula: `1d20 + ${ataqueBonus.info.modAcerto}`,
      mod: ataqueBonus.info.modAcerto,
    });
    onMarcarUsado('bonus');
    setPainelAberto(null);
    setFeedback(`🗡 ${ataqueBonus.nome} (Mão Secundária) — ${ataqueBonus.descricao} Toque "Rolar Dano" pra ver o dano.`);
    setDanoPendente({
      label: `Dano — ${ataqueBonus.nome} (Mão Secundária)`,
      quantidade: ataqueBonus.info.danoQuantidade,
      lados: ataqueBonus.info.danoLados,
      mod: ataqueBonus.info.danoMod,
    });
  }

  function usarMenteTatica() {
    if (!onUsarUsoFolego()) return;
    rolarDados({ label: 'Mente Tática', formula: '1d10', quantidade: 1, lados: 10, mod: 0 });
    setFeedback('🧠 Mente Tática — some o resultado ao teste de atributo que falhou.');
  }

  function usarIndomavel() {
    if (!onUsarIndomavel()) return;
    rolarD20({ label: 'Indomável (nova salvaguarda)', formula: `1d20 + ${nivel}`, mod: nivel });
    setFeedback('🛡️ Indomável — use esse resultado como sua nova salvaguarda.');
  }

  function registrarAtaque(nome: string, desc: string, dano: DanoPendente) {
    const proximo = ataquesFeitos + 1;
    setAtaquesFeitos(proximo);
    setFeedback(`${nome} — ${desc}`);
    setDanoPendente(dano);
    if (proximo >= numAtaques) {
      onMarcarUsado('acao');
      setPainelAberto(null);
    }
  }

  function usarSurtoDeAcao() {
    if (!onUsarSurto()) return;
    setFeedback('💥 Surto de Ação — você ganhou uma ação extra nesse turno (a Ação normal continua disponível).');
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

  const temEspacoDisponivel = espacos.some((e) => (espacosGastosPorCirculo[e.circulo] ?? 0) < e.maximo);
  // `espacos` já vem ordenado por círculo crescente (espacosDeMagiaAtivos,
  // core/magiasPersonagem.ts) — o primeiro com sobra é exatamente o que
  // `gastarQualquerSlot` (FichaShell.tsx) vai gastar de verdade.
  const proximoCirculoParaGastar = espacos.find((e) => (espacosGastosPorCirculo[e.circulo] ?? 0) < e.maximo)?.circulo ?? null;

  function ladoDoPainel(categoria: RecursoTurno): 'left' | 'right' | 'bottom' {
    if (categoria === 'acao') return 'left';
    if (categoria === 'bonus') return 'right';
    return 'bottom';
  }

  return (
    <>
      <div className={styles.splitBtns}>
        <div
          className={`${styles.splitBtn} ${styles.splitBtnIniciativa}`}
          style={iniciativaMod === null ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
          onClick={alternarIniciativa}
        >
          {iniciativaValor === null ? (
            <>
              <div className={styles.sbIcon}>🎲</div>
              <div className={styles.sbLabel}>Iniciativa</div>
            </>
          ) : (
            <>
              <div className={styles.sbIcon} style={{ fontSize: 21 }}>
                {iniciativaValor}
              </div>
              <div className={styles.sbLabel}>Iniciativa</div>
              <div className={styles.sbHint}>(Aperte novamente para terminar o combate)</div>
            </>
          )}
        </div>
        <div className={`${styles.splitBtn} ${styles.splitBtnFimTurno}`} onClick={fimDoTurno}>
          <div className={styles.sbIcon}>↻</div>
          <div className={styles.sbLabel}>Fim do Turno</div>
          <div className={styles.sbState}>restaura os 3 botões</div>
        </div>
      </div>

      <div className={`box-solid ${styles.hpLive}`}>
        <div className={styles.hpHeader}>
          <div className="label">Pontos de Vida</div>
          <div className={styles.hpNum}>
            {pvAtual} / {pvMax}
          </div>
        </div>
        <LinearProgressBar valor={pvAtual} maximo={pvMax} />
      </div>
      <div className={styles.hpBtnRow}>
        <div className={styles.hpBtnSmall} onClick={() => onAlterarPv(-5)}>
          −5
        </div>
        <div className={styles.hpBtnSmall} onClick={() => onAlterarPv(-1)}>
          −1
        </div>
        <div className={`${styles.hpBtnSmall} ${styles.hpBtnManual}`}>
          Manual <span className="tag">[PH]</span>
        </div>
        <div className={styles.hpBtnSmall} onClick={() => onAlterarPv(1)}>
          +1
        </div>
        <div className={styles.hpBtnSmall} onClick={() => onAlterarPv(5)}>
          +5
        </div>
      </div>

      {(estiloDeLuta || mestreTatico || ataquesEstudados || ajusteTatico) && (
        <>
          <div className="section-title">Características</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            {estiloDeLuta && <InfoChip nome={estiloDeLuta.nome} descricao={estiloDeLuta.beneficios} />}
            {ajusteTatico && <InfoChip nome={ajusteTatico.nome} descricao={ajusteTatico.descricao} />}
            {mestreTatico && <InfoChip nome={mestreTatico.nome} descricao={mestreTatico.descricao} />}
            {ataquesEstudados && <InfoChip nome={ataquesEstudados.nome} descricao={ataquesEstudados.descricao} />}
          </div>
        </>
      )}

      {indomavelMaximo > 0 && (
        <>
          <div className="section-title">Indomável</div>
          <div
            className="box"
            style={{
              padding: 12,
              marginBottom: 12,
              cursor: indomavelRestantes > 0 ? 'pointer' : 'default',
              opacity: indomavelRestantes > 0 ? 1 : 0.5,
            }}
            onClick={indomavelRestantes > 0 ? usarIndomavel : undefined}
          >
            <div style={{ fontSize: 13 }}>🛡️ Ao falhar uma salvaguarda, toque aqui</div>
            <div className="label" style={{ marginTop: 2 }}>
              Rola de novo somando seu nível de Guerreiro ({indomavelRestantes}/{indomavelMaximo} usos — só recupera
              no Descanso Longo).
            </div>
          </div>
        </>
      )}

      {usosFolegoMaximo > 0 && (
        <>
          <div className="section-title">Mente Tática</div>
          <div
            className="box"
            style={{
              padding: 12,
              cursor: usosFolegoRestantes > 0 ? 'pointer' : 'default',
              opacity: usosFolegoRestantes > 0 ? 1 : 0.5,
            }}
            onClick={usosFolegoRestantes > 0 ? usarMenteTatica : undefined}
          >
            <div style={{ fontSize: 13 }}>🧠 Ao falhar um teste de atributo, toque aqui</div>
            <div className="label" style={{ marginTop: 2 }}>
              Gasta 1 uso de Recuperar Fôlego, joga 1d10 e soma ao teste ({usosFolegoRestantes}/{usosFolegoMaximo}{' '}
              usos — banco compartilhado com Recuperar Fôlego).
            </div>
          </div>
        </>
      )}

      <div className="section-title">Ação · Ação Bônus · Reação — estado do turno</div>
      <div className={styles.splitBtns}>
        {(['acao', 'bonus'] as RecursoTurno[]).map((categoria) => (
          <div
            key={categoria}
            className={`${styles.splitBtn} ${styles[`splitBtn${categoria === 'acao' ? 'Acao' : 'Bonus'}`]} ${
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
        className={`${styles.splitBtnSmall} ${styles.splitBtnReacao} ${turnState.reacao === 'usada' ? styles.splitBtnUsada : ''}`}
        onClick={() => abrirPainel('reacao')}
      >
        <div className={styles.sbIcon}>{LABELS.reacao.icone}</div>
        <div className={styles.sbLabel}>{LABELS.reacao.nome}</div>
        <div className={styles.sbState}>{turnState.reacao === 'usada' ? 'usada' : 'ativo'}</div>
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
        title={painelAberto ? `${LABELS[painelAberto].icone} ${LABELS[painelAberto].nome}` : ''}
        onClose={fecharPainel}
        detalhesAtivo={detalhesAtivo}
        onToggleDetalhes={() => setDetalhesAtivo((v) => !v)}
      >
        {painelAberto === 'acao' && (
          <AcaoPanelContent
            onEscolher={(nome, desc, dano) => escolherNoPainel('acao', nome, desc, dano)}
            onAtacar={registrarAtaque}
            gastarSlotCirculo={onGastarSlotCirculo}
            espacos={espacos}
            espacosGastosPorCirculo={espacosGastosPorCirculo}
            conjura={conjura}
            truques={truques}
            magiasPreparadas={magiasPreparadasAcao}
            modAcertoConjuracao={modAcertoConjuracao}
            numAtaques={numAtaques}
            ataquesFeitos={ataquesFeitos}
            surtoMax={surtoMaximo}
            surtoRestantes={surtoRestantes}
            surtoUsadoTurno={surtoUsadoTurno}
            onUsarSurto={usarSurtoDeAcao}
            ataqueAtual={ataqueAtual}
            detalhesAtivo={detalhesAtivo}
          />
        )}
        {painelAberto === 'bonus' && (
          <BonusPanelContent
            usosFolegoMaximo={usosFolegoMaximo}
            usosFolegoRestantes={usosFolegoRestantes}
            onUsarRecuperarFolego={usarRecuperarFolego}
            ataqueBonus={ataqueBonus}
            onUsarAtaqueBonus={usarAtaqueMaoSecundaria}
            usosInspiracaoMaximo={usosInspiracaoMaximo}
            usosInspiracaoRestantes={usosInspiracaoRestantes}
            tamanhoDadoInspiracao={tamanhoDadoInspiracao}
            fonteDeInspiracao={fonteDeInspiracao}
            temEspacoDisponivel={temEspacoDisponivel}
            proximoCirculoParaGastar={proximoCirculoParaGastar}
            onUsarInspiracao={usarInspiracaoBardo}
            onRecuperarInspiracaoComEspaco={recuperarInspiracaoComEspaco}
            detalhesAtivo={detalhesAtivo}
          />
        )}
        {painelAberto === 'reacao' && (
          <ReacaoPanelContent
            onEscolher={(nome, desc) => escolherNoPainel('reacao', nome, desc)}
            gastarSlotCirculo={onGastarSlotCirculo}
            conjura={conjura}
            magiasReacao={magiasPreparadasReacao}
            modAcertoConjuracao={modAcertoConjuracao}
            detalhesAtivo={detalhesAtivo}
            contraEncantamentoDisponivel={contraEncantamentoDisponivel}
            palavrasDeInterrupcaoDisponivel={palavrasDeInterrupcaoDisponivel}
            usosInspiracaoMaximo={usosInspiracaoMaximo}
            usosInspiracaoRestantes={usosInspiracaoRestantes}
            tamanhoDadoInspiracao={tamanhoDadoInspiracao}
            onUsarInspiracao={onUsarInspiracao}
          />
        )}
      </SidePanel>
    </>
  );
}
