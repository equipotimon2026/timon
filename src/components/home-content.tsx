'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { QuestionnaireFlow } from '@/components/questionnaire/questionnaire-flow';
import { JourneyPath, buildJourneySteps, calcCompletionPercent, JOURNEY_STEPS_CONFIG } from '@/components/journey-path';
import { AssessmentModal } from '@/components/journey-path/assessment-modal';
import { ProgressSteps } from '@/components/wizard/progress-steps';
import { AssessmentSummary } from '@/components/wizard/assessment-summary';
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
}

interface HomeContentProps {
  initialProfile: any;
}

export function HomeContent({ initialProfile }: HomeContentProps) {
  const { profile, setProfile, fetchProfile } = useAuthStore();
  const { completedSections, setCompletedSections } = useAssessmentStore();
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

      if (assessment?.status === 'completed' && assessment.results) {
        setAnalyzeResults(assessment.results);
        setActiveStep(2);
      } else if (assessment?.status === 'processing' || assessment?.status === 'failed') {
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

  const handleResultsReceived = useCallback((data: unknown) => {
    setAnalyzeResults(data);
    setActiveStep(2);
  }, []);

  const handleStepClick = useCallback(
    (index: number) => {
      if (index === 0) {
        setActiveStep(0);
      } else if (index === 1 && (allTestsCompleted || hasResults)) {
        setActiveStep(1);
      } else if (index === 2 && hasResults) {
        setActiveStep(2);
      }
    },
    [allTestsCompleted, hasResults]
  );

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

  const steps = [
    {
      label: 'Tests',
      status: (activeStep === 0
        ? 'active'
        : hasResults || allTestsCompleted
          ? 'completed'
          : 'active') as 'active' | 'completed' | 'locked',
    },
    {
      label: 'Resumen',
      status: (
        activeStep === 1
          ? 'active'
          : activeStep > 1 || hasResults || allTestsCompleted
            ? 'completed'
            : 'locked'
      ) as 'active' | 'completed' | 'locked',
    },
    {
      label: 'Resultados',
      status: (activeStep === 2 ? 'active' : hasResults ? 'completed' : 'locked') as
        | 'active'
        | 'completed'
        | 'locked',
    },
  ];

  // Fix step statuses: active step should be 'active', not 'completed'
  steps[activeStep].status = 'active';

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
  const showBanner = activeStep === 2 && (assessmentOutdated || (hasResults && assessmentIsOutdated));
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
  const completionPercent = calcCompletionPercent(completedSections);

  return (
    <div className="min-h-screen">
      {/* Wizard Progress Steps — always visible */}
      <div className="mx-auto max-w-7xl px-6 pt-8 sm:px-8 lg:px-12">
        <div className="mb-6 animate-fade-up">
          <ProgressSteps steps={steps} onStepClick={handleStepClick} />
        </div>

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

      {activeStep > 0 && (
        <div className="bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
            {activeStep === 1 && (
              <AssessmentSummary
                onResultsReceived={handleResultsReceived}
                assessmentId={latestAssessment?.status === 'processing' ? latestAssessment.assessment_id : null}
                assessmentStatus={latestAssessment?.status ?? null}
                completedSectionIds={completedSections}
              />
            )}

            {activeStep === 2 && <ResultsView />}
          </div>
        </div>
      )}
    </div>
  );
}
