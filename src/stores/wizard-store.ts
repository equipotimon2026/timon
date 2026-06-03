import { create } from 'zustand';

export interface WizardStep {
  label: string;
  status: 'completed' | 'active' | 'locked';
  loading?: boolean;
}

interface WizardStore {
  /** Steps to render in the navbar; null when no wizard is active on the current page */
  steps: WizardStep[] | null;
  onStepClick: ((index: number) => void) | null;
  setWizard: (payload: { steps: WizardStep[]; onStepClick: (index: number) => void } | null) => void;
}

export const useWizardStore = create<WizardStore>((set) => ({
  steps: null,
  onStepClick: null,
  setWizard: (payload) =>
    set({ steps: payload?.steps ?? null, onStepClick: payload?.onStepClick ?? null }),
}));
