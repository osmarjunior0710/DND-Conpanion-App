import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  alinhamentos,
  arrayPadrao,
  atributosOrdem,
  classesFixture,
  type Atributo,
} from '../../data/wizardFixtures';
import { origens } from '../../data/rulesets/dnd2024/origens';
import { especies } from '../../data/rulesets/dnd2024/especies';
import { idiomas } from '../../data/rulesets/dnd2024/idiomas';
import { gruposFerramenta } from '../../data/rulesets/dnd2024/ferramentas';
import { criarSelecaoInicial, type WizardSelection } from './types';
import styles from './WizardShell.module.css';
import ClasseStep from './steps/ClasseStep';
import ClasseEscolhasStep from './steps/ClasseEscolhasStep';
import OrigemStep from './steps/OrigemStep';
import OrigemEscolhasStep from './steps/OrigemEscolhasStep';
import EspecieStep from './steps/EspecieStep';
import EspecieEscolhasStep from './steps/EspecieEscolhasStep';
import AtributosStep from './steps/AtributosStep';
import LinguasStep from './steps/LinguasStep';
import AlinhamentoStep from './steps/AlinhamentoStep';
import LojaStep from './steps/LojaStep';
import ResumoStep from './steps/ResumoStep';
import type { StepProps } from './steps/StepProps';

const nomesAleatorios = [
  'Aria Ventos-Negros',
  'Thorn Ferreiro',
  'Lyra Sombraluz',
  'Kael Pedraverde',
  'Sira Nuvem-de-Fogo',
  'Bram Duasluas',
];

function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

interface WizardStepDef {
  name: string;
  render: (props: StepProps) => React.ReactNode;
  isValid: (s: WizardSelection) => boolean;
  mensagemInvalida?: string;
  randomize?: () => void;
}

export default function WizardShell() {
  const navigate = useNavigate();
  const [wizIndex, setWizIndex] = useState(0);
  const [selection, setSelection] = useState<WizardSelection>(criarSelecaoInicial());
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function update(patch: Partial<WizardSelection>) {
    setAviso(null);
    setSelection((prev) => ({ ...prev, ...patch }));
  }

  function randomizarClasse() {
    const c = classesFixture[Math.floor(Math.random() * classesFixture.length)];
    update({ classe: c.nome });
  }
  function randomizarOrigem() {
    const disponiveis = origens.filter((o) => o.disponivel);
    const o = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    update({ origem: o.nome });
  }
  function randomizarEscolhasOrigem() {
    const origemSelecionada = origens.find((o) => o.nome === selection.origem);
    if (!origemSelecionada) return;
    const patch: Partial<WizardSelection> = {
      equipamentoOrigemEscolhido: Math.random() < 0.5 ? 'A' : 'B',
    };
    if (origemSelecionada.ferramenta.categoria === 'escolha') {
      const opcoes = gruposFerramenta[origemSelecionada.ferramenta.grupo] ?? [];
      if (opcoes.length > 0) {
        patch.ferramentaOrigemEscolhida = opcoes[Math.floor(Math.random() * opcoes.length)].nome;
      }
    }
    update(patch);
  }
  function randomizarEspecie() {
    const disponiveis = especies.filter((e) => e.disponivel);
    const e = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    update({ especie: e.nome });
  }
  function randomizarAtributos() {
    const valores = embaralhar(arrayPadrao);
    const atributos = {} as Record<Atributo, number | null>;
    atributosOrdem.forEach((a, i) => {
      atributos[a] = valores[i];
    });
    const bonusEscolhas = embaralhar([...atributosOrdem]).slice(0, 3);
    setValorSelecionado(null);
    update({ atributos, bonusModo: '111', bonusEscolhas });
  }
  function randomizarLinguas() {
    const outrosIdiomas = idiomas.filter((i) => i.nome !== 'Comum').map((i) => i.nome);
    update({ linguas: ['Comum', ...embaralhar(outrosIdiomas).slice(0, 2)] });
  }
  function randomizarAlinhamento() {
    const a = alinhamentos[Math.floor(Math.random() * alinhamentos.length)];
    update({ alinhamento: a });
  }
  function randomizarResumo() {
    const nome = nomesAleatorios[Math.floor(Math.random() * nomesAleatorios.length)];
    update({ nome });
  }

  const steps: WizardStepDef[] = [
    {
      name: '1. Classe',
      render: (p) => <ClasseStep {...p} />,
      isValid: (s) => s.classe !== null,
      mensagemInvalida: 'Escolha uma classe antes de avançar.',
      randomize: randomizarClasse,
    },
    { name: '1b. Escolhas da Classe', render: (p) => <ClasseEscolhasStep {...p} />, isValid: () => true },
    {
      name: '2. Origem',
      render: (p) => <OrigemStep {...p} />,
      isValid: (s) => s.origem !== null,
      mensagemInvalida: 'Escolha uma origem antes de avançar.',
      randomize: randomizarOrigem,
    },
    {
      name: '2b. Escolhas da Origem',
      render: (p) => <OrigemEscolhasStep {...p} />,
      isValid: (s) => {
        const origemSelecionada = origens.find((o) => o.nome === s.origem);
        if (!origemSelecionada) return true;
        if (origemSelecionada.ferramenta.categoria === 'escolha' && s.ferramentaOrigemEscolhida === null) return false;
        return s.equipamentoOrigemEscolhido !== null;
      },
      mensagemInvalida: 'Escolha a ferramenta e o equipamento (A ou B) antes de avançar.',
      randomize: randomizarEscolhasOrigem,
    },
    {
      name: '3. Espécie',
      render: (p) => <EspecieStep {...p} />,
      isValid: (s) => s.especie !== null,
      mensagemInvalida: 'Escolha uma espécie antes de avançar.',
      randomize: randomizarEspecie,
    },
    { name: '3b. Escolhas da Espécie', render: (p) => <EspecieEscolhasStep {...p} />, isValid: () => true },
    {
      name: '3c. Atributos',
      render: (p) => (
        <AtributosStep {...p} valorSelecionado={valorSelecionado} setValorSelecionado={setValorSelecionado} />
      ),
      isValid: (s) =>
        atributosOrdem.every((a) => s.atributos[a] !== null) && s.bonusModo === '111' && s.bonusEscolhas.length === 3,
      mensagemInvalida: 'Distribua os 6 atributos e aplique o ajuste de antecedente (+1/+1/+1) antes de avançar.',
      randomize: randomizarAtributos,
    },
    {
      name: '4. Línguas',
      render: (p) => <LinguasStep {...p} />,
      isValid: (s) => s.linguas.filter((l) => l !== 'Comum').length === 2,
      mensagemInvalida: 'Escolha mais 2 idiomas além de Comum antes de avançar.',
      randomize: randomizarLinguas,
    },
    {
      name: '5. Alinhamento',
      render: (p) => <AlinhamentoStep {...p} />,
      isValid: (s) => s.alinhamento !== null,
      mensagemInvalida: 'Escolha um alinhamento antes de avançar.',
      randomize: randomizarAlinhamento,
    },
    { name: '6. Loja', render: (p) => <LojaStep {...p} />, isValid: () => true },
    {
      name: '7. Resumo',
      render: (p) => <ResumoStep {...p} />,
      isValid: (s) => s.nome.trim().length > 0,
      mensagemInvalida: 'Digite um nome pro personagem antes de salvar.',
      randomize: randomizarResumo,
    },
  ];

  const step = steps[wizIndex];
  const isLast = wizIndex === steps.length - 1;

  function wizNext() {
    if (!step.isValid(selection)) {
      setAviso(step.mensagemInvalida ?? 'Selecione o que falta antes de avançar.');
      return;
    }
    setAviso(null);
    if (isLast) {
      // Fase 0: ainda não existe salvamento de verdade — a ficha em si
      // (Perfil/Mochila/Magias/Combat) chega na entrega 0.5.
      navigate('/ficha/novo-personagem');
      return;
    }
    setWizIndex((i) => i + 1);
  }

  function wizPrev() {
    setAviso(null);
    if (wizIndex === 0) {
      navigate('/home');
      return;
    }
    setWizIndex((i) => i - 1);
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className="back" onClick={wizPrev}>
            ←
          </span>
          <div className={styles.stepName}>{step.name}</div>
        </div>
        <div className={styles.progress}>
          {steps.map((s, i) => (
            <div
              key={s.name}
              className={`${styles.dot} ${i < wizIndex ? styles.dotDone : ''} ${i === wizIndex ? styles.dotCurrent : ''}`}
            />
          ))}
        </div>
      </div>
      <div className={styles.body}>{step.render({ selection, update })}</div>

      {step.randomize && (
        <div className={styles.randomFab} onClick={step.randomize} title="Sortear tudo desta etapa">
          🔀
        </div>
      )}

      {aviso && <div className={styles.warning}>{aviso}</div>}

      <div className={styles.navLayer}>
        <div className={`btn ${styles.pill}`} onClick={wizPrev}>
          ← Voltar
        </div>
        <div className={`btn btn-primary ${styles.pill}`} onClick={wizNext}>
          {isLast ? 'Salvar ✓' : 'Avançar →'}
        </div>
      </div>
    </div>
  );
}
