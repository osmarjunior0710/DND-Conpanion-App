import { classes } from '../../../data/rulesets/dnd2024/classes';
import type { StepProps } from './StepProps';

const iconeModulos = import.meta.glob('../../../assets/icones-classes/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

function iconeClasse(id: string): string | undefined {
  const entrada = Object.entries(iconeModulos).find(([caminho]) => caminho.endsWith(`/${id}.png`));
  return entrada?.[1];
}

function bannerClasse(id: string): string | undefined {
  const entrada = Object.entries(iconeModulos).find(([caminho]) => caminho.endsWith(`/${id}-banner.png`));
  return entrada?.[1];
}

// Ícones novos (emblema redondo) substituem os estandartes antigos —
// mesmo arquivo `-banner.png`, mas exibidos na caixa quadrada padrão
// (`.opt-card-img`) em vez da caixa alta/estreita de antes, porque o
// formato redondo cabe melhor nela. Classes sem arte própria ainda
// usam uma cópia do emblema do Guerreiro como placeholder — trocar
// pelo emblema real assim que existir (ver DECISOES-DESIGN.md).
function IconeClasse({ id }: { id: string }) {
  const banner = bannerClasse(id);
  if (banner) return <img src={banner} alt="" className="opt-card-img-emblema" />;
  return (
    <div className="opt-card-img">
      {iconeClasse(id) ? <img src={iconeClasse(id)} alt="" /> : '🖼'}
    </div>
  );
}

const CLASSES_EM_BREVE = [
  { nome: 'Bárbaro', id: 'barbaro' },
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
  const disponiveis = classes.filter((c) => c.disponivel);
  // Classes com dado real (núcleo já importado) mas ainda não prontas
  // pro wizard de ponta a ponta (ex: Bardo, Etapa 1 só de dados feita)
  // aparecem na lista "em breve" com o nome/emblema reais, não mais o
  // placeholder genérico.
  const indisponiveis = classes.filter((c) => !c.disponivel);

  return (
    <>
      <div className="section-title">Selecione uma classe</div>
      {disponiveis.map((c) => (
        <div
          key={c.id}
          className={`opt-card ${selection.classe === c.nome ? 'selected' : ''}`}
          onClick={() => update({ classe: c.nome })}
        >
          <div className="opt-card-row">
            <IconeClasse id={c.id} />
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
      {indisponiveis.map((c) => (
        <div key={c.id} className="opt-card btn-disabled">
          <div className="opt-card-row">
            <IconeClasse id={c.id} />
            <div className="opt-card-info">
              <div className="opt-card-name">
                {c.nome}
                <span className="tag" style={{ marginLeft: 6 }}>(em breve)</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {CLASSES_EM_BREVE.map((classe) => (
        <div key={classe.id} className="opt-card btn-disabled">
          <div className="opt-card-row">
            <IconeClasse id={classe.id} />
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
        Só o Guerreiro está pronto por enquanto — as outras classes ainda não foram implementadas de
        ponta a ponta. Ver <code>PENDENCIAS.md</code>.
      </div>
    </>
  );
}
