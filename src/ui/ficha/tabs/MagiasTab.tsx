import { useState } from 'react';
import type { Classe } from '../../../data/rulesets/dnd2024/classes';
import type { Magia } from '../../../data/rulesets/dnd2024/magias';
import {
  espacosDeMagiaAtivos,
  truquesDoPersonagem,
  magiasPreparadasDoPersonagem,
  circulosDisponiveisParaConjurar,
} from '../../../core/magiasPersonagem';
import { classificarMagia } from '../../../core/classificarMagia';
import MagiaComDescricao from '../../components/MagiaComDescricao';
import TickPips from '../../components/TickPips';
import { useColapsavel } from '../../hooks/useColapsavel';
import { useRoll } from '../../roll/RollContext';
import EscolherCirculoShell from '../combat/EscolherCirculoShell';
import styles from './MagiasTab.module.css';

interface MagiasTabProps {
  classe: Classe | null;
  nivel: number;
  espacosGastosPorCirculo: Record<number, number>;
  onGastarSlotCirculo: (circulo: number) => boolean;
  modAcertoConjuracao: number | null;
  conjura: boolean;
  truquesAtuais: string[];
  magiasPreparadasAtuais: string[];
  /** "Descobertas Mágicas" (Colégio do Conhecimento, nível 6) — 2
   * magias sempre preparadas, mostradas numa seção própria (não se
   * misturam com Magias Preparadas normais). */
  magiasDescobertasMagicasAtuais: string[];
  faltamTruques: number;
  faltamMagiasPreparadas: number;
  onCompletarTruques: () => void;
  onCompletarMagiasPreparadas: () => void;
}

export default function MagiasTab({
  classe,
  nivel,
  espacosGastosPorCirculo,
  onGastarSlotCirculo,
  modAcertoConjuracao,
  conjura,
  truquesAtuais,
  magiasPreparadasAtuais,
  magiasDescobertasMagicasAtuais,
  faltamTruques,
  faltamMagiasPreparadas,
  onCompletarTruques,
  onCompletarMagiasPreparadas,
}: MagiasTabProps) {
  const { rolarD20 } = useRoll();
  const [telaCirculo, setTelaCirculo] = useState<{ magia: Magia; circulos: number[] } | null>(null);

  if (!conjura) {
    return (
      <div className="box" style={{ padding: 14, color: 'var(--text-faint)', fontSize: 12, textAlign: 'center' }}>
        Esse personagem não tem nenhuma fonte de conjuração no momento (nem pela classe, nem por multiclasse).
      </div>
    );
  }

  const espacos = espacosDeMagiaAtivos(classe, nivel);
  const truques = truquesDoPersonagem(truquesAtuais);
  const preparadas = magiasPreparadasDoPersonagem(magiasPreparadasAtuais);
  const descobertasMagicas = magiasPreparadasDoPersonagem(magiasDescobertasMagicasAtuais);
  const [espacosExpandido, setEspacosExpandido] = useColapsavel('espacos-de-magia', true);

  function rolarAtaqueSeForMagiaDeAtaque(m: Magia) {
    if (classificarMagia(m).ataque && modAcertoConjuracao !== null) {
      rolarD20({
        label: `Ataque de Magia — ${m.nome}`,
        formula: `1d20 + ${modAcertoConjuracao}`,
        mod: modAcertoConjuracao,
      });
    }
  }

  function usarMagia(m: Magia) {
    if (m.circulo === 0) {
      rolarAtaqueSeForMagiaDeAtaque(m);
      return;
    }
    const circulosDisponiveis = circulosDisponiveisParaConjurar(m.circulo, espacos, espacosGastosPorCirculo);
    if (circulosDisponiveis.length === 0) return;
    setTelaCirculo({ magia: m, circulos: circulosDisponiveis });
  }

  if (telaCirculo) {
    return (
      <EscolherCirculoShell
        magia={telaCirculo.magia}
        circulosDisponiveis={telaCirculo.circulos}
        espacos={espacos}
        espacosGastosPorCirculo={espacosGastosPorCirculo}
        onVoltar={() => setTelaCirculo(null)}
        onConjurar={(circulo) => {
          const ok = onGastarSlotCirculo(circulo);
          setTelaCirculo(null);
          if (ok) rolarAtaqueSeForMagiaDeAtaque(telaCirculo.magia);
        }}
      />
    );
  }

  const temCurto = espacos.some((e) => e.recuperaNoDescansoCurto);
  const temLongo = espacos.some((e) => !e.recuperaNoDescansoCurto);
  const avisoRecuperacao =
    temCurto && temLongo
      ? 'Recupera no Descanso Curto ou Longo, conforme o círculo.'
      : temCurto
        ? 'Recupera no Descanso Curto.'
        : 'Recupera no Descanso Longo.';

  return (
    <>
      {espacos.length > 0 && (
        <>
          <div className={styles.grupoHeader} onClick={() => setEspacosExpandido(!espacosExpandido)}>
            <span>Espaços de Magia</span>
            <span>{espacosExpandido ? '▾' : '▸'}</span>
          </div>
          {espacosExpandido && (
            <>
              <div className="label" style={{ margin: '0 0 var(--space-2)' }}>
                {avisoRecuperacao}
              </div>
              {espacos.map((espaco, i) => {
                const gasto = espacosGastosPorCirculo[espaco.circulo] ?? 0;
                return (
                  <div key={espaco.circulo} className={styles.espacoRow} style={i === 0 ? { borderTop: 'none' } : undefined}>
                    <span>{espaco.circulo}º círculo</span>
                    <TickPips total={espaco.maximo} usados={gasto} tamanho="lg" />
                  </div>
                );
              })}
            </>
          )}
        </>
      )}

      {(truques.length > 0 || faltamTruques > 0) && (
        <>
          <div className="section-title">Truques</div>
          {faltamTruques > 0 && (
            <div className={styles.avisoFaltando} onClick={onCompletarTruques}>
              ⚠️ Faltam {faltamTruques} truque{faltamTruques > 1 ? 's' : ''} pro seu nível — toque pra escolher
            </div>
          )}
          {truques.map((m) => (
            <div key={m.id} className={styles.spellRow}>
              <div className={styles.spellName}>
                <MagiaComDescricao magia={m} variante="icone" />
              </div>
              <span className={styles.spellCirculo}>Truque</span>
              <div className={styles.usarBtn} onClick={() => usarMagia(m)}>
                Usar
              </div>
            </div>
          ))}
        </>
      )}

      {descobertasMagicas.length > 0 && (
        <>
          <div className="section-title">Descobertas Mágicas</div>
          <div className="label" style={{ marginBottom: 4 }}>
            Colégio do Conhecimento — sempre preparadas, não contam na conta de Magias Preparadas.
          </div>
          {descobertasMagicas.map((m) => {
            const semEspaco = m.circulo > 0 && circulosDisponiveisParaConjurar(m.circulo, espacos, espacosGastosPorCirculo).length === 0;
            return (
              <div key={m.id} className={styles.spellRow}>
                <div className={styles.spellName}>
                  <MagiaComDescricao magia={m} variante="icone" />
                </div>
                <span className={styles.spellCirculo}>{m.circulo === 0 ? 'Truque' : `${m.circulo}º círculo`}</span>
                <div
                  className={`${styles.usarBtn} ${semEspaco ? styles.usarBtnDesabilitado : ''}`}
                  onClick={() => usarMagia(m)}
                >
                  Usar
                </div>
              </div>
            );
          })}
        </>
      )}

      {(preparadas.length > 0 || faltamMagiasPreparadas > 0) && (
        <>
          <div className="section-title">Magias Preparadas</div>
          {faltamMagiasPreparadas > 0 && (
            <div className={styles.avisoFaltando} onClick={onCompletarMagiasPreparadas}>
              ⚠️ Faltam {faltamMagiasPreparadas} magia{faltamMagiasPreparadas > 1 ? 's' : ''} preparada
              {faltamMagiasPreparadas > 1 ? 's' : ''} pro seu nível — toque pra escolher
            </div>
          )}
          {preparadas.map((m) => {
            const semEspaco = circulosDisponiveisParaConjurar(m.circulo, espacos, espacosGastosPorCirculo).length === 0;
            return (
              <div key={m.id} className={styles.spellRow}>
                <div className={styles.spellName}>
                  <MagiaComDescricao magia={m} variante="icone" />
                </div>
                <span className={styles.spellCirculo}>{m.circulo}º círculo</span>
                <div
                  className={`${styles.usarBtn} ${semEspaco ? styles.usarBtnDesabilitado : ''}`}
                  onClick={() => usarMagia(m)}
                >
                  Usar
                </div>
              </div>
            );
          })}
        </>
      )}

      <div className="label" style={{ marginTop: 8 }}>
        Usar aqui gasta o espaço de magia de verdade (com upcast, igual a aba Combat) — útil pra conjurar fora do
        seu turno, no meio da campanha.
      </div>
    </>
  );
}
