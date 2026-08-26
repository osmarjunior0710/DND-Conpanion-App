import { useState } from 'react';
import { acoesBase, ataqueArmaExemplo, magiasExemplo, type AtaqueInfo, type MagiaExemplo } from '../../../data/exampleCombat';
import { useRoll } from '../../roll/RollContext';
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
  gastarSlot: () => boolean;
  espacosGastos: number;
  espacosMaximo: number;
  conjura: boolean;
  numAtaques: number;
  ataquesFeitos: number;
  surtoMax: number;
  surtoRestantes: number;
  surtoUsadoTurno: boolean;
  onUsarSurto: () => void;
}

export default function AcaoPanelContent({
  onEscolher,
  onAtacar,
  gastarSlot,
  espacosGastos,
  espacosMaximo,
  conjura,
  numAtaques,
  ataquesFeitos,
  surtoMax,
  surtoRestantes,
  surtoUsadoTurno,
  onUsarSurto,
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

  function escolherMagia(m: MagiaExemplo) {
    if (m.circulo > 0) {
      const ok = gastarSlot();
      if (!ok) {
        setAvisoSlot('Sem Espaços de Magia disponíveis. Faça um Descanso Curto pra recuperar.');
        return;
      }
    }
    setAvisoSlot(null);
    if (m.ataque) {
      rolarAtaque(`[PH] ${m.nome}`, m.ataque, onEscolher);
      return;
    }
    onEscolher(`[PH] ✨ ${m.nome}`, m.descricao);
  }

  const surtoDesabilitado = surtoRestantes <= 0 || surtoUsadoTurno;

  return (
    <>
      <div className={styles.row} onClick={() => rolarAtaque('[PH] Atacar (Adaga)', ataqueArmaExemplo, onAtacar)}>
        <div className={styles.rowName}>
          🗡 Atacar {numAtaques > 1 ? `(ataque ${Math.min(ataquesFeitos + 1, numAtaques)}/${numAtaques})` : ''}
        </div>
        <div className={styles.rowDesc}>
          [PH] valores de exemplo (Adaga +4 / 1d4+3) — ainda não usa a arma equipada de verdade.{' '}
          {numAtaques > 1
            ? `Ataque Extra: você tem direito a ${numAtaques} ataques nesse turno — toque de novo depois de rolar o dano.`
            : 'Ataca com arma ou Ataque Desarmado.'}
        </div>
      </div>

      {surtoMax > 0 && (
        <div
          className={styles.row}
          style={surtoDesabilitado ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
          onClick={onUsarSurto}
        >
          <div className={styles.rowName}>💥 Surto de Ação</div>
          <div className={styles.rowDesc}>
            Ganha uma ação extra nesse turno — não gasta sua Ação normal. {surtoRestantes}/{surtoMax} usos
            {surtoUsadoTurno ? ' (já usado nesse turno)' : ''}.
          </div>
        </div>
      )}

      {conjura && (
        <>
          <div className={styles.row} onClick={() => setMagiaAberta((v) => !v)}>
            <div className={styles.rowName}>✨ Usar Magia {magiaAberta ? '▴' : '▾'}</div>
            <div className={styles.rowDesc}>Conjurar magia, usar item mágico ou característica mágica</div>
          </div>
          <div className={`${styles.accordionBody} ${magiaAberta ? styles.accordionBodyOpen : ''}`}>
            <div className="label" style={{ marginBottom: 6 }}>
              [PH] lista de magias/espaços abaixo é fixture de exemplo — ainda não é a lista real da classe
              conjuradora do personagem.
            </div>
            <div className={styles.slotCounter}>
              <span>1º círculo:</span>
              {Array.from({ length: espacosMaximo }).map((_, i) => (
                <div key={i} className={`${styles.slotPipLg} ${i < espacosGastos ? styles.slotPipLgGasto : ''}`} />
              ))}
              <span style={{ color: 'var(--text-faint)' }}>
                {espacosMaximo - espacosGastos}/{espacosMaximo} disponíveis
              </span>
            </div>
            {avisoSlot && (
              <div className="label" style={{ color: 'var(--warn)', marginBottom: 8 }}>
                {avisoSlot}
              </div>
            )}
            {magiasExemplo.map((m) => (
              <div key={m.nome} className={styles.spellMiniRow} onClick={() => escolherMagia(m)}>
                <span>[PH] {m.nome}</span>
                <span className="tag">{m.tipo}</span>
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
        <div className={styles.rowDesc}>Seu movimento não provoca Ataques de Oportunidade pelo resto do turno</div>
      </div>

      {acoesBase.map((a) => (
        <div key={a.nome} className={styles.row} onClick={() => onEscolher(`${a.icone} ${a.nome}`, a.desc)}>
          <div className={styles.rowName}>
            {a.icone} {a.nome}
          </div>
          <div className={styles.rowDesc}>{a.desc}</div>
        </div>
      ))}
    </>
  );
}
