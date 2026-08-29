import type { Atributo } from '../../../data/wizardFixtures';
import { talentos, type Talento } from '../../../data/rulesets/dnd2024/talentos';
import styles from './LevelUpShell.module.css';

interface TelaEscolherTalentoProps {
  nivelAtual: number;
  atributosFinais: Record<Atributo, number>;
  talentosGeraisAtuais: string[];
  onEscolher: (id: string) => void;
  onFechar: () => void;
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

/** Tela cheia de seleção de Talento Geral (Fase 3 do plano de
 * Talentos) — aberta a partir do passo de ASI do Level Up quando o
 * jogador escolhe "Escolher um Talento". Só a lista + validação de
 * Nível/Atributo Mínimo (dado real); "Outro Pré-requisito" (texto
 * livre) aparece como aviso não-bloqueante, nunca trava a escolha.
 * Talento fica salvo `[PH]` — Fase 4 aplica o efeito mecânico de
 * verdade, talento por talento. */
export default function TelaEscolherTalento({
  nivelAtual,
  atributosFinais,
  talentosGeraisAtuais,
  onEscolher,
  onFechar,
}: TelaEscolherTalentoProps) {
  const opcoes = talentos.filter(
    (t) => t.categoria === 'Geral' && (t.repetivel || !talentosGeraisAtuais.includes(t.id)),
  );

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.stepName}>Escolher um Talento</div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="label" style={{ marginBottom: 10 }}>
          Talentos Gerais (Cap. 5) — escolher aqui não aplica nenhum efeito mecânico ainda,
          só fica salvo e mostrado na Ficha (<code>[PH]</code>).
        </div>
        {opcoes.map((t) => {
          const motivo = motivoIndisponivel(t, nivelAtual, atributosFinais);
          const disponivel = motivo === null;
          return (
            <div
              key={t.id}
              className="opt-card"
              style={disponivel ? { cursor: 'pointer' } : { opacity: 0.45, pointerEvents: 'none' }}
              onClick={() => disponivel && onEscolher(t.id)}
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
      </div>

      <div className={styles.navLayer}>
        <div className={`btn ${styles.pill}`} onClick={onFechar}>
          ← Voltar
        </div>
      </div>
    </div>
  );
}
