'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { QuestionnaireFlow } from '@/components/questionnaire/questionnaire-flow';
import { CategorySelection } from '@/components/questionnaire/category-selection';
import { useRouter } from '@/i18n/routing';
import { updateProfile, updatePersona } from '@/app/actions/user';
import { getCompletedAssessments } from '@/app/actions/assessment-status';
import type { UserPersona } from '@/types/questionnaire';

interface HomeContentProps {
  initialProfile: any;
  initialCompletedSections: number[];
}

export function HomeContent({ initialProfile, initialCompletedSections }: HomeContentProps) {
  const { profile, setProfile, fetchProfile, signOut } = useAuthStore();
  const { completedSections, setCompletedSections } = useAssessmentStore();
  const router = useRouter();

  useEffect(() => {
    if (initialProfile) setProfile(initialProfile);
    setCompletedSections(initialCompletedSections);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentProfile = profile || initialProfile;
  const isOnboardingComplete = currentProfile?.onboarding_completed;

  if (!isOnboardingComplete) {
    return (
      <QuestionnaireFlow
        userId={currentProfile?.id ?? 0}
        onComplete={async (persona: UserPersona) => {
          await updatePersona(persona);
          await fetchProfile();
          const sections = await getCompletedAssessments();
          setCompletedSections(sections);
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

  const currentCompleted = completedSections.length > 0 ? completedSections : initialCompletedSections;
  const completedIds = currentCompleted.map(String);

  return (
    <CategorySelection
      completedSections={completedIds}
      userName={currentProfile?.first_name ?? 'Usuario'}
      onSignOut={signOut}
      onNavigate={(id) => router.push(`/assessment/${id}`)}
    />
  );
}
