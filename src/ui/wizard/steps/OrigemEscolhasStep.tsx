import { origens } from '../../../data/rulesets/dnd2024/origens';
import { talentosOrigem } from '../../../data/rulesets/dnd2024/talentos';
import { gruposFerramenta } from '../../../data/rulesets/dnd2024/ferramentas';
import type { StepProps } from './StepProps';

export default function OrigemEscolhasStep({ selection, update }: StepProps) {
  const origem = origens.find((o) => o.nome === selection.origem);

  if (!origem) {
    return <div className="label">Volte e selecione uma origem primeiro.</div>;
  }

  const talento = talentosOrigem.find((t) => t.id === origem.talentoOrigemId);
  const nomeTalento = talento?.nome ?? origem.talentoOrigemId;

  return (
    <>
      <div className="section-title">
        {origem.nome} — Talento: {nomeTalento}
        {origem.talentoOrigemVariante ? ` (${origem.talentoOrigemVariante})` : ''}
      </div>
      {talento ? (
        <div className="box" style={{ padding: 10, marginBottom: 4 }}>
          <div style={{ fontSize: 11, lineHeight: 1.5 }}>{talento.beneficios}</div>
        </div>
      ) : (
        <div className="label">⚠️ Talento não encontrado nos dados importados — avise o Osmar.</div>
      )}

      <div className="section-title">Perícias concedidas</div>
      <div className="summary-row">
        <span>{origem.pericias[0]}</span>
        <span>fixa</span>
      </div>
      <div className="summary-row">
        <span>{origem.pericias[1]}</span>
        <span>fixa</span>
      </div>

      <div className="section-title">Ferramenta</div>
      {origem.ferramenta.categoria === 'fixa' ? (
        <div className="summary-row">
          <span>{origem.ferramenta.nome}</span>
          <span>fixa</span>
        </div>
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

      <div className="section-title">Equipamento inicial</div>
      <div className="label" style={{ marginBottom: 4 }}>
        Opção A (kit de aventureiro):
      </div>
      {origem.equipamentoOpcaoA.itens.map((it) => (
        <div className="summary-row" key={it.nome}>
          <span>{it.nome}</span>
          <span>
            {it.quantidade > 1 ? `${it.quantidade}${it.unidade ? ` ${it.unidade}` : '×'}` : '1'}
          </span>
        </div>
      ))}
      <div className="summary-row">
        <span>Ouro restante</span>
        <span>{origem.equipamentoOpcaoA.ouro} PO</span>
      </div>
      <div className="label" style={{ margin: '8px 0 4px' }}>
        Opção B (só ouro):
      </div>
      <div className="summary-row">
        <span>Ouro</span>
        <span>{origem.equipamentoOpcaoB.ouro} PO</span>
      </div>
      <div className="label" style={{ marginTop: 8 }}>
        ⚠️ Protótipo: a escolha entre Opção A/B e a compra na Loja ainda são passos separados (etapa 6 do wizard) —
        aqui é só a referência do que a origem oferece.
      </div>
    </>
  );
}
