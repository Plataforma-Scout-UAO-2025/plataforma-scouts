import { z } from "zod";
import { DOCUMENT_TYPES } from "@/types/guardian.type";

export const completeDataSchema = z.object({
  identification: z
    .string()
    .min(6, "La identificación debe tener al menos 6 dígitos")
    .max(10, "La identificación debe tener máximo 10 dígitos")
    .regex(/^\d+$/, "La identificación solo puede contener números"),
  
  documentType: z
    .enum(DOCUMENT_TYPES, {
      message: "Seleccione un tipo de documento válido",
    }),
  
  phone: z
    .string()
    .length(10, "El teléfono debe tener exactamente 10 dígitos")
    .regex(/^3\d{9}$/, "El teléfono debe iniciar con 3 y tener 10 dígitos"),
  
  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(100, "La dirección debe tener máximo 100 caracteres"),
  
  gender: z
    .enum(["MALE", "FEMALE", "OTHER"], {
      message: "Seleccione un género válido",
    }),
  
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 100;
    }, "Debe ser mayor de 18 años"),
  
  age: z
    .number()
    .min(18, "Debe ser mayor de 18 años")
    .max(100, "Edad máxima 100 años")
    .optional(),
});

export type CompleteDataFormData = z.infer<typeof completeDataSchema>;