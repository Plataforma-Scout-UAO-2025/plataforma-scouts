import { z } from "zod";

export const CreatePagoFormSchema = z.object({
  concepto: z.string().min(1, { message: "El concepto es requerido" }),
  monto: z.string().min(1, { message: "El monto es requerido" }),
  fechaPago: z.string().min(1, { message: "La fecha de pago es requerida" }),
  estado: z.enum(["Pagado", "Pendiente", "Cancelado"]),
  medioPago: z.enum(["PSE", "Efectivo", "Tarjeta de Debito", "Tarjeta de Credito", "Otro"]),
  cuotaId: z.string().min(1, { message: "El ID de cuota es requerido" }),
  scoutId: z.string().min(1, { message: "El ID del scout es requerido" }),
});

export type CreatePagoFormValues = z.infer<typeof CreatePagoFormSchema>;
