import { espacosMagiaExemplo, magiasExemplo } from '../../../data/exampleCombat';
import styles from './MagiasTab.module.css';

interface MagiasTabProps {
  espacosGastos: number;
  conjura: boolean;
}

export default function MagiasTab({ espacosGastos, conjura }: MagiasTabProps) {
  const truques = magiasExemplo.filter((m) => m.circulo === 0);
  const preparadas = magiasExemplo.filter((m) => m.circulo > 0);

  if (!conjura) {
    return (
      <div className="box" style={{ padding: 14, color: 'var(--text-faint)', fontSize: 13, textAlign: 'center' }}>
        Esse personagem não tem nenhuma fonte de conjuração no momento (nem pela classe, nem por multiclasse).
      </div>
    );
  }

  return (
    <>
      <div className="label" style={{ marginBottom: 8, color: 'var(--warn)' }}>
        [PH] tudo nesta aba ainda é fixture de exemplo — nenhuma classe conjuradora foi importada ainda, então isso
        não reflete a magia real do personagem.
      </div>

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
            <div className={styles.spellName}>[PH] {m.nome}</div>
            <div className={styles.spellDesc}>{m.descricao}</div>
          </div>
          <span className="label">{m.tipo}</span>
        </div>
      ))}

      <div className="section-title">1º Círculo — preparadas</div>
      {preparadas.map((m) => (
        <div key={m.nome} className={styles.spellRow}>
          <div>
            <div className={styles.spellName}>[PH] {m.nome}</div>
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
