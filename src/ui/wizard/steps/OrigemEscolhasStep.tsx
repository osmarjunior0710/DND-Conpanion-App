import type { StepProps } from './StepProps';

export default function OrigemEscolhasStep({ selection }: StepProps) {
  if (!selection.origem) {
    return <div className="label">Volte e selecione uma origem primeiro.</div>;
  }

  return (
    <>
      <div className="section-title">{selection.origem} — detalhes</div>
      <div className="summary-row">
        <span>Talento de origem</span>
        <span>+1 característica</span>
      </div>
      <div className="summary-row">
        <span>Perícias concedidas</span>
        <span>2 fixas</span>
      </div>
      <div className="summary-row">
        <span>Ferramenta concedida</span>
        <span>1 à escolha</span>
      </div>
    </>
  );
}
