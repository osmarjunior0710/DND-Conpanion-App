import { origens } from '../../../data/rulesets/dnd2024/origens';
import { talentosOrigem } from '../../../data/rulesets/dnd2024/talentos';
import { gruposFerramenta } from '../../../data/rulesets/dnd2024/ferramentas';
import type { StepProps } from './StepProps';

function formatarItem(it: { nome: string; quantidade: number; unidade: string | null }): string {
  if (it.quantidade <= 1) return it.nome;
  return it.unidade ? `${it.nome} (${it.quantidade} ${it.unidade})` : `${it.quantidade}× ${it.nome}`;
}

export default function OrigemEscolhasStep({ selection, update }: StepProps) {
  const origem = origens.find((o) => o.nome === selection.origem);

  if (!origem) {
    return <div className="label">Volte e selecione uma origem primeiro.</div>;
  }

  const talento = talentosOrigem.find((t) => t.id === origem.talentoOrigemId);
  const nomeTalento = talento?.nome ?? origem.talentoOrigemId;

  return (
    <>
      <div className="section-title">{origem.nome}</div>

      <div className="opt-card" style={{ cursor: 'default' }}>
        <div className="opt-card-name">
          {nomeTalento}
          {origem.talentoOrigemVariante ? ` (${origem.talentoOrigemVariante})` : ''}
        </div>
        {talento ? (
          <div className="opt-card-desc">{talento.beneficios}</div>
        ) : (
          <div className="opt-card-desc">⚠️ Talento não encontrado nos dados importados — avise o Osmar.</div>
        )}
      </div>

      <div className="section-title">Perícias concedidas</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
        <span className="tag">{origem.pericias[0]}</span>
        <span className="tag">{origem.pericias[1]}</span>
      </div>

      <div className="section-title">Ferramenta</div>
      {origem.ferramenta.categoria === 'fixa' ? (
        <div style={{ fontSize: 12 }}>{origem.ferramenta.nome}</div>
      ) : (
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
                {opcao.preco && <span className="tag">{opcao.preco}</span>}
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
          {origem.equipamentoOpcaoA.itens.map(formatarItem).join(', ')}
          {origem.equipamentoOpcaoA.ouro > 0 && (
            <>
              {', '}
              <span className="tag">{origem.equipamentoOpcaoA.ouro} PO</span> restantes
            </>
          )}
        </div>
      </div>
      <div
        className={`opt-card ${selection.equipamentoOrigemEscolhido === 'B' ? 'selected' : ''}`}
        onClick={() => update({ equipamentoOrigemEscolhido: 'B' })}
      >
        <div className="opt-card-name">Opção B — só ouro</div>
        <div className="opt-card-desc">
          <span className="tag">{origem.equipamentoOpcaoB.ouro} PO</span> pra gastar como quiser na Loja
        </div>
      </div>
    </>
  );
}
