'use client';

import { useAuthStore } from '@/stores/auth-store';
import { UserHeader } from '@/components/layout/user-header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuthStore();
  const userName = profile
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
    : '';

  return (
    <div className="min-h-screen bg-background">
      <UserHeader userName={userName || 'Usuario'} />
      <main>{children}</main>
    </div>
  );
}
