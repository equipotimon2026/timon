import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(2, 'Minimo 2 caracteres'),
  lastName: z.string().min(2, 'Minimo 2 caracteres'),
  age: z.number().min(14, 'Edad minima 14').max(99, 'Edad maxima 99'),
  email: z.string().email('Email invalido'),
  phoneNumber: z.string().min(6, 'Telefono invalido'),
  school: z.string().min(2, 'Escuela requerida'),
  schoolYear: z.enum(['4to', '5to', '6to', 'egresado', 'otro'], {
    error: 'Selecciona un ano',
  }),
});

export type ProfileInput = z.infer<typeof profileSchema>;
