import { cargaExemplo, itensEquipadosExemplo } from '../../../data/exampleSheet';
import styles from './MochilaTab.module.css';

export default function MochilaTab() {
  const percentual = Math.min(100, Math.round((cargaExemplo.atual / cargaExemplo.maxima) * 100));

  return (
    <>
      <div className="section-title">Carga</div>
      <div className={`box ${styles.cargaBox}`}>
        <div className={styles.cargaRow}>
          <span>{cargaExemplo.atual.toString().replace('.', ',')} kg carregados</span>
          <span>máx. {cargaExemplo.maxima} kg</span>
        </div>
        <div className={styles.weightBarOuter}>
          <div className={styles.weightBarInner} style={{ width: `${percentual}%` }} />
        </div>
      </div>

      <div className="section-title">Equipado (kit da classe)</div>
      {itensEquipadosExemplo.map((it) => (
        <div key={it.nome} className={styles.itemRow}>
          <span className={styles.itemName}>{it.nome}</span>
          <span className={styles.itemWeight}>{it.peso}</span>
        </div>
      ))}

      <div className="section-title">Itens comprados na loja</div>
      <div className="label">nenhum item comprado no wizard ainda vem parar aqui — isso liga o wizard à ficha na Fase 1, quando o salvamento de verdade entrar.</div>

      <div className="box" style={{ textAlign: 'center', padding: 12, marginTop: 12, fontSize: 11, color: 'var(--text-faint)' }}>
        ＋ adicionar item (chega quando o salvamento de personagem existir de verdade)
      </div>
    </>
  );
}
