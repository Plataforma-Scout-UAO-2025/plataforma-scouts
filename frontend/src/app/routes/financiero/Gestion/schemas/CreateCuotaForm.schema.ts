import { z } from "zod";
import { differenceInDays } from "date-fns";

export const createCuotaFormSchema = (isEditMode = false) => z.object({
    name: z.string().min(1, { message: "El nombre es requerido" }),
    description: z.string().min(1, { message: "La descripción es requerida" }),
    amount: z.number().min(0, { message: "El monto debe ser mayor a 0" }),
    periodicity: z.enum(["SINGLE", "MONTH", "QUARTER", "YEAR"] as const),
    scope: z.enum(["ALL", "SCOUT", "SUBGROUP", "SECTION"] as const),
    start_date: z.date({ message: "La fecha de inicio es requerida" }),
    end_date: z.date().optional(),
    associated_to: isEditMode
        ? z.object({
            id: z.string(),
            name: z.string(),
        }).nullable()
        : z.object({
            id: z.string().min(1, { message: "El ID es requerido" }),
            name: z.string().min(1, { message: "El nombre es requerido" }),
        }).nullable(),
}).refine((data) => {
    // Validar que la fecha final no sea menor que la fecha de inicio (solo si end_date existe)
    if (data.end_date && data.start_date) {
        return data.end_date >= data.start_date;
    }
    return true;
}, {
    message: "La fecha de fin no puede ser anterior a la fecha de inicio",
    path: ["end_date"]
}).refine((data) => {
    // Validar periodicidad trimestral: mínimo 90 días (solo si end_date existe)
    if (data.periodicity === "QUARTER" && data.start_date && data.end_date) {
        const daysDifference = differenceInDays(data.end_date, data.start_date);
        return daysDifference >= 90;
    }
    return true;
}, {
    message: "Para periodicidad trimestral, el período debe ser de al menos 90 días",
    path: ["end_date"]
}).refine((data) => {
    // Validar periodicidad anual: mínimo 365 días (solo si end_date existe)
    if (data.periodicity === "YEAR" && data.start_date && data.end_date) {
        const daysDifference = differenceInDays(data.end_date, data.start_date);
        return daysDifference >= 365;
    }
    return true;
}, {
    message: "Para periodicidad anual, el período debe ser de al menos 365 días",
    path: ["end_date"]
}).refine((data) => {
    // Validar que end_date sea requerido cuando periodicity no es SINGLE
    if (data.periodicity !== "SINGLE") {
        return data.end_date !== undefined;
    }
    return true;
}, {
    message: "La fecha de fin es requerida para periodicidades que no sean única",
    path: ["end_date"]
}).refine((data) => {
    // Validar que associated_to sea obligatorio cuando el scope requiere selección específica
    // Solo aplicar esta validación en modo creación, no en edición
    if (!isEditMode && (data.scope === "SCOUT" || data.scope === "SUBGROUP" || data.scope === "SECTION")) {
        return data.associated_to !== null && data.associated_to.id !== "" && data.associated_to.name !== "";
    }
    return true;
}, {
    message: "Debe seleccionar un asociado para este alcance",
    path: ["associated_to"]
});

export type CreateCuotaFormValues = z.infer<ReturnType<typeof createCuotaFormSchema>>;