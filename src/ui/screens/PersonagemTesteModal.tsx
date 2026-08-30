import { useState } from 'react';
import { armazenamentoPersonagens } from '../../core/armazenamentoPersonagens';
import { gerarPersonagemTeste, opcoesGeradorTeste } from '../../core/geradorPersonagemTeste';
import { classes } from '../../data/rulesets/dnd2024/classes';
import { niveisComASI } from '../../core/levelUp';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import styles from './PersonagemTesteModal.module.css';

const NIVEIS = Array.from({ length: 20 }, (_, i) => i + 1);

interface PersonagemTesteModalProps {
  onFechar: () => void;
  onCriado: (id: string) => void;
}

/** Popup "🎲 Personagem de Teste" — só pede Classe/Origem/Espécie/
 * Nível e gera uma ficha completa na hora (tudo o resto sorteado),
 * pra testar telas sem passar pelo wizard de 10 passos toda vez. Ver
 * `core/geradorPersonagemTeste.ts` e DECISOES-DESIGN.md. */
export default function PersonagemTesteModal({ onFechar, onCriado }: PersonagemTesteModalProps) {
  useLockBodyScroll(true);
  const opcoes = opcoesGeradorTeste();
  const [classeNome, setClasseNome] = useState(opcoes.classes[0]?.nome ?? '');
  const [origemNome, setOrigemNome] = useState(opcoes.origens[0]?.nome ?? '');
  const [especieNome, setEspecieNome] = useState(opcoes.especies[0]?.nome ?? '');
  const [nivel, setNivel] = useState(1);
  const [gerando, setGerando] = useState(false);

  const classeObj = classes.find((c) => c.nome === classeNome);
  const niveisAsiDaClasse = classeObj ? niveisComASI(classeObj) : [];

  function criar() {
    setGerando(true);
    const personagem = gerarPersonagemTeste({ classeNome, origemNome, especieNome, nivelAlvo: nivel });
    armazenamentoPersonagens.salvar(personagem);
    onCriado(personagem.id);
  }

  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>🎲 Personagem de Teste</div>
        <div className={styles.desc}>
          Gera uma ficha completa na hora, com tudo sorteado (atributos, perícias, magias, talentos, equipamento
          inicial da Classe/Origem) — pra testar rápido sem passar pelo wizard.
        </div>

        <div className={styles.field}>
          <div className="label" style={{ marginBottom: 4 }}>
            Classe
          </div>
          <select className={styles.select} value={classeNome} onChange={(e) => setClasseNome(e.target.value)}>
            {opcoes.classes.map((c) => (
              <option key={c.id} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <div className="label" style={{ marginBottom: 4 }}>
            Origem
          </div>
          <select className={styles.select} value={origemNome} onChange={(e) => setOrigemNome(e.target.value)}>
            {opcoes.origens.map((o) => (
              <option key={o.id} value={o.nome}>
                {o.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <div className="label" style={{ marginBottom: 4 }}>
            Espécie
          </div>
          <select className={styles.select} value={especieNome} onChange={(e) => setEspecieNome(e.target.value)}>
            {opcoes.especies.map((e) => (
              <option key={e.id} value={e.nome}>
                {e.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field} style={{ marginBottom: 0 }}>
          <div className="label" style={{ marginBottom: 4 }}>
            Nível
          </div>
          <select className={styles.select} value={nivel} onChange={(e) => setNivel(Number(e.target.value))}>
            {NIVEIS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {niveisAsiDaClasse.length > 0 && (
            <>
              <div className="label" style={{ marginTop: 8, marginBottom: 4 }}>
                Ou 1 nível antes de um Talento, pra subir na mão e escolher você mesmo:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {niveisAsiDaClasse.map((nivelAsi) => (
                  <span
                    key={nivelAsi}
                    className={`tag ${nivel === nivelAsi - 1 ? styles.tagAtivo : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setNivel(nivelAsi - 1)}
                  >
                    nível {nivelAsi - 1} (Talento no {nivelAsi})
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={styles.actions}>
          <div className="btn" style={{ flex: 1 }} onClick={onFechar}>
            Cancelar
          </div>
          <div
            className="btn btn-primary"
            style={{ flex: 1, opacity: gerando ? 0.6 : 1, pointerEvents: gerando ? 'none' : undefined }}
            onClick={criar}
          >
            {gerando ? 'Gerando...' : 'Criar'}
          </div>
        </div>
      </div>
    </div>
  );
}
