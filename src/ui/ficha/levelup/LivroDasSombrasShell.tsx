import { useState } from 'react';
import { magias } from '../../../data/rulesets/dnd2024/magias';
import { truquesElegiveisLivroDasSombras, magiasRituaisElegiveisLivroDasSombras } from '../../../core/livroDasSombras';
import MagiaComDescricao from '../../components/MagiaComDescricao';
import styles from './LevelUpShell.module.css';

interface LivroDasSombrasShellProps {
  /** Conteúdo atual do livro (3 truques + 2 magias, nomes) — vazio na
   * 1ª vez que o jogador reconjura (personagem criado antes do Pacto
   * do Tomo existir, ou nunca escolheu na criação). */
  atuais: string[];
  /** Truques Conhecidos + Magias Preparadas NORMAIS do Bruxo — excluídos
   * do catálogo (regra real: "magias que você ainda não tem preparadas"). */
  truquesConhecidos: string[];
  magiasPreparadasConhecidas: string[];
  onConfirmar: (novaLista: string[]) => void;
  onFechar: () => void;
}

const MAX_TRUQUES = 3;
const MAX_MAGIAS = 2;

/** Tela de "Reconjurar o Livro das Sombras" (Bruxo, Pacto do Tomo) —
 * regra real: a escolha NÃO é fixa, pode ser refeita a cada Descanso
 * Curto/Longo (diferente de Truques/Magias Preparadas normais, que só
 * trocam 1 por level-up) — por isso aqui é escolha livre completa, sem
 * a trava de "só 1 troca" do Level Up. Ver DND-Regras.md. */
export default function LivroDasSombrasShell({
  atuais,
  truquesConhecidos,
  magiasPreparadasConhecidas,
  onConfirmar,
  onFechar,
}: LivroDasSombrasShellProps) {
  const [truquesEscolhidos, setTruquesEscolhidos] = useState<string[]>(
    atuais.filter((nome) => magias.find((m) => m.nome === nome)?.circulo === 0),
  );
  const [magiasEscolhidas, setMagiasEscolhidas] = useState<string[]>(
    atuais.filter((nome) => (magias.find((m) => m.nome === nome)?.circulo ?? -1) > 0),
  );

  const jaConhecidos = [...truquesConhecidos, ...magiasPreparadasConhecidas];
  const truquesCatalogo = truquesElegiveisLivroDasSombras(jaConhecidos);
  const magiasCatalogo = magiasRituaisElegiveisLivroDasSombras(jaConhecidos);

  function toggleTruque(nome: string) {
    if (truquesEscolhidos.includes(nome)) {
      setTruquesEscolhidos((prev) => prev.filter((x) => x !== nome));
    } else if (truquesEscolhidos.length < MAX_TRUQUES) {
      setTruquesEscolhidos((prev) => [...prev, nome]);
    }
  }

  function toggleMagia(nome: string) {
    if (magiasEscolhidas.includes(nome)) {
      setMagiasEscolhidas((prev) => prev.filter((x) => x !== nome));
    } else if (magiasEscolhidas.length < MAX_MAGIAS) {
      setMagiasEscolhidas((prev) => [...prev, nome]);
    }
  }

  const completo = truquesEscolhidos.length === MAX_TRUQUES && magiasEscolhidas.length === MAX_MAGIAS;

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.stepName}>Reconjurar o Livro das Sombras</div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="label" style={{ marginBottom: 8 }}>
          Escolha de novo os 3 truques + 2 magias rituais de 1º círculo do livro — podem ser de qualquer classe,
          desde que você ainda não as tenha preparadas fora do livro.
        </div>

        <div className="section-title">
          Truques — escolha {MAX_TRUQUES} ({truquesEscolhidos.length}/{MAX_TRUQUES})
        </div>
        {truquesCatalogo.map((m) => (
          <div key={m.id} className="check-row" onClick={() => toggleTruque(m.nome)}>
            <div className={`check-box ${truquesEscolhidos.includes(m.nome) ? 'checked' : ''}`} />
            <span className="check-label">
              <MagiaComDescricao magia={m} variante="icone" />{' '}
              <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>({m.classes.join(', ')})</span>
            </span>
          </div>
        ))}

        <div className="section-title" style={{ marginTop: 8 }}>
          Magias de 1º Círculo — Ritual — escolha {MAX_MAGIAS} ({magiasEscolhidas.length}/{MAX_MAGIAS})
        </div>
        {magiasCatalogo.map((m) => (
          <div key={m.id} className="check-row" onClick={() => toggleMagia(m.nome)}>
            <div className={`check-box ${magiasEscolhidas.includes(m.nome) ? 'checked' : ''}`} />
            <span className="check-label">
              <MagiaComDescricao magia={m} variante="icone" />{' '}
              <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>({m.classes.join(', ')})</span>
            </span>
          </div>
        ))}
      </div>

      <div className={styles.navLayer}>
        <div className={`btn ${styles.pill}`} onClick={onFechar}>
          ← Cancelar
        </div>
        <div
          className={`btn btn-primary ${styles.pill}`}
          style={completo ? undefined : { opacity: 0.5, pointerEvents: 'none' }}
          onClick={() => onConfirmar([...truquesEscolhidos, ...magiasEscolhidas])}
        >
          Confirmar ✓
        </div>
      </div>
    </div>
  );
}
