'use client';

import { useState, useEffect, useRef } from 'react';

const MESSAGES = [
  'Analizando tu perfil de personalidad...',
  'Evaluando tus intereses vocacionales...',
  'Procesando tu dominancia cerebral...',
  'Mapeando tus inteligencias múltiples...',
  'Interpretando tus proyecciones...',
  'Integrando todos tus resultados...',
  'Generando recomendaciones de carrera...',
];

const TOTAL_DURATION = 180;
const MESSAGE_INTERVAL = TOTAL_DURATION / MESSAGES.length;

export function LoadingScreen() {
  const [elapsed, setElapsed] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = (Date.now() - startRef.current) / 1000;
      setElapsed(seconds);

      const newIndex = Math.min(
        Math.floor(seconds / MESSAGE_INTERVAL),
        MESSAGES.length - 1
      );
      setMessageIndex(newIndex);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min((elapsed / TOTAL_DURATION) * 100, 99);
  const currentMessage =
    elapsed > TOTAL_DURATION + 30
      ? 'Esto puede tomar un momento más...'
      : MESSAGES[messageIndex];

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center animate-fade-up">
      <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
      </div>

      <p
        key={messageIndex}
        className="mb-8 text-lg font-medium text-foreground animate-fade-up"
      >
        {currentMessage}
      </p>

      <p className="mt-8 text-xs text-muted-foreground/60">
        Nuestro agente de IA está procesando tus respuestas. Esto suele tomar entre 2 y 4 minutos.
      </p>
    </div>
  );
}
