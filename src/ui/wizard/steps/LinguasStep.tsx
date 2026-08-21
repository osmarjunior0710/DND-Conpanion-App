import { idiomas } from '../../../data/rulesets/dnd2024/idiomas';
import type { StepProps } from './StepProps';

const MAX_ESCOLHAS = 2;

export default function LinguasStep({ selection, update }: StepProps) {
  const escolhidos = selection.linguas.filter((l) => l !== 'Comum');
  const comuns = idiomas.filter((i) => i.tipo === 'Comum' && i.nome !== 'Comum');
  const raras = idiomas.filter((i) => i.tipo === 'Raro');

  function toggleLingua(l: string) {
    const i = selection.linguas.indexOf(l);
    if (i > -1) {
      update({ linguas: selection.linguas.filter((x) => x !== l) });
    } else if (escolhidos.length < MAX_ESCOLHAS) {
      update({ linguas: [...selection.linguas, l] });
    }
  }

  return (
    <>
      <div className="section-title">Idiomas</div>
      <div className="label" style={{ marginBottom: 8 }}>
        Comum é obrigatório. Escolha mais {MAX_ESCOLHAS} ({escolhidos.length}/{MAX_ESCOLHAS} escolhidos) — os
        idiomas Raros também estão liberados aqui, desde que você tenha uma boa justificativa de história pra
        conhecer um deles (ex: um Tiferino sabendo Infernal, um Druida sabendo Druídico).
      </div>

      <div className="check-row" style={{ opacity: 0.7 }}>
        <div className="check-box checked" />
        <span className="check-label">Comum (obrigatório)</span>
      </div>

      <div className="section-title" style={{ marginTop: 8 }}>
        Comuns
      </div>
      {comuns.map((i) => (
        <div key={i.id} className="check-row" onClick={() => toggleLingua(i.nome)}>
          <div className={`check-box ${selection.linguas.includes(i.nome) ? 'checked' : ''}`} />
          <span className="check-label">{i.nome}</span>
        </div>
      ))}

      <div className="section-title" style={{ marginTop: 8 }}>
        Raros
      </div>
      {raras.map((i) => (
        <div key={i.id} className="check-row" onClick={() => toggleLingua(i.nome)}>
          <div className={`check-box ${selection.linguas.includes(i.nome) ? 'checked' : ''}`} />
          <span className="check-label">{i.nome}</span>
        </div>
      ))}
    </>
  );
}
