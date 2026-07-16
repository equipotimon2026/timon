'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@/i18n/routing';

type Phase = 'checking' | 'success' | 'underpaid' | 'timeout';

const POLL_MS = 3000;
const MAX_POLLS = 20; // ~1 minuto

export function PaymentCallbackContent() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('checking');
  const polls = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      polls.current += 1;
      try {
        const res = await fetch('/api/payments/status');
        const data = await res.json();
        if (cancelled) return;
        if (data.hasAccess) {
          setPhase('success');
          setTimeout(() => router.push('/'), 1500);
          return;
        }
        if (data.status === 'UNDERPAID') {
          setPhase('underpaid');
          return;
        }
      } catch {
        // red: seguir intentando
      }
      if (polls.current >= MAX_POLLS) {
        setPhase('timeout');
        return;
      }
      setTimeout(poll, POLL_MS);
    }

    poll();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      {phase === 'checking' && (
        <>
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <h2 className="text-lg font-bold">Verificando tu pago…</h2>
          <p className="mt-1 text-sm text-muted-foreground">Esto puede tardar unos segundos.</p>
        </>
      )}
      {phase === 'success' && (
        <>
          <span className="mb-3 text-[44px]">🎉</span>
          <h2 className="text-lg font-bold">¡Pago confirmado!</h2>
          <p className="mt-1 text-sm text-muted-foreground">Desbloqueamos todos tus módulos. Redirigiendo…</p>
        </>
      )}
      {phase === 'underpaid' && (
        <>
          <span className="mb-3 text-[44px]">⚠️</span>
          <h2 className="text-lg font-bold">La transferencia llegó incompleta</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Recibimos un monto menor al del pago. Escribinos y lo resolvemos a la brevedad.
          </p>
        </>
      )}
      {phase === 'timeout' && (
        <>
          <span className="mb-3 text-[44px]">⏳</span>
          <h2 className="text-lg font-bold">Todavía no vimos tu transferencia</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Puede demorar unos minutos. Cuando se acredite, tus módulos se desbloquean
            automáticamente. Podés volver al inicio.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 rounded-xl bg-[#4361EE] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Volver al inicio
          </button>
        </>
      )}
    </div>
  );
}
