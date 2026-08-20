import type { StepProps } from './StepProps';

export default function EspecieEscolhasStep({ selection }: StepProps) {
  if (!selection.especie) {
    return <div className="label">Volte e selecione uma espécie primeiro.</div>;
  }

  return (
    <>
      <div className="section-title">{selection.especie} — detalhes</div>
      <div className="summary-row">
        <span>Deslocamento</span>
        <span>9 metros</span>
      </div>
      <div className="summary-row">
        <span>Tamanho</span>
        <span>Médio</span>
      </div>
      <div className="summary-row">
        <span>Traços especiais</span>
        <span>2</span>
      </div>
    </>
  );
}
