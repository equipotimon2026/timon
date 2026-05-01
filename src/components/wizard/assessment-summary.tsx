'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { LoadingScreen } from './loading-screen';
import { JOURNEY_STEPS_CONFIG } from '@/components/journey-path';

interface AssessmentSummaryProps {
  onResultsReceived: (data: unknown) => void;
  assessmentId?: string | null;
  assessmentStatus?: string | null;
  completedSectionIds?: number[];
}

export function AssessmentSummary({ onResultsReceived, assessmentId, assessmentStatus, completedSectionIds = [] }: AssessmentSummaryProps) {
  const completedSet = new Set(completedSectionIds);
  const hasExistingAssessment = !!assessmentStatus && assessmentStatus !== 'failed';
  const [state, setState] = useState<'idle' | 'loading' | 'polling' | 'error'>(
    assessmentId ? 'polling' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');

  // Resume polling if we already have an assessment_id
  useEffect(() => {
    if (!assessmentId) return;
    let cancelled = false;

    async function resumePolling() {
      try {
        const profileRes = await fetch('/api/auth/profile');
        const profileData = await profileRes.json();
        const email = profileData.profile?.email ?? '';

        const POLL_INTERVAL = 20_000;
        const MAX_POLLS = 30;

        for (let i = 0; i < MAX_POLLS; i++) {
          if (cancelled) return;

          const pollRes = await fetch(
            `/api/analyze?assessment_id=${assessmentId}&email=${encodeURIComponent(email)}`
          );

          if (!pollRes.ok) {
            const body = await pollRes.json().catch(() => ({}));
            throw new Error(body.error || `Error de polling: ${pollRes.status}`);
          }

          const pollData = await pollRes.json();

          if (pollData.status === 'completed') {
            onResultsReceived(pollData.results);
            return;
          }

          if (pollData.status === 'failed') {
            throw new Error(pollData.error || 'El procesamiento falló');
          }

          await new Promise((r) => setTimeout(r, POLL_INTERVAL));
        }

        throw new Error('El procesamiento tardó demasiado.');
      } catch (err) {
        if (cancelled) return;
        console.error('[assessment] Resume polling error:', err);
        setErrorMessage('Hubo un problema al generar tu perfil. Por favor, intentá de nuevo.');
        setState('error');
      }
    }

    resumePolling();
    return () => { cancelled = true; };
  }, [assessmentId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit() {
    setState('loading');
    setErrorMessage('');

    try {
      // Step 1: Submit assessment
      const res = await fetch('/api/analyze', { method: 'POST' });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Error ${res.status}`);
      }

      const { assessment_id, email } = await res.json();

      if (!assessment_id) {
        throw new Error('No se recibió el ID del assessment');
      }

      // Step 2: Poll for results every 20 seconds
      const POLL_INTERVAL = 20_000;
      const MAX_POLLS = 30; // 30 * 20s = 10 minutes max

      for (let i = 0; i < MAX_POLLS; i++) {
        const pollRes = await fetch(
          `/api/analyze?assessment_id=${assessment_id}&email=${encodeURIComponent(email)}`
        );

        if (!pollRes.ok) {
          const body = await pollRes.json().catch(() => ({}));
          throw new Error(body.error || `Error de polling: ${pollRes.status}`);
        }

        const pollData = await pollRes.json();

        if (pollData.status === 'completed') {
          onResultsReceived(pollData.results);
          return;
        }

        if (pollData.status === 'failed') {
          throw new Error(pollData.error || 'El procesamiento falló');
        }

        // Still processing, wait before next poll
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
      }

      throw new Error('El procesamiento tardó demasiado. Intentá de nuevo.');
    } catch (err) {
      console.error('[assessment] Error:', err);
      setErrorMessage('Hubo un problema al generar tu perfil. Por favor, intentá de nuevo.');
      setState('error');
    }
  }

  if (state === 'loading' || state === 'polling') {
    return <LoadingScreen />;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 animate-fade-up">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
          <CheckCircle2 className="h-6 w-6 text-accent" />
        </div>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          ¡Tus respuestas están listas!
        </h2>
        <p className="mt-2 text-muted-foreground">
          Revisá un resumen de lo que completaste y generá tu perfil vocacional
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {JOURNEY_STEPS_CONFIG.map((step) => {
          const isDone = step.sectionId !== null && completedSet.has(step.sectionId);
          return (
            <Card
              key={step.id}
              className={`flex items-center gap-3 p-4 ${
                isDone
                  ? 'border-accent/20 bg-accent/5'
                  : 'border-border bg-muted/30'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent" />
              ) : (
                <Circle className="h-5 w-5 flex-shrink-0 text-muted-foreground/40" />
              )}
              <div>
                <p className={`text-sm font-semibold ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.subtitle}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {state === 'error' && (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={hasExistingAssessment}
          className="bg-gradient-to-r from-primary to-accent px-8 py-6 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:from-muted disabled:to-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          {hasExistingAssessment
            ? assessmentStatus === 'processing'
              ? 'Procesando...'
              : 'Perfil ya generado'
            : 'Generar mi perfil vocacional'}
        </Button>
      </div>
    </div>
  );
}
