import { create } from 'zustand';

type OnboardingStep =
  | 'welcome'
  | 'personalData'
  | 'careerStatus'
  | 'careerChangeQuestions'
  | 'initial'
  | 'careerInput'
  | 'validation';

type CareerCount = '0' | '1' | '2-3' | 'many';

type UserPersona =
  | 'buscador'
  | 'multipotencial'
  | 'analitico'
  | 'practico'
  | 'determinado'
  | 'enfocado'
  | 'estratega'
  | 'reinventado';

interface OnboardingStore {
  step: OnboardingStep;
  careerStatus: 'first' | 'change' | null;
  careerCount: CareerCount | null;
  careers: string[];
  persona: UserPersona | null;
  careerChangeData: {
    previousCareer: string;
    duration: string;
    enrollmentReason: string;
    quitReason: string;
    hatedActivities: string[];
    likedSomething: string;
    likedDetail: string;
    nonNegotiable: string;
  } | null;
  setStep: (step: OnboardingStep) => void;
  setCareerStatus: (status: 'first' | 'change') => void;
  setCareerCount: (count: CareerCount) => void;
  setCareers: (careers: string[]) => void;
  setPersona: (persona: UserPersona) => void;
  setCareerChangeData: (data: OnboardingStore['careerChangeData']) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 'welcome',
  careerStatus: null,
  careerCount: null,
  careers: [],
  persona: null,
  careerChangeData: null,

  setStep: (step) => set({ step }),
  setCareerStatus: (careerStatus) => set({ careerStatus }),
  setCareerCount: (careerCount) => set({ careerCount }),
  setCareers: (careers) => set({ careers }),
  setPersona: (persona) => set({ persona }),
  setCareerChangeData: (careerChangeData) => set({ careerChangeData }),
  reset: () =>
    set({
      step: 'welcome',
      careerStatus: null,
      careerCount: null,
      careers: [],
      persona: null,
      careerChangeData: null,
    }),
}));
