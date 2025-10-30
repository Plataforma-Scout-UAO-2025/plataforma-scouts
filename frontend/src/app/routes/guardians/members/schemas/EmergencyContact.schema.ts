import { z } from 'zod';

/**
 * Schema de validación para contactos de emergencia
 * 
 * Valida:
 * - Nombre completo requerido
 * - Relación con el scout (parentesco)
 * - Teléfono (opcional, pero si se ingresa debe ser válido)
 */
export const emergencyContactSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'El nombre completo es requerido'),
  relationship: z.enum(['Padre', 'Madre', 'Tutor', 'Abuelo/a', 'Tío/a', 'Hermano/a', 'Otro'], {
    message: 'La relación es requerida'
  }),
  phone: z.string()
    .min(1, 'El teléfono es requerido')
    .refine((value) => {
      if (!value || value.trim() === '') return true;
      const cleanValue = value.replace(/\s/g, '').replace(/\+57/g, '');
      return /^\d{10}$/.test(cleanValue);
    }, {
      message: 'El teléfono debe tener 10 dígitos (puede incluir +57 opcional)'
    })
});

export type EmergencyContactData = z.infer<typeof emergencyContactSchema>;