import { z } from 'zod';

/**
 * Schema de validación para contactos de emergencia
 * 
 * Valida:
 * - Nombre completo requerido
 * - Relación con el scout (parentesco)
 * - Teléfono en formato colombiano (+57 + 10 dígitos)
 */
export const emergencyContactSchema = z.object({
  id: z.number().optional(),
  fullName: z.string().min(1, 'El nombre completo es requerido'),
  relationship: z.enum(['Padre', 'Madre', 'Tutor', 'Abuelo/a', 'Tío/a', 'Hermano/a', 'Otro'], {
    message: 'La relación es requerida'
  }),
  phone: z.string()
    .min(1, 'El teléfono es requerido')
    .superRefine((value, ctx) => {
      // Remover espacios para la validación
      const cleanValue = value.replace(/\s/g, '');
      
      // Verificar si tiene el prefijo +57
      if (!cleanValue.startsWith('+57')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El teléfono debe comenzar con +57'
        });
        return;
      }
      
      // Verificar si después del +57 hay exactamente 10 dígitos
      const phoneNumber = cleanValue.substring(3); // Remover +57
      if (!/^\d{10}$/.test(phoneNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Después de +57 debe haber exactamente 10 dígitos'
        });
        return;
      }
    })
});

export type EmergencyContactData = z.infer<typeof emergencyContactSchema>;
