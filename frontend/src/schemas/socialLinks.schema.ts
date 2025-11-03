import { z } from "zod";

/**
 * Schema para las redes sociales de un grupo scout.
 * Cada red social es opcional pero debe ser una URL válida si se proporciona.
 */
export const socialLinksSchema = z.object({
    website: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
    facebook: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
    instagram: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
}).partial();

export type SocialLinks = z.infer<typeof socialLinksSchema>;
