import { z } from "zod";

export const CreateCuotaFormSchema = z.object({
    nombre: z.string().min(1, { message: "El nombre es requerido" }),
    monto: z.string().min(1, { message: "El monto es requerido" }),
    periodicidad: z.enum(["Mensual", "Trimestral", "Semestral", "Anual"]),
    tipoCuota: z.enum(["Ordinaria", "Extraordinaria"]),
    fechaLimitePago: z.string().min(1, { message: "La fecha límite de pago es requerida" }),
    medioPago: z.enum(["PSE", "Efectivo", "Tarjeta de Debito", "Tarjeta de Credito", "Otro"]),
    aplicaA: z.string().min(1, { message: "El aplica a es requerido" }),
});

export type CreateCuotaFormValues = z.infer<typeof CreateCuotaFormSchema>;