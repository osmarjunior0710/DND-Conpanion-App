import { useState } from 'react';
import type { ExplicacaoCalculo } from '../../../core/calculoPersonagem';
import { buscarDescricaoItem } from '../../../data/rulesets/dnd2024/buscarDescricaoItem';
import { calcularCargaTotal, pesoDaLinha, type ItemMochila } from '../../../core/mochila';
import ItemComDescricao from '../../components/ItemComDescricao';
import InfoValor from '../../components/InfoValor';
import { corDaCarga } from '../../utils/corCarga';
import styles from './MochilaTab.module.css';

interface MochilaTabProps {
  itens: ItemMochila[];
  itensDetalhados: boolean;
  pesoAtivo: boolean;
  capacidadeMaxima: number | null;
  explicacaoCapacidadeMaxima: ExplicacaoCalculo;
  onAlterarQuantidade: (id: string, delta: number) => void;
  onRemoverItem: (id: string) => void;
  onAdicionarItem: (nome: string, quantidade: number) => void;
}

function Linha({
  item,
  itensDetalhados,
  pesoAtivo,
  onAlterarQuantidade,
  onRemoverItem,
}: {
  item: ItemMochila;
  itensDetalhados: boolean;
  pesoAtivo: boolean;
  onAlterarQuantidade: (id: string, delta: number) => void;
  onRemoverItem: (id: string) => void;
}) {
  const descricao = buscarDescricaoItem(item.nome);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);

  function tocarTrash() {
    if (confirmandoRemocao) {
      onRemoverItem(item.id);
      return;
    }
    setConfirmandoRemocao(true);
    setTimeout(() => setConfirmandoRemocao(false), 3000);
  }

  return (
    <div className={styles.itemRow}>
      <div className={styles.itemTop}>
        <span className={styles.itemName}>
          {itensDetalhados ? (
            item.nome
          ) : (
            <ItemComDescricao nome={item.nome} descricao={descricao} rotulo={item.nome} variante="icone" />
          )}
        </span>
        <span
          className={`${styles.trashBtn} ${confirmandoRemocao ? styles.trashBtnConfirmando : ''}`}
          onClick={tocarTrash}
        >
          {confirmandoRemocao ? 'confirmar 🗑' : '🗑'}
        </span>
      </div>
      {itensDetalhados && descricao && <div className={styles.itemDesc}>{descricao}</div>}
      <div className={styles.itemBottom}>
        {pesoAtivo ? <span className={styles.itemWeight}>{pesoDaLinha(item)}</span> : <span />}
        <div className={styles.stepperRow}>
          <button
            type="button"
            className={styles.stepperBtn}
            disabled={item.quantidade === 0}
            onClick={() => onAlterarQuantidade(item.id, -1)}
          >
            −
          </button>
          <span className={styles.stepperQtd}>{item.quantidade}</span>
          <button type="button" className={styles.stepperBtn} onClick={() => onAlterarQuantidade(item.id, 1)}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function AdicionarItem({ onAdicionarItem }: { onAdicionarItem: (nome: string, quantidade: number) => void }) {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  function confirmar() {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return;
    onAdicionarItem(nomeLimpo, quantidade);
    setNome('');
    setQuantidade(1);
  }

  return (
    <div className={`box ${styles.addBox}`}>
      <div className="label" style={{ marginBottom: 6 }}>
        ganhou ou achou um item? adiciona aqui
      </div>
      <div className={styles.addRow}>
        <input
          className={styles.addInput}
          placeholder="nome do item..."
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <div className={styles.stepperRow}>
          <button type="button" className={styles.stepperBtn} onClick={() => setQuantidade((v) => Math.max(1, v - 1))}>
            −
          </button>
          <span className={styles.stepperQtd}>{quantidade}</span>
          <button type="button" className={styles.stepperBtn} onClick={() => setQuantidade((v) => v + 1)}>
            +
          </button>
        </div>
      </div>
      <div className="btn btn-primary" style={{ marginTop: 8, textAlign: 'center' }} onClick={confirmar}>
        + Adicionar item
      </div>
    </div>
  );
}

export default function MochilaTab({
  itens,
  itensDetalhados,
  pesoAtivo,
  capacidadeMaxima,
  explicacaoCapacidadeMaxima,
  onAlterarQuantidade,
  onRemoverItem,
  onAdicionarItem,
}: MochilaTabProps) {
  const carga = calcularCargaTotal(itens);
  const percentual = capacidadeMaxima ? Math.round((carga.kg / capacidadeMaxima) * 100) : 0;
  const sobrecarregado = capacidadeMaxima !== null && carga.kg > capacidadeMaxima;

  return (
    <>
      {pesoAtivo && (
        <>
          <div className="section-title">Carga</div>
          <div className={`box ${styles.cargaBox}`}>
            <div className={styles.cargaRow}>
              <span>{carga.kg.toString().replace('.', ',')} kg carregados</span>
              <span>
                máx. {capacidadeMaxima ?? '—'} kg
                <InfoValor titulo="Capacidade máxima de carga" explicacao={explicacaoCapacidadeMaxima} />
              </span>
            </div>
            <div className={styles.weightBarOuter}>
              <div
                className={styles.weightBarInner}
                style={{ width: `${Math.min(100, percentual)}%`, background: corDaCarga(percentual) }}
              />
            </div>
          </div>
          {sobrecarregado && (
            <div className="label" style={{ marginTop: 4, color: 'var(--danger)' }}>
              Carga acima da capacidade máxima.
            </div>
          )}
          {carga.itensSemPeso > 0 && (
            <div className="label" style={{ marginTop: 4 }}>
              {carga.itensSemPeso} {carga.itensSemPeso === 1 ? 'item não entra' : 'itens não entram'} nessa soma —
              sem peso cadastrado na planilha ainda.
            </div>
          )}
        </>
      )}

      <div className="section-title">Itens</div>
      {itens.length === 0 && <div className="label">Mochila vazia.</div>}
      {itens.map((it) => (
        <Linha
          key={it.id}
          item={it}
          itensDetalhados={itensDetalhados}
          pesoAtivo={pesoAtivo}
          onAlterarQuantidade={onAlterarQuantidade}
          onRemoverItem={onRemoverItem}
        />
      ))}

      <AdicionarItem onAdicionarItem={onAdicionarItem} />
    </>
  );
}
