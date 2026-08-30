import { useState } from 'react';
import { dadoVidaValor } from '../../../data/levelUpFixtures';
import type { Atributo } from '../../../data/wizardFixtures';
import type { Classe } from '../../../data/rulesets/dnd2024/classes';
import { modificador, type WizardSelection } from '../../../core/personagem';
import type { Magia } from '../../../data/rulesets/dnd2024/magias';
import { subclasses } from '../../../data/rulesets/dnd2024/subclasses';
import { estilosDeLuta } from '../../../data/rulesets/dnd2024/estilosDeLuta';
import {
  caracteristicasDoNivel,
  niveisComASI,
  niveisComDadivaEpica,
  niveisComEspecialista,
  temEstiloDeLutaTrocavel,
  NOMES_ESPECIALISTA,
} from '../../../core/levelUp';
import { valorRecursoClasse } from '../../../core/recursosClasse';
import { agruparMagiasPorCirculo, contarTrocas, espacosDeMagiaAtivos } from '../../../core/magiasPersonagem';
import { iconesMagia } from '../../../core/classificarMagia';
import MagiaComDescricao from '../../components/MagiaComDescricao';
import GrupoMagiaColapsavel from '../../components/GrupoMagiaColapsavel';
import IconeClasse from '../../components/IconeClasse';
import { useAvisoTemporario } from '../../hooks/useAvisoTemporario';
import { talentos } from '../../../data/rulesets/dnd2024/talentos';
import TelaEscolherTalento from './TelaEscolherTalento';
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
    truquesEscolhidos: string[] | null;
    magiasPreparadasEscolhidas: string[] | null;
    periciasEspecialistaEscolhidas: string[] | null;
    atributosAumentados: Atributo[] | null;
    talentoGeralEscolhido: string | null;
  }) => void;
  /** Controlado pelo `FichaShell` (persistido junto com o resto do
   * progresso) em vez de estado local — uma vez rolado o dado de
   * vida, fechar o Level Up (ou dar F5) não pode apagar o resultado e
   * abrir margem pra rolar de novo. Ver DECISOES-DESIGN.md. */
  hpModo: 'media' | 'rolar' | null;
  onHpModoChange: (modo: 'media' | 'rolar' | null) => void;
  hpRolado: number | null;
  onHpRoladoChange: (valor: number | null) => void;
  /** Truques que o personagem já tem (pré-marcados na tela de escolha
   * — Etapa 4.1). */
  truquesAtuais: string[];
  /** Catálogo completo de Truques da classe, pra escolher de/pra. */
  truquesDaClasse: Magia[];
  /** Magias Preparadas que o personagem já tem (Etapa 4.3). */
  magiasPreparadasAtuais: string[];
  /** Catálogo de magias de círculo > 0 da classe (todos os círculos —
   * filtrado por círculo ativo no nível novo aqui dentro). */
  magiasDaClasseDisponiveis: Magia[];
  /** Perícias já escolhidas pra Especialização (dobra o Bônus de
   * Proficiência) — característica "Especialista" do Bardo. */
  periciasEspecialistaAtuais: string[];
  /** Perícias em que o personagem é proficiente — de onde a escolha
   * de Especialista pode vir (só dá pra especializar o que já é
   * proficiente). */
  periciasProficientesDoPersonagem: string[];
  /** Atributos atuais do personagem (já com Level Ups anteriores
   * aplicados) — pra mostrar base/mod real na tela de Aumento de
   * Atributo. */
  atributosAtuais: WizardSelection['atributos'];
  /** Atributos FINAIS (base + bônus de espécie/origem/ASI já
   * aplicados) — usado só pra validar Atributo Mínimo de Talentos
   * (regra real checa a pontuação total, não a base). */
  atributosFinaisAtuais: Record<Atributo, number>;
  /** Talentos Gerais já escolhidos em Level Ups anteriores — Fase 3 do
   * plano de Talentos (ver DECISOES-DESIGN.md/PENDENCIAS.md). */
  talentosGeraisAtuais: string[];
}

type LuStep =
  | 'pv'
  | 'features'
  | 'subclasse'
  | 'estiloDeLuta'
  | 'truques'
  | 'magiasPreparadas'
  | 'especialista'
  | 'asi'
  | 'dadivaEpica'
  | 'resumo';
type FaseDramatica = 'idle' | 'rolando' | 'resultado';

const NOMES_ATRIBUTOS = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
const DURACAO_ROLAGEM_MS = 1400;

export default function LevelUpShell({
  personagem,
  classe,
  onFechar,
  onConfirmar,
  hpModo,
  onHpModoChange,
  hpRolado,
  onHpRoladoChange,
  truquesAtuais,
  truquesDaClasse,
  magiasPreparadasAtuais,
  magiasDaClasseDisponiveis,
  periciasEspecialistaAtuais,
  periciasProficientesDoPersonagem,
  atributosAtuais,
  atributosFinaisAtuais,
  talentosGeraisAtuais,
}: LevelUpShellProps) {
  const novoNivel = personagem.nivel + 1;
  const maxTruques = valorRecursoClasse(classe, 'Truques Conhecidos', novoNivel);
  const maxMagiasPreparadas = valorRecursoClasse(classe, 'Magias Preparadas', novoNivel);
  const circuloMaximoNovoNivel = Math.max(0, ...espacosDeMagiaAtivos(classe, novoNivel).map((e) => e.circulo));
  const magiasPreparadasDaClasse = magiasDaClasseDisponiveis.filter((m) => m.circulo <= circuloMaximoNovoNivel);
  // Especialista não é uma tabela por nível (não tem coluna numérica
  // na planilha) — a regra real é sempre "+2 perícias por gatilho"
  // (confirmado na descrição da característica), por isso o incremento
  // fixo em vez de ler de `recursos`.
  const especialistaDisparaAgora = niveisComEspecialista(classe).includes(novoNivel);
  const subclassesDaClasse = subclasses.filter((s) => s.classeId === classe.id);
  const maxEspecialista = periciasEspecialistaAtuais.length + (especialistaDisparaAgora ? 2 : 0);

  const luSteps: LuStep[] = ['pv', 'features'];
  if (classe.nivelSubclasse === novoNivel && !personagem.subclasse) luSteps.push('subclasse');
  if (temEstiloDeLutaTrocavel(classe, novoNivel)) luSteps.push('estiloDeLuta');
  if (maxTruques > 0) luSteps.push('truques');
  if (maxMagiasPreparadas > 0) luSteps.push('magiasPreparadas');
  if (especialistaDisparaAgora) luSteps.push('especialista');
  if (niveisComASI(classe).includes(novoNivel)) luSteps.push('asi');
  if (niveisComDadivaEpica(classe).includes(novoNivel)) luSteps.push('dadivaEpica');
  luSteps.push('resumo');

  // Características que já ganham uma tela própria mais adiante nesse
  // mesmo Level Up não aparecem de novo como card no passo "Novas
  // Características" — evita repetir a mesma coisa 2x (ver
  // DECISOES-DESIGN.md "Level Up — passo de Novas Características não
  // duplica característica com tela própria"). Uma característica
  // passiva sem tela própria (ex: "Ataque Extra") continua aparecendo
  // normalmente — esse passo é o único lugar que mostra ela.
  const nomesComTelaPropria = new Set<string>();
  if (luSteps.includes('subclasse')) nomesComTelaPropria.add(`Subclasse de ${classe.nome}`);
  if (luSteps.includes('estiloDeLuta')) nomesComTelaPropria.add('Estilo de Luta');
  if (luSteps.includes('especialista')) NOMES_ESPECIALISTA.forEach((n) => nomesComTelaPropria.add(n));
  if (luSteps.includes('asi')) nomesComTelaPropria.add('Aumento no Valor de Atributo');
  if (luSteps.includes('dadivaEpica')) nomesComTelaPropria.add('Dádiva Épica');

  const [luIndex, setLuIndex] = useState(0);
  const [faseDramatica, setFaseDramatica] = useState<FaseDramatica>('idle');
  const [valorDadoAnimado, setValorDadoAnimado] = useState<number | null>(null);
  // Escolha de subclasse — versão placeholder (ver PENDENCIAS.md
  // "Escolha de subclasse — versão placeholder"): só salva o NOME
  // escolhido (pra já poder trocar o ícone na Lista de Personagens),
  // nenhuma característica mecânica da subclasse existe ainda.
  const [subclasseEscolhida, setSubclasseEscolhida] = useState<string | null>(personagem.subclasse);
  const [estiloDeLutaEscolhido, setEstiloDeLutaEscolhido] = useState<string | null>(personagem.estiloDeLuta);
  const [truquesEscolhidos, setTruquesEscolhidos] = useState<string[]>(truquesAtuais);
  const [magiasPreparadasEscolhidas, setMagiasPreparadasEscolhidas] = useState<string[]>(magiasPreparadasAtuais);
  const [especialistaEscolhidas, setEspecialistaEscolhidas] = useState<string[]>(periciasEspecialistaAtuais);
  const [asiModo, setAsiModo] = useState<'atributo' | 'talento' | null>(null);
  const [asiEscolhas, setAsiEscolhas] = useState<Atributo[]>([]);
  const [telaAsi, setTelaAsi] = useState(false);
  const [talentoEscolhido, setTalentoEscolhido] = useState<string | null>(null);
  const [telaTalento, setTelaTalento] = useState(false);
  const [aviso, setAviso] = useAvisoTemporario();

  const media = dadoVidaValor[personagem.dadoVida] + personagem.conMod;
  const pvGanho = hpModo === 'media' ? media : hpModo === 'rolar' ? (hpRolado !== null ? hpRolado + personagem.conMod : null) : null;

  // Rolagem do dado de vida é definitiva assim que acontece — só roda
  // uma vez, disparada pelo "Avançar" (não por um botão dentro do
  // passo), com uma pausa dramática em tela cheia antes do resultado.
  // Uma vez que `hpRolado` é preenchido, o passo PV fica travado (ver
  // JSX abaixo) — voltar/reabrir o Level Up não permite rolar de novo.
  function iniciarRolagemDramatica() {
    const lados = parseInt(personagem.dadoVida.slice(1), 10);
    setFaseDramatica('rolando');
    const intervalo = setInterval(() => {
      setValorDadoAnimado(1 + Math.floor(Math.random() * lados));
    }, 90);
    setTimeout(() => {
      clearInterval(intervalo);
      const resultado = 1 + Math.floor(Math.random() * lados);
      setValorDadoAnimado(resultado);
      onHpRoladoChange(resultado);
      setFaseDramatica('resultado');
    }, DURACAO_ROLAGEM_MS);
  }

  function continuarAposRolagem() {
    setFaseDramatica('idle');
    setLuIndex((i) => i + 1);
  }

  function toggleTruque(nome: string) {
    const i = truquesEscolhidos.indexOf(nome);
    if (i > -1) {
      setTruquesEscolhidos((prev) => prev.filter((x) => x !== nome));
      return;
    }
    if (truquesEscolhidos.length < maxTruques) setTruquesEscolhidos((prev) => [...prev, nome]);
  }

  const trocasDeTruque = contarTrocas(truquesAtuais, truquesEscolhidos);
  const truquesValido = truquesEscolhidos.length === maxTruques && trocasDeTruque <= 1;

  function toggleMagiaPreparada(nome: string) {
    const i = magiasPreparadasEscolhidas.indexOf(nome);
    if (i > -1) {
      setMagiasPreparadasEscolhidas((prev) => prev.filter((x) => x !== nome));
      return;
    }
    if (magiasPreparadasEscolhidas.length < maxMagiasPreparadas) {
      setMagiasPreparadasEscolhidas((prev) => [...prev, nome]);
    }
  }

  const trocasDeMagia = contarTrocas(magiasPreparadasAtuais, magiasPreparadasEscolhidas);
  const magiasPreparadasValido = magiasPreparadasEscolhidas.length === maxMagiasPreparadas && trocasDeMagia <= 1;

  // Especialista é só ADIÇÃO — nunca substitui uma perícia já
  // especializada (diferente de Truques/Magias Preparadas, que podem
  // trocar 1 por level-up), então `toggle` nem deixa desmarcar o que
  // já veio de um nível anterior.
  function toggleEspecialista(nome: string) {
    if (periciasEspecialistaAtuais.includes(nome)) return;
    const i = especialistaEscolhidas.indexOf(nome);
    if (i > -1) {
      setEspecialistaEscolhidas((prev) => prev.filter((x) => x !== nome));
      return;
    }
    if (especialistaEscolhidas.length < maxEspecialista) setEspecialistaEscolhidas((prev) => [...prev, nome]);
  }

  const especialistaValido = especialistaEscolhidas.length === maxEspecialista;

  const PONTOS_ASI = 2;
  const pontosAsiGastos = asiEscolhas.length;
  const pontosAsiRestantes = PONTOS_ASI - pontosAsiGastos;

  function pontosNoAtributo(a: Atributo): number {
    return asiEscolhas.filter((x) => x === a).length;
  }

  /** Regra real: +2 num atributo só, ou +1 em dois — nunca mais de 2
   * no mesmo, nunca passa de 20 no total, nunca mais de 2 pontos
   * gastos no total. */
  function incrementarAsi(a: Atributo) {
    const nesse = pontosNoAtributo(a);
    const base = atributosAtuais[a] ?? 10;
    if (pontosAsiRestantes <= 0 || nesse >= 2 || base + nesse >= 20) return;
    setAsiEscolhas((prev) => [...prev, a]);
  }

  function decrementarAsi(a: Atributo) {
    const idx = asiEscolhas.indexOf(a);
    if (idx === -1) return;
    setAsiEscolhas((prev) => prev.filter((_, i) => i !== idx));
  }

  const step = luSteps[luIndex];
  const nomesStep: Record<LuStep, string> = {
    pv: 'Pontos de Vida',
    features: 'Novas Características',
    subclasse: 'Escolha de Subclasse',
    estiloDeLuta: 'Estilo de Luta',
    truques: 'Truques',
    magiasPreparadas: 'Magias Preparadas',
    especialista: 'Especialista',
    asi: 'Atributo ou Talento',
    dadivaEpica: 'Dádiva Épica',
    resumo: 'Resumo',
  };

  function avancar() {
    if (step === 'pv') {
      if (hpModo === null) {
        setAviso('Escolha um método de PV antes de avançar.');
        return;
      }
      if (hpModo === 'rolar' && hpRolado === null) {
        setAviso(null);
        iniciarRolagemDramatica();
        return;
      }
    }
    if (step === 'subclasse' && subclassesDaClasse.length > 0 && subclasseEscolhida === null) {
      setAviso('Escolha uma subclasse antes de avançar.');
      return;
    }
    if (step === 'truques' && !truquesValido) {
      setAviso(
        trocasDeTruque > 1
          ? 'Você só pode trocar 1 truque por level-up — desmarque menos truques que já tinha.'
          : `Escolha exatamente ${maxTruques} truques antes de avançar.`,
      );
      return;
    }
    if (step === 'magiasPreparadas' && !magiasPreparadasValido) {
      setAviso(
        trocasDeMagia > 1
          ? 'Você só pode trocar 1 magia preparada por level-up — desmarque menos magias que já tinha.'
          : `Escolha exatamente ${maxMagiasPreparadas} magias preparadas antes de avançar.`,
      );
      return;
    }
    if (step === 'especialista' && !especialistaValido) {
      setAviso(`Escolha exatamente ${maxEspecialista - periciasEspecialistaAtuais.length} perícia(s) pra Especialista antes de avançar.`);
      return;
    }
    if (step === 'asi') {
      if (asiModo === null) {
        setAviso('Escolha Aumentar Atributos ou um Talento antes de avançar.');
        return;
      }
      if (asiModo === 'atributo' && pontosAsiRestantes > 0) {
        setTelaAsi(true);
        return;
      }
      if (asiModo === 'talento' && talentoEscolhido === null) {
        setAviso('Escolha um Talento antes de avançar.');
        return;
      }
    }
    setAviso(null);
    if (step === 'resumo') {
      onConfirmar({
        novoNivel,
        pvGanho: pvGanho ?? 0,
        subclasseEscolhida,
        estiloDeLutaEscolhido,
        truquesEscolhidos: luSteps.includes('truques') ? truquesEscolhidos : null,
        magiasPreparadasEscolhidas: luSteps.includes('magiasPreparadas') ? magiasPreparadasEscolhidas : null,
        periciasEspecialistaEscolhidas: luSteps.includes('especialista') ? especialistaEscolhidas : null,
        atributosAumentados: luSteps.includes('asi') && asiModo === 'atributo' ? asiEscolhas : null,
        talentoGeralEscolhido: luSteps.includes('asi') && asiModo === 'talento' ? talentoEscolhido : null,
      });
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

  const features = caracteristicasDoNivel(classe, novoNivel).filter((f) => !nomesComTelaPropria.has(f.nome));
  const dadivaEpica = caracteristicasDoNivel(classe, novoNivel).find((f) => f.nome === 'Dádiva Épica');

  if (faseDramatica !== 'idle') {
    return (
      <div className={styles.dramaScreen}>
        {faseDramatica === 'rolando' ? (
          <>
            <div className={styles.dramaLabel}>rolando 1{personagem.dadoVida}...</div>
            <div className={`${styles.dramaDie} ${styles.dramaDieSpinning}`}>{valorDadoAnimado ?? '?'}</div>
          </>
        ) : (
          <>
            <div className={styles.dramaLabel}>resultado</div>
            <div className={styles.dramaDie}>{hpRolado}</div>
            <div className={styles.dramaSub}>
              {hpRolado} + mod. CON ({personagem.conMod >= 0 ? '+' : ''}
              {personagem.conMod})
            </div>
            <div className={styles.dramaTotal}>+{(hpRolado ?? 0) + personagem.conMod} PV</div>
            <div className={`btn btn-primary ${styles.dramaBtn}`} onClick={continuarAposRolagem}>
              Continuar →
            </div>
          </>
        )}
      </div>
    );
  }

  if (telaTalento) {
    return (
      <TelaEscolherTalento
        nivelAtual={novoNivel}
        atributosFinais={atributosFinaisAtuais}
        talentosGeraisAtuais={talentosGeraisAtuais}
        onEscolher={(id) => {
          setTalentoEscolhido(id);
          setTelaTalento(false);
        }}
        onFechar={() => setTelaTalento(false)}
      />
    );
  }

  if (telaAsi) {
    return (
      <div className={styles.screen}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <div className={styles.stepName}>Aumentar Atributos</div>
          </div>
        </div>

        <div className={styles.body}>
          <div className="label" style={{ marginBottom: 10 }}>
            Distribua {PONTOS_ASI} pontos — no máximo 2 no mesmo atributo (regra real: +2 num só, ou +1 em dois).
            Faltam {pontosAsiRestantes}.
          </div>
          <div className={styles.asiHeaderRow}>
            <span>Atributo</span>
            <span>ASI</span>
            <span>Total</span>
          </div>
          {NOMES_ATRIBUTOS.map((nome) => {
            const a = nome as Atributo;
            const base = atributosAtuais[a] ?? 10;
            const nesse = pontosNoAtributo(a);
            const total = base + nesse;
            return (
              <div key={a} className={styles.asiRow}>
                <span>
                  {a} {base} ({modificador(base) >= 0 ? '+' : ''}
                  {modificador(base)})
                </span>
                <span className={styles.asiStepper}>
                  <div
                    className={styles.asiBtn}
                    style={nesse === 0 ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
                    onClick={() => decrementarAsi(a)}
                  >
                    −
                  </div>
                  <span>{nesse}</span>
                  <div
                    className={styles.asiBtn}
                    style={pontosAsiRestantes === 0 || nesse >= 2 || base + nesse >= 20 ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
                    onClick={() => incrementarAsi(a)}
                  >
                    +
                  </div>
                </span>
                <span>
                  {total} ({modificador(total) >= 0 ? '+' : ''}
                  {modificador(total)})
                </span>
              </div>
            );
          })}
        </div>

        <div className={styles.navLayer}>
          <div className={`btn ${styles.pill}`} onClick={() => setTelaAsi(false)}>
            ← Voltar
          </div>
          <div
            className={`btn btn-primary ${styles.pill}`}
            style={pontosAsiRestantes === 0 ? undefined : { opacity: 0.5, pointerEvents: 'none' }}
            onClick={() => {
              setTelaAsi(false);
              setLuIndex((i) => i + 1);
            }}
          >
            Confirmar ✓
          </div>
        </div>
      </div>
    );
  }

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

      {step === 'magiasPreparadas' && (
        <div className={styles.subHeader}>
          <div className="section-title" style={{ marginBottom: 4 }}>
            Magias Preparadas — escolha {maxMagiasPreparadas} ({magiasPreparadasEscolhidas.length}/{maxMagiasPreparadas})
          </div>
          <div className="label">
            Regra oficial: a cada nível, você pode substituir 1 das magias que já tem preparada por outra da lista
            (de qualquer círculo pro qual você tenha espaço).
          </div>
        </div>
      )}

      <div className={styles.body}>
        {step === 'pv' && (
          <>
            <div className="section-title">Como determinar os novos PV?</div>
            {hpRolado !== null ? (
              <div className="opt-card selected" style={{ cursor: 'default' }}>
                <div className="opt-card-name">🎲 Dado de vida rolado — resultado travado</div>
                <div className="opt-card-desc">
                  Rolou <b>{hpRolado}</b> em 1{personagem.dadoVida} + mod. CON ({personagem.conMod >= 0 ? '+' : ''}
                  {personagem.conMod}) = <b>+{hpRolado + personagem.conMod} PV</b>. Não dá pra rolar de novo.
                </div>
              </div>
            ) : (
              <>
                <div className={`opt-card ${hpModo === 'media' ? 'selected' : ''}`} onClick={() => onHpModoChange('media')}>
                  <div className="opt-card-name">Usar a média fixa</div>
                  <div className="opt-card-desc">
                    {dadoVidaValor[personagem.dadoVida]} (média de {personagem.dadoVida}) + mod. CON ({personagem.conMod >= 0 ? '+' : ''}
                    {personagem.conMod}) = <b>+{media} PV</b>
                  </div>
                </div>
                <div className={`opt-card ${hpModo === 'rolar' ? 'selected' : ''}`} onClick={() => onHpModoChange('rolar')}>
                  <div className="opt-card-name">Rolar o dado de vida 🎲</div>
                  <div className="opt-card-desc">
                    Rola 1{personagem.dadoVida} + mod. CON ({personagem.conMod >= 0 ? '+' : ''}
                    {personagem.conMod}) — ao tocar em "Avançar" o dado rola e o resultado é definitivo, sem chance
                    de rolar de novo.
                  </div>
                </div>
              </>
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
            <div className="label" style={{ marginBottom: 8, color: 'var(--warn)' }}>
              [PH] Escolha ainda não implementada de verdade — só guarda o nome (troca o ícone do personagem na
              lista). As características mecânicas de cada subclasse ainda não existem na ficha.
            </div>
            {subclassesDaClasse.length === 0 && (
              <div className="box" style={{ padding: 14, textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
                ＋ subclasses de {classe.nome} ainda não foram importadas.
              </div>
            )}
            {subclassesDaClasse.map((s) => (
              <div
                key={s.id}
                className={`opt-card ${subclasseEscolhida === s.nome ? 'selected' : ''}`}
                onClick={() => setSubclasseEscolhida(s.nome)}
              >
                <div className="opt-card-row">
                  <IconeClasse id={s.id} />
                  <div className="opt-card-info">
                    <div className="opt-card-name">{s.nome}</div>
                  </div>
                </div>
              </div>
            ))}
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

        {step === 'truques' && (
          <>
            <div className="section-title">
              Truques — escolha {maxTruques} ({truquesEscolhidos.length}/{maxTruques})
            </div>
            <div className="label" style={{ marginBottom: 8 }}>
              Regra oficial: a cada nível, você pode substituir 1 dos truques que já conhece por outro da lista —
              não precisa mexer se não quiser.
            </div>
            {agruparMagiasPorCirculo(truquesDaClasse).map((grupo) => (
              <GrupoMagiaColapsavel key={grupo.circulo} label={grupo.label} magias={grupo.magias}>
                {(m) => {
                  const jaTinha = truquesAtuais.includes(m.nome);
                  const marcado = truquesEscolhidos.includes(m.nome);
                  const removendo = jaTinha && !marcado;
                  return (
                    <div
                      key={m.id}
                      className={`check-row ${jaTinha ? (removendo ? styles.truqueRemovendo : styles.truqueAtual) : ''}`}
                      onClick={() => toggleTruque(m.nome)}
                    >
                      <div className={`check-box ${marcado ? 'checked' : ''}`} />
                      <span className="check-label">
                        <MagiaComDescricao magia={m} variante="icone" /> {iconesMagia(m)}
                        {' '}<span style={{ color: removendo ? 'var(--danger)' : 'var(--text-faint)', fontSize: 12 }}>
                          ({m.escola}
                          {removendo ? ' · 🔻 será removido' : jaTinha ? ' · já tinha' : ''})
                        </span>
                      </span>
                    </div>
                  );
                }}
              </GrupoMagiaColapsavel>
            ))}
            {trocasDeTruque > 1 && (
              <div className="label" style={{ color: 'var(--danger)', marginTop: 6 }}>
                ⚠️ {trocasDeTruque} truques trocados — só pode trocar 1 por level-up.
              </div>
            )}
          </>
        )}

        {step === 'magiasPreparadas' && (
          <>
            {agruparMagiasPorCirculo(magiasPreparadasDaClasse).map((grupo) => (
              <GrupoMagiaColapsavel key={grupo.circulo} label={grupo.label} magias={grupo.magias}>
                {(m) => {
                  const jaTinha = magiasPreparadasAtuais.includes(m.nome);
                  const marcado = magiasPreparadasEscolhidas.includes(m.nome);
                  const removendo = jaTinha && !marcado;
                  return (
                    <div
                      key={m.id}
                      className={`check-row ${jaTinha ? (removendo ? styles.truqueRemovendo : styles.truqueAtual) : ''}`}
                      onClick={() => toggleMagiaPreparada(m.nome)}
                    >
                      <div className={`check-box ${marcado ? 'checked' : ''}`} />
                      <span className="check-label">
                        <MagiaComDescricao magia={m} variante="icone" /> {iconesMagia(m)}
                        {' '}<span style={{ color: removendo ? 'var(--danger)' : 'var(--text-faint)', fontSize: 12 }}>
                          ({m.circulo}º círculo
                          {removendo ? ' · 🔻 será removida' : jaTinha ? ' · já tinha' : ''})
                        </span>
                      </span>
                    </div>
                  );
                }}
              </GrupoMagiaColapsavel>
            ))}
            {trocasDeMagia > 1 && (
              <div className="label" style={{ color: 'var(--danger)', marginTop: 6 }}>
                ⚠️ {trocasDeMagia} magias trocadas — só pode trocar 1 por level-up.
              </div>
            )}
          </>
        )}

        {step === 'especialista' && (
          <>
            <div className="section-title">
              Especialista — escolha {maxEspecialista - periciasEspecialistaAtuais.length} (
              {especialistaEscolhidas.length - periciasEspecialistaAtuais.length}/{maxEspecialista - periciasEspecialistaAtuais.length})
            </div>
            <div className="label" style={{ marginBottom: 8 }}>
              Dobra o Bônus de Proficiência nas perícias escolhidas — só dá pra escolher entre as que você já é
              proficiente.
            </div>
            {periciasEspecialistaAtuais.length > 0 && (
              <>
                <div className={styles.subHeader}>Selecionadas previamente</div>
                {periciasProficientesDoPersonagem
                  .filter((nome) => periciasEspecialistaAtuais.includes(nome))
                  .map((nome) => (
                    <div key={nome} className={`check-row ${styles.truqueAtual}`} style={{ cursor: 'default' }}>
                      <div className="check-box checked" />
                      <span className="check-label">{nome}</span>
                    </div>
                  ))}
                <div className={styles.subHeader}>Disponíveis</div>
              </>
            )}
            {periciasProficientesDoPersonagem
              .filter((nome) => !periciasEspecialistaAtuais.includes(nome))
              .map((nome) => {
                const marcada = especialistaEscolhidas.includes(nome);
                return (
                  <div key={nome} className="check-row" onClick={() => toggleEspecialista(nome)}>
                    <div className={`check-box ${marcada ? 'checked' : ''}`} />
                    <span className="check-label">{nome}</span>
                  </div>
                );
              })}
          </>
        )}

        {step === 'asi' && (
          <>
            <div className="section-title">Aumento de Atributo ou Talento</div>
            <div
              className={`opt-card ${asiModo === 'atributo' ? 'selected' : ''}`}
              onClick={() => {
                if (asiModo !== 'atributo') {
                  setAsiModo('atributo');
                  setAsiEscolhas([]);
                  setTalentoEscolhido(null);
                }
                setTelaAsi(true);
              }}
            >
              <div className="opt-card-name">Aumentar Atributos</div>
              <div className="opt-card-desc">
                {asiModo === 'atributo' && pontosAsiGastos > 0
                  ? NOMES_ATRIBUTOS.filter((a) => pontosNoAtributo(a as Atributo) > 0)
                      .map((a) => `${a} +${pontosNoAtributo(a as Atributo)}`)
                      .join(', ')
                  : '+2 em um atributo, ou +1 em dois atributos (máx. 20) — toque pra distribuir'}
              </div>
            </div>
            <div
              className={`opt-card ${asiModo === 'talento' ? 'selected' : ''}`}
              onClick={() => {
                if (asiModo !== 'talento') {
                  setAsiModo('talento');
                  setAsiEscolhas([]);
                }
                setTelaTalento(true);
              }}
            >
              <div className="opt-card-name">Escolher um Talento</div>
              <div className="opt-card-desc">
                {asiModo === 'talento' && talentoEscolhido
                  ? (talentos.find((t) => t.id === talentoEscolhido)?.nome ?? talentoEscolhido)
                  : 'Talentos Gerais (Cap. 5) — toque pra escolher'}
              </div>
            </div>
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
            {luSteps.includes('truques') && (
              <div className="summary-row">
                <span>Truques</span>
                <span>{trocasDeTruque > 0 ? `${trocasDeTruque} trocado(s)` : 'sem troca'}</span>
              </div>
            )}
            {luSteps.includes('magiasPreparadas') && (
              <div className="summary-row">
                <span>Magias Preparadas</span>
                <span>{trocasDeMagia > 0 ? `${trocasDeMagia} trocada(s)` : 'sem troca'}</span>
              </div>
            )}
            {luSteps.includes('especialista') && (
              <div className="summary-row">
                <span>Especialista</span>
                <span>{especialistaEscolhidas.slice(periciasEspecialistaAtuais.length).join(', ') || 'nenhuma escolhida'}</span>
              </div>
            )}
            {asiModo === 'atributo' && (
              <div className="summary-row">
                <span>Atributos</span>
                <span>
                  {NOMES_ATRIBUTOS.filter((a) => pontosNoAtributo(a as Atributo) > 0)
                    .map((a) => `${a} +${pontosNoAtributo(a as Atributo)}`)
                    .join(', ') || 'nenhum escolhido'}
                </span>
              </div>
            )}
            {asiModo === 'talento' && (
              <div className="summary-row">
                <span>Talento</span>
                <span>{(talentoEscolhido && talentos.find((t) => t.id === talentoEscolhido)?.nome) ?? 'nenhum escolhido'}</span>
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
