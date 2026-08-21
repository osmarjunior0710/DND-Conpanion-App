import { classes } from '../../../data/rulesets/dnd2024/classes';
import type { StepProps } from './StepProps';

const CLASSES_EM_BREVE = [
  'Bárbaro',
  'Bardo',
  'Bruxo',
  'Clérigo',
  'Druida',
  'Feiticeiro',
  'Guardião',
  'Ladino',
  'Mago',
  'Monge',
  'Paladino',
];

export default function ClasseStep({ selection, update }: StepProps) {
  return (
    <>
      <div className="section-title">Selecione uma classe</div>
      {classes.map((c) => (
        <div
          key={c.id}
          className={`opt-card ${selection.classe === c.nome ? 'selected' : ''}`}
          onClick={() => update({ classe: c.nome })}
        >
          <div className="opt-card-row">
            <div className="opt-card-img">🖼</div>
            <div className="opt-card-info">
              <div className="opt-card-name">{c.nome}</div>
              <div className="opt-card-desc">Atributo primário: {c.atributoPrimario}</div>
              <div className="opt-card-tags">
                <span className="tag">Dado de Vida {c.dadoDeVida}</span>
                <span className="tag">Salvaguardas {c.salvaguardas.join('/')}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {CLASSES_EM_BREVE.map((nome) => (
        <div key={nome} className="opt-card btn-disabled">
          <div className="opt-card-row">
            <div className="opt-card-img">🖼</div>
            <div className="opt-card-info">
              <div className="opt-card-name">
                {nome}
                <span className="tag" style={{ marginLeft: 6 }}>(em breve)</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="label" style={{ marginTop: 6 }}>
        Só o Guerreiro está pronto por enquanto — as outras 11 classes ainda não foram importadas da
        planilha. Ver <code>PENDENCIAS.md</code>.
      </div>
    </>
  );
}
