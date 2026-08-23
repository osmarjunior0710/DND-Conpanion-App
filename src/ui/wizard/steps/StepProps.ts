import type { WizardSelection } from '../../../core/personagem';

export interface StepProps {
  selection: WizardSelection;
  update: (patch: Partial<WizardSelection>) => void;
}
