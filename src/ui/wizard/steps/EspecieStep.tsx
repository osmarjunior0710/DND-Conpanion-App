import { especiesFixture } from '../../../data/wizardFixtures';
import type { StepProps } from './StepProps';

export default function EspecieStep({ selection, update }: StepProps) {
  return (
    <>
      <div className="section-title">Selecione uma espécie</div>
      {especiesFixture.map((e) => (
        <div
          key={e.nome}
          className={`opt-card ${selection.especie === e.nome ? 'selected' : ''}`}
          onClick={() => update({ especie: e.nome })}
        >
          <div className="opt-card-row">
            <div className="opt-card-img">🖼</div>
            <div className="opt-card-info">
              <div className="opt-card-name">{e.nome}</div>
              <div className="opt-card-desc">{e.desc}</div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
