import { truquesElegiveisLivroDasSombras, magiasRituaisElegiveisLivroDasSombras } from '../../../core/livroDasSombras';
import MagiaComDescricao from '../../components/MagiaComDescricao';
import type { StepProps } from './StepProps';

const MAX_TRUQUES = 3;
const MAX_MAGIAS = 2;

export default function LivroDasSombrasStep({ selection, update }: StepProps) {
  const jaConhecidos = [...selection.truquesEscolhidos, ...selection.magiasPreparadasEscolhidas];
  const truquesCatalogo = truquesElegiveisLivroDasSombras(jaConhecidos);
  const magiasCatalogo = magiasRituaisElegiveisLivroDasSombras(jaConhecidos);

  function toggleTruque(nome: string) {
    const atual = selection.livroDasSombrasTruques;
    if (atual.includes(nome)) {
      update({ livroDasSombrasTruques: atual.filter((x) => x !== nome) });
    } else if (atual.length < MAX_TRUQUES) {
      update({ livroDasSombrasTruques: [...atual, nome] });
    }
  }

  function toggleMagia(nome: string) {
    const atual = selection.livroDasSombrasMagias;
    if (atual.includes(nome)) {
      update({ livroDasSombrasMagias: atual.filter((x) => x !== nome) });
    } else if (atual.length < MAX_MAGIAS) {
      update({ livroDasSombrasMagias: [...atual, nome] });
    }
  }

  return (
    <>
      <div className="section-title">Livro das Sombras (Pacto do Tomo)</div>
      <div className="label" style={{ marginBottom: 8 }}>
        Ao conjurar o livro, escolha 3 truques + 2 magias de 1º círculo com o marcador Ritual — podem ser de
        qualquer classe, desde que você ainda não as tenha preparadas. Enquanto o livro existir, funcionam como
        magias de Bruxo sempre preparadas (não contam no limite normal).
      </div>

      <div className="section-title">
        Truques — escolha {MAX_TRUQUES} ({selection.livroDasSombrasTruques.length}/{MAX_TRUQUES})
      </div>
      {truquesCatalogo.map((m) => (
        <div key={m.id} className="check-row" onClick={() => toggleTruque(m.nome)}>
          <div className={`check-box ${selection.livroDasSombrasTruques.includes(m.nome) ? 'checked' : ''}`} />
          <span className="check-label">
            <MagiaComDescricao magia={m} variante="icone" />{' '}
            <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>({m.classes.join(', ')})</span>
          </span>
        </div>
      ))}

      <div className="section-title" style={{ marginTop: 8 }}>
        Magias de 1º Círculo — Ritual — escolha {MAX_MAGIAS} ({selection.livroDasSombrasMagias.length}/{MAX_MAGIAS})
      </div>
      {magiasCatalogo.map((m) => (
        <div key={m.id} className="check-row" onClick={() => toggleMagia(m.nome)}>
          <div className={`check-box ${selection.livroDasSombrasMagias.includes(m.nome) ? 'checked' : ''}`} />
          <span className="check-label">
            <MagiaComDescricao magia={m} variante="icone" />{' '}
            <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>({m.classes.join(', ')})</span>
          </span>
        </div>
      ))}
    </>
  );
}
