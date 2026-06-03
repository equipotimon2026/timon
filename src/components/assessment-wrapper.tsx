'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAssessmentStore } from '@/stores/assessment-store';
import { saveQuestionnaireResponse, getDraft, saveDraft, getResponses, type StoredResponseRow } from '@/app/actions/questionnaire';
import { SECTION_IDS } from '@/lib/constants';
import { getCalculatorForSection } from '@/lib/calculators';
import { MIPSForm } from '@/components/assessments/mips-form';
import { ProfesionalesForm, denormalizeProfesionales } from '@/components/assessments/profesionales-form';
import { RIASECForm, denormalizeRiasec } from '@/components/assessments/riasec-form';
import { HerrmannForm } from '@/components/assessments/herrmann-form';
import { GardnerForm, denormalizeGardner } from '@/components/assessments/gardner-form';
import { ProyectivasForm } from '@/components/assessments/proyectivas-form';
import { AutodescubrimientoForm, denormalizeAutodescubrimiento } from '@/components/assessments/autodescubrimiento-form';
import { EstiloVidaForm, denormalizeEstiloVida } from '@/components/assessments/estilo-vida-form';
import { VisionFuturoForm, denormalizeVisionFuturo } from '@/components/assessments/vision-futuro-form';
import { ArbolGenealogForm } from '@/components/assessments/arbol-genealogico-form';
import { UniversidadForm } from '@/components/assessments/universidad-form';
import { VibecheckForm } from '@/components/assessments/vibecheck-form';
import { VoscolegioForm } from '@/components/assessments/voscolegio-form';
import { PadresForm } from '@/components/assessments/padres-form';

// Optional per-form de-normalizer: rebuilds a form's own state shape from the
// canonical `responses` rows, so a completed form restores correctly even when
// its working draft is stale or was deleted by older code.
type Denormalizer = (rows: StoredResponseRow[]) => unknown;

const denormalizeVoscolegio: Denormalizer = (rows) => {
  const state: { sliderVal: number | null; contenido: string; materias: Record<string, string> } = {
    sliderVal: null,
    contenido: '',
    materias: {},
  };
  for (const r of rows) {
    if (r.questionNumber === 1) state.sliderVal = r.responseInteger;
    else if (r.questionNumber === 2) state.contenido = r.responseText ?? '';
    else if (r.question && r.responseText) state.materias[r.question] = r.responseText;
  }
  return state;
};

// herrmann: state is Record<stepIndex, string[]> keyed by questionNumber-1
const denormalizeHerrmann: Denormalizer = (rows) => {
  const responses: Record<number, string[]> = {};
  for (const r of rows) {
    const i = r.questionNumber - 1;
    responses[i] = r.responseArray ?? (r.responseText ? [r.responseText] : []);
  }
  return responses;
};

// arbol-genealogico: fixed questionNumber → field
const denormalizeArbol: Denormalizer = (rows) => {
  const map: Record<number, string> = { 1: 'q1', 2: 'q2', 3: 'q3', 4: 'q4', 5: 'q5', 6: 'apoyo', 7: 'entorno' };
  const s: Record<string, string> = { q1: '', q2: '', q3: '', q4: '', q5: '', apoyo: '', entorno: '' };
  for (const r of rows) {
    const key = map[r.questionNumber];
    if (key) s[key] = r.responseText ?? '';
  }
  return s;
};

// vibecheck: q1 → selectedId, q2 → followUpAnswer
const denormalizeVibecheck: Denormalizer = (rows) => {
  const byQN = new Map(rows.map((r) => [r.questionNumber, r]));
  return {
    selectedId: byQN.get(1)?.responseText ?? '',
    seen: [],
    expanded: [],
    followUpAnswer: byQN.get(2)?.responseText ?? '',
  };
};

// proyectivas (chat): answers keyed by index (questionNumber-1)
const denormalizeProyectivas: Denormalizer = (rows) => {
  const answers: Record<number, string> = {};
  for (const r of rows) answers[r.questionNumber - 1] = r.responseText ?? '';
  return { answers, phase: 'abiertas' };
};

// mips (chat): answers keyed by index (questionNumber-1), values are the option labels
const denormalizeMips: Denormalizer = (rows) => {
  const answers: Record<number, string> = {};
  for (const r of rows) answers[r.questionNumber - 1] = r.responseText ?? '';
  return { answers };
};

// padres (chat): question 0 = familiar label; questions ≥1 = {q, a} pairs
const denormalizePadres: Denormalizer = (rows) => {
  const responses: { q: string; a: string }[] = [];
  let familiar = '';
  let familiarOtro = '';
  for (const r of rows) {
    if (r.questionNumber === 0) {
      const label = r.responseText ?? '';
      if (label === 'Mamá' || label === 'Papá') familiar = label;
      else if (label) { familiar = 'Otro'; familiarOtro = label; }
    } else if (r.question) {
      responses.push({ q: r.question, a: r.responseText ?? '' });
    }
  }
  return { responses, flowIdx: 0, answeredCount: responses.length, familiar, familiarOtro };
};

// universidad: fixed questionNumber → field (zona stored as combined label; podio as JSON)
const denormalizeUniversidad: Denormalizer = (rows) => {
  const byQN = new Map(rows.map((r) => [r.questionNumber, r]));
  const t = (n: number) => byQN.get(n)?.responseText ?? '';
  let podio: Record<string, unknown> = {};
  try { podio = JSON.parse(t(12) || '{}'); } catch { podio = {}; }
  return {
    costo: t(1),
    zona: t(2), zonaOtra: '',
    viaje: t(3), mudarse: t(4),
    ingresoCBC: t(5), trabajar: t(6), trabajarCuanto: t(7),
    prestigio: t(8), valores: t(9), instalaciones: t(10), presencialidad: t(11),
    podio,
  };
};

const ASSESSMENT_MAP: Record<string, { sectionId: number; Component: any; denormalize?: Denormalizer }> = {
  'mips': { sectionId: SECTION_IDS.MILLON, Component: MIPSForm, denormalize: denormalizeMips },
  'riasec': { sectionId: SECTION_IDS.RIASEC, Component: RIASECForm, denormalize: denormalizeRiasec },
  'herrmann': { sectionId: SECTION_IDS.HERRMANN, Component: HerrmannForm, denormalize: denormalizeHerrmann },
  'gardner': { sectionId: SECTION_IDS.GARDNER, Component: GardnerForm, denormalize: denormalizeGardner },
  'proyectivas': { sectionId: SECTION_IDS.PROYECTIVA, Component: ProyectivasForm, denormalize: denormalizeProyectivas },
  'autodescubrimiento': { sectionId: SECTION_IDS.AUTODESC, Component: AutodescubrimientoForm, denormalize: denormalizeAutodescubrimiento },
  'estilo-vida': { sectionId: SECTION_IDS.LIFESTYLE, Component: EstiloVidaForm, denormalize: denormalizeEstiloVida },
  'vision-futuro': { sectionId: SECTION_IDS.FUTURO, Component: VisionFuturoForm, denormalize: denormalizeVisionFuturo },
  'arbol-genealogico': { sectionId: SECTION_IDS.FAMILIA, Component: ArbolGenealogForm, denormalize: denormalizeArbol },
  'universidad': { sectionId: SECTION_IDS.UNIVERSIDAD, Component: UniversidadForm, denormalize: denormalizeUniversidad },
  'vibecheck': { sectionId: SECTION_IDS.VIBECHECK, Component: VibecheckForm, denormalize: denormalizeVibecheck },
  'voscolegio': { sectionId: SECTION_IDS.VOSCOLEGIO, Component: VoscolegioForm, denormalize: denormalizeVoscolegio },
  'padres': { sectionId: SECTION_IDS.PADRES, Component: PadresForm, denormalize: denormalizePadres },
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
  const latestRef = useRef<unknown>(undefined);

  const assessment = ASSESSMENT_MAP[assessmentId];
  const sectionId = assessment?.sectionId;

  useEffect(() => {
    if (!sectionId) return;
    let cancelled = false;
    (async () => {
      try {
        // Prefer canonical saved responses when we can rebuild the form state from them;
        // the draft is only the in-progress fallback (and may be stale for completed forms).
        if (assessment?.denormalize) {
          const rows = await getResponses(sectionId);
          if (!cancelled && rows.length > 0) {
            setInitialResponses(assessment.denormalize(rows));
            return;
          }
        }
        const draft = await getDraft(sectionId);
        if (!cancelled) setInitialResponses(draft);
      } catch {
        // ignore — form starts empty
      } finally {
        if (!cancelled) setIsLoadingDraft(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sectionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResponseChange = useCallback(
    (responses: unknown) => {
      if (!sectionId) return;
      latestRef.current = responses;
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
    // Persist final state as draft so reopening a completed form restores answers.
    // The responses table holds the canonical record, but the draft mirrors the
    // form's own state shape, which is what each form reads via initialResponses.
    if (sectionId && latestRef.current !== undefined) {
      await saveDraft({ sectionId, draftData: latestRef.current }).catch(() => {});
    }
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
