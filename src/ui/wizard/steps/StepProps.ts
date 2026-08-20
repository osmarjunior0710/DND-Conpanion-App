import type { WizardSelection } from '../types';

export interface StepProps {
  selection: WizardSelection;
  update: (patch: Partial<WizardSelection>) => void;
}
