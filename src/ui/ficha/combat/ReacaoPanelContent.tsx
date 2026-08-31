import { useState } from 'react';
import type { Magia } from '../../../data/rulesets/dnd2024/magias';
import { classificarMagia, iconesMagia } from '../../../core/classificarMagia';
import { useRoll } from '../../roll/RollContext';
import MagiaComDescricao from '../../components/MagiaComDescricao';
import styles from './PanelRows.module.css';

interface ReacaoPanelContentProps {
  onEscolher: (nome: string, desc: string) => void;
  gastarSlotCirculo: (circulo: number) => boolean;
  conjura: boolean;
  magiasReacao: Magia[];
  modAcertoConjuracao: number | null;
  detalhesAtivo: boolean;
  contraEncantamentoDisponivel: boolean;
}

export default function ReacaoPanelContent({
  onEscolher,
  gastarSlotCirculo,
  conjura,
  magiasReacao,
  modAcertoConjuracao,
  detalhesAtivo,
  contraEncantamentoDisponivel,
}: ReacaoPanelContentProps) {
  const [aviso, setAviso] = useState<string | null>(null);
  const { rolarD20 } = useRoll();

  function conjurarMagia(m: Magia) {
    if (m.circulo > 0) {
      const ok = gastarSlotCirculo(m.circulo);
      if (!ok) {
        setAviso(`Sem Espaço de Magia de ${m.circulo}º círculo disponível. Veja a aba Magias pra saber quando recupera.`);
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

  function usarContraEncantamento() {
    rolarD20({
      label: 'Contra-Encantamento (nova salvaguarda)',
      formula: '1d20 com Vantagem + seu mod. de salvaguarda',
      mod: 0,
      vantagem: 'vantagem',
    });
    onEscolher(
      '🎶 Contra-Encantamento',
      'Some seu modificador de salvaguarda (ou o de quem está sendo protegido, se não for você) ao resultado mostrado.',
    );
  }

  return (
    <>
      {contraEncantamentoDisponivel && (
        <div className={styles.row} onClick={usarContraEncantamento}>
          <div className={styles.rowName}>🎶 Contra-Encantamento</div>
          {detalhesAtivo && (
            <div className={styles.rowDesc}>
              Você ou uma criatura a até 9m falhou salvaguarda contra Amedrontado/Enfeitiçado — role de novo, com
              Vantagem. Sem custo de recurso.
            </div>
          )}
        </div>
      )}
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
            <div className="label" style={{ color: 'var(--danger)', marginBottom: 8, marginTop: 8 }}>
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
        {detalhesAtivo && (
          <div className={styles.rowDesc}>Disponível por padrão pra qualquer personagem, sem precisar de característica de classe</div>
        )}
      </div>
    </>
  );
}
