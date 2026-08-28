import type { Classe } from '../../../data/rulesets/dnd2024/classes';
import { origens } from '../../../data/rulesets/dnd2024/origens';
import { especies } from '../../../data/rulesets/dnd2024/especies';
import { talentosOrigem } from '../../../data/rulesets/dnd2024/talentos';
import { caracteristicasAcumuladas } from '../../../core/levelUp';
import type { WizardSelection } from '../../../core/personagem';

interface PerfilTabProps {
  selecao: WizardSelection;
  classe: Classe | null;
  nivel: number;
}

export default function PerfilTab({ selecao, classe, nivel }: PerfilTabProps) {
  const caracteristicasClasse = classe ? caracteristicasAcumuladas(classe, nivel) : [];
  const origem = origens.find((o) => o.nome === selecao.origem) ?? null;
  const talento = origem ? talentosOrigem.find((t) => t.id === origem.talentoOrigemId) ?? null : null;
  const especie = especies.find((e) => e.nome === selecao.especie) ?? null;

  return (
    <>
      <div className="section-title">Classe{classe ? ` — ${classe.nome}` : ''}</div>
      {caracteristicasClasse.length === 0 && (
        <div className="label" style={{ marginBottom: 12 }}>
          Nenhuma característica de classe ainda.
        </div>
      )}
      {caracteristicasClasse.map((c) => (
        <div key={c.nome} className="opt-card" style={{ cursor: 'default' }}>
          <div className="opt-card-name">{c.nome}</div>
          {c.descricao ? (
            <div className="opt-card-desc">{c.descricao}</div>
          ) : (
            <div className="opt-card-desc" style={{ color: 'var(--text-faint)' }}>
              Descrição detalhada ainda não importada pra essa característica.
            </div>
          )}
        </div>
      ))}

      <div className="section-title" style={{ marginTop: 16 }}>
        Origem{origem ? ` — ${origem.nome}` : ''}
      </div>
      {talento ? (
        <div className="opt-card" style={{ cursor: 'default' }}>
          <div className="opt-card-name">
            {talento.nome}
            {origem?.talentoOrigemVariante ? ` (${origem.talentoOrigemVariante})` : ''}
          </div>
          <div className="opt-card-desc">{talento.beneficios}</div>
        </div>
      ) : (
        <div className="label" style={{ marginBottom: 12 }}>
          Nenhum Talento de Origem ainda.
        </div>
      )}

      <div className="section-title" style={{ marginTop: 16 }}>
        Espécie{especie ? ` — ${especie.nome}` : ''}
      </div>
      {especie && especie.traços.length > 0 ? (
        especie.traços.map((t) => (
          <div key={t.nome} className="opt-card" style={{ cursor: 'default' }}>
            <div className="opt-card-name">{t.nome}</div>
            <div className="opt-card-desc">{t.descricao}</div>
          </div>
        ))
      ) : (
        <div className="label" style={{ marginBottom: 12 }}>
          Nenhum traço de espécie ainda.
        </div>
      )}
    </>
  );
}
