import type { AtributoFinal, ExplicacaoCalculo, PericiaFinal } from '../../../core/calculoPersonagem';
import type { Arma } from '../../../data/rulesets/dnd2024/armas';
import { buscarDescricaoMaestria } from '../../../data/rulesets/dnd2024/propriedadesMaestria';
import { useRoll } from '../../roll/RollContext';
import InfoValor from '../../components/InfoValor';
import ItemComDescricao from '../../components/ItemComDescricao';
import TrocarArmaMaestria from '../../components/TrocarArmaMaestria';
import styles from './AtributosTab.module.css';

interface AtributosTabProps {
  nivel: number;
  pvMax: number;
  pvAtual: number;
  ca: number | null;
  iniciativa: number | null;
  percepcaoPassiva: number | null;
  bonusProficiencia: number;
  explicacaoPv: ExplicacaoCalculo;
  explicacaoCa: ExplicacaoCalculo;
  explicacaoIniciativa: ExplicacaoCalculo;
  explicacaoPercepcaoPassiva: ExplicacaoCalculo;
  atributos: AtributoFinal[];
  pericias: PericiaFinal[];
  onDescansoLongo: () => void;
  onDescansoCurto: () => void;
  restStatus: string | null;
  onAbrirLevelUp: () => void;
  maestriaArma: string[];
  armasParaMaestria: Arma[];
  onTrocarArmaMaestria: (armaAntiga: string, armaNova: string) => void;
}

export default function AtributosTab({
  nivel,
  pvMax,
  pvAtual,
  ca,
  iniciativa,
  percepcaoPassiva,
  bonusProficiencia,
  explicacaoPv,
  explicacaoCa,
  explicacaoIniciativa,
  explicacaoPercepcaoPassiva,
  atributos,
  pericias,
  onDescansoLongo,
  onDescansoCurto,
  restStatus,
  onAbrirLevelUp,
  maestriaArma,
  armasParaMaestria,
  onTrocarArmaMaestria,
}: AtributosTabProps) {
  const { rolarD20 } = useRoll();

  return (
    <>
      <div className={`box-solid ${styles.levelBox}`}>
        <div>
          <div className="label">nível atual</div>
          <div style={{ fontSize: 18 }}>{nivel}</div>
        </div>
        <div className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={onAbrirLevelUp}>
          ⬆ Level Up
        </div>
      </div>

      <div className="stat-grid">
        {atributos.map((a) => (
          <div
            key={a.atributo}
            className="box stat-box"
            onClick={() => rolarD20({ label: a.atributo, formula: `1d20 ${a.mod >= 0 ? '+' : '-'} ${Math.abs(a.mod)}`, mod: a.mod })}
          >
            <div className="stat-name">{a.atributo}</div>
            <div className="stat-mod">{a.valor}</div>
            <div className="stat-val">
              {a.mod >= 0 ? '+' : ''}
              {a.mod}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.hpRow}>
        <div className={`box ${styles.hpBox}`}>
          <div className="label">
            PV <InfoValor titulo="Pontos de Vida máximos" explicacao={explicacaoPv} />
          </div>
          <div className={styles.hpNum}>
            {pvAtual}/{pvMax}
          </div>
        </div>
        <div className={`box ${styles.hpBox}`}>
          <div className="label">
            CA <InfoValor titulo="Classe de Armadura" explicacao={explicacaoCa} />
          </div>
          <div className={styles.hpNum}>{ca ?? '—'}</div>
        </div>
        <div
          className={`box ${styles.hpBox}`}
          onClick={() =>
            iniciativa !== null && rolarD20({ label: 'Iniciativa', formula: `1d20 + ${iniciativa}`, mod: iniciativa })
          }
        >
          <div className="label">
            Iniciativa <InfoValor titulo="Iniciativa" explicacao={explicacaoIniciativa} />
          </div>
          <div className={styles.hpNum}>
            {iniciativa !== null ? `${iniciativa >= 0 ? '+' : ''}${iniciativa} 🎲` : '—'}
          </div>
        </div>
      </div>

      <div className="section-title">Perícias</div>
      <div className={styles.skillRow}>
        <span>Bônus de Proficiência</span>
        <span>
          {bonusProficiencia >= 0 ? '+' : ''}
          {bonusProficiencia}
        </span>
      </div>
      {pericias.map((p) => (
        <div
          key={p.nome}
          className={styles.skillRow}
          onClick={() => rolarD20({ label: p.nome, formula: `1d20 ${p.mod >= 0 ? '+' : '-'} ${Math.abs(p.mod)}`, mod: p.mod })}
        >
          <span>
            {p.proficiente ? '🔵' : '⚫'} {p.especialista && '⭐ '}
            {p.nome} ({p.atributo}) 🎲 <InfoValor titulo={p.nome} explicacao={p.explicacao} />
          </span>
          <span>
            {p.mod >= 0 ? '+' : ''}
            {p.mod}
          </span>
        </div>
      ))}
      <div className={styles.skillRow}>
        <span>
          Percepção Passiva <InfoValor titulo="Percepção Passiva" explicacao={explicacaoPercepcaoPassiva} />
        </span>
        <span>{percepcaoPassiva ?? '—'}</span>
      </div>
      <div className="label" style={{ marginTop: 6, marginBottom: 12 }}>
        toque num atributo, perícia ou iniciativa pra rolar o dado.
      </div>

      {maestriaArma.length > 0 && (
        <>
          <div className="section-title">Maestria em Arma</div>
          {maestriaArma.map((nome) => {
            const arma = armasParaMaestria.find((a) => a.nome === nome);
            return (
              <div key={nome} className={styles.maestriaRow}>
                <div className={styles.maestriaTop}>
                  <span>{nome}</span>
                  <TrocarArmaMaestria
                    armaAtual={nome}
                    todasAsArmas={armasParaMaestria}
                    jaEscolhidas={maestriaArma}
                    onTrocar={(nova) => onTrocarArmaMaestria(nome, nova)}
                  />
                </div>
                {arma && (
                  <div className={styles.maestriaDetalhe}>
                    {arma.dano} ·{' '}
                    <ItemComDescricao nome={arma.maestria} descricao={buscarDescricaoMaestria(arma.maestria)} variante="icone" />
                  </div>
                )}
              </div>
            );
          })}
          <div className="label" style={{ marginTop: 2, marginBottom: 12 }}>
            você pode trocar 1 arma a cada Descanso Longo.
          </div>
        </>
      )}

      <div className="section-title">Descanso</div>
      <div className={styles.actionGrid}>
        <div className={`box ${styles.actionBtn}`} onClick={onDescansoCurto}>
          <div className={styles.aName}>Descanso Curto</div>
          <div className={styles.aType}>1 hora</div>
        </div>
        <div className={`box ${styles.actionBtn}`} onClick={onDescansoLongo}>
          <div className={styles.aName}>Descanso Longo</div>
          <div className={styles.aType}>8 horas</div>
        </div>
      </div>
      {restStatus && <div className={styles.restStatus}>{restStatus}</div>}
    </>
  );
}
