import { z } from "zod";

export const updateGroupSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del grupo es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  
  district: z
    .string()
    .max(100, "El distrito no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),
  
  address: z
    .string()
    .max(255, "La dirección no puede exceder 255 caracteres")
    .optional()
    .or(z.literal("")),
  
  phone: z
    .string()
    .regex(/^[\d\s\+\-\(\)]+$/, "Formato de teléfono inválido")
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .optional()
    .or(z.literal("")),
  
  email: z
    .string()
    .email("Formato de email inválido")
    .max(255, "El email no puede exceder 255 caracteres")
    .optional()
    .or(z.literal("")),
  
  founded_in: z
    .string()
    .optional()
    .or(z.literal("")),
  
  motto: z
    .string()
    .max(255, "El lema no puede exceder 255 caracteres")
    .optional()
    .or(z.literal("")),
  
  mission: z
    .string()
    .max(2048, "La misión no puede exceder 2048 caracteres")
    .optional()
    .or(z.literal("")),
  
  vision: z
    .string()
    .max(2048, "La visión no puede exceder 2048 caracteres")
    .optional()
    .or(z.literal("")),
  
  history: z
    .string()
    .max(4096, "La historia no puede exceder 4096 caracteres")
    .optional()
    .or(z.literal("")),
  
  logo: z
    .string()
    .optional()
    .or(z.literal("")),
  
  scarf: z
    .string()
    .optional()
    .or(z.literal("")),
  
  social_links: z
    .record(z.string(), z.string())
    .optional(),
});

export type UpdateGroupFormData = z.infer<typeof updateGroupSchema>;