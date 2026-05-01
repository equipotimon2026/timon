'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { QuestionnaireFlow } from '@/components/questionnaire/questionnaire-flow';
import { JourneyPath, buildJourneySteps, calcCompletionPercent } from '@/components/journey-path';
import { AssessmentModal } from '@/components/journey-path/assessment-modal';
import { ProgressSteps } from '@/components/wizard/progress-steps';
import { AssessmentSummary } from '@/components/wizard/assessment-summary';
import { ResultsView } from '@/components/wizard/results-view';
import { AssessmentWrapper } from '@/components/assessment-wrapper';
import { useRouter } from '@/i18n/routing';
import { updateProfile, updatePersona } from '@/app/actions/user';
import type { UserPersona } from '@/types/questionnaire';

const TOTAL_ASSESSMENTS = 10;

interface Assessment {
  assessment_id: string;
  status: string;
  results: unknown;
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

  // Fetch completed sections and latest assessment from API
  const fetchInitialData = useCallback(async () => {
    try {
      const [sectionsRes, assessmentRes] = await Promise.all([
        fetch('/api/assessments/completed'),
        fetch('/api/assessments/latest'),
      ]);

      const sectionsData = await sectionsRes.json();
      setCompletedSections(sectionsData.completedSections ?? []);

      const assessmentData = await assessmentRes.json();
      const assessment: Assessment | null = assessmentData.assessment ?? null;
      setLatestAssessment(assessment);

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

  const allTestsCompleted = completedSections.length >= TOTAL_ASSESSMENTS;
  const hasResults = analyzeResults !== null;

  // Auto-advance to step 1 (summary) when all tests are completed
  useEffect(() => {
    if (allTestsCompleted && activeStep === 0 && !latestAssessment) {
      setActiveStep(1);
    }
  }, [allTestsCompleted]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResultsReceived = useCallback((data: unknown) => {
    setAnalyzeResults(data);
    setActiveStep(2);
  }, []);

  const handleStepClick = useCallback(
    (index: number) => {
      if (index === 0) {
        setActiveStep(0);
      } else if (index === 1 && allTestsCompleted) {
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
      status: (activeStep === 0 ? 'active' : allTestsCompleted ? 'completed' : 'active') as
        | 'active'
        | 'completed'
        | 'locked',
    },
    {
      label: 'Resumen',
      status: (
        activeStep === 1
          ? 'active'
          : activeStep > 1
            ? 'completed'
            : allTestsCompleted
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

  const journeySteps = buildJourneySteps(completedSections, (slug) =>
    setModalSlug(slug)
  );
  const completionPercent = calcCompletionPercent(completedSections);

  return (
    <div className="min-h-screen">
      {/* Wizard Progress Steps — always visible */}
      <div className="mx-auto max-w-7xl px-6 pt-8 sm:px-8 lg:px-12">
        <div className="mb-6 animate-fade-up">
          <ProgressSteps steps={steps} onStepClick={handleStepClick} />
        </div>
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
