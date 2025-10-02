import type { ZodType } from "zod";

export const validateClient = <T>(schema: ZodType<T>, payload: unknown) => {
  const result = schema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Datos inválidos";
    return { success: false, error: message };
  }

  return { success: true, data: result.data as T };
};