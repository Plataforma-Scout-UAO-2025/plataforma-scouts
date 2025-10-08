import { z } from 'zod';

export const vaccineDetailSchema = z.object({
  name: z.string().min(1, "El nombre de la vacuna es requerido").max(50, "Máximo 50 caracteres"),
  date: z.string().refine((date) => {
    return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/.test(date);
  }, "Fecha inválida"),
});

export const medicationDetailSchema = z.object({
  name: z.string().min(1, "El nombre del medicamento es requerido").max(50, "Máximo 50 caracteres"),
  dose: z.string().min(1, "La dosis es requerida").max(100, "Máximo 100 caracteres"),
  frecuency: z.string().min(1, "La frecuencia es requerida").max(100, "Máximo 100 caracteres"),
});

export const medicalFormSchema = z.object({
  member_id: z.number().min(1, "ID de miembro requerido"),
  blood_type: z.string().min(1, "Tipo de sangre requerido"),
  eps: z.string().min(1, "EPS requerida").max(50, "Máximo 50 caracteres"),
  allergies: z.string().max(1000, "Máximo 1000 caracteres").default(''),
  chronic_diseases: z.string().max(1000, "Máximo 1000 caracteres").default(''),
  physical_restrictions: z.string().max(1000, "Máximo 1000 caracteres").default(''),
  surgical_history: z.string().max(1000, "Máximo 1000 caracteres").default(''),
  vaccines_detail: z.array(vaccineDetailSchema).default([]),
  medications_detail: z.array(medicationDetailSchema).default([]),
});

export type MedicalFormInput = z.infer<typeof medicalFormSchema>;