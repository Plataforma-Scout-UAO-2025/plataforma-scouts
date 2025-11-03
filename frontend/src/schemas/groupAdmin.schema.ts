import { z } from "zod";

// Helpers para validación de fechas
const isOver18 = (dateString: string): boolean => {
  const birthDate = new Date(dateString);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
};

const isNotFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
};

const calculateAge = (dateString: string): number => {
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const emergencyContactSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  relationship: z.string().min(1, "La relación es requerida"),
  phone: z.string().min(7, "El teléfono debe tener al menos 7 caracteres"),
});

export const createGroupAdminSchema = z.object({
  // Datos de usuario Auth0
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
  confirmPassword: z.string().min(1, "Debe confirmar la contraseña"),
  username: z.string().min(3, "El username debe tener al menos 3 caracteres")
    .max(50, "El username no puede exceder 50 caracteres"),
  
  // Datos del miembro
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  age: z.number()
    .min(18, "Debe ser mayor de 18 años")
    .max(100, "La edad no puede ser mayor a 100 años"),
  role: z.string().min(1, "El rol es requerido"),
  identification: z.string().min(1, "La identificación es requerida"),
  documentType: z.enum(["CC", "TI", "CE", "PASSPORT", "RC"]),
  memberEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  gender: z.string().min(1, "El género es requerido"),
  birthDate: z.string()
    .min(1, "La fecha de nacimiento es requerida")
    .refine(isNotFutureDate, "La fecha de nacimiento no puede ser futura")
    .refine(isOver18, "Debe ser mayor de 18 años"),
  address: z.string().optional(),
  phone: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  hobbies: z.string().optional(),
  sports: z.string().optional(),
  instruments: z.string().optional(),
  relationship: z.string().optional(),
  acceptanceDate: z.string().optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  acceptTreatment: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type CreateGroupAdminFormData = z.infer<typeof createGroupAdminSchema>;

// Export helpers para usar en el componente
export { calculateAge, isOver18, isNotFutureDate };
