import { z } from "zod";

export const memberSchema = z.object({
  member_id: z.string().uuid(),
  first_name: z.string().min(1, "El nombre es requerido"),
  last_name: z.string().min(1, "El apellido es requerido"),
  subgroup_id: z.number().int().min(1, "El ID del subgrupo es requerido"),
  subgroup_name: z.string().min(1, "El nombre del subgrupo es requerido"),
  section_id: z.number().int().min(1, "El ID de la sección es requerido"),
  section_name: z.string().min(1, "El nombre de la sección es requerido"),
  age: z.number().int().min(0, "La edad debe ser un número positivo"),
  user_id: z.string().min(1, "El ID del usuario es requerido"),
  tenant_id: z.string().optional(),
  guardian_id: z
    .number()
    .int()
    .min(1, "El ID del tutor debe ser un número positivo")
    .optional(),
  relationship: z.string().optional(),
  role: z
    .enum(["admin_group", "admin_global", "scout"], {
      message: "Rol no válido",
    })
    .optional(),
  status: z.string().optional(),
  isActive: z.boolean().optional(),
  identification: z
    .string()
    .min(1, "La identificación es requerida")
    .optional(),
  document_type: z
    .string()
    .min(1, "El tipo de documento es requerido")
    .optional(),
  email: z.string().email("Email no válido").optional(),
  gender: z.string().min(1, "El género es requerido").optional(),
  birth_day: z.date().optional(),
  address: z.string().min(1, "La dirección es requerida").optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  hobbies: z.string().optional(),
  sports: z.string().optional(),
  instruments: z.string().optional(),
  acceptance_date: z.date().optional(),
  emergency_phone: z
    .array(z.string().min(1, "El teléfono de emergencia es requerido"))
    .optional(),
});

export const updateMemberSchema = z.object({
  first_name: z.string().min(1, "El nombre es requerido").optional(),
  last_name: z.string().min(1, "El apellido es requerido").optional(),
  subgroup_id: z
    .number()
    .int()
    .min(1, "El ID del subgrupo es requerido")
    .optional(),
  subgroup_name: z
    .string()
    .min(1, "El nombre del subgrupo es requerido")
    .optional(),
  section_id: z
    .number()
    .int()
    .min(1, "El ID de la sección es requerido")
    .optional(),
  section_name: z
    .string()
    .min(1, "El nombre de la sección es requerido")
    .optional(),
  age: z
    .number()
    .int()
    .min(0, "La edad debe ser un número positivo")
    .optional(),
  guardian_id: z
    .number()
    .int()
    .min(1, "El ID del tutor debe ser un número positivo")
    .optional(),
  relationship: z.string().optional(),
  role: z
    .enum(["admin_group", "admin_global", "scout"], {
      message: "Rol no válido",
    })
    .optional(),
  status: z.string().optional(),
  isActive: z.boolean().optional(),
  identification: z
    .string()
    .min(1, "La identificación es requerida")
    .optional(),
  document_type: z
    .string()
    .min(1, "El tipo de documento es requerido")
    .optional(),
  email: z.string().email("Email no válido").optional(),
  gender: z.string().min(1, "El género es requerido").optional(),
  birth_day: z.date().optional(),
  address: z.string().min(1, "La dirección es requerida").optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  hobbies: z.string().optional(),
  sports: z.string().optional(),
  instruments: z.string().optional(),
  acceptance_date: z.date().optional(),
  emergency_phone: z
    .array(z.string().min(1, "El teléfono de emergencia es requerido"))
    .optional(),
});

export type Member = z.infer<typeof memberSchema>;
export type UpdateMember = z.infer<typeof updateMemberSchema>;
