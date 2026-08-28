import type { Classe } from '../../../data/rulesets/dnd2024/classes';
import type { WizardSelection } from '../../../core/personagem';
import { espacosDeMagiaAtivos, truquesDoPersonagem, magiasPreparadasDoPersonagem } from '../../../core/magiasPersonagem';
import MagiaComDescricao from '../../components/MagiaComDescricao';
import styles from './MagiasTab.module.css';

interface MagiasTabProps {
  selecao: WizardSelection;
  classe: Classe | null;
  nivel: number;
  espacosGastosPorCirculo: Record<number, number>;
  conjura: boolean;
  truquesAtuais: string[];
}

export default function MagiasTab({ selecao, classe, nivel, espacosGastosPorCirculo, conjura, truquesAtuais }: MagiasTabProps) {
  if (!conjura) {
    return (
      <div className="box" style={{ padding: 14, color: 'var(--text-faint)', fontSize: 13, textAlign: 'center' }}>
        Esse personagem não tem nenhuma fonte de conjuração no momento (nem pela classe, nem por multiclasse).
      </div>
    );
  }

  const espacos = espacosDeMagiaAtivos(classe, nivel);
  const truques = truquesDoPersonagem(truquesAtuais);
  const preparadas = magiasPreparadasDoPersonagem(selecao);

  return (
    <>
      {espacos.length > 0 && (
        <>
          <div className="section-title">Espaços de Magia</div>
          {espacos.map((espaco) => {
            const gasto = espacosGastosPorCirculo[espaco.circulo] ?? 0;
            return (
              <div key={espaco.circulo} style={{ marginBottom: 12 }}>
                <div className="label">{espaco.circulo}º círculo</div>
                <div className={styles.slotRow}>
                  {Array.from({ length: espaco.maximo }).map((_, i) => (
                    <div key={i} className={`${styles.slotPip} ${i < gasto ? styles.slotPipGasto : ''}`}>
                      {i < gasto ? '✓' : '①'}
                    </div>
                  ))}
                </div>
                <div className="label">
                  {espaco.maximo - gasto}/{espaco.maximo} disponíveis — recupera no{' '}
                  {espaco.recuperaNoDescansoCurto ? 'Descanso Curto' : 'Descanso Longo'}.
                </div>
              </div>
            );
          })}
        </>
      )}

      {truques.length > 0 && (
        <>
          <div className="section-title">Truques</div>
          {truques.map((m) => (
            <div key={m.id} className={styles.spellRow}>
              <div className={styles.spellName}>
                <MagiaComDescricao magia={m} variante="icone" />
              </div>
              <span className="label">{m.escola}</span>
            </div>
          ))}
        </>
      )}

      {preparadas.length > 0 && (
        <>
          <div className="section-title">Magias Preparadas</div>
          {preparadas.map((m) => (
            <div key={m.id} className={styles.spellRow}>
              <div className={styles.spellName}>
                <MagiaComDescricao magia={m} variante="icone" />
              </div>
              <span className="label">{m.circulo}º círculo</span>
            </div>
          ))}
        </>
      )}

      <div className="label" style={{ marginTop: 8 }}>
        Conjurar de verdade (gastar espaço, rolar ataque/dano) acontece pela aba Combat, dentro do painel de Ação.
      </div>
    </>
  );
}
