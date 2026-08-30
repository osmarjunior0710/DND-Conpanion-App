import type { Atributo } from '../../../data/wizardFixtures';
import { talentos, type Talento } from '../../../data/rulesets/dnd2024/talentos';

interface TelaEscolherTalentoProps {
  nivelAtual: number;
  atributosFinais: Record<Atributo, number>;
  talentosGeraisAtuais: string[];
  selecionado: string | null;
  onSelecionar: (id: string) => void;
}

function motivoIndisponivel(t: Talento, nivelAtual: number, atributosFinais: Record<Atributo, number>): string | null {
  if (t.prerequisitos.nivelMinimo !== null && nivelAtual < t.prerequisitos.nivelMinimo) {
    return `Requer nível ${t.prerequisitos.nivelMinimo}+`;
  }
  const faltando = t.prerequisitos.atributosMinimos.filter((a) => (atributosFinais[a] ?? 10) < 13);
  if (faltando.length > 0) {
    return `Requer ${faltando.join('/')} 13+`;
  }
  return null;
}

/** Lista de seleção de Talento Geral (Fase 3 do plano de Talentos) —
 * renderizada dentro do passo "asi" do Level Up, junto do resto do
 * passo. Só um <> de opt-cards controlado pelo pai: tocar num talento
 * só marca a seleção (`onSelecionar`), mesmo padrão de toda outra
 * escolha do Level Up — quem confirma e avança é sempre o "Avançar"
 * do passo, não um botão próprio desta lista. Talento fica salvo
 * `[PH]` — Fase 4 aplica o efeito mecânico de verdade, talento por
 * talento. */
export default function TelaEscolherTalento({
  nivelAtual,
  atributosFinais,
  talentosGeraisAtuais,
  selecionado,
  onSelecionar,
}: TelaEscolherTalentoProps) {
  const opcoes = talentos.filter(
    (t) => t.categoria === 'Geral' && (t.repetivel || !talentosGeraisAtuais.includes(t.id) || t.id === selecionado),
  );

  return (
    <>
      <div className="label" style={{ marginTop: 14, marginBottom: 10 }}>
        Talentos Gerais (Cap. 5) — escolher aqui não aplica nenhum efeito mecânico ainda,
        só fica salvo e mostrado na Ficha (<code>[PH]</code>).
      </div>
      {opcoes.map((t) => {
        const motivo = motivoIndisponivel(t, nivelAtual, atributosFinais);
        const disponivel = motivo === null;
        return (
          <div
            key={t.id}
            className={`opt-card ${selecionado === t.id ? 'selected' : ''}`}
            style={disponivel ? { cursor: 'pointer' } : { opacity: 0.45, pointerEvents: 'none' }}
            onClick={() => disponivel && onSelecionar(t.id)}
          >
            <div className="opt-card-name">
              {t.nome}
              {!disponivel && <span style={{ color: 'var(--danger)', fontSize: 12 }}> · {motivo}</span>}
            </div>
            <div className="opt-card-desc">{t.beneficios}</div>
            {t.prerequisitos.outro && (
              <div style={{ color: 'var(--text-faint)', fontSize: 12, marginTop: 4 }}>
                ⚠️ Requer: {t.prerequisitos.outro} — confirme que seu personagem atende
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
