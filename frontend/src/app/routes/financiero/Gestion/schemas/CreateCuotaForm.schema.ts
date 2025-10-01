import { z } from "zod";

export const CreateCuotaFormSchema = z.object({
    name: z.string().min(1, { message: "El nombre es requerido" }),
    description: z.string().min(1, { message: "La descripción es requerida" }),
    amount: z.number().min(0, { message: "El monto debe ser mayor a 0" }),
    periodicity: z.enum(["SINGLE", "MONTH", "QUARTER", "YEAR"] as const),
    scope: z.enum(["ALL", "SCOUT", "SUBGROUP", "SECTION"] as const),
    start_date: z.date({ message: "La fecha de inicio es requerida" }),
    end_date: z.date().optional(),
    target_member_id: z.number().optional(),
});

export type CreateCuotaFormValues = z.infer<typeof CreateCuotaFormSchema>;