import { z } from 'zod';


export const GalleryItemSchema = z.object({
  id: z.string().uuid().optional(),
  objectId: z.string().uuid().optional(),
  url: z.string().url().optional(),
});

export const GalleryItemsSchema = z.array(GalleryItemSchema);

export type GalleryItemZ = z.infer<typeof GalleryItemSchema>;
export type GalleryItemsZ = z.infer<typeof GalleryItemsSchema>;

export default GalleryItemSchema;
