'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { UserPlus, Mail, Lock, ArrowRight, CheckCircle2, User } from 'lucide-react';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsSubmitting(false);
        return;
      }

      // If user was created and has a session (email confirmation disabled)
      if (signUpData.session) {
        window.location.href = '/es';
        return;
      }

      // If user was created but needs email confirmation
      if (signUpData.user && !signUpData.session) {
        setSuccess(true);
        setIsSubmitting(false);
        return;
      }

      // Fallback: something unexpected
      setError('Ocurrio un error inesperado. Intenta de nuevo.');
      setIsSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexion. Intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center animate-fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 animate-check-pop">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            {t('register.successTitle', { defaultValue: 'Revisa tu email' })}
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t('register.successMessage', {
              defaultValue:
                'Te enviamos un link de confirmacion a tu correo. Hace click en el link para activar tu cuenta.',
            })}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            {t('register.backToLogin', {
              defaultValue: 'Volver a iniciar sesion',
            })}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    'block w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 animate-scale-in">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          {t('register.title', { defaultValue: 'Crear cuenta' })}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
              {t('register.firstName', { defaultValue: 'Nombre' })}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Juan"
                {...register('firstName')}
                className={inputClass}
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
              {t('register.lastName', { defaultValue: 'Apellido' })}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Perez"
                {...register('lastName')}
                className={inputClass}
              />
            </div>
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            {t('register.email', { defaultValue: 'Correo electronico' })}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              {...register('email')}
              className={inputClass}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            {t('register.password', { defaultValue: 'Contraseña' })}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimo 6 caracteres"
              {...register('password')}
              className={inputClass}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
            {t('register.confirmPassword', { defaultValue: 'Confirmar contraseña' })}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeti tu contraseña"
              {...register('confirmPassword')}
              className={inputClass}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
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
            ? t('register.submitting', { defaultValue: 'Creando cuenta...' })
            : t('register.submit', { defaultValue: 'Crear mi cuenta' })}
          {!isSubmitting && (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground">
        {t('register.hasAccount', { defaultValue: 'Ya tenes cuenta?' })}{' '}
        <Link
          href="/login"
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {t('register.login', { defaultValue: 'Inicia sesion' })}
        </Link>
      </p>
    </div>
  );
}
