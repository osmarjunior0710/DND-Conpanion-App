import { alinhamentos } from '../../../data/wizardFixtures';
import type { StepProps } from './StepProps';

export default function AlinhamentoStep({ selection, update }: StepProps) {
  return (
    <>
      <div className="section-title">Selecione um alinhamento</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {alinhamentos.map((a) => (
          <div
            key={a}
            className={`opt-card ${selection.alinhamento === a ? 'selected' : ''}`}
            style={{ padding: '10px 6px' }}
            onClick={() => update({ alinhamento: a })}
          >
            <div className="opt-card-name" style={{ fontSize: 10, textAlign: 'center' }}>
              {a}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
