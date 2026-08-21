import { pvBaseClasse } from '../../../data/wizardFixtures';
import { valorFinalAtributo } from '../types';
import type { StepProps } from './StepProps';

export default function ResumoStep({ selection, update }: StepProps) {
  const conValor = valorFinalAtributo(selection, 'CON');
  const sabValor = valorFinalAtributo(selection, 'SAB');
  const conMod = conValor !== null ? Math.floor((conValor - 10) / 2) : 0;
  const sabMod = sabValor !== null ? Math.floor((sabValor - 10) / 2) : 0;
  const pvBase = selection.classe ? (pvBaseClasse[selection.classe] ?? 8) : null;
  const pvMax = selection.classe && pvBase !== null ? pvBase + conMod : null;
  const percepcaoPassiva = 10 + sabMod;

  return (
    <>
      <div className="section-title">Resumo do personagem</div>
      <div className="summary-row">
        <span>Classe</span>
        <span>{selection.classe || '—'}</span>
      </div>
      <div className="summary-row">
        <span>Origem</span>
        <span>{selection.origem || '—'}</span>
      </div>
      <div className="summary-row">
        <span>Espécie</span>
        <span>{selection.especie || '—'}</span>
      </div>
      <div className="summary-row">
        <span>Idiomas</span>
        <span>{selection.linguas.join(', ') || '—'}</span>
      </div>
      <div className="summary-row">
        <span>Alinhamento</span>
        <span>{selection.alinhamento || '—'}</span>
      </div>
      <div className="summary-row">
        <span>Itens comprados</span>
        <span>{selection.itens.length}</span>
      </div>

      <div className="section-title">Números calculados automaticamente</div>
      <div className="summary-row">
        <span>Pontos de Vida máximos</span>
        <span>
          {pvMax !== null
            ? `${pvMax} (${pvBase} + mod. CON ${conMod >= 0 ? '+' : ''}${conMod})`
            : '— (selecione uma classe)'}
        </span>
      </div>
      <div className="summary-row">
        <span>Percepção Passiva</span>
        <span>
          {percepcaoPassiva} (10 + mod. SAB {sabMod >= 0 ? '+' : ''}
          {sabMod})
        </span>
      </div>
      <div className="label" style={{ marginTop: 4 }}>
        ⚠️ Protótipo: Percepção Passiva aqui ainda não soma o Bônus de Proficiência quando o personagem tem
        proficiência em Percepção — ajustar quando virar código de verdade.
      </div>

      <div className="section-title">Nome do personagem</div>
      <input
        className="box"
        style={{ width: '100%', padding: 10, background: 'transparent', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 }}
        placeholder="digite o nome..."
        value={selection.nome}
        onChange={(e) => update({ nome: e.target.value })}
      />

      <div className="section-title">Aparência</div>
      <textarea
        className="box"
        style={{ width: '100%', padding: 10, background: 'transparent', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, minHeight: 50 }}
        placeholder="como seu personagem se parece?"
        value={selection.aparencia}
        onChange={(e) => update({ aparencia: e.target.value })}
      />

      <div className="section-title">Personalidade</div>
      <textarea
        className="box"
        style={{ width: '100%', padding: 10, background: 'transparent', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, minHeight: 50 }}
        placeholder="traços de personalidade, ideais, vínculos, defeitos"
        value={selection.personalidade}
        onChange={(e) => update({ personalidade: e.target.value })}
      />
      <div className="label" style={{ marginTop: 6 }}>
        nota futura: o livro sugere sortear traços de personalidade com base no alinhamento (tabela 1d4) — pode virar
        um botão "🎲 sortear traço" aqui depois.
      </div>

      <div className="section-title">Avatar</div>
      <div className="box" style={{ padding: 16, textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
        ＋ enviar imagem (opcional)
      </div>
    </>
  );
}
