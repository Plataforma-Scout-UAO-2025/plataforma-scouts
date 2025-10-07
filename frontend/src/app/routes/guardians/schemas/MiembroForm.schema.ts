import { z } from 'zod';

export const contactoEmergenciaSchema = z.object({
  id: z.number().optional(),
  nombreCompleto: z.string().min(1, 'El nombre completo es requerido'),
  relacion: z.enum(['Padre', 'Madre', 'Tutor', 'Abuelo/a', 'Tío/a', 'Hermano/a', 'Otro'], {
    message: 'La relación es requerida'
  }),
  telefono: z.string()
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

export const miembroFormSchema = z.object({
  firstName: z.string().min(1, 'Los nombres son requeridos'),
  lastName: z.string().min(1, 'Los apellidos son requeridos'),
  email: z.string().email('Email inválido'),
  tipoDocumento: z.enum(['CC', 'TI', 'RC', 'CE', 'PA', 'PEP', 'PPT', 'NIT', 'NUIP'], {
    message: 'El tipo de documento es requerido'
  }),
  identification: z.string().min(1, 'El número de identificación es requerido'),
  genero: z.enum(['Masculino', 'Femenino', 'Otro'], {
    message: 'El género es requerido'
  }),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
  telefono: z.string()
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
    }),
  direccion: z.string().min(1, 'La dirección es requerida'),
  rol: z.string().optional(),
  fechaAceptacion: z.string().min(1, 'La fecha de aceptación es requerida'),
  isActive: z.boolean(),
  peso: z.string().optional(),
  altura: z.string().optional(),
  hobbies: z.string().optional(),
  deportes: z.string().optional(),
  instrumentos: z.string().optional(),
  contactosEmergencia: z.array(contactoEmergenciaSchema)
    .min(1, 'Debe tener al menos un contacto de emergencia')
    .max(5, 'Máximo 5 contactos de emergencia')
});

export type MiembroFormData = z.infer<typeof miembroFormSchema>;
export type ContactoEmergenciaData = z.infer<typeof contactoEmergenciaSchema>;