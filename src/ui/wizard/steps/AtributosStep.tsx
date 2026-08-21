import { arrayPadrao, atributosOrdem } from '../../../data/wizardFixtures';
import { modFmt, valorFinalAtributo } from '../types';
import type { StepProps } from './StepProps';

interface AtributosStepProps extends StepProps {
  valorSelecionado: number | null;
  setValorSelecionado: (v: number | null) => void;
}

export default function AtributosStep({ selection, update, valorSelecionado, setValorSelecionado }: AtributosStepProps) {
  const usados = atributosOrdem.map((a) => selection.atributos[a]).filter((v): v is number => v !== null);
  const disponiveis = [...arrayPadrao];
  usados.forEach((v) => {
    const i = disponiveis.indexOf(v);
    if (i > -1) disponiveis.splice(i, 1);
  });
  const todosPreenchidos = usados.length === 6;

  function assignAtributo(a: (typeof atributosOrdem)[number]) {
    if (selection.atributos[a]) {
      update({ atributos: { ...selection.atributos, [a]: null } });
      return;
    }
    if (valorSelecionado === null) return;
    update({ atributos: { ...selection.atributos, [a]: valorSelecionado } });
    setValorSelecionado(null);
  }

  function setBonusModo() {
    update({ bonusModo: '111', bonusEscolhas: [] });
  }

  function toggleBonus(a: (typeof atributosOrdem)[number]) {
    const i = selection.bonusEscolhas.indexOf(a);
    if (i > -1) {
      update({ bonusEscolhas: selection.bonusEscolhas.filter((x) => x !== a) });
    } else if (selection.bonusEscolhas.length < 3) {
      update({ bonusEscolhas: [...selection.bonusEscolhas, a] });
    }
  }

  return (
    <>
      <div className="section-title">Array padrão — toque num valor, depois num atributo</div>
      <div className="box" style={{ padding: 8, marginBottom: 10, fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.5 }}>
        ⚠️ Protótipo: só o "Conjunto Padrão" está implementado aqui. O livro também permite{' '}
        <b>Geração Aleatória</b> (4d6, descarta o menor, 6x) e <b>Custo de Pontos</b> (27 pontos, tabela de custo por
        valor) — ficam pra fazer depois, quando isso virar código de verdade.
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {disponiveis.length === 0 && <div className="label">todos os valores já foram distribuídos</div>}
        {disponiveis.map((v, i) => (
          <div
            key={`${v}-${i}`}
            className={`opt-card ${valorSelecionado === v ? 'selected' : ''}`}
            style={{ padding: '10px 14px', margin: 0 }}
            onClick={() => setValorSelecionado(v)}
          >
            <div className="opt-card-name">{v}</div>
          </div>
        ))}
      </div>

      <div className="section-title">Atributos (valor base)</div>
      <div className="stat-grid">
        {atributosOrdem.map((a) => (
          <div key={a} className="box stat-box" onClick={() => assignAtributo(a)}>
            <div className="stat-name">{a}</div>
            <div className="stat-mod">{selection.atributos[a] ?? '—'}</div>
            <div className="stat-val">{selection.atributos[a] ? `mod ${modFmt(selection.atributos[a]!)}` : 'vazio'}</div>
          </div>
        ))}
      </div>
      <div className="label" style={{ marginTop: 2, marginBottom: 16 }}>
        toque num valor acima, depois no atributo que deve recebê-lo. Toque num atributo já preenchido pra devolver o
        valor.
      </div>

      {todosPreenchidos && (
        <>
          <div className="section-title">Ajuste do Antecedente ({selection.origem || '— selecione uma origem antes —'})</div>
          <div className="box" style={{ padding: 8, marginBottom: 10, fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.5 }}>
            ⚠️ Protótipo: por regra, o antecedente indica 3 atributos específicos pra receber o ajuste (+2/+1 num par,
            ou +1/+1/+1 nos três). Aqui só o modo <b>+1/+1/+1</b> está funcional, e você escolhe livremente quais 3
            atributos recebem — isso precisa ser travado nos 3 atributos corretos do antecedente quando virar código
            de verdade.
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div
              className={`opt-card ${selection.bonusModo === '111' ? 'selected' : ''}`}
              style={{ flex: 1, margin: 0 }}
              onClick={setBonusModo}
            >
              <div className="opt-card-name" style={{ textAlign: 'center' }}>
                +1 / +1 / +1
              </div>
            </div>
            <div className="opt-card btn-disabled" style={{ flex: 1, margin: 0 }}>
              <div className="opt-card-name" style={{ textAlign: 'center' }}>
                +2 / +1 (em breve)
              </div>
            </div>
          </div>
          {selection.bonusModo === '111' && (
            <>
              <div className="label">toque em até 3 atributos pra aplicar +1 ({selection.bonusEscolhas.length}/3)</div>
              <div className="stat-grid" style={{ marginTop: 8 }}>
                {atributosOrdem.map((a) => (
                  <div
                    key={a}
                    className={`box stat-box ${selection.bonusEscolhas.includes(a) ? 'selected' : ''}`}
                    onClick={() => toggleBonus(a)}
                  >
                    <div className="stat-name">{a}</div>
                    <div className="stat-mod">{valorFinalAtributo(selection, a)}</div>
                    <div className="stat-val">{selection.bonusEscolhas.includes(a) ? '+1 aplicado' : 'toque p/ +1'}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
