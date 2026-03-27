'use client';

import { useAuthStore } from '@/stores/auth-store';
import { UserHeader } from '@/components/layout/user-header';
import { SectionFeedback } from '@/components/layout/section-feedback';
import { saveFeedback } from '@/app/actions/feedback';
import { useRouter } from '@/i18n/routing';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuthStore();
  const router = useRouter();
  const userName = profile
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
    : '';

  const handleSignOut = async () => {
    await signOut();
    // Hard redirect to clear all client state
    window.location.href = '/es/login';
  };

  const handleSaveFeedback = async (feedback: string) => {
    await saveFeedback({ sectionId: 1, feedback });
  };

  return (
    <div className="min-h-screen bg-background">
      <UserHeader userName={userName || 'Usuario'} onSignOut={handleSignOut} />
      <main>{children}</main>
      {profile && (
        <SectionFeedback userId={profile.id} onSaveFeedback={handleSaveFeedback} />
      )}
    </div>
  );
}
