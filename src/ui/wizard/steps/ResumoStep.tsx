import {
  calcularCA,
  calcularOuroInicial,
  calcularPercepcaoPassiva,
  calcularPvMaximoNivel1,
  explicarCA,
  explicarOuroInicial,
  explicarPercepcaoPassiva,
  explicarPvMaximoNivel1,
} from '../../../core/calculoPersonagem';
import InfoValor from '../../components/InfoValor';
import type { StepProps } from './StepProps';

export default function ResumoStep({ selection, update }: StepProps) {
  const pvMax = calcularPvMaximoNivel1(selection);
  const ca = calcularCA(selection);
  const percepcaoPassiva = calcularPercepcaoPassiva(selection);
  const ouroInicial = calcularOuroInicial(selection);

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
          {pvMax !== null ? pvMax : '— (selecione uma classe)'}
          {pvMax !== null && <InfoValor titulo="Pontos de Vida máximos" explicacao={explicarPvMaximoNivel1(selection)} />}
        </span>
      </div>
      <div className="summary-row">
        <span>Classe de Armadura</span>
        <span>
          {ca !== null ? ca : '—'}
          {ca !== null && <InfoValor titulo="Classe de Armadura" explicacao={explicarCA(selection)} />}
        </span>
      </div>
      <div className="summary-row">
        <span>Percepção Passiva</span>
        <span>
          {percepcaoPassiva !== null ? percepcaoPassiva : '—'}
          {percepcaoPassiva !== null && (
            <InfoValor titulo="Percepção Passiva" explicacao={explicarPercepcaoPassiva(selection)} />
          )}
        </span>
      </div>
      <div className="summary-row">
        <span>Ouro inicial</span>
        <span>
          {ouroInicial} PO
          <InfoValor titulo="Ouro inicial" explicacao={explicarOuroInicial(selection)} />
        </span>
      </div>

      <div className="section-title">Nome do personagem</div>
      <input
        className="box"
        style={{ width: '100%', padding: 10, background: 'transparent', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13 }}
        placeholder="digite o nome..."
        value={selection.nome}
        onChange={(e) => update({ nome: e.target.value })}
      />

      <div className="section-title">Aparência</div>
      <textarea
        className="box"
        style={{ width: '100%', padding: 10, background: 'transparent', color: 'var(--text)', fontFamily: 'inherit', fontSize: 12, minHeight: 50 }}
        placeholder="como seu personagem se parece?"
        value={selection.aparencia}
        onChange={(e) => update({ aparencia: e.target.value })}
      />

      <div className="section-title">Personalidade</div>
      <textarea
        className="box"
        style={{ width: '100%', padding: 10, background: 'transparent', color: 'var(--text)', fontFamily: 'inherit', fontSize: 12, minHeight: 50 }}
        placeholder="traços de personalidade, ideais, vínculos, defeitos"
        value={selection.personalidade}
        onChange={(e) => update({ personalidade: e.target.value })}
      />
      <div className="label" style={{ marginTop: 6 }}>
        nota futura: o livro sugere sortear traços de personalidade com base no alinhamento (tabela 1d4) — pode virar
        um botão "🎲 sortear traço" aqui depois.
      </div>

      <div className="section-title">Avatar</div>
      <div className="box" style={{ padding: 16, textAlign: 'center', color: 'var(--text-faint)', fontSize: 12 }}>
        [PH] ＋ enviar imagem (opcional) — ainda não funciona, por enquanto a Lista de Personagens usa o emblema da
        Classe no lugar
      </div>
    </>
  );
}
