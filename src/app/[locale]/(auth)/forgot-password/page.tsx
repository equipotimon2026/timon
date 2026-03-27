'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/lib/validations/auth';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          origin: window.location.origin,
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error || 'Error al enviar el email');
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Error de conexion');
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="space-y-6 text-center animate-fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 animate-check-pop">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            {t('forgotPassword.successTitle', {
              defaultValue: 'Email enviado',
            })}
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t('forgotPassword.successMessage', {
              defaultValue:
                'Si el email existe en nuestro sistema, vas a recibir un link para restablecer tu contraseña.',
            })}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('forgotPassword.backToLogin', {
              defaultValue: 'Volver a iniciar sesion',
            })}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 animate-scale-in">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          {t('forgotPassword.title', {
            defaultValue: 'Recupera tu acceso',
          })}
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
          {t('forgotPassword.description', {
            defaultValue:
              'Ingresa tu email y te enviaremos un link para restablecer tu contraseña.',
          })}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground"
          >
            {t('forgotPassword.email', { defaultValue: 'Email' })}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              {...register('email')}
              className="block w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 animate-scale-in">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:shadow-none"
        >
          {isSubmitting
            ? t('forgotPassword.submitting', { defaultValue: 'Enviando...' })
            : t('forgotPassword.submit', { defaultValue: 'Enviar link de recuperacion' })}
          {!isSubmitting && (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
      </form>

      {/* Back link */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('forgotPassword.backToLogin', {
            defaultValue: 'Volver a iniciar sesion',
          })}
        </Link>
      </div>
    </div>
  );
}
