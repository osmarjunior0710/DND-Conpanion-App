import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import type { StepProps } from './steps/StepProps';

interface WizardStepDef {
  name: string;
  render: (props: StepProps) => React.ReactNode;
}

export default function WizardShell() {
  const navigate = useNavigate();
  const [wizIndex, setWizIndex] = useState(0);
  const [selection, setSelection] = useState<WizardSelection>(criarSelecaoInicial());
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(null);

  function update(patch: Partial<WizardSelection>) {
    setSelection((prev) => ({ ...prev, ...patch }));
  }

  const steps: WizardStepDef[] = [
    { name: '1. Classe', render: (p) => <ClasseStep {...p} /> },
    { name: '1b. Escolhas da Classe', render: (p) => <ClasseEscolhasStep {...p} /> },
    { name: '2. Origem', render: (p) => <OrigemStep {...p} /> },
    { name: '2b. Escolhas da Origem', render: (p) => <OrigemEscolhasStep {...p} /> },
    { name: '3. Espécie', render: (p) => <EspecieStep {...p} /> },
    { name: '3b. Escolhas da Espécie', render: (p) => <EspecieEscolhasStep {...p} /> },
    {
      name: '3c. Atributos',
      render: (p) => (
        <AtributosStep {...p} valorSelecionado={valorSelecionado} setValorSelecionado={setValorSelecionado} />
      ),
    },
    { name: '4. Línguas', render: (p) => <LinguasStep {...p} /> },
    { name: '5. Alinhamento', render: (p) => <AlinhamentoStep {...p} /> },
  ];

  const step = steps[wizIndex];
  const isLast = wizIndex === steps.length - 1;

  function wizNext() {
    if (isLast) {
      navigate('/wizard/loja-resumo-pendente');
      return;
    }
    setWizIndex((i) => i + 1);
  }

  function wizPrev() {
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
      <div className={styles.footer}>
        <div className="btn" onClick={wizPrev}>
          ← Voltar
        </div>
        <div className="btn btn-primary" onClick={wizNext}>
          {isLast ? 'Continuar →' : 'Avançar →'}
        </div>
      </div>
    </div>
  );
}
