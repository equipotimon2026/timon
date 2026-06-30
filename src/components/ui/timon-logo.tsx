import { cn } from '@/lib/utils';

/**
 * Timon brand mark (compass/helm) — official Timon logo.
 * Uses `currentColor` so it inherits the text color of its context;
 * pass a color via `className` (e.g. `text-primary-foreground`).
 */
export function TimonLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      className={cn('h-6 w-6', className)}
      aria-hidden="true"
    >
      <circle cx="48" cy="48" r="22" stroke="currentColor" strokeWidth="3" fill="none" />
      <circle cx="48" cy="48" r="5" fill="currentColor" />
      <line x1="48" y1="10" x2="48" y2="86" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="10" y1="48" x2="86" y2="48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="74.87" y1="21.13" x2="21.13" y2="74.87" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="74.87" y1="74.87" x2="21.13" y2="21.13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="48" cy="10" r="4" fill="currentColor" />
      <circle cx="48" cy="86" r="4" fill="currentColor" />
      <circle cx="10" cy="48" r="4" fill="currentColor" />
      <circle cx="86" cy="48" r="4" fill="currentColor" />
      <circle cx="74.87" cy="21.13" r="4" fill="currentColor" />
      <circle cx="21.13" cy="74.87" r="4" fill="currentColor" />
      <circle cx="74.87" cy="74.87" r="4" fill="currentColor" />
      <circle cx="21.13" cy="21.13" r="4" fill="currentColor" />
    </svg>
  );
}

export default TimonLogo;
