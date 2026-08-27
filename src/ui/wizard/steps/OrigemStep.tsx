import { origens } from '../../../data/rulesets/dnd2024/origens';
import { descricoesOrigens } from '../../../data/rulesets/dnd2024/descricoesOrigens';
import { nomesDuplicados } from '../../../core/duplicidadeSelecao';
import type { StepProps } from './StepProps';

export default function OrigemStep({ selection, update }: StepProps) {
  // Marcação de duplicidade — só Perícias por enquanto (única sobreposição
  // hoje alcançável no wizard: Perícia da Classe, escolhida na etapa
  // anterior, x Perícia fixa de CADA Origem, comparadas 1 a 1). Só pra
  // criação — a Ficha precisará de outra abordagem, ver DECISOES-DESIGN.md.

  return (
    <>
      <div className="section-title">Selecione uma origem</div>
      {origens.map((o) => {
        const duplicadas = nomesDuplicados(selection.periciasClasseEscolhidas, o.pericias);
        const duplicada = duplicadas.size > 0;
        return (
          <div
            key={o.id}
            className={`opt-card ${selection.origem === o.nome ? 'selected' : ''} ${!o.disponivel ? 'btn-disabled' : ''} ${duplicada ? 'opt-card-duplicada' : ''}`}
            onClick={() => o.disponivel && update({ origem: o.nome, ferramentaOrigemEscolhida: null })}
          >
            <div className="opt-card-row">
              <div className="opt-card-img">🖼</div>
              <div className="opt-card-info">
                <div className="opt-card-name">
                  {o.nome}
                  {!o.disponivel && <span className="tag" style={{ marginLeft: 6 }}>(em breve)</span>}
                </div>
                <div className="opt-card-desc">{descricoesOrigens[o.id]}</div>
                {duplicada && (
                  <div className="opt-card-desc" style={{ color: 'var(--warn)' }}>
                    ⚠️ {[...duplicadas].join(', ')} já escolhida na Classe
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div className="label" style={{ marginTop: 6 }}>
        6 origens ficam "(em breve)" — o talento delas (Habilidoso ou Iniciado em Magia) pede uma seleção extra que
        ainda não tem tela própria. Ver <code>PENDENCIAS.md</code>.
      </div>
    </>
  );
}
