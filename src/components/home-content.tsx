'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { QuestionnaireFlow } from '@/components/questionnaire/questionnaire-flow';
import { JourneyPath, buildJourneySteps, calcCompletionPercent, calcCompletionPercentFromStatus, JOURNEY_STEPS_CONFIG } from '@/components/journey-path';
import { AssessmentModal } from '@/components/journey-path/assessment-modal';
import { useWizardStore, type WizardStep } from '@/stores/wizard-store';
import { LoadingScreen } from '@/components/wizard/loading-screen';
import { PendingResultsScreen } from '@/components/wizard/pending-results-screen';
import { ResultsView } from '@/components/wizard/results-view';
import { AssessmentWrapper } from '@/components/assessment-wrapper';
import { useRouter } from '@/i18n/routing';
import { updateProfile, updatePersona } from '@/app/actions/user';
import type { UserPersona } from '@/types/questionnaire';
import type { SectionStatus } from '@/hooks/use-sections';
import { Sparkles } from 'lucide-react';

const REQUIRED_SECTION_IDS = JOURNEY_STEPS_CONFIG
  .filter((s) => s.sectionId !== null)
  .map((s) => s.sectionId as number);

interface Assessment {
  assessment_id: string;
  status: string;
  results: unknown;
  is_outdated?: boolean;
  created_at?: string;
  released_at?: string | null;
}

interface HomeContentProps {
  initialProfile: any;
}

export function HomeContent({ initialProfile }: HomeContentProps) {
  const { profile, setProfile, fetchProfile } = useAuthStore();
  const { completedSections, setCompletedSections } = useAssessmentStore();
  const setWizard = useWizardStore((s) => s.setWizard);
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [analyzeResults, setAnalyzeResults] = useState<unknown>(null);
  const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalSlug, setModalSlug] = useState<string | null>(null);
  const [sectionsStatus, setSectionsStatus] = useState<SectionStatus[]>([]);
  const [assessmentOutdated, setAssessmentOutdated] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  // Pantalla "12hs": la generacion termino/fallo pero el resultado aun no esta
  // disponible para el usuario (gate manual del admin o fallo silencioso).
  const [awaitingResults, setAwaitingResults] = useState(false);

  // Fetch completed sections and latest assessment from API
  const fetchInitialData = useCallback(async () => {
    try {
      const [sectionsRes, assessmentRes, sectionsStatusRes] = await Promise.all([
        fetch('/api/assessments/completed'),
        fetch('/api/assessments/latest'),
        fetch('/api/users/me/sections-status'),
      ]);

      const sectionsData = await sectionsRes.json();
      setCompletedSections(sectionsData.completedSections ?? []);

      const assessmentData = await assessmentRes.json();
      const assessment: Assessment | null = assessmentData.assessment ?? null;
      setLatestAssessment(assessment);

      if (sectionsStatusRes.ok) {
        const statusData = await sectionsStatusRes.json();
        setSectionsStatus(statusData.sections ?? []);
        setAssessmentOutdated(statusData.assessment_outdated ?? false);
      }

      if (assessment?.status === 'completed' && assessment.released_at && assessment.results) {
        // Liberado por el admin → mostrar resultados.
        setAnalyzeResults(assessment.results);
        setActiveStep(1);
      } else if (assessment?.status === 'completed' || assessment?.status === 'failed' || assessment?.status === 'cancelled') {
        // Terminado pero todavia no liberado, o fallo/cancelado → pantalla "12hs".
        // El usuario nunca ve un error.
        setAwaitingResults(true);
        setActiveStep(1);
      } else if (assessment?.status === 'processing') {
        // Resume polling happens in a dedicated effect below
        setActiveStep(1);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  }, [setCompletedSections]);

  useEffect(() => {
    if (initialProfile) setProfile(initialProfile);
    fetchInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentProfile = profile || initialProfile;
  const isOnboardingComplete = currentProfile?.onboarding_completed;

  const completedSet = new Set(completedSections);
  const allTestsCompleted = REQUIRED_SECTION_IDS.every((id) => completedSet.has(id));
  const hasResults = analyzeResults !== null;

  // Poll the analyze endpoint. El usuario NUNCA ve un error: cualquier estado
  // terminal sin resultado liberado cae en la pantalla "12hs". El timeout (30min)
  // lo controla el servidor comparando contra created_at, asi que el loop del
  // cliente solo reacciona al estado que devuelve el server.
  const pollAssessment = useCallback(
    async (assessmentId: string, email: string, signal?: { cancelled: boolean }) => {
      const POLL_INTERVAL = 20_000;
      const MAX_POLLS = 120; // tope de seguridad (~40min); el corte real es server-side

      for (let i = 0; i < MAX_POLLS; i++) {
        if (signal?.cancelled) return;

        let pollData: { status?: string; released?: boolean } = {};
        try {
          const pollRes = await fetch(
            `/api/analyze?assessment_id=${assessmentId}&email=${encodeURIComponent(email)}`
          );
          pollData = await pollRes.json().catch(() => ({}));
        } catch {
          // Error de red: no exponerlo, reintentar.
          await new Promise((r) => setTimeout(r, POLL_INTERVAL));
          continue;
        }

        if (signal?.cancelled) return;

        if (pollData.status === 'completed') {
          if (pollData.released) {
            // Liberado mientras poolleabamos → traer los resultados via latest.
            await fetchInitialData();
          } else {
            setAwaitingResults(true);
          }
          setGenerating(false);
          return;
        }
        if (pollData.status === 'failed' || pollData.status === 'cancelled') {
          // Fallo/cancelado/timeout → pantalla "12hs", sin error visible.
          setAwaitingResults(true);
          setGenerating(false);
          return;
        }

        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
      }

      // Tope de seguridad alcanzado: igual mostramos "12hs", nunca un error.
      setAwaitingResults(true);
      setGenerating(false);
    },
    [fetchInitialData]
  );

  // Trigger generation from the Tests tab, then jump to the Results tab while polling.
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setAwaitingResults(false);
    setActiveStep(1);

    try {
      const res = await fetch('/api/analyze', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Error ${res.status}`);
      }

      const { assessment_id, email } = await res.json();
      if (!assessment_id) throw new Error('No se recibió el ID del assessment');

      await pollAssessment(assessment_id, email);
    } catch (err) {
      // El usuario nunca ve el error: mostramos la pantalla "12hs".
      console.error('[assessment] Error:', err);
      setAwaitingResults(true);
      setGenerating(false);
    }
  }, [pollAssessment]);

  // Resume polling on load if there is an assessment already processing.
  useEffect(() => {
    if (latestAssessment?.status !== 'processing') return;
    const signal = { cancelled: false };
    setGenerating(true);
    setActiveStep(1);

    (async () => {
      try {
        const profileRes = await fetch('/api/auth/profile');
        const profileData = await profileRes.json();
        const email = profileData.profile?.email ?? '';
        await pollAssessment(latestAssessment.assessment_id, email, signal);
      } catch (err) {
        if (signal.cancelled) return;
        console.error('[assessment] Resume polling error:', err);
        setAwaitingResults(true);
        setGenerating(false);
      }
    })();

    return () => {
      signal.cancelled = true;
    };
  }, [latestAssessment, pollAssessment]);

  const handleStepClick = useCallback(
    (index: number) => {
      if (index === 0) {
        setActiveStep(0);
      } else if (index === 1 && (hasResults || generating || awaitingResults)) {
        setActiveStep(1);
      }
    },
    [hasResults, generating, awaitingResults]
  );

  // Publish the wizard stepper to the navbar (UserHeader renders it from the store).
  useEffect(() => {
    if (!isOnboardingComplete) return;
    const wizardSteps: WizardStep[] = [
      {
        label: 'Tests',
        status: activeStep === 0 ? 'active' : hasResults || allTestsCompleted ? 'completed' : 'active',
      },
      {
        label: 'Resultados',
        status: activeStep === 1 ? 'active' : hasResults ? 'completed' : 'locked',
        loading: generating,
      },
    ];
    wizardSteps[activeStep].status = 'active';
    setWizard({ steps: wizardSteps, onStepClick: handleStepClick });
    return () => setWizard(null);
  }, [isOnboardingComplete, activeStep, hasResults, allTestsCompleted, generating, handleStepClick, setWizard]);

  if (!isOnboardingComplete) {
    return (
      <QuestionnaireFlow
        userId={currentProfile?.id ?? 0}
        onComplete={async (persona: UserPersona) => {
          await updatePersona(persona);
          await fetchProfile();
          await fetchInitialData();
        }}
        onSavePersonalData={async (data) => {
          const updated = await updateProfile({
            age: data.age,
            school: data.school,
            schoolYear: data.year,
            phoneNumber: data.phone,
          });
          setProfile(updated);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const outdatedSectionIds = sectionsStatus
    .filter((s) => s.status === 'completed_outdated')
    .map((s) => s.section_id);
  const missingSectionIds = sectionsStatus
    .filter((s) => s.status === 'missing')
    .map((s) => s.section_id);

  const outdatedSectionNames = JOURNEY_STEPS_CONFIG
    .filter((c) => c.sectionId !== null && outdatedSectionIds.includes(c.sectionId))
    .map((c) => c.title);

  const allSectionsCurrent = sectionsStatus.length > 0 && sectionsStatus.every((s) => s.status === 'completed_current');
  const assessmentIsOutdated = latestAssessment?.is_outdated === true;
  const showBanner = activeStep === 1 && (assessmentOutdated || (hasResults && assessmentIsOutdated));
  const canRegenerate = allSectionsCurrent;

  async function handleConfirmRegenerate() {
    setShowRegenerateModal(false);
    setRegenerating(true);
    setRegenerateError(null);
    try {
      const res = await fetch('/api/assessments/regenerate', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Error al iniciar regeneración');
      }
      const data = await res.json();
      const assessmentId = data.assessment_id;
      const profileRes = await fetch('/api/auth/profile');
      const profileBody = await profileRes.json();
      const email = profileBody.profile?.email ?? '';
      const MAX_POLLS = 60;
      let count = 0;
      const poll = async () => {
        count++;
        if (count > MAX_POLLS) {
          setRegenerateError('El análisis tardó demasiado.');
          setRegenerating(false);
          return;
        }
        try {
          const pollRes = await fetch(
            `/api/analyze?assessment_id=${assessmentId}&email=${encodeURIComponent(email)}`
          );
          const pollData = await pollRes.json();
          if (pollData.status === 'completed') {
            await fetchInitialData();
            setRegenerating(false);
          } else if (pollData.status === 'failed') {
            throw new Error(pollData.error || 'Procesamiento falló');
          } else {
            setTimeout(poll, 5_000);
          }
        } catch (err) {
          setRegenerateError(err instanceof Error ? err.message : 'Error durante el análisis');
          setRegenerating(false);
        }
      };
      setTimeout(poll, 5_000);
    } catch (err) {
      setRegenerateError(err instanceof Error ? err.message : 'Error al regenerar');
      setRegenerating(false);
    }
  }

  const journeySteps = buildJourneySteps(
    completedSections,
    (slug) => setModalSlug(slug),
    sectionsStatus
  );
  const completionPercent = sectionsStatus.length > 0
    ? calcCompletionPercentFromStatus(sectionsStatus)
    : calcCompletionPercent(completedSections);

  const hasProcessing = latestAssessment?.status === 'processing';
  const canGenerate = allTestsCompleted && !hasResults && !generating && !hasProcessing;
  const generateLabel = generating
    ? 'Generando...'
    : hasResults
      ? 'Perfil generado'
      : !allTestsCompleted
        ? 'Completá los tests'
        : 'Generar resultados';

  return (
    <div className="min-h-screen">
      {/* Wizard stepper is rendered in the navbar (UserHeader) via the wizard store */}
      <div className="mx-auto max-w-7xl px-6 pt-8 sm:px-8 lg:px-12 empty:hidden">
        {/* Outdated assessment banner */}
        {showBanner && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                {canRegenerate
                  ? 'Completaste los formularios actualizados.'
                  : 'Actualizamos algunos formularios.'}
                {!canRegenerate && outdatedSectionNames.length > 0 && (
                  <> &ldquo;{outdatedSectionNames.join(', ')}&rdquo;.</>
                )}
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                {canRegenerate
                  ? 'Generá un nuevo análisis sin perder el anterior.'
                  : 'Completalos para obtener un análisis más profundo. Tu análisis actual no se borra.'}
              </p>
              {regenerateError && (
                <p className="mt-1 text-xs text-red-600">{regenerateError}</p>
              )}
            </div>
            {regenerating ? (
              <div className="flex shrink-0 items-center gap-2 text-xs text-amber-700">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                Generando análisis...
              </div>
            ) : canRegenerate ? (
              <button
                onClick={() => setShowRegenerateModal(true)}
                className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
              >
                Regenerar análisis
              </button>
            ) : (
              <button
                onClick={() => setActiveStep(0)}
                className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
              >
                Ver formularios actualizados
              </button>
            )}
          </div>
        )}
      </div>

      {activeStep === 0 && (
        <JourneyPath
          userName={currentProfile?.first_name ?? 'Usuario'}
          completionPercent={completionPercent}
          steps={journeySteps}
          onGenerate={handleGenerate}
          canGenerate={canGenerate}
          generating={generating}
          hasResults={hasResults}
          generateLabel={generateLabel}
        />
      )}

      {/* Assessment Modal — opens over journey path */}
      <AssessmentModal open={modalSlug !== null} onClose={() => setModalSlug(null)}>
        {modalSlug && (
          <AssessmentWrapper
            key={modalSlug}
            assessmentId={modalSlug}
            userId={currentProfile?.id ?? 0}
            onDone={() => {
              setModalSlug(null);
              fetchInitialData();
            }}
          />
        )}
      </AssessmentModal>

      {activeStep === 1 && (
        <div className="bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
            {generating ? (
              <LoadingScreen />
            ) : hasResults ? (
              <ResultsView />
            ) : (
              <PendingResultsScreen />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
