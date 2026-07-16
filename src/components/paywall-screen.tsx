'use client';

import { useCallback, useEffect, useState } from 'react';
import { Lock, Copy, Check, Users, AlertTriangle } from 'lucide-react';

interface Quote {
  hasAccess: boolean;
  baseAmount: number;
  amount: number;
  discountPct: number;
  myCode: string;
  myGroupSize: number;
  usedCode: string | null;
  usedGroupSize: number;
  groupSizeThreshold: number;
  discountPctConfig: number;
  pendingPayment: { paymentUrl: string; amount: number; expiresAt: string | null } | null;
  lastPaymentStatus: string | null;
}

const fmtARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export function PaywallScreen({ onUnlocked }: { onUnlocked?: () => void }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchQuote = useCallback(async () => {
    try {
      const res = await fetch('/api/payments/quote');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Quote = await res.json();
      setQuote(data);
      if (data.hasAccess) onUnlocked?.();
    } catch {
      setError('No pudimos cargar el precio. Recargá la página.');
    } finally {
      setLoading(false);
    }
  }, [onUnlocked]);

  useEffect(() => { fetchQuote(); }, [fetchQuote]);

  async function handlePay() {
    setPaying(true);
    setError(null);
    try {
      const res = await fetch('/api/payments', { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Error generando el pago');
      window.location.href = body.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando el pago');
      setPaying(false);
    }
  }

  async function handleUseCode() {
    setCodeError(null);
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    try {
      const res = await fetch('/api/referrals/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCodeError(body.error || 'Código inválido');
        return;
      }
      setCodeInput('');
      fetchQuote(); // refresca precio y progreso del grupo
    } catch {
      setCodeError('Error de red. Reintentá.');
    }
  }

  function handleCopy() {
    if (!quote) return;
    navigator.clipboard.writeText(quote.myCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!quote) {
    return <div className="p-8 text-center text-sm text-red-600">{error}</div>;
  }

  const hasDiscount = quote.discountPct > 0;
  // Progreso del grupo relevante: el del código usado si existe, si no el propio
  const groupSize = quote.usedCode ? quote.usedGroupSize : quote.myGroupSize;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF]">
          <Lock className="h-6 w-6" style={{ color: '#4361EE' }} />
        </div>
        <h2 className="text-xl font-bold mb-1">Desbloqueá tu análisis completo</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Los primeros 3 módulos son gratis. Con un único pago accedés a los 10
          módulos restantes y a tu análisis vocacional completo.
        </p>

        {/* Precio */}
        <div className="mb-6">
          {hasDiscount && (
            <p className="text-sm text-muted-foreground line-through">{fmtARS(quote.baseAmount)}</p>
          )}
          <p className="text-3xl font-bold">
            {fmtARS(quote.amount)}
            {hasDiscount && (
              <span className="ml-2 align-middle rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                -{quote.discountPct}% grupo de amigos
              </span>
            )}
          </p>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {quote.lastPaymentStatus === 'UNDERPAID' ? (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Tu transferencia llegó incompleta
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                Recibimos un monto menor al del pago. Escribinos y lo resolvemos a la
                brevedad — no generes un pago nuevo.
              </p>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full rounded-xl bg-[#4361EE] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3651d4] disabled:opacity-60"
            >
              {paying ? 'Generando pago…' : 'Pagar por transferencia'}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Te redirigimos a Talo para completar la transferencia bancaria.
            </p>
          </>
        )}

        {/* Referidos */}
        <div className="mt-8 border-t pt-6">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" style={{ color: '#4361EE' }} />
            <p className="text-sm font-semibold">
              Juntá {quote.groupSizeThreshold} amigos y paguen {quote.discountPctConfig}% menos
            </p>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Compartí tu código. Cuando tu grupo llegue a {quote.groupSizeThreshold} personas,
            todos los que no hayan pagado obtienen {quote.discountPctConfig}% de descuento.
          </p>
          <div className="mb-4 flex items-center gap-2">
            <code className="flex-1 rounded-lg border bg-gray-50 px-3 py-2 text-center text-base font-bold tracking-[0.2em]">
              {quote.myCode}
            </code>
            <button
              onClick={handleCopy}
              className="rounded-lg border p-2.5 hover:bg-gray-50"
              aria-label="Copiar código"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            Tu grupo: <span className="font-semibold">{groupSize}/{quote.groupSizeThreshold}</span>
            {hasDiscount && ' — ¡descuento activado!'}
          </p>

          {quote.usedCode ? (
            <p className="text-xs text-muted-foreground">
              Usaste el código <span className="font-mono font-semibold">{quote.usedCode}</span>.
            </p>
          ) : (
            <div>
              <p className="mb-1.5 text-xs font-medium">¿Te pasaron un código?</p>
              <div className="flex gap-2">
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="CÓDIGO"
                  maxLength={6}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm uppercase tracking-widest"
                />
                <button
                  onClick={handleUseCode}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                >
                  Aplicar
                </button>
              </div>
              {codeError && <p className="mt-1.5 text-xs text-red-600">{codeError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
