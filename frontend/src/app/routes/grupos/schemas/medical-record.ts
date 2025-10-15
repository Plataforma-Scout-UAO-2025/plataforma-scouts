import { z } from 'zod';
import { medicalFormSchema } from '../medical-info/schemas/CreateMedicalInfoForm.schema';

export const medicalRecordSchema = medicalFormSchema.extend({
  id: z.number(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  member_name: z.string(),
});

export type MedicalRecord = z.infer<typeof medicalRecordSchema>;