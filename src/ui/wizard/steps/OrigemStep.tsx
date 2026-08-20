import { origens } from '../../../data/rulesets/dnd2024/origens';
import { talentosOrigem } from '../../../data/rulesets/dnd2024/talentos';
import type { StepProps } from './StepProps';

function descricaoCurta(o: (typeof origens)[number]): string {
  const talento = talentosOrigem.find((t) => t.id === o.talentoOrigemId);
  const nomeTalento = talento?.nome ?? o.talentoOrigemId;
  return `${o.pericias.join(' e ')} · Talento: ${nomeTalento}${o.talentoOrigemVariante ? ` (${o.talentoOrigemVariante})` : ''}`;
}

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
              <div className="opt-card-desc">{descricaoCurta(o)}</div>
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
