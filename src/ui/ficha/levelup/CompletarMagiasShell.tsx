import { useState } from 'react';
import type { Magia } from '../../../data/rulesets/dnd2024/magias';
import { agruparMagiasPorCirculo } from '../../../core/magiasPersonagem';
import { iconesMagia } from '../../../core/classificarMagia';
import MagiaComDescricao from '../../components/MagiaComDescricao';
import GrupoMagiaColapsavel from '../../components/GrupoMagiaColapsavel';
import styles from './LevelUpShell.module.css';

interface CompletarMagiasShellProps {
  titulo: string;
  atuais: string[];
  catalogo: Magia[];
  deficit: number;
  onConfirmar: (novaLista: string[]) => void;
  onFechar: () => void;
}

/** Tela de "completar" Truques/Magias Preparadas faltando — diferente
 * do step de Level Up (que permite trocar 1), aqui só existe
 * ADICIONAR: os que já são do personagem ficam travados (marcados,
 * não dá pra desmarcar), só falta escolher o restante até fechar a
 * conta. Não é level-up — é corrigir um descompasso entre o que a
 * ficha tem e o que a tabela da classe diz que deveria ter nesse
 * nível (ver PENDENCIAS.md "Detector genérico de ficha atrasada"). */
export default function CompletarMagiasShell({ titulo, atuais, catalogo, deficit, onConfirmar, onFechar }: CompletarMagiasShellProps) {
  const [escolhidas, setEscolhidas] = useState<string[]>([]);

  function toggle(nome: string) {
    if (atuais.includes(nome)) return;
    const i = escolhidas.indexOf(nome);
    if (i > -1) {
      setEscolhidas((prev) => prev.filter((x) => x !== nome));
      return;
    }
    if (escolhidas.length < deficit) setEscolhidas((prev) => [...prev, nome]);
  }

  const completo = escolhidas.length === deficit;

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.stepName}>Completar {titulo}</div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="section-title">
          {titulo} faltando — escolha {deficit} ({escolhidas.length}/{deficit})
        </div>
        <div className="label" style={{ marginBottom: 8 }}>
          Sua ficha tem menos {titulo.toLowerCase()} do que a tabela da classe diz que você deveria ter nesse nível
          (provavelmente um Level Up passou sem essa escolha). Os que você já tem ficam marcados e travados — só
          falta escolher o restante.
        </div>
        {agruparMagiasPorCirculo(catalogo).map((grupo) => (
          <GrupoMagiaColapsavel key={grupo.circulo} label={grupo.label} magias={grupo.magias}>
            {(m) => {
              const travado = atuais.includes(m.nome);
              const marcado = travado || escolhidas.includes(m.nome);
              return (
                <div
                  key={m.id}
                  className={`check-row ${travado ? styles.truqueAtual : ''}`}
                  style={travado ? { cursor: 'default' } : undefined}
                  onClick={() => toggle(m.nome)}
                >
                  <div className={`check-box ${marcado ? 'checked' : ''}`} />
                  <span className="check-label">
                    <MagiaComDescricao magia={m} variante="icone" /> {iconesMagia(m)}
                    {' '}<span style={{ color: 'var(--text-faint)', fontSize: 12 }}>
                      ({m.circulo === 0 ? m.escola : `${m.circulo}º círculo`}
                      {travado ? ' · já tinha' : ''})
                    </span>
                  </span>
                </div>
              );
            }}
          </GrupoMagiaColapsavel>
        ))}
      </div>

      <div className={styles.navLayer}>
        <div className={`btn ${styles.pill}`} onClick={onFechar}>
          ← Cancelar
        </div>
        <div
          className={`btn btn-primary ${styles.pill}`}
          style={completo ? undefined : { opacity: 0.5, pointerEvents: 'none' }}
          onClick={() => onConfirmar([...atuais, ...escolhidas])}
        >
          Confirmar ✓
        </div>
      </div>
    </div>
  );
}
