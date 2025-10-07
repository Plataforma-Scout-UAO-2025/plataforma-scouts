import { z } from "zod";

export const memberSchema = z.object({
  member_id: z.string().uuid(),
  tenant_id: z.string(),
  subgroup_id: z.string(),
  userId: z.string(),
  first_name: z.string().min(1, "El nombre es requerido"),
  last_name: z.string().min(1, "El apellido es requerido"),
  age: z.number().int().min(0, "La edad debe ser un número positivo"),
  role: z.enum(["standard_user", "auditor", "admin"], {
    message: "Rol no válido",
  }),
  identification: z.string().min(1, "La identificación es requerida"),
  document_type: z.string().min(1, "El tipo de documento es requerido"),
  email: z.string().email("Email no válido"),
  gender: z.string().min(1, "El género es requerido"),
  birth_day: z.date(),
  address: z.string().min(1, "La dirección es requerida"),
  phone: z.string().min(1, "El teléfono es requerido"),
  weight: z.number().positive("El peso debe ser un número positivo"),
  height: z.number().positive("La altura debe ser un número positivo"),
  hobbies: z.string(),
  sports: z.string(),
  instruments: z.string(),
  status: z.string(),
  acceptance_date: z.date(),
  in_charge_of: z.string(),
  emergency_phone: z.string().min(1, "El teléfono de emergencia es requerido"),
  created_at: z.date(),
  updated_at: z.date(),
});

export const updateMemberSchema = z.object({
  first_name: z.string().min(1, "El nombre es requerido").optional(),
  last_name: z.string().min(1, "El apellido es requerido").optional(),
  age: z.number().int().min(0, "La edad debe ser un número positivo").optional(),
  role: z.enum(["standard_user", "auditor", "admin"], {
    message: "Rol no válido",
  }).optional(),
  identification: z.string().min(1, "La identificación es requerida").optional(),
  document_type: z.string().min(1, "El tipo de documento es requerido").optional(),
  email: z.string().email("Email no válido").optional(),
  gender: z.string().min(1, "El género es requerido").optional(),
  birth_day: z.date().optional(),
  address: z.string().min(1, "La dirección es requerida").optional(),
  phone: z.string().min(1, "El teléfono es requerido").optional(),
  weight: z.number().positive("El peso debe ser un número positivo").optional(),
  height: z.number().positive("La altura debe ser un número positivo").optional(),
  hobbies: z.string().optional(),
  sports: z.string().optional(),
  instruments: z.string().optional(),
  status: z.string().optional(),
  acceptance_date: z.date().optional(),
  in_charge_of: z.string().optional(),
  emergency_phone: z.string().min(1, "El teléfono de emergencia es requerido").optional(),
});

export type Member = z.infer<typeof memberSchema>;
export type UpdateMember = z.infer<typeof updateMemberSchema>;     