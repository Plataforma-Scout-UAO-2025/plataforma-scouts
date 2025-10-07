import { z } from "zod";

export const CreatePagoFormSchema = z.object({
  paid_at: z.string().min(1, { message: "La fecha de pago es requerida" }),
  method: z.enum(["PSE", "Efectivo", "Tarjeta de Debito", "Tarjeta de Credito", "Otro"]),
  reference: z.string().optional(),
});

export type CreatePagoFormValues = z.infer<typeof CreatePagoFormSchema>;
