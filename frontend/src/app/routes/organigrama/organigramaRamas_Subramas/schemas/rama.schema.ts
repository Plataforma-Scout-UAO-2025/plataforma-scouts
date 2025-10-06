import { z } from 'zod';

export const createRamaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede exceder 50 caracteres'),
  descripcion: z.string().optional(),
  edadMinima: z.number().min(0, 'La edad mínima debe ser mayor o igual a 0').max(30, 'La edad mínima no puede ser mayor a 30'),
  edadMaxima: z.number().min(0, 'La edad máxima debe ser mayor o igual a 0').max(30, 'La edad máxima no puede ser mayor a 30'),
  año: z.number().min(2020, 'El año debe ser mayor o igual a 2020').max(2030, 'El año no puede ser mayor a 2030'),
}).refine((data) => data.edadMaxima >= data.edadMinima, {
  message: 'La edad máxima debe ser mayor o igual a la edad mínima',
  path: ['edadMaxima'],
});

export const updateRamaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede exceder 50 caracteres').optional(),
  descripcion: z.string().optional(),
  edadMinima: z.number().min(0, 'La edad mínima debe ser mayor o igual a 0').max(30, 'La edad mínima no puede ser mayor a 30').optional(),
  edadMaxima: z.number().min(0, 'La edad máxima debe ser mayor o igual a 0').max(30, 'La edad máxima no puede ser mayor a 30').optional(),
  estado: z.enum(['activa', 'inactiva']).optional(),
});

export const createSubramaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede exceder 50 caracteres'),
  descripcion: z.string().optional(),
  ramaId: z.string().min(1, 'La rama es requerida'),
  lider: z.string().optional(),
});

export const updateSubramaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede exceder 50 caracteres').optional(),
  descripcion: z.string().optional(),
  lider: z.string().optional(),
  estado: z.enum(['activa', 'inactiva']).optional(),
});

export type CreateRamaFormData = z.infer<typeof createRamaSchema>;
export type UpdateRamaFormData = z.infer<typeof updateRamaSchema>;
export type CreateSubramaFormData = z.infer<typeof createSubramaSchema>;
export type UpdateSubramaFormData = z.infer<typeof updateSubramaSchema>;