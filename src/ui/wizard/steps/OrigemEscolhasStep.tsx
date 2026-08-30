import { origens } from '../../../data/rulesets/dnd2024/origens';
import { descricoesOrigens } from '../../../data/rulesets/dnd2024/descricoesOrigens';
import { talentosOrigem } from '../../../data/rulesets/dnd2024/talentos';
import { gruposFerramenta } from '../../../data/rulesets/dnd2024/ferramentas';
import { pericias } from '../../../data/rulesets/dnd2024/pericias';
import { buscarDescricaoItem } from '../../../data/rulesets/dnd2024/buscarDescricaoItem';
import { buscarDescricaoFerramenta } from '../../../data/rulesets/dnd2024/buscarDescricaoFerramenta';
import ItemComDescricao from '../../components/ItemComDescricao';
import InfoChip from '../../components/InfoChip';
import type { StepProps } from './StepProps';

function rotuloItem(it: { nome: string; quantidade: number; unidade: string | null }): string {
  if (it.quantidade <= 1) return it.nome;
  return it.unidade ? `${it.nome} (${it.quantidade} ${it.unidade})` : `${it.quantidade}× ${it.nome}`;
}

function descricaoPericia(nome: string): string | null {
  const p = pericias.find((x) => x.nome === nome);
  return p ? `${p.atributo} — ${p.exemplo}` : null;
}

export default function OrigemEscolhasStep({ selection, update }: StepProps) {
  const origem = origens.find((o) => o.nome === selection.origem);

  if (!origem) {
    return <div className="label">Volte e selecione uma origem primeiro.</div>;
  }

  const talento = talentosOrigem.find((t) => t.id === origem.talentoOrigemId);
  const nomeTalento = talento?.nome ?? origem.talentoOrigemId;
  const nomeTalentoCompleto = `${nomeTalento}${origem.talentoOrigemVariante ? ` (${origem.talentoOrigemVariante})` : ''}`;

  return (
    <>
      <div className="section-title">{origem.nome}</div>
      <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-dim)', marginBottom: 4 }}>
        {descricoesOrigens[origem.id]}
      </div>

      <div className="section-title">Concedido pela origem</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <span className="label">Talento:</span>
        <InfoChip
          nome={nomeTalentoCompleto}
          descricao={talento?.beneficios ?? '⚠️ Talento não encontrado nos dados importados — avise o Osmar.'}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <span className="label">Perícias</span>
        <InfoChip nome={origem.pericias[0]} descricao={descricaoPericia(origem.pericias[0])} />
        <InfoChip nome={origem.pericias[1]} descricao={descricaoPericia(origem.pericias[1])} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
        <span className="label">Per. com Ferramentas:</span>
        {origem.ferramenta.categoria === 'fixa' ? (
          <InfoChip nome={origem.ferramenta.nome} descricao={buscarDescricaoFerramenta(origem.ferramenta.nome)} />
        ) : selection.ferramentaOrigemEscolhida ? (
          <InfoChip
            nome={selection.ferramentaOrigemEscolhida}
            descricao={buscarDescricaoFerramenta(selection.ferramentaOrigemEscolhida)}
          />
        ) : (
          <span className="label">(escolha abaixo)</span>
        )}
      </div>

      {origem.ferramenta.categoria === 'escolha' && (
        <>
          <div className="label" style={{ marginBottom: 8 }}>
            Escolha 1 de {origem.ferramenta.grupo}:
          </div>
          {(gruposFerramenta[origem.ferramenta.grupo] ?? []).map((opcao) => (
            <div
              key={opcao.nome}
              className={`opt-card ${selection.ferramentaOrigemEscolhida === opcao.nome ? 'selected' : ''}`}
              style={{ padding: '10px 12px' }}
              onClick={() => update({ ferramentaOrigemEscolhida: opcao.nome })}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="opt-card-name">{opcao.nome}</span>
                {opcao.preco && <span className="label">{opcao.preco}</span>}
              </div>
            </div>
          ))}
        </>
      )}

      <div className="section-title">Equipamento inicial — escolha A ou B</div>
      <div
        className={`opt-card ${selection.equipamentoOrigemEscolhido === 'A' ? 'selected' : ''}`}
        onClick={() => update({ equipamentoOrigemEscolhido: 'A' })}
      >
        <div className="opt-card-name">Opção A — kit de aventureiro</div>
        <div className="opt-card-desc">
          {origem.equipamentoOpcaoA.itens.map((it, i) => (
            <span key={it.nome}>
              {i > 0 && ', '}
              <ItemComDescricao nome={it.nome} descricao={buscarDescricaoItem(it.nome)} rotulo={rotuloItem(it)} />
            </span>
          ))}
          {origem.equipamentoOpcaoA.ouro > 0 && `, ${origem.equipamentoOpcaoA.ouro} PO restantes`}
        </div>
      </div>
      <div
        className={`opt-card ${selection.equipamentoOrigemEscolhido === 'B' ? 'selected' : ''}`}
        onClick={() => update({ equipamentoOrigemEscolhido: 'B' })}
      >
        <div className="opt-card-name">Opção B — só ouro</div>
        <div className="opt-card-desc">{origem.equipamentoOpcaoB.ouro} PO pra gastar como quiser na Loja</div>
      </div>
    </>
  );
}
