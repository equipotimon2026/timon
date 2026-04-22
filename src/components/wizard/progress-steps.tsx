'use client';

import { CheckCircle2, Lock } from 'lucide-react';

interface Step {
  label: string;
  status: 'completed' | 'active' | 'locked';
}

interface ProgressStepsProps {
  steps: Step[];
  onStepClick?: (index: number) => void;
}

export function ProgressSteps({ steps, onStepClick }: ProgressStepsProps) {
  const activeIndex = steps.findIndex((s) => s.status === 'active');
  const progressPercent =
    activeIndex === -1
      ? 100
      : (activeIndex / (steps.length - 1)) * 100;

  return (
    <div className="mx-auto w-full max-w-md px-6">
      <div className="relative mx-3">
        <div className="h-1 w-full rounded-full bg-secondary">
          <div
            className="h-1 rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {steps.map((step, i) => {
          const leftPercent = (i / (steps.length - 1)) * 100;
          const isClickable =
            step.status === 'completed' ||
            (step.status === 'active' && i !== activeIndex);

          return (
            <button
              key={step.label}
              type="button"
              disabled={step.status === 'locked'}
              onClick={() => isClickable && onStepClick?.(i)}
              className="absolute -top-3 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full transition-all duration-300"
              style={{ left: `${leftPercent}%` }}
              aria-label={step.label}
            >
              {step.status === 'completed' && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              )}
              {step.status === 'active' && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-bold text-white text-xs shadow-[0_0_12px_rgba(124,58,237,0.5)]">
                  {i + 1}
                </span>
              )}
              {step.status === 'locked' && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-muted bg-background text-muted-foreground">
                  <Lock className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex justify-between px-0">
        {steps.map((step) => (
          <span
            key={step.label}
            className={`text-xs font-medium ${
              step.status === 'active'
                ? 'text-foreground font-semibold'
                : step.status === 'completed'
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/50'
            }`}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
