'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SectionCurrent {
  section_id: number;
  code: string;
  name: string;
  order_index: number;
  current_version: number;
  questions: unknown[];
}

export interface SectionStatus {
  section_id: number;
  code: string;
  current_version: number;
  user_version_completed: number | null;
  status: 'completed_current' | 'completed_outdated' | 'missing';
}

export interface SectionsCurrentResult {
  sections: SectionCurrent[];
  loading: boolean;
  error: string | null;
}

export interface SectionsStatusResult {
  sections: SectionStatus[];
  assessment_outdated: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSectionsCurrent(): SectionsCurrentResult {
  const [sections, setSections] = useState<SectionCurrent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/sections/current')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setSections(data.sections ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { sections, loading, error };
}

export function useSectionsStatus(): SectionsStatusResult {
  const [sections, setSections] = useState<SectionStatus[]>([]);
  const [assessmentOutdated, setAssessmentOutdated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/users/me/sections-status')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setSections(data.sections ?? []);
          setAssessmentOutdated(data.assessment_outdated ?? false);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { sections, assessment_outdated: assessmentOutdated, loading, error, refetch };
}
