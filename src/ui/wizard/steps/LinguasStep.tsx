import { linguasDisponiveis } from '../../../data/wizardFixtures';
import type { StepProps } from './StepProps';

export default function LinguasStep({ selection, update }: StepProps) {
  function toggleLingua(l: string) {
    const i = selection.linguas.indexOf(l);
    if (i > -1) {
      update({ linguas: selection.linguas.filter((x) => x !== l) });
    } else if (selection.linguas.length < 2) {
      update({ linguas: [...selection.linguas, l] });
    }
  }

  return (
    <>
      <div className="section-title">Idiomas disponíveis (escolha até 2)</div>
      {linguasDisponiveis.map((l) => (
        <div key={l} className="check-row" onClick={() => toggleLingua(l)}>
          <div className={`check-box ${selection.linguas.includes(l) ? 'checked' : ''}`} />
          <span className="check-label">{l}</span>
        </div>
      ))}
    </>
  );
}
