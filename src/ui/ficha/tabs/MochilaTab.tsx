import { calcularCargaTotal, type ItemMochila } from '../../../core/mochila';
import styles from './MochilaTab.module.css';

interface MochilaTabProps {
  itens: ItemMochila[];
}

function linhaItem(it: ItemMochila, i: number) {
  return (
    <div key={`${it.nome}-${i}`} className={styles.itemRow}>
      <span className={styles.itemName}>
        {it.quantidade > 1 ? `${it.quantidade}× ` : ''}
        {it.nome}
      </span>
      <span className={styles.itemWeight}>{it.peso ?? '— (sem peso cadastrado)'}</span>
    </div>
  );
}

export default function MochilaTab({ itens }: MochilaTabProps) {
  const carga = calcularCargaTotal(itens);
  const itensOrigem = itens.filter((i) => i.origemDoItem === 'Origem');
  const itensClasse = itens.filter((i) => i.origemDoItem === 'Classe');

  return (
    <>
      <div className="section-title">Carga</div>
      <div className={`box ${styles.cargaBox}`}>
        <div className={styles.cargaRow}>
          <span>{carga.kg.toString().replace('.', ',')} kg carregados</span>
        </div>
      </div>
      {carga.itensSemPeso > 0 && (
        <div className="label" style={{ marginTop: 4 }}>
          {carga.itensSemPeso} {carga.itensSemPeso === 1 ? 'item não entra' : 'itens não entram'} nessa soma —
          sem peso cadastrado na planilha ainda.
        </div>
      )}
      <div className="label" style={{ marginTop: 4 }}>
        Capacidade máxima de carga ainda não é calculada — a fórmula (Força × multiplicador) é uma lacuna de
        dado conhecida, ver <code>CLAUDE.md</code>.
      </div>

      <div className="section-title">Equipado (Origem)</div>
      {itensOrigem.length === 0 && <div className="label">Nenhum item — opção "só ouro" escolhida na Origem.</div>}
      {itensOrigem.map(linhaItem)}

      <div className="section-title">Equipado (Classe)</div>
      {itensClasse.length === 0 && <div className="label">Nenhum item — opção "só ouro" escolhida na Classe.</div>}
      {itensClasse.map(linhaItem)}

      <div className="section-title">Itens comprados na loja</div>
      <div className="label">
        a Loja ainda usa itens de exemplo, não o que você comprou de verdade — liga na próxima entrega (A5).
      </div>
      <div className="box" style={{ textAlign: 'center', padding: 12, marginTop: 12, fontSize: 13, color: 'var(--text-faint)' }}>
        ＋ adicionar item (chega na entrega da Loja)
      </div>
    </>
  );
}
