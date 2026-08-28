import { useState } from 'react';
import { acoesBase, type AtaqueInfo } from '../../../data/exampleCombat';
import type { Magia } from '../../../data/rulesets/dnd2024/magias';
import type { AtaqueResolvido } from '../../../core/ataque';
import type { EspacoDeMagiaAtivo } from '../../../core/magiasPersonagem';
import { classificarMagia, iconesMagia } from '../../../core/classificarMagia';
import { useRoll } from '../../roll/RollContext';
import MagiaComDescricao from '../../components/MagiaComDescricao';
import styles from './PanelRows.module.css';

export interface DanoPendente {
  label: string;
  quantidade: number;
  lados: number;
  mod: number;
}

interface AcaoPanelContentProps {
  onEscolher: (nome: string, desc: string, dano?: DanoPendente) => void;
  onAtacar: (nome: string, desc: string, dano: DanoPendente) => void;
  gastarSlotCirculo: (circulo: number) => boolean;
  espacos: EspacoDeMagiaAtivo[];
  espacosGastosPorCirculo: Record<number, number>;
  conjura: boolean;
  truques: Magia[];
  magiasPreparadas: Magia[];
  modAcertoConjuracao: number | null;
  numAtaques: number;
  ataquesFeitos: number;
  surtoMax: number;
  surtoRestantes: number;
  surtoUsadoTurno: boolean;
  onUsarSurto: () => void;
  ataqueAtual: AtaqueResolvido | null;
  detalhesAtivo: boolean;
}

export default function AcaoPanelContent({
  onEscolher,
  onAtacar,
  gastarSlotCirculo,
  espacos,
  espacosGastosPorCirculo,
  conjura,
  truques,
  magiasPreparadas,
  modAcertoConjuracao,
  numAtaques,
  ataquesFeitos,
  surtoMax,
  surtoRestantes,
  surtoUsadoTurno,
  onUsarSurto,
  ataqueAtual,
  detalhesAtivo,
}: AcaoPanelContentProps) {
  const [magiaAberta, setMagiaAberta] = useState(false);
  const [avisoSlot, setAvisoSlot] = useState<string | null>(null);
  const { rolarD20 } = useRoll();

  function rolarAtaque(nome: string, ataque: AtaqueInfo, finalizar: (nome: string, desc: string, dano: DanoPendente) => void) {
    rolarD20({
      label: `Ataque — ${nome}`,
      formula: `1d20 + ${ataque.modAcerto}`,
      mod: ataque.modAcerto,
    });
    finalizar(`🗡 ${nome}`, `Rolagem de acerto feita. Toque "Rolar Dano" pra ver o dano ${ataque.danoTipo}.`, {
      label: `Dano — ${nome}`,
      quantidade: ataque.danoQuantidade,
      lados: ataque.danoLados,
      mod: ataque.danoMod,
    });
  }

  function conjurarMagia(m: Magia) {
    if (m.circulo > 0) {
      const ok = gastarSlotCirculo(m.circulo);
      if (!ok) {
        setAvisoSlot(`Sem Espaço de Magia de ${m.circulo}º círculo disponível. Veja a aba Magias pra saber quando recupera.`);
        return;
      }
    }
    setAvisoSlot(null);
    const classificacao = classificarMagia(m);
    if (classificacao.ataque && modAcertoConjuracao !== null) {
      rolarD20({
        label: `Ataque de Magia — ${m.nome}`,
        formula: `1d20 + ${modAcertoConjuracao}`,
        mod: modAcertoConjuracao,
      });
      onEscolher(`✨ ${m.nome}`, 'Rolagem de acerto feita. Veja a descrição da magia (ⓘ) pro dano.');
      return;
    }
    onEscolher(`✨ ${m.nome}`, m.descricaoCurta ?? '');
  }

  const surtoDesabilitado = surtoRestantes <= 0 || surtoUsadoTurno;

  return (
    <>
      {ataqueAtual && (
        <div
          className={styles.row}
          onClick={() => rolarAtaque(`🗡 ${ataqueAtual.nome}`, ataqueAtual.info, onAtacar)}
        >
          <div className={styles.rowName}>
            🗡 Atacar — {ataqueAtual.nome}{' '}
            {numAtaques > 1 ? `(ataque ${Math.min(ataquesFeitos + 1, numAtaques)}/${numAtaques})` : ''}
          </div>
          <div className={styles.rowDesc}>
            {ataqueAtual.descricao}
            {detalhesAtivo && (
              <>
                {' '}
                {numAtaques > 1
                  ? `Ataque Extra: você tem direito a ${numAtaques} ataques nesse turno — toque de novo depois de rolar o dano.`
                  : 'Equipe uma arma na Mochila pra trocar; sem nada na Mão Principal, é Ataque Desarmado.'}
              </>
            )}
          </div>
        </div>
      )}

      {surtoMax > 0 && (
        <div
          className={styles.row}
          style={surtoDesabilitado ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
          onClick={onUsarSurto}
        >
          <div className={styles.rowName}>💥 Surto de Ação</div>
          {detalhesAtivo && (
            <div className={styles.rowDesc}>
              Ganha uma ação extra nesse turno — não gasta sua Ação normal. {surtoRestantes}/{surtoMax} usos
              {surtoUsadoTurno ? ' (já usado nesse turno)' : ''}.
            </div>
          )}
        </div>
      )}

      {conjura && (
        <>
          <div className={styles.row} onClick={() => setMagiaAberta((v) => !v)}>
            <div className={styles.rowName}>✨ Usar Magia {magiaAberta ? '▴' : '▾'}</div>
            {detalhesAtivo && <div className={styles.rowDesc}>Conjurar Truque ou Magia Preparada</div>}
          </div>
          <div className={`${styles.accordionBody} ${magiaAberta ? styles.accordionBodyOpen : ''}`}>
            {espacos.map((e) => {
              const gasto = espacosGastosPorCirculo[e.circulo] ?? 0;
              return (
                <div key={e.circulo} className={styles.slotCounter}>
                  <span>{e.circulo}º círculo:</span>
                  {Array.from({ length: e.maximo }).map((_, i) => (
                    <div key={i} className={`${styles.slotPipLg} ${i < gasto ? styles.slotPipLgGasto : ''}`} />
                  ))}
                  <span style={{ color: 'var(--text-faint)' }}>
                    {e.maximo - gasto}/{e.maximo} disponíveis
                  </span>
                </div>
              );
            })}
            {avisoSlot && (
              <div className="label" style={{ color: 'var(--danger)', marginBottom: 8 }}>
                {avisoSlot}
              </div>
            )}
            {truques.map((m) => (
              <div key={m.id} className={styles.spellMiniRow} onClick={() => conjurarMagia(m)}>
                <span>
                  <MagiaComDescricao magia={m} variante="icone" /> {iconesMagia(m)}
                </span>
                <span className="tag">Truque</span>
              </div>
            ))}
            {magiasPreparadas.map((m) => (
              <div key={m.id} className={styles.spellMiniRow} onClick={() => conjurarMagia(m)}>
                <span>
                  <MagiaComDescricao magia={m} variante="icone" /> {iconesMagia(m)}
                </span>
                <span className="tag">{m.circulo}º círculo</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div
        className={styles.row}
        onClick={() =>
          onEscolher('💨 Desengajar', 'Seu movimento não provoca Ataques de Oportunidade pelo resto do turno.')
        }
      >
        <div className={styles.rowName}>💨 Desengajar</div>
        {detalhesAtivo && (
          <div className={styles.rowDesc}>Seu movimento não provoca Ataques de Oportunidade pelo resto do turno</div>
        )}
      </div>

      {acoesBase.map((a) => (
        <div key={a.nome} className={styles.row} onClick={() => onEscolher(`${a.icone} ${a.nome}`, a.desc)}>
          <div className={styles.rowName}>
            {a.icone} {a.nome}
          </div>
          {detalhesAtivo && <div className={styles.rowDesc}>{a.desc}</div>}
        </div>
      ))}
    </>
  );
}
