import { SECTION_IDS } from '@/lib/constants';
import * as mips from './mips';
import * as riasec from './riasec';
import * as herrmann from './herrmann';
import * as gardner from './gardner';
import * as vak from './vak';
import * as textBased from './text-based';

export interface QuestionnaireCalculator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  calculateScore: (responses: any) => Record<string, any>;
}

export { mips, riasec, herrmann, gardner, vak, textBased };

export function getCalculatorForSection(sectionId: number): QuestionnaireCalculator {
  switch (sectionId) {
    case SECTION_IDS.MILLON:
      return mips;
    case SECTION_IDS.RIASEC:
      return riasec;
    case SECTION_IDS.HERRMANN:
      return herrmann;
    case SECTION_IDS.GARDNER:
      return gardner;
    case SECTION_IDS.APRENDIZAJE:
      return vak;
    case SECTION_IDS.PROYECTIVA:
    case SECTION_IDS.AUTODESC:
    case SECTION_IDS.LIFESTYLE:
    case SECTION_IDS.FUTURO:
    case SECTION_IDS.FAMILIA:
    case SECTION_IDS.VIBECHECK:
    case SECTION_IDS.VOSCOLEGIO:
    case SECTION_IDS.PADRES:
    case SECTION_IDS.PROFESIONALES:
      return textBased;
    case SECTION_IDS.BRAVITO:
    case SECTION_IDS.UNIVERSIDAD:
    default:
      return {
        calculateScore: (responses: unknown) => ({
          completed: true,
          responsesCount:
            typeof responses === 'object' && responses !== null
              ? Object.keys(responses).length
              : 0,
          completedAt: new Date().toISOString(),
        }),
      };
  }
}
