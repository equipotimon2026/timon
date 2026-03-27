'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { LogIn, Mail, Lock, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

type Step = 'email' | 'login' | 'create-password';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!data.exists) {
        router.push(`/register?email=${encodeURIComponent(email)}`);
        return;
      }

      if (data.firstName) setFirstName(data.firstName);

      if (data.hasPassword) {
        setStep('login');
      } else {
        setStep('create-password');
      }
    } catch {
      setError('Error al verificar el email');
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Contraseña incorrecta');
        setIsLoading(false);
        return;
      }

      window.location.href = '/es';
    } catch {
      setError('Error al iniciar sesion');
      setIsLoading(false);
    }
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/create-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear la contraseña');
        setIsLoading(false);
        return;
      }

      // Auto-login after creating password
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        setError('Contraseña creada, pero hubo un error al iniciar sesión. Intenta de nuevo.');
        setStep('login');
        setIsLoading(false);
        return;
      }

      window.location.href = '/es';
    } catch {
      setError('Error al crear la contraseña');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 animate-scale-in">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          {step === 'create-password'
            ? 'Crear contraseña'
            : t('login.title', { defaultValue: 'Iniciar sesion' })}
        </h1>
        {step !== 'email' && firstName && (
          <p className="text-sm text-muted-foreground">
            Hola, {firstName}
          </p>
        )}
      </div>

      {/* Step: Email */}
      {step === 'email' && (
        <form onSubmit={handleCheckEmail} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              {t('login.email', { defaultValue: 'Correo electronico' })}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 animate-scale-in">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Continuar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Step: Login (user has password) */}
      {step === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              {t('login.email', { defaultValue: 'Correo electronico' })}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                disabled
                className="block w-full rounded-xl border border-input bg-muted py-2.5 pl-10 pr-8 text-sm text-muted-foreground shadow-sm"
              />
              <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                {t('login.password', { defaultValue: 'Contraseña' })}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                {t('login.forgotPassword', { defaultValue: '¿Olvidaste tu contraseña?' })}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type="password"
                autoComplete="off"
                autoFocus
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative z-10 block w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 animate-scale-in">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {t('login.submit', { defaultValue: 'Ingresar' })}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Usar otro email
          </button>
        </form>
      )}

      {/* Step: Create password (legacy user) */}
      {step === 'create-password' && (
        <form onSubmit={handleCreatePassword} className="space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-sm text-foreground">
              Encontramos tu cuenta. Como es tu primer inicio de sesion, necesitas crear una contraseña.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              {t('login.email', { defaultValue: 'Correo electronico' })}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                disabled
                className="block w-full rounded-xl border border-input bg-muted py-2.5 pl-10 pr-8 text-sm text-muted-foreground shadow-sm"
              />
              <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block text-sm font-medium text-foreground">
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                autoFocus
                placeholder="Minimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Repetir contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 animate-scale-in">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Crear contraseña e ingresar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Usar otro email
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-muted-foreground">
        {t('login.noAccount', { defaultValue: 'No tenes cuenta?' })}{' '}
        <Link
          href="/register"
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {t('login.register', { defaultValue: 'Registrate' })}
        </Link>
      </p>
    </div>
  );
}
