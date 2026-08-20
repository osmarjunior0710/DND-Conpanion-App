import { origensFixture } from '../../../data/wizardFixtures';
import type { StepProps } from './StepProps';

export default function OrigemStep({ selection, update }: StepProps) {
  return (
    <>
      <div className="section-title">Selecione uma origem</div>
      {origensFixture.map((o) => (
        <div
          key={o.nome}
          className={`opt-card ${selection.origem === o.nome ? 'selected' : ''}`}
          onClick={() => update({ origem: o.nome })}
        >
          <div className="opt-card-row">
            <div className="opt-card-img">🖼</div>
            <div className="opt-card-info">
              <div className="opt-card-name">{o.nome}</div>
              <div className="opt-card-desc">{o.desc}</div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
