'use client';

import { useTranslations } from 'next-intl';
import { Compass } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('auth');

  return (
    <div className="flex min-h-screen">
      {/* Left panel - decorative (hidden on mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />

        {/* Content */}
        <div className="relative z-10 max-w-md px-12 text-center animate-fade-up">
          {/* Logo / Brand */}
          <div className="mb-8 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Compass className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h2 className="font-serif text-4xl font-bold tracking-tight text-primary-foreground">
            Timon
          </h2>
        </div>

        {/* Decorative dots */}
        <div className="absolute bottom-8 left-8 flex gap-2">
          <div className="h-2 w-2 rounded-full bg-primary-foreground/20" />
          <div className="h-2 w-2 rounded-full bg-primary-foreground/10" />
          <div className="h-2 w-2 rounded-full bg-primary-foreground/5" />
        </div>
      </div>

      {/* Right panel - form area */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        {/* Mobile logo (shown only on small screens) */}
        <div className="mb-8 flex items-center gap-3 lg:hidden animate-fade-up">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <span className="font-serif text-2xl font-bold text-foreground">
            Timon
          </span>
        </div>

        <div className="w-full max-w-md animate-fade-up animation-delay-100">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground animate-fade-in animation-delay-300">
          Timon
        </p>
      </div>
    </div>
  );
}
