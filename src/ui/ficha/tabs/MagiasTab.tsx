import { espacosMagiaExemplo, magiasExemplo } from '../../../data/exampleCombat';
import styles from './MagiasTab.module.css';

interface MagiasTabProps {
  espacosGastos: number;
}

export default function MagiasTab({ espacosGastos }: MagiasTabProps) {
  const truques = magiasExemplo.filter((m) => m.circulo === 0);
  const preparadas = magiasExemplo.filter((m) => m.circulo > 0);

  return (
    <>
      <div className="section-title">Espaços de Magia</div>
      <div className="label">1º círculo</div>
      <div className={styles.slotRow}>
        {Array.from({ length: espacosMagiaExemplo.maximo }).map((_, i) => (
          <div key={i} className={`${styles.slotPip} ${i < espacosGastos ? styles.slotPipGasto : ''}`}>
            {i < espacosGastos ? '✓' : '①'}
          </div>
        ))}
      </div>
      <div className="label" style={{ marginBottom: 12 }}>
        {espacosMagiaExemplo.maximo - espacosGastos}/{espacosMagiaExemplo.maximo} disponíveis — Magia de Pacto do
        Bruxo recupera no Descanso Curto (não só no Longo).
      </div>

      <div className="section-title">Truques</div>
      {truques.map((m) => (
        <div key={m.nome} className={styles.spellRow}>
          <div>
            <div className={styles.spellName}>{m.nome}</div>
            <div className={styles.spellDesc}>{m.descricao}</div>
          </div>
          <span className="label">{m.tipo}</span>
        </div>
      ))}

      <div className="section-title">1º Círculo — preparadas</div>
      {preparadas.map((m) => (
        <div key={m.nome} className={styles.spellRow}>
          <div>
            <div className={styles.spellName}>{m.nome}</div>
            <div className={styles.spellDesc}>{m.descricao}</div>
          </div>
          <span className="label">{m.tipo}</span>
        </div>
      ))}

      <div className="label" style={{ marginTop: 8 }}>
        Conjurar de verdade (gastar espaço, rolar ataque/dano) acontece pela aba Combat, dentro do painel de Ação.
      </div>
    </>
  );
}
