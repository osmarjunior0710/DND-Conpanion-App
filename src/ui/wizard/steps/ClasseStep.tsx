import { classesFixture } from '../../../data/wizardFixtures';
import type { StepProps } from './StepProps';

export default function ClasseStep({ selection, update }: StepProps) {
  return (
    <>
      <div className="section-title">Selecione uma classe</div>
      {classesFixture.map((c) => (
        <div
          key={c.nome}
          className={`opt-card ${selection.classe === c.nome ? 'selected' : ''}`}
          onClick={() => update({ classe: c.nome })}
        >
          <div className="opt-card-row">
            <div className="opt-card-img">🖼</div>
            <div className="opt-card-info">
              <div className="opt-card-name">{c.nome}</div>
              <div className="opt-card-desc">{c.desc}</div>
              <div className="opt-card-tags">
                <span className="tag">Dado de Vida {c.dadoVida}</span>
                <span className="tag">Complexidade {c.complexidade}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="label" style={{ marginTop: 6 }}>
        avance para ver as escolhas específicas de {selection.classe || '(selecione uma classe)'}
      </div>
    </>
  );
}
