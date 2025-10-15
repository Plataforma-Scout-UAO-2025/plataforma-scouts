import { z } from 'zod';

export const SubgroupSchema = z.object({
  subgroupId: z.number().int().optional(),
  tenantId: z.string().optional(),
  groupId: z.number().optional(),
  sectionId: z.number().optional(),
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  photoPrincipal: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const SectionSchema = z.object({
  sectionId: z.number().int().optional(),
  tenantId: z.string().optional(),
  groupId: z.number().optional(),
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  iconObjectId: z.string().nullable().optional(),
  photoPrincipal: z.string().nullable().optional(),
  galleryObjectIds: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  // nested subgroups when using with-subgroups endpoint
  subgroups: z.array(SubgroupSchema).optional(),
});

export type SectionZ = z.infer<typeof SectionSchema>;
export type SubgroupZ = z.infer<typeof SubgroupSchema>;
