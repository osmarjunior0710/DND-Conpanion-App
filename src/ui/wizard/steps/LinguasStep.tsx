import { useEffect } from 'react';
import { idiomas } from '../../../data/rulesets/dnd2024/idiomas';
import { idiomaExtraClasse } from '../../../data/rulesets/dnd2024/idiomaExtraClasse';
import type { StepProps } from './StepProps';

const MAX_ESCOLHAS_ORIGEM = 2;

export default function LinguasStep({ selection, update }: StepProps) {
  const extraClasse = selection.classe ? idiomaExtraClasse[selection.classe] : undefined;
  const fixosClasse = extraClasse?.fixo ?? [];
  const maxEscolhas = MAX_ESCOLHAS_ORIGEM + (extraClasse?.escolhaLivre ?? 0);

  // Idioma fixo de Classe (ex: Druídico do Druida) entra sozinho,
  // igual ao Comum — não conta contra a escolha livre do jogador.
  useEffect(() => {
    const faltando = fixosClasse.filter((f) => !selection.linguas.includes(f));
    if (faltando.length > 0) update({ linguas: [...selection.linguas, ...faltando] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.classe]);

  const escolhidos = selection.linguas.filter((l) => l !== 'Comum' && !fixosClasse.includes(l));
  const comuns = idiomas.filter((i) => i.tipo === 'Comum' && i.nome !== 'Comum');
  const raras = idiomas.filter((i) => i.tipo === 'Raro' && !fixosClasse.includes(i.nome));

  function toggleLingua(l: string) {
    const i = selection.linguas.indexOf(l);
    if (i > -1) {
      update({ linguas: selection.linguas.filter((x) => x !== l) });
    } else if (escolhidos.length < maxEscolhas) {
      update({ linguas: [...selection.linguas, l] });
    }
  }

  return (
    <>
      <div className="section-title">Idiomas</div>
      <div className="label" style={{ marginBottom: 8 }}>
        Comum é obrigatório{fixosClasse.length > 0 ? `, ${fixosClasse.join(', ')} vem da sua Classe (fixo)` : ''}.
        Escolha mais {maxEscolhas} ({escolhidos.length}/{maxEscolhas} escolhidos) — os idiomas Raros também estão
        liberados aqui, desde que você tenha uma boa justificativa de história pra conhecer um deles (ex: um
        Tiferino sabendo Infernal).
      </div>

      <div className="check-row" style={{ opacity: 0.7 }}>
        <div className="check-box checked" />
        <span className="check-label">Comum (obrigatório)</span>
      </div>

      {fixosClasse.map((f) => (
        <div key={f} className="check-row" style={{ opacity: 0.7 }}>
          <div className="check-box checked" />
          <span className="check-label">{f} (Classe, fixo)</span>
        </div>
      ))}

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
