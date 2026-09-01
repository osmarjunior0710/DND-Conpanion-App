import { arrayPadrao, atributosOrdem, type Atributo } from '../../../data/wizardFixtures';
import { origens } from '../../../data/rulesets/dnd2024/origens';
import { modFmt, type WizardSelection } from '../../../core/personagem';
import DistribuirPontosAtributo from '../../components/DistribuirPontosAtributo';
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

  const origemSelecionada = origens.find((o) => o.nome === selection.origem);
  const atributosElegiveis = origemSelecionada?.atributosElegiveis ?? null;

  function atributoTravado(a: (typeof atributosOrdem)[number]): boolean {
    if (selection.desbloquearAtributos) return false;
    if (!atributosElegiveis) return false;
    return !atributosElegiveis.includes(a);
  }

  function assignAtributo(a: (typeof atributosOrdem)[number]) {
    if (selection.atributos[a]) {
      update({ atributos: { ...selection.atributos, [a]: null } });
      return;
    }
    if (valorSelecionado === null) return;
    update({ atributos: { ...selection.atributos, [a]: valorSelecionado } });
    setValorSelecionado(null);
  }

  function incrementarBonus(a: Atributo) {
    if (atributoTravado(a)) return;
    const nesse = selection.bonusEscolhas.filter((x) => x === a).length;
    const base = selection.atributos[a] ?? 10;
    if (selection.bonusEscolhas.length >= 3 || nesse >= 2 || base + nesse >= 20) return;
    update({ bonusEscolhas: [...selection.bonusEscolhas, a] });
  }

  function decrementarBonus(a: Atributo) {
    const i = selection.bonusEscolhas.lastIndexOf(a);
    if (i === -1) return;
    const novo = [...selection.bonusEscolhas];
    novo.splice(i, 1);
    update({ bonusEscolhas: novo });
  }

  function toggleDesbloquear() {
    const novoValor = !selection.desbloquearAtributos;
    const patch: Partial<WizardSelection> = { desbloquearAtributos: novoValor };
    if (!novoValor && atributosElegiveis) {
      patch.bonusEscolhas = selection.bonusEscolhas.filter((a) => atributosElegiveis.includes(a));
    }
    update(patch);
  }

  return (
    <>
      <div className="section-title">Array padrão — toque num valor, depois num atributo</div>
      <div className="box" style={{ padding: 8, marginBottom: 10, fontSize: 11, color: 'var(--text-faint)', lineHeight: 1.5 }}>
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
          <div className="box" style={{ padding: 8, marginBottom: 10, fontSize: 11, color: 'var(--text-faint)', lineHeight: 1.5 }}>
            Por regra, o antecedente permite distribuir 3 pontos entre os atributos, no máximo <b>+2</b> num só (pode
            ser <b>+2/+1</b> num par, ou <b>+1/+1/+1</b> nos três).
            {atributosElegiveis
              ? ` Os 3 atributos elegíveis de ${selection.origem} (${atributosElegiveis.join(', ')}) já vêm travados abaixo — os outros 3 ficam bloqueados, a não ser que você marque "Desbloquear atributos".`
              : ' Selecione uma origem antes pra travar os atributos certos aqui.'}
          </div>

          {atributosElegiveis && (
            <div className="check-row" onClick={toggleDesbloquear} style={{ marginBottom: 10 }}>
              <div className={`check-box ${selection.desbloquearAtributos ? 'checked' : ''}`} />
              <span className="check-label">
                Desbloquear atributos (ignorar a regra do antecedente e escolher qualquer um dos 6)
              </span>
            </div>
          )}

          <DistribuirPontosAtributo
            pontosTotal={3}
            escolhas={selection.bonusEscolhas}
            atributosBase={selection.atributos}
            onIncrementar={incrementarBonus}
            onDecrementar={decrementarBonus}
            atributoTravado={atributoTravado}
          />
        </>
      )}
    </>
  );
}
