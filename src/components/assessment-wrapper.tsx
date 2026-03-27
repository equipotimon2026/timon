'use client';

import { useRouter } from '@/i18n/routing';
import { useAssessmentStore } from '@/stores/assessment-store';
import { saveQuestionnaireResponse } from '@/app/actions/questionnaire';
import { SECTION_IDS } from '@/lib/constants';
import { getCalculatorForSection } from '@/lib/calculators';
import { MIPSForm } from '@/components/assessments/mips-form';
import { RIASECForm } from '@/components/assessments/riasec-form';
import { HerrmannForm } from '@/components/assessments/herrmann-form';
import { GardnerForm } from '@/components/assessments/gardner-form';
import { ProyectivasForm } from '@/components/assessments/proyectivas-form';
import { AutodescubrimientoForm } from '@/components/assessments/autodescubrimiento-form';
import { EstiloVidaForm } from '@/components/assessments/estilo-vida-form';
import { VisionFuturoForm } from '@/components/assessments/vision-futuro-form';
import { ArbolGenealogForm } from '@/components/assessments/arbol-genealogico-form';
import { UniversidadForm } from '@/components/assessments/universidad-form';

const ASSESSMENT_MAP: Record<string, { sectionId: number; Component: any }> = {
  'mips': { sectionId: SECTION_IDS.MILLON, Component: MIPSForm },
  'riasec': { sectionId: SECTION_IDS.RIASEC, Component: RIASECForm },
  'herrmann': { sectionId: SECTION_IDS.HERRMANN, Component: HerrmannForm },
  'gardner': { sectionId: SECTION_IDS.GARDNER, Component: GardnerForm },
  'proyectivas': { sectionId: SECTION_IDS.PROYECTIVA, Component: ProyectivasForm },
  'autodescubrimiento': { sectionId: SECTION_IDS.AUTODESC, Component: AutodescubrimientoForm },
  'estilo-vida': { sectionId: SECTION_IDS.LIFESTYLE, Component: EstiloVidaForm },
  'vision-futuro': { sectionId: SECTION_IDS.FUTURO, Component: VisionFuturoForm },
  'arbol-genealogico': { sectionId: SECTION_IDS.FAMILIA, Component: ArbolGenealogForm },
  'universidad': { sectionId: SECTION_IDS.UNIVERSIDAD, Component: UniversidadForm },
};

interface AssessmentWrapperProps {
  assessmentId: string;
  userId: number;
}

export function AssessmentWrapper({ assessmentId, userId }: AssessmentWrapperProps) {
  const router = useRouter();
  const { markCompleted } = useAssessmentStore();

  const assessment = ASSESSMENT_MAP[assessmentId];
  if (!assessment) return <div>Assessment not found</div>;

  const { Component, sectionId } = assessment;

  const handleSave = async (sid: number, responses: any, meta: Record<string, unknown>) => {
    const calculator = getCalculatorForSection(sid);
    const scoreData = calculator.calculateScore(responses);
    await saveQuestionnaireResponse({
      sectionId: sid,
      responses,
      scoreData,
      meta,
    });
  };

  const handleComplete = () => {
    markCompleted(sectionId);
    router.push('/');
  };

  return <Component userId={userId} onSave={handleSave} onComplete={handleComplete} />;
}
