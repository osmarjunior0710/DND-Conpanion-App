import { classes } from '../../../data/rulesets/dnd2024/classes';
import type { StepProps } from './StepProps';
import barbaroBanner from '../../../assets/icones-classes/barbaro-banner.png';

const iconeModulos = import.meta.glob('../../../assets/icones-classes/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

function iconeClasse(id: string): string | undefined {
  const entrada = Object.entries(iconeModulos).find(([caminho]) => caminho.endsWith(`/${id}.png`));
  return entrada?.[1];
}

const CLASSES_EM_BREVE = [
  { nome: 'Bárbaro', id: 'barbaro' },
  { nome: 'Bardo', id: 'bardo' },
  { nome: 'Bruxo', id: 'bruxo' },
  { nome: 'Clérigo', id: 'clerigo' },
  { nome: 'Druida', id: 'druida' },
  { nome: 'Feiticeiro', id: 'feiticeiro' },
  { nome: 'Guardião', id: 'guardiao' },
  { nome: 'Ladino', id: 'ladino' },
  { nome: 'Mago', id: 'mago' },
  { nome: 'Monge', id: 'monge' },
  { nome: 'Paladino', id: 'paladino' },
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
            <div className="opt-card-img">
              {iconeClasse(c.id) ? (
                <img src={iconeClasse(c.id)} alt="" />
              ) : (
                '🖼'
              )}
            </div>
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
      {CLASSES_EM_BREVE.map((classe) => (
        <div key={classe.id} className="opt-card btn-disabled">
          <div className="opt-card-row">
            {classe.id === 'barbaro' ? (
              <img src={barbaroBanner} alt="" className="opt-card-img-banner" />
            ) : (
              <div className="opt-card-img">
                {iconeClasse(classe.id) ? (
                  <img src={iconeClasse(classe.id)} alt="" />
                ) : (
                  '🖼'
                )}
              </div>
            )}
            <div className="opt-card-info">
              <div className="opt-card-name">
                {classe.nome}
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
