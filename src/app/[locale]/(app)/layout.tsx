'use client';

import { useAuthStore } from '@/stores/auth-store';
import { UserHeader } from '@/components/layout/user-header';
import { SectionFeedback } from '@/components/layout/section-feedback';
import { saveFeedback } from '@/app/actions/feedback';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuthStore();
  const userName = profile
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
    : '';

  const handleSaveFeedback = async (feedback: string) => {
    await saveFeedback({ sectionId: 1, feedback });
  };

  return (
    <div className="min-h-screen bg-background">
      <UserHeader userName={userName || 'Usuario'} />
      <main>{children}</main>
      {profile && (
        <SectionFeedback userId={profile.id} onSaveFeedback={handleSaveFeedback} />
      )}
    </div>
  );
}
