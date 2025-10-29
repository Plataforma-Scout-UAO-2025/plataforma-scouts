import { z } from 'zod';

/**
 * Schema de validación para el formulario de miembros/scouts
 * 
 * Valida:
 * - Información personal (nombres, apellidos, documento, género, fecha nacimiento)
 * - Contacto (email, teléfono en formato colombiano, dirección)
 * - Información scout (rol, fecha aceptación, estado activo)
 * - Información adicional opcional (peso, altura, hobbies, deportes, instrumentos)
 * - Contactos de emergencia (array opcional)
 */
export const memberFormSchema = z.object({
  firstName: z.string().min(1, 'Los nombres son requeridos'),
  lastName: z.string().min(1, 'Los apellidos son requeridos'),
  email: z.string().email('Email inválido'),
  documentType: z.enum(['CC', 'TI', 'RC', 'CE', 'PA', 'PEP', 'PPT', 'NIT', 'NUIP'], {
    message: 'El tipo de documento es requerido'
  }),
  identification: z.string().min(1, 'El número de identificación es requerido'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'El género es requerido'
  }),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'),
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
      const phoneNumber = cleanValue.substring(3);
      if (!/^\d{10}$/.test(phoneNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Después de +57 debe haber exactamente 10 dígitos'
        });
        return;
      }
    }),
  address: z.string().min(1, 'La dirección es requerida'),
  role: z.string().optional(),
  acceptanceDate: z.string().min(1, 'La fecha de aceptación es requerida'),
  isActive: z.boolean(),
  weight: z.string().optional(),
  height: z.string().optional(),
  hobbies: z.string().optional(),
  sports: z.string().optional(),
  instruments: z.string().optional(),  
});

export const editMemberSchema = z.object({
  documentType: z.enum(['CC', 'TI', 'RC', 'CE', 'PA', 'PEP', 'PPT', 'NIT', 'NUIP'], {
    message: 'El tipo de documento es requerido'
  }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),  
});

export type MemberFormData = z.infer<typeof memberFormSchema>;
export type EditMemberFormData = z.infer<typeof editMemberSchema>;