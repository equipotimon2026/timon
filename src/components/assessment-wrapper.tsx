'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAssessmentStore } from '@/stores/assessment-store';
import { saveQuestionnaireResponse, getDraft, saveDraft, deleteDraft } from '@/app/actions/questionnaire';
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
import { VibecheckForm } from '@/components/assessments/vibecheck-form';
import { VoscolegioForm } from '@/components/assessments/voscolegio-form';
import { PadresForm } from '@/components/assessments/padres-form';
import { ProfesionalesForm } from '@/components/assessments/profesionales-form';

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
  'vibecheck': { sectionId: SECTION_IDS.VIBECHECK, Component: VibecheckForm },
  'voscolegio': { sectionId: SECTION_IDS.VOSCOLEGIO, Component: VoscolegioForm },
  'padres': { sectionId: SECTION_IDS.PADRES, Component: PadresForm },
  'profesionales': { sectionId: SECTION_IDS.PROFESIONALES, Component: ProfesionalesForm },
};

interface AssessmentWrapperProps {
  assessmentId: string;
  userId: number;
  /** Optional: called after completion instead of router.push('/') */
  onDone?: () => void;
}

export function AssessmentWrapper({ assessmentId, userId, onDone }: AssessmentWrapperProps) {
  const router = useRouter();
  const { markCompleted } = useAssessmentStore();
  const [initialResponses, setInitialResponses] = useState<unknown>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const assessment = ASSESSMENT_MAP[assessmentId];
  const sectionId = assessment?.sectionId;

  useEffect(() => {
    if (!sectionId) return;
    getDraft(sectionId)
      .then((draft) => setInitialResponses(draft))
      .catch(() => {})
      .finally(() => setIsLoadingDraft(false));
  }, [sectionId]);

  const handleResponseChange = useCallback(
    (responses: unknown) => {
      if (!sectionId) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveDraft({ sectionId, draftData: responses }).catch(() => {});
      }, 1000);
    },
    [sectionId]
  );

  if (!assessment) return <div>Assessment not found</div>;

  const { Component } = assessment;

  const handleSave = async (_sid: number, responses: any, meta: Record<string, unknown>) => {
    const calculator = getCalculatorForSection(sectionId);
    const scoreData = calculator.calculateScore(responses);
    await saveQuestionnaireResponse({
      sectionId,
      responses,
      scoreData,
      meta,
    });
  };

  const handleComplete = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await deleteDraft(sectionId).catch(() => {});
    markCompleted(sectionId);
    if (onDone) onDone();
    else router.push('/');
  };

  if (isLoadingDraft) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <Component
      userId={userId}
      onSave={handleSave}
      onComplete={handleComplete}
      initialResponses={initialResponses}
      onResponseChange={handleResponseChange}
    />
  );
}
