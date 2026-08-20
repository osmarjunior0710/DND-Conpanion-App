import { lojaItensFixture } from '../../../data/wizardFixtures';
import type { StepProps } from './StepProps';

export default function LojaStep({ selection, update }: StepProps) {
  function addItem(nome: string) {
    update({ itens: [...selection.itens, nome] });
  }

  return (
    <>
      <div className="box-solid" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', marginBottom: 10 }}>
        <span className="label">ouro disponível</span>
        <span>85 PO</span>
      </div>
      <div className="section-title">Itens à venda</div>
      {lojaItensFixture.map((it) => (
        <div
          key={it.nome}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '9px 4px',
            borderBottom: '1px dashed var(--line-soft)',
          }}
        >
          <div>
            <div style={{ fontSize: 12 }}>{it.nome}</div>
            <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>{it.preco}</div>
          </div>
          <div
            style={{
              width: 26,
              height: 26,
              border: '1px solid var(--line)',
              borderRadius: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              cursor: 'pointer',
            }}
            onClick={() => addItem(it.nome)}
          >
            ＋
          </div>
        </div>
      ))}
      <div className="section-title">Carrinho ({selection.itens.length})</div>
      {selection.itens.length === 0 ? (
        <div className="label">nada adicionado ainda</div>
      ) : (
        selection.itens.map((i, idx) => (
          <div className="summary-row" key={`${i}-${idx}`}>
            <span>{i}</span>
            <span>—</span>
          </div>
        ))
      )}
    </>
  );
}
