import { create } from 'zustand';

interface AssessmentStore {
  completedSections: number[];
  setCompletedSections: (sections: number[]) => void;
  markCompleted: (sectionId: number) => void;
  isCompleted: (sectionId: number) => boolean;
  completionStats: () => { completed: number; total: number };
}

const TOTAL_ASSESSMENTS = 10;

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  completedSections: [],

  setCompletedSections: (sections) => set({ completedSections: sections }),

  markCompleted: (sectionId) => {
    const current = get().completedSections;
    if (!current.includes(sectionId)) {
      set({ completedSections: [...current, sectionId] });
    }
  },

  isCompleted: (sectionId) => get().completedSections.includes(sectionId),

  completionStats: () => ({
    completed: get().completedSections.length,
    total: TOTAL_ASSESSMENTS,
  }),
}));
