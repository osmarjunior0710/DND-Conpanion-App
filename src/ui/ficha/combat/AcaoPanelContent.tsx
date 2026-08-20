import { useState } from 'react';
import { acoesBase, magiasExemplo, type MagiaExemplo } from '../../../data/exampleCombat';
import styles from './PanelRows.module.css';

interface AcaoPanelContentProps {
  onEscolher: (nome: string, desc: string) => void;
  gastarSlot: () => boolean;
  espacosGastos: number;
  espacosMaximo: number;
}

export default function AcaoPanelContent({ onEscolher, gastarSlot, espacosGastos, espacosMaximo }: AcaoPanelContentProps) {
  const [magiaAberta, setMagiaAberta] = useState(false);
  const [avisoSlot, setAvisoSlot] = useState<string | null>(null);

  function escolherMagia(m: MagiaExemplo) {
    if (m.circulo > 0) {
      const ok = gastarSlot();
      if (!ok) {
        setAvisoSlot('Sem Espaços de Magia disponíveis. Faça um Descanso Curto pra recuperar.');
        return;
      }
    }
    setAvisoSlot(null);
    onEscolher(`✨ ${m.nome}`, m.descricao);
  }

  return (
    <>
      <div className={styles.row} onClick={() => onEscolher('🗡 Atacar', 'Ataca com arma ou Ataque Desarmado.')}>
        <div className={styles.rowName}>🗡 Atacar</div>
        <div className={styles.rowDesc}>Ataca com arma ou Ataque Desarmado</div>
      </div>

      <div className={styles.row} onClick={() => setMagiaAberta((v) => !v)}>
        <div className={styles.rowName}>✨ Usar Magia {magiaAberta ? '▴' : '▾'}</div>
        <div className={styles.rowDesc}>Conjurar magia, usar item mágico ou característica mágica</div>
      </div>
      <div className={`${styles.accordionBody} ${magiaAberta ? styles.accordionBodyOpen : ''}`}>
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
            <span>{m.nome}</span>
            <span className="tag">{m.tipo}</span>
          </div>
        ))}
      </div>

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
