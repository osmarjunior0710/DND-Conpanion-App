import { useState } from 'react';
import type { Magia } from '../../../data/rulesets/dnd2024/magias';
import { classificarMagia, iconesMagia } from '../../../core/classificarMagia';
import { useRoll } from '../../roll/RollContext';
import MagiaComDescricao from '../../components/MagiaComDescricao';
import styles from './PanelRows.module.css';

interface ReacaoPanelContentProps {
  onEscolher: (nome: string, desc: string) => void;
  gastarSlot: () => boolean;
  conjura: boolean;
  magiasReacao: Magia[];
  modAcertoConjuracao: number | null;
}

export default function ReacaoPanelContent({
  onEscolher,
  gastarSlot,
  conjura,
  magiasReacao,
  modAcertoConjuracao,
}: ReacaoPanelContentProps) {
  const [aviso, setAviso] = useState<string | null>(null);
  const { rolarD20 } = useRoll();

  function conjurarMagia(m: Magia) {
    if (m.circulo > 0) {
      const ok = gastarSlot();
      if (!ok) {
        setAviso('Sem Espaços de Magia disponíveis. Veja a aba Magias pra saber quando recupera.');
        return;
      }
    }
    setAviso(null);
    const classificacao = classificarMagia(m);
    if (classificacao.ataque && modAcertoConjuracao !== null) {
      rolarD20({
        label: `Ataque de Magia — ${m.nome}`,
        formula: `1d20 + ${modAcertoConjuracao}`,
        mod: modAcertoConjuracao,
      });
      onEscolher(`✨ ${m.nome}`, 'Rolagem de acerto feita. Veja a descrição da magia (ⓘ) pro dano.');
      return;
    }
    onEscolher(`✨ ${m.nome}`, m.descricaoCurta ?? '');
  }

  return (
    <>
      {conjura && magiasReacao.length > 0 && (
        <>
          {magiasReacao.map((m) => (
            <div key={m.id} className={styles.spellMiniRow} onClick={() => conjurarMagia(m)}>
              <span>
                <MagiaComDescricao magia={m} variante="icone" /> {iconesMagia(m)}
              </span>
              <span className="tag">{m.circulo === 0 ? 'Truque' : `${m.circulo}º círculo`}</span>
            </div>
          ))}
          {aviso && (
            <div className="label" style={{ color: 'var(--warn)', marginBottom: 8, marginTop: 8 }}>
              {aviso}
            </div>
          )}
        </>
      )}
      <div
        className={styles.row}
        onClick={() =>
          onEscolher(
            '⚔ Ataque de Oportunidade',
            'Disponível por padrão pra qualquer personagem, quando um inimigo visível sai do seu alcance.',
          )
        }
      >
        <div className={styles.rowName}>⚔ Ataque de Oportunidade</div>
        <div className={styles.rowDesc}>Disponível por padrão pra qualquer personagem, sem precisar de característica de classe</div>
      </div>
    </>
  );
}
