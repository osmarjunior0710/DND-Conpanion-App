import type { Classe } from '../../../data/rulesets/dnd2024/classes';
import { espacosDeMagiaAtivos, truquesDoPersonagem, magiasPreparadasDoPersonagem } from '../../../core/magiasPersonagem';
import MagiaComDescricao from '../../components/MagiaComDescricao';
import TickPips from '../../components/TickPips';
import { useColapsavel } from '../../hooks/useColapsavel';
import styles from './MagiasTab.module.css';

interface MagiasTabProps {
  classe: Classe | null;
  nivel: number;
  espacosGastosPorCirculo: Record<number, number>;
  conjura: boolean;
  truquesAtuais: string[];
  magiasPreparadasAtuais: string[];
  faltamTruques: number;
  faltamMagiasPreparadas: number;
  onCompletarTruques: () => void;
  onCompletarMagiasPreparadas: () => void;
}

export default function MagiasTab({
  classe,
  nivel,
  espacosGastosPorCirculo,
  conjura,
  truquesAtuais,
  magiasPreparadasAtuais,
  faltamTruques,
  faltamMagiasPreparadas,
  onCompletarTruques,
  onCompletarMagiasPreparadas,
}: MagiasTabProps) {
  if (!conjura) {
    return (
      <div className="box" style={{ padding: 14, color: 'var(--text-faint)', fontSize: 13, textAlign: 'center' }}>
        Esse personagem não tem nenhuma fonte de conjuração no momento (nem pela classe, nem por multiclasse).
      </div>
    );
  }

  const espacos = espacosDeMagiaAtivos(classe, nivel);
  const truques = truquesDoPersonagem(truquesAtuais);
  const preparadas = magiasPreparadasDoPersonagem(magiasPreparadasAtuais);
  const [espacosExpandido, setEspacosExpandido] = useColapsavel('espacos-de-magia', true);

  const temCurto = espacos.some((e) => e.recuperaNoDescansoCurto);
  const temLongo = espacos.some((e) => !e.recuperaNoDescansoCurto);
  const avisoRecuperacao =
    temCurto && temLongo
      ? 'Recupera no Descanso Curto ou Longo, conforme o círculo.'
      : temCurto
        ? 'Recupera no Descanso Curto.'
        : 'Recupera no Descanso Longo.';

  return (
    <>
      {espacos.length > 0 && (
        <>
          <div className={styles.grupoHeader} onClick={() => setEspacosExpandido(!espacosExpandido)}>
            <span>Espaços de Magia</span>
            <span>{espacosExpandido ? '▾' : '▸'}</span>
          </div>
          {espacosExpandido && (
            <>
              <div className="label" style={{ margin: '0 0 var(--space-2)' }}>
                {avisoRecuperacao}
              </div>
              {espacos.map((espaco, i) => {
                const gasto = espacosGastosPorCirculo[espaco.circulo] ?? 0;
                return (
                  <div key={espaco.circulo} className={styles.espacoRow} style={i === 0 ? { borderTop: 'none' } : undefined}>
                    <span>{espaco.circulo}º círculo</span>
                    <TickPips total={espaco.maximo} usados={gasto} tamanho="lg" />
                  </div>
                );
              })}
            </>
          )}
        </>
      )}

      {(truques.length > 0 || faltamTruques > 0) && (
        <>
          <div className="section-title">Truques</div>
          {faltamTruques > 0 && (
            <div className={styles.avisoFaltando} onClick={onCompletarTruques}>
              ⚠️ Faltam {faltamTruques} truque{faltamTruques > 1 ? 's' : ''} pro seu nível — toque pra escolher
            </div>
          )}
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

      {(preparadas.length > 0 || faltamMagiasPreparadas > 0) && (
        <>
          <div className="section-title">Magias Preparadas</div>
          {faltamMagiasPreparadas > 0 && (
            <div className={styles.avisoFaltando} onClick={onCompletarMagiasPreparadas}>
              ⚠️ Faltam {faltamMagiasPreparadas} magia{faltamMagiasPreparadas > 1 ? 's' : ''} preparada
              {faltamMagiasPreparadas > 1 ? 's' : ''} pro seu nível — toque pra escolher
            </div>
          )}
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
