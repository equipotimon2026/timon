'use client';

import { Clock } from 'lucide-react';

/**
 * Pantalla que se muestra cuando la generacion del perfil termino (o fallo) pero
 * el resultado todavia no esta disponible para el usuario. Nunca expone errores:
 * cualquier fallo del agente se comunica como "alta demanda".
 */
export function PendingResultsScreen() {
  return (
    <div className="mx-auto max-w-md py-24 text-center animate-fade-up">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Clock className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">
        Estamos preparando tus resultados
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Por la alta demanda, tus resultados estarán disponibles dentro de las
        próximas 12 horas. Te avisaremos cuando estén listos.
      </p>
    </div>
  );
}
