import { useState } from 'react';
import { dadoVidaValor } from '../../../data/levelUpFixtures';
import type { Classe } from '../../../data/rulesets/dnd2024/classes';
import { estilosDeLuta } from '../../../data/rulesets/dnd2024/estilosDeLuta';
import { caracteristicasDoNivel, niveisComASI, niveisComDadivaEpica, temEstiloDeLutaTrocavel } from '../../../core/levelUp';
import { useRoll } from '../../roll/RollContext';
import styles from './LevelUpShell.module.css';

export interface PersonagemNivel {
  nivel: number;
  pvMax: number;
  dadoVida: string;
  conMod: number;
  subclasse: string | null;
  estiloDeLuta: string | null;
}

interface LevelUpShellProps {
  personagem: PersonagemNivel;
  classe: Classe;
  onFechar: () => void;
  onConfirmar: (resultado: {
    novoNivel: number;
    pvGanho: number;
    subclasseEscolhida: string | null;
    estiloDeLutaEscolhido: string | null;
  }) => void;
}

type LuStep = 'pv' | 'features' | 'subclasse' | 'estiloDeLuta' | 'asi' | 'dadivaEpica' | 'resumo';

const NOMES_ATRIBUTOS = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

export default function LevelUpShell({ personagem, classe, onFechar, onConfirmar }: LevelUpShellProps) {
  const { rolarDados } = useRoll();
  const novoNivel = personagem.nivel + 1;

  const luSteps: LuStep[] = ['pv', 'features'];
  if (classe.nivelSubclasse === novoNivel && !personagem.subclasse) luSteps.push('subclasse');
  if (temEstiloDeLutaTrocavel(classe, novoNivel)) luSteps.push('estiloDeLuta');
  if (niveisComASI(classe).includes(novoNivel)) luSteps.push('asi');
  if (niveisComDadivaEpica(classe).includes(novoNivel)) luSteps.push('dadivaEpica');
  luSteps.push('resumo');

  const [luIndex, setLuIndex] = useState(0);
  const [hpModo, setHpModo] = useState<'media' | 'rolar' | null>(null);
  const [hpRolado, setHpRolado] = useState<number | null>(null);
  // Escolha de subclasse ainda não tem UI própria (nenhuma subclasse
  // foi importada ainda — ver PENDENCIAS.md, plano "Guerreiro 1-20").
  // Fica null até essa entrega existir; a etapa "subclasse" só mostra
  // um aviso, sem travar o avanço.
  const subclasseEscolhida: string | null = null;
  const [estiloDeLutaEscolhido, setEstiloDeLutaEscolhido] = useState<string | null>(personagem.estiloDeLuta);
  const [asiModo, setAsiModo] = useState<'atributo' | 'talento' | null>(null);
  const [asiEscolhas, setAsiEscolhas] = useState<string[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  const media = dadoVidaValor[personagem.dadoVida] + personagem.conMod;
  const pvGanho = hpModo === 'media' ? media : hpModo === 'rolar' ? (hpRolado !== null ? hpRolado + personagem.conMod : null) : null;

  function rolarHp() {
    const lados = parseInt(personagem.dadoVida.slice(1), 10);
    rolarDados({
      label: 'PV do Level Up',
      formula: `1${personagem.dadoVida}`,
      quantidade: 1,
      lados,
      mod: 0,
      onResultado: (total) => setHpRolado(total),
    });
  }

  function toggleAsi(a: string) {
    const total = asiEscolhas.length;
    const nesse = asiEscolhas.filter((x) => x === a).length;
    if (nesse > 0) {
      const idx = asiEscolhas.indexOf(a);
      setAsiEscolhas((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    if (total < 2) setAsiEscolhas((prev) => [...prev, a]);
  }

  const step = luSteps[luIndex];
  const nomesStep: Record<LuStep, string> = {
    pv: 'Pontos de Vida',
    features: 'Novas Características',
    subclasse: 'Escolha de Subclasse',
    estiloDeLuta: 'Estilo de Luta',
    asi: 'Atributo ou Talento',
    dadivaEpica: 'Dádiva Épica',
    resumo: 'Resumo',
  };

  function avancar() {
    if (step === 'pv' && pvGanho === null) {
      setAviso('Escolha um método de PV antes de avançar.');
      return;
    }
    setAviso(null);
    if (step === 'resumo') {
      onConfirmar({ novoNivel, pvGanho: pvGanho ?? 0, subclasseEscolhida, estiloDeLutaEscolhido });
      return;
    }
    setLuIndex((i) => i + 1);
  }

  function voltar() {
    setAviso(null);
    if (luIndex === 0) {
      onFechar();
      return;
    }
    setLuIndex((i) => i - 1);
  }

  const features = caracteristicasDoNivel(classe, novoNivel);
  const dadivaEpica = caracteristicasDoNivel(classe, novoNivel).find((f) => f.nome === 'Dádiva Épica');

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.stepName}>
            Nível {novoNivel} — {nomesStep[step]}
          </div>
        </div>
        <div className={styles.progress}>
          {luSteps.map((s, i) => (
            <div key={s} className={`${styles.dot} ${i < luIndex ? styles.dotDone : ''} ${i === luIndex ? styles.dotCurrent : ''}`} />
          ))}
        </div>
      </div>

      <div className={styles.body}>
        {step === 'pv' && (
          <>
            <div className="section-title">Como determinar os novos PV?</div>
            <div className={`opt-card ${hpModo === 'media' ? 'selected' : ''}`} onClick={() => { setHpModo('media'); setHpRolado(null); }}>
              <div className="opt-card-name">Usar a média fixa</div>
              <div className="opt-card-desc">
                {dadoVidaValor[personagem.dadoVida]} (média de {personagem.dadoVida}) + mod. CON ({personagem.conMod >= 0 ? '+' : ''}
                {personagem.conMod}) = <b>+{media} PV</b>
              </div>
            </div>
            <div className={`opt-card ${hpModo === 'rolar' ? 'selected' : ''}`} onClick={() => { setHpModo('rolar'); setHpRolado(null); }}>
              <div className="opt-card-name">Rolar o dado de vida 🎲</div>
              <div className="opt-card-desc">
                Rola 1{personagem.dadoVida} + mod. CON ({personagem.conMod >= 0 ? '+' : ''}
                {personagem.conMod})
              </div>
            </div>
            {hpModo === 'rolar' && (
              <div className="box" style={{ textAlign: 'center', padding: 14, marginTop: 10 }}>
                {hpRolado === null ? (
                  <div className="btn btn-primary" onClick={rolarHp}>
                    Rolar 1{personagem.dadoVida} 🎲
                  </div>
                ) : (
                  <>
                    <div className="label">resultado</div>
                    <div style={{ fontSize: 22 }}>+{hpRolado + personagem.conMod} PV</div>
                  </>
                )}
              </div>
            )}
            <div className="summary-row" style={{ marginTop: 14 }}>
              <span>PV atuais</span>
              <span>{personagem.pvMax}</span>
            </div>
            <div className="summary-row">
              <span>PV após level up</span>
              <span>{pvGanho !== null ? personagem.pvMax + pvGanho : '—'}</span>
            </div>
          </>
        )}

        {step === 'features' && (
          <>
            <div className="section-title">Características desbloqueadas no nível {novoNivel}</div>
            {features.length === 0 && (
              <div className="label">Nenhuma característica nova nesse nível.</div>
            )}
            {features.map((f) => (
              <div key={f.nome} className="opt-card" style={{ cursor: 'default' }}>
                <div className="opt-card-name">{f.nome}</div>
                {f.descricao ? (
                  <div className="opt-card-desc">{f.descricao}</div>
                ) : (
                  <div className="opt-card-desc" style={{ color: 'var(--text-faint)' }}>
                    Descrição detalhada ainda não importada pra esse nível/característica.
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {step === 'subclasse' && (
          <>
            <div className="section-title">Escolha sua subclasse</div>
            <div className="box" style={{ padding: 14, textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
              ＋ subclasses de {classe.nome} ainda não foram importadas — entra numa próxima entrega (ver
              PENDENCIAS.md, plano "Guerreiro 1-20").
            </div>
          </>
        )}

        {step === 'estiloDeLuta' && (
          <>
            <div className="section-title">Manter ou trocar seu Estilo de Luta</div>
            <div className="label" style={{ marginBottom: 8 }}>
              Regra oficial: a cada nível de {classe.nome}, você pode substituir o Estilo de Luta escolhido por
              outro — não precisa manter o mesmo.
            </div>
            {estilosDeLuta.map((e) => (
              <div
                key={e.id}
                className={`opt-card ${estiloDeLutaEscolhido === e.nome ? 'selected' : ''}`}
                style={{ padding: '10px 12px' }}
                onClick={() => setEstiloDeLutaEscolhido(e.nome)}
              >
                <div className="opt-card-name">{e.nome}</div>
                <div className="opt-card-desc">{e.beneficios}</div>
              </div>
            ))}
          </>
        )}

        {step === 'asi' && (
          <>
            <div className="section-title">Aumento de Atributo ou Talento</div>
            <div className={`opt-card ${asiModo === 'atributo' ? 'selected' : ''}`} onClick={() => { setAsiModo('atributo'); setAsiEscolhas([]); }}>
              <div className="opt-card-name">Aumentar Atributos</div>
              <div className="opt-card-desc">+2 em um atributo, ou +1 em dois atributos (máx. 20)</div>
            </div>
            <div className={`opt-card ${asiModo === 'talento' ? 'selected' : ''}`} onClick={() => { setAsiModo('talento'); setAsiEscolhas([]); }}>
              <div className="opt-card-name">Escolher um Talento</div>
              <div className="opt-card-desc">Lista completa de talentos (Cap. 5) entra numa próxima entrega</div>
            </div>
            {asiModo === 'atributo' && (
              <>
                <div className="label" style={{ margin: '10px 0 6px' }}>
                  toque em até 2 atributos (cada toque = +1, máx. 2 no mesmo)
                </div>
                <div className="stat-grid">
                  {NOMES_ATRIBUTOS.map((a) => (
                    <div key={a} className="box stat-box" onClick={() => toggleAsi(a)}>
                      <div className="stat-name">{a}</div>
                      <div className="stat-mod">{asiEscolhas.filter((x) => x === a).length > 0 ? `+${asiEscolhas.filter((x) => x === a).length}` : '—'}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {asiModo === 'talento' && (
              <div className="box" style={{ padding: 14, textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
                ＋ lista de talentos entra numa próxima entrega
              </div>
            )}
          </>
        )}

        {step === 'dadivaEpica' && (
          <>
            <div className="section-title">Dádiva Épica</div>
            {dadivaEpica?.descricao && <div className="label" style={{ marginBottom: 10 }}>{dadivaEpica.descricao}</div>}
            <div className="box" style={{ padding: 14, textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
              ＋ lista de Dádivas Épicas (Cap. 5) entra numa próxima entrega
            </div>
          </>
        )}

        {step === 'resumo' && (
          <>
            <div className="section-title">Resumo do Level Up</div>
            <div className="summary-row">
              <span>Novo nível</span>
              <span>{novoNivel}</span>
            </div>
            <div className="summary-row">
              <span>PV ganhos</span>
              <span>+{pvGanho ?? '—'}</span>
            </div>
            <div className="summary-row">
              <span>Novo PV máximo</span>
              <span>{pvGanho !== null ? personagem.pvMax + pvGanho : '—'}</span>
            </div>
            {subclasseEscolhida && (
              <div className="summary-row">
                <span>Subclasse</span>
                <span>{subclasseEscolhida}</span>
              </div>
            )}
            {luSteps.includes('estiloDeLuta') && (
              <div className="summary-row">
                <span>Estilo de Luta</span>
                <span>{estiloDeLutaEscolhido ?? 'nenhum escolhido'}</span>
              </div>
            )}
            {asiModo === 'atributo' && (
              <div className="summary-row">
                <span>Atributos</span>
                <span>{asiEscolhas.join(', ') || 'nenhum escolhido'}</span>
              </div>
            )}
            {asiModo === 'talento' && (
              <div className="summary-row">
                <span>Talento</span>
                <span>(a definir numa próxima entrega)</span>
              </div>
            )}
            <div className="label" style={{ marginTop: 10 }}>
              Confirmar aplica as mudanças na ficha e marca a ficha como "com XP" — a edição livre de valores base
              trava a partir daí.
            </div>
          </>
        )}
      </div>

      {aviso && <div className={styles.warning}>{aviso}</div>}

      <div className={styles.navLayer}>
        <div className={`btn ${styles.pill}`} onClick={voltar}>
          ← Voltar
        </div>
        <div className={`btn btn-primary ${styles.pill}`} onClick={avancar}>
          {step === 'resumo' ? 'Confirmar ✓' : 'Avançar →'}
        </div>
      </div>
    </div>
  );
}
