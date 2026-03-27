import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Minimo 2 caracteres'),
    lastName: z.string().min(2, 'Minimo 2 caracteres'),
    email: z.string().email('Email invalido'),
    password: z.string().min(6, 'Minimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Minimo 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalido'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
