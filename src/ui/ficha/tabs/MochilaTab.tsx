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
}

function Linha({ item, itensDetalhados, pesoAtivo }: { item: ItemMochila; itensDetalhados: boolean; pesoAtivo: boolean }) {
  const descricao = buscarDescricaoItem(item.nome);
  const rotulo = item.quantidade > 1 ? `${item.quantidade}× ${item.nome}` : item.nome;

  return (
    <div className={styles.itemRow}>
      <div className={styles.itemInfo}>
        <span className={styles.itemName}>
          {itensDetalhados ? (
            rotulo
          ) : (
            <ItemComDescricao nome={item.nome} descricao={descricao} rotulo={rotulo} variante="icone" />
          )}
        </span>
        {itensDetalhados && descricao && <div className={styles.itemDesc}>{descricao}</div>}
      </div>
      {pesoAtivo && <span className={styles.itemWeight}>{pesoDaLinha(item)}</span>}
    </div>
  );
}

export default function MochilaTab({ itens, itensDetalhados, pesoAtivo, capacidadeMaxima, explicacaoCapacidadeMaxima }: MochilaTabProps) {
  const carga = calcularCargaTotal(itens);
  const itensOrigem = itens.filter((i) => i.origemDoItem === 'Origem');
  const itensClasse = itens.filter((i) => i.origemDoItem === 'Classe');
  const itensLoja = itens.filter((i) => i.origemDoItem === 'Loja');
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

      <div className="section-title">Equipado (Origem)</div>
      {itensOrigem.length === 0 && <div className="label">Nenhum item — opção "só ouro" escolhida na Origem.</div>}
      {itensOrigem.map((it, i) => (
        <Linha key={`${it.nome}-${i}`} item={it} itensDetalhados={itensDetalhados} pesoAtivo={pesoAtivo} />
      ))}

      <div className="section-title">Equipado (Classe)</div>
      {itensClasse.length === 0 && <div className="label">Nenhum item — opção "só ouro" escolhida na Classe.</div>}
      {itensClasse.map((it, i) => (
        <Linha key={`${it.nome}-${i}`} item={it} itensDetalhados={itensDetalhados} pesoAtivo={pesoAtivo} />
      ))}

      <div className="section-title">Itens comprados na loja</div>
      {itensLoja.length === 0 && <div className="label">Nenhum item comprado no wizard.</div>}
      {itensLoja.map((it, i) => (
        <Linha key={`${it.nome}-${i}`} item={it} itensDetalhados={itensDetalhados} pesoAtivo={pesoAtivo} />
      ))}
    </>
  );
}
