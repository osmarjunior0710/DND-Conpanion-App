import { useState } from 'react';
import {
  calcularCustoCarrinho,
  calcularModAtaque,
  classeEhProficiente,
  construirCatalogoLoja,
  formatarPO,
  type GrupoLoja,
  type LojaItem,
} from '../../../core/loja';
import { calcularOuroInicial } from '../../../core/calculoPersonagem';
import { calcularCapacidadeMaxima, calcularCargaTotal, calcularItensIniciais } from '../../../core/mochila';
import type { StepProps } from './StepProps';
import styles from './LojaStep.module.css';

const GRUPOS_ARMA_ARMADURA = new Set([
  'armas-simples-cac',
  'armas-simples-dist',
  'armas-marciais-cac',
  'armas-marciais-dist',
  'armadura-leve',
  'armadura-media',
  'armadura-pesada',
  'escudos',
]);

const catalogo = construirCatalogoLoja();

function quantidadeNoCarrinho(selection: StepProps['selection'], nome: string): number {
  return selection.itens.find((i) => i.nome === nome)?.quantidade ?? 0;
}

/** Azul (até 25%) → Verde (50%) → Amarelo (75%) → Laranja (90%) →
 * Vermelho (acima de 90%) — mesma ideia da barra de Carga da Ficha,
 * só que com degradê em vez de só "normal/sobrecarregado". */
function corDaCarga(percentual: number): string {
  if (percentual <= 25) return '#4a5fd9';
  if (percentual <= 50) return '#2f8f52';
  if (percentual <= 75) return '#c9a227';
  if (percentual <= 90) return '#c9711f';
  return 'var(--danger)';
}

function ItemCard({ item, selection, update, ouroRestante }: { item: LojaItem; selection: StepProps['selection']; update: StepProps['update']; ouroRestante: number }) {
  const qtd = quantidadeNoCarrinho(selection, item.nome);
  const podeComprar = item.custoPO !== null && item.custoPO <= ouroRestante;

  function mudarQuantidade(delta: number) {
    const atual = [...selection.itens];
    const idx = atual.findIndex((i) => i.nome === item.nome);
    const qtdAtual = idx >= 0 ? atual[idx].quantidade : 0;
    const nova = qtdAtual + delta;
    if (nova <= 0) {
      if (idx >= 0) atual.splice(idx, 1);
    } else if (idx >= 0) {
      atual[idx] = { nome: item.nome, quantidade: nova };
    } else {
      atual.push({ nome: item.nome, quantidade: nova });
    }
    update({ itens: atual });
  }

  const modAtaque =
    item.dano !== undefined && item.propriedades !== undefined
      ? calcularModAtaque(selection, { grupo: item.grupo, propriedades: item.propriedades })
      : null;

  return (
    <div className={`box ${styles.itemCard} ${qtd > 0 ? styles.itemCardComprado : ''}`}>
      <div className={styles.itemNome}>{item.nome}</div>

      {item.dano && (
        <div className={styles.itemLinha}>
          <span className={styles.itemLinhaLabel}>Dano/Efeito</span>
          <span className={styles.itemLinhaValor}>{item.dano}</span>
        </div>
      )}
      {item.propriedades !== undefined && (
        <div className={styles.itemLinha}>
          <span className={styles.itemLinhaLabel}>Propriedades</span>
          <span className={styles.itemLinhaValor}>{item.propriedades || '—'}</span>
        </div>
      )}
      {item.classeArmadura && (
        <div className={styles.itemLinha}>
          <span className={styles.itemLinhaLabel}>Dano/Efeito</span>
          <span className={styles.itemLinhaValor}>CA {item.classeArmadura}</span>
        </div>
      )}
      {item.furtividade && item.furtividade !== '—' && (
        <div className={styles.itemLinha}>
          <span className={styles.itemLinhaLabel}>Propriedades</span>
          <span className={styles.itemLinhaValor}>Desvantagem em Furtividade</span>
        </div>
      )}
      {item.dano !== undefined && modAtaque && (
        <div className={styles.itemLinha}>
          <span className={styles.itemLinhaLabel}>Mod. de Ataque</span>
          <span className={`${styles.itemLinhaValor} ${modAtaque.proficiente ? styles.modProficiente : styles.modSemProficiencia}`}>
            {modAtaque.mod >= 0 ? `+${modAtaque.mod}` : modAtaque.mod}
            {!modAtaque.proficiente && ' (sem proficiência)'}
          </span>
        </div>
      )}
      {item.atributo && (
        <div className={styles.itemLinha}>
          <span className={styles.itemLinhaLabel}>Atributo</span>
          <span className={styles.itemLinhaValor}>{item.atributo}</span>
        </div>
      )}
      <div className={styles.itemLinha}>
        <span className={styles.itemLinhaLabel}>Peso</span>
        <span className={styles.itemLinhaValor}>{item.peso ?? '— (sem peso cadastrado)'}</span>
      </div>
      <div className={styles.itemLinha}>
        <span className={styles.itemLinhaLabel}>Custo</span>
        <span className={styles.itemLinhaValor}>{item.custoTexto}</span>
      </div>
      {item.efeito && (
        <div className={styles.itemEfeitoTexto}>{item.efeito}</div>
      )}

      <div className={styles.stepperRow}>
        <button type="button" className={styles.stepperBtn} onClick={() => mudarQuantidade(-1)} disabled={qtd === 0}>
          −
        </button>
        <span className={styles.stepperQtd}>{qtd}</span>
        <button type="button" className={styles.stepperBtn} onClick={() => mudarQuantidade(1)} disabled={!podeComprar}>
          +
        </button>
      </div>
    </div>
  );
}

function Grupo({ grupo, selection, update, ouroRestante, soProficiente }: { grupo: GrupoLoja; selection: StepProps['selection']; update: StepProps['update']; ouroRestante: number; soProficiente: boolean }) {
  const [aberto, setAberto] = useState(false);
  const itensVisiveis = soProficiente && GRUPOS_ARMA_ARMADURA.has(grupo.id) ? grupo.itens.filter((it) => classeEhProficiente(selection, it)) : grupo.itens;

  if (itensVisiveis.length === 0) return null;

  const comprados = itensVisiveis
    .map((item) => ({ item, qtd: quantidadeNoCarrinho(selection, item.nome) }))
    .filter((x) => x.qtd > 0);

  return (
    <div className="box-solid" style={{ marginBottom: 8 }}>
      <div className={styles.grupoHeader} onClick={() => setAberto(!aberto)}>
        <span className={styles.grupoTitulo}>{grupo.titulo}</span>
        <span className={styles.grupoContagem}>
          ({itensVisiveis.length} {itensVisiveis.length === 1 ? 'item' : 'itens'}) {aberto ? '▾' : '▸'}
        </span>
      </div>

      {!aberto && comprados.length > 0 && (
        <div className={styles.compradoResumo}>
          <div className={styles.compradoTitulo}>Comprado</div>
          {comprados.map(({ item, qtd }) => (
            <div key={item.nome} className={styles.compradoLinha}>
              <span>
                {item.nome} ×{qtd}
              </span>
              <span>{item.custoPO !== null ? formatarPO(item.custoPO * qtd) : '—'}</span>
            </div>
          ))}
        </div>
      )}

      {aberto &&
        itensVisiveis.map((item) => (
          <ItemCard key={item.nome} item={item} selection={selection} update={update} ouroRestante={ouroRestante} />
        ))}
    </div>
  );
}

export default function LojaStep({ selection, update }: StepProps) {
  const [soProficiente, setSoProficiente] = useState(false);
  const ouroInicial = calcularOuroInicial(selection);
  const custoCarrinho = calcularCustoCarrinho(selection.itens, catalogo);
  const ouroRestante = Math.round((ouroInicial - custoCarrinho) * 100) / 100;

  const itensMochila = calcularItensIniciais(selection);
  const carga = calcularCargaTotal(itensMochila);
  const capacidadeMaxima = calcularCapacidadeMaxima(selection);
  const percentualCarga = capacidadeMaxima ? Math.min(100, Math.round((carga.kg / capacidadeMaxima) * 100)) : 0;

  return (
    <>
      <div className={`box-solid ${styles.ouroBox}`}>
        <div className={styles.ouroBoxTopo}>
          <div className={styles.ouroLabelCol}>
            <span className="label">ouro inicial</span>
            <span>{ouroInicial} PO</span>
          </div>
          <div className={styles.ouroLabelCol} style={{ alignItems: 'flex-end' }}>
            <span className="label">restante</span>
            <span className={`${styles.ouroValor} ${ouroRestante <= 0 ? styles.ouroValorZerado : ''}`}>{formatarPO(ouroRestante)}</span>
          </div>
        </div>
        <div className={styles.cargaRow}>
          <div className={styles.cargaBarOuter}>
            <div className={styles.cargaBarInner} style={{ width: `${percentualCarga}%`, background: corDaCarga(percentualCarga) }} />
          </div>
          <span className={styles.cargaIcone}>🎒</span>
        </div>
        <div className={styles.cargaTexto}>
          {carga.kg.toString().replace('.', ',')} kg / máx. {capacidadeMaxima ?? '—'} kg
        </div>
      </div>

      <label className={styles.filtroRow}>
        <input type="checkbox" checked={soProficiente} onChange={(e) => setSoProficiente(e.target.checked)} />
        <span style={{ fontSize: 13 }}>Filtrar por proficiência (mostra só armas e armaduras que sua classe usa bem)</span>
      </label>

      <div className="section-title">Itens à venda</div>
      {catalogo.map((grupo) => (
        <Grupo key={grupo.id} grupo={grupo} selection={selection} update={update} ouroRestante={ouroRestante} soProficiente={soProficiente} />
      ))}
    </>
  );
}
