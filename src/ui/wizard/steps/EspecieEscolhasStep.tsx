import { especies } from '../../../data/rulesets/dnd2024/especies';
import InfoChip from '../../components/InfoChip';
import type { StepProps } from './StepProps';

export default function EspecieEscolhasStep({ selection }: StepProps) {
  const especie = especies.find((e) => e.nome === selection.especie);

  if (!especie) {
    return <div className="label">Volte e selecione uma espécie primeiro.</div>;
  }

  return (
    <>
      <div className="section-title">{especie.nome}</div>
      <div style={{ fontSize: 11, lineHeight: 1.6, color: 'var(--text-dim)', marginBottom: 4 }}>
        {especie.introducao}
      </div>

      <div className="summary-row">
        <span>Tipo de Criatura</span>
        <span>{especie.tipoCriatura}</span>
      </div>
      <div className="summary-row">
        <span>Tamanho</span>
        <span>{especie.tamanho.fixo ?? especie.tamanho.opcoes?.join(' ou ')}</span>
      </div>
      <div className="summary-row">
        <span>Deslocamento</span>
        <span>{especie.deslocamento}</span>
      </div>

      <div className="section-title">Traços da espécie</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
        {especie.traços.map((t) => (
          <InfoChip key={t.nome} nome={t.nome} descricao={t.descricao} />
        ))}
      </div>
    </>
  );
}
