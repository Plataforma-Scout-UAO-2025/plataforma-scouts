import { z } from "zod";

export const emergencyContactSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .regex(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/, "Solo se permiten letras y espacios"),

  relationship: z
    .string()
    .min(1, "El parentesco es requerido")
    .min(3, "El parentesco debe tener al menos 3 caracteres")
    .regex(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/, "Solo se permiten letras y espacios"),

  phone: z
    .string()
    .min(7, "El teléfono debe tener al menos 7 dígitos")
    .max(10, "El teléfono no puede tener más de 10 dígitos")
    .regex(/^[0-9]+$/, "Solo se permiten números"),
});

export const emergencyContactsSchema = z.object({
  emergency_contacts: z
    .array(emergencyContactSchema)
    .min(1, "Debe haber al menos un contacto de emergencia")
    .refine(
      (contacts) => contacts.every((c) => c.name && c.relationship && c.phone),
      "Todos los contactos deben estar completos"
    ),
});

export const personalDataBaseSchema = z

  .object({
    firstname: z
      .string()
      .min(1, "El nombre es requerido")
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .regex(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/, "Solo se permiten letras y espacios"),

    lastname: z
      .string()
      .min(1, "Los apellidos son requeridos")
      .min(2, "Los apellidos deben tener al menos 2 caracteres")
      .regex(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/, "Solo se permiten letras y espacios"),

    email: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .email("Debe ser un correo válido"),

    confirm_email: z
      .string()
      .min(1, "Debes confirmar el correo electrónico")
      .email("Debe ser un correo válido"),

    username: z
      .string()
      .min(1, "El nombre de usuario es requerido")
      .min(4, "El nombre de usuario debe tener al menos 4 caracteres")
      .max(20, "El nombre de usuario no puede tener más de 20 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guion bajo"),

    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),

    confirm_password: z.string().min(1, "Debes confirmar la contraseña"),

    document_type: z.string().min(1, "Debes seleccionar un tipo de documento"),

    identification: z
      .string()
      .min(1, "El número de documento es requerido")
      .min(6, "El número de documento debe tener al menos 6 dígitos")
      .regex(/^[0-9]+$/, "Solo se permiten números"),

    birth_date: z
      .string()
      .min(1, "La fecha de nacimiento es requerida")
      .refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 0 && age <= 80;
      }, "Debes tener entre 0 y 80 años"),

    gender: z.string().min(1, "Debes seleccionar un género"),

    address: z
      .string()
      .min(1, "La dirección es requerida")
      .min(5, "La dirección debe tener al menos 5 caracteres"),

    phone: z
      .string()
      .min(1, "El teléfono es requerido")
      .min(7, "El teléfono debe tener al menos 7 dígitos")
      .max(10, "El teléfono no puede tener más de 10 dígitos")
      .regex(/^[0-9]+$/, "Solo se permiten números"),

    weight: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
        "El peso debe ser un número positivo"
      ),

    height: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
        "La altura debe ser un número positivo"
      ),
  })

  .refine((data) => data.email === data.confirm_email, {
    message: "Los correos electrónicos no coinciden",
    path: ["confirm_email"],
  })

  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

export const dataConsentSchema = z.object({
  data_treatment_consent: z
    .string()
    .min(1, "Debes seleccionar una opción")
    .refine(
      (value) => value === "accepted",
      "Debes autorizar el tratamiento de datos para continuar"
    ),
});

export const page1Schema = z.intersection(
  personalDataBaseSchema,
  emergencyContactsSchema
);

export const page2Schema = z.intersection(
  z.object({
    hobbies: z
      .string()
      .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo se permiten letras")
      .min(2, "Debe tener al menos 2 caracteres")
      .optional()
      .or(z.literal("")),
    sports: z
      .string()
      .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo se permiten letras")
      .min(2, "Debe tener al menos 2 caracteres")
      .optional()
      .or(z.literal("")),
    instruments: z
      .string()
      .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo se permiten letras")
      .min(2, "Debe tener al menos 2 caracteres")
      .optional()
      .or(z.literal("")),
  }),
  dataConsentSchema
);

export const page3Schema = z.object({
  institution: z
    .string()
    .min(1, "El nombre de la institución es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres"),

  course: z.string().min(1, "El curso/grado es requerido"),

  calendar: z.string().min(1, "El calendario es requerido"),

  shift: z.string().min(1, "La jornada es requerida"),
});

export const fullEnrollmentSchema = z.intersection(
  z.intersection(page1Schema, page2Schema),
  page3Schema
);

export type EmergencyContact = z.infer<typeof emergencyContactSchema>;
export type PersonalDataBase = z.infer<typeof personalDataBaseSchema>;
export type DataConsent = z.infer<typeof dataConsentSchema>;
export type Page1Data = z.infer<typeof page1Schema>;
export type Page2Data = z.infer<typeof page2Schema>;
export type Page3Data = z.infer<typeof page3Schema>;
export type FullEnrollmentData = z.infer<typeof fullEnrollmentSchema>;
