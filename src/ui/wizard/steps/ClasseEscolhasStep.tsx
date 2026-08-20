import type { StepProps } from './StepProps';

export default function ClasseEscolhasStep({ selection }: StepProps) {
  if (!selection.classe) {
    return <div className="label">Volte e selecione uma classe primeiro.</div>;
  }

  return (
    <>
      <div className="section-title">{selection.classe} — habilidades recebidas</div>
      <div className="summary-row">
        <span>Defesa sem Armadura</span>
        <span>Nível 1</span>
      </div>
      <div className="summary-row">
        <span>Recurso de classe (ex: Fúria)</span>
        <span>Nível 1</span>
      </div>
      <div className="section-title">Seleções da classe</div>
      <div className="check-row">
        <div className="check-box checked" />
        <span className="check-label">Perícia: Sobrevivência</span>
      </div>
      <div className="check-row">
        <div className="check-box" />
        <span className="check-label">Perícia: Intimidação</span>
      </div>
      <div className="section-title">Kit inicial</div>
      <div className="opt-card" style={{ cursor: 'default' }}>
        <div className="opt-card-row">
          <div className="opt-card-img">🖼</div>
          <div className="opt-card-info">
            <div className="opt-card-name">Kit padrão</div>
            <div className="opt-card-desc">Arma + armadura + itens de aventura pré-definidos</div>
          </div>
        </div>
      </div>
    </>
  );
}
