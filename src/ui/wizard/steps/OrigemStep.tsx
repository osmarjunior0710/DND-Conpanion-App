import { origens } from '../../../data/rulesets/dnd2024/origens';
import { descricoesOrigens } from '../../../data/rulesets/dnd2024/descricoesOrigens';
import type { StepProps } from './StepProps';

export default function OrigemStep({ selection, update }: StepProps) {
  return (
    <>
      <div className="section-title">Selecione uma origem</div>
      {origens.map((o) => (
        <div
          key={o.id}
          className={`opt-card ${selection.origem === o.nome ? 'selected' : ''} ${!o.disponivel ? 'btn-disabled' : ''}`}
          onClick={() => o.disponivel && update({ origem: o.nome, ferramentaOrigemEscolhida: null })}
        >
          <div className="opt-card-row">
            <div className="opt-card-img">🖼</div>
            <div className="opt-card-info">
              <div className="opt-card-name">
                {o.nome}
                {!o.disponivel && <span className="tag" style={{ marginLeft: 6 }}>(em breve)</span>}
              </div>
              <div className="opt-card-desc">{descricoesOrigens[o.id]}</div>
            </div>
          </div>
        </div>
      ))}
      <div className="label" style={{ marginTop: 6 }}>
        6 origens ficam "(em breve)" — o talento delas (Habilidoso ou Iniciado em Magia) pede uma seleção extra que
        ainda não tem tela própria. Ver <code>PENDENCIAS.md</code>.
      </div>
    </>
  );
}
