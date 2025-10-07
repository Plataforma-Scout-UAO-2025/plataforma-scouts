import { z } from 'zod';

// Helper: normalize legacy input keys (Spanish) to canonical English keys used by the frontend types.
const normalizeBranchInput = (val: unknown) => {
  if (!val || typeof val !== 'object') return val;
  const o = val as Record<string, unknown>;
  return {
    // prefer canonical keys, fallback to legacy aliases
    name: o.name ?? o.nombre,
    description: o.description ?? o.descripcion,
    minAge: o.minAge ?? o.edadMinima ?? o.edad_minima,
    maxAge: o.maxAge ?? o.edadMaxima ?? o.edad_maxima,
    year: o.year ?? o.año ?? o['año'] ?? o.year ?? undefined,
    // Files may come from form, accept either key
    iconFile: o.iconFile ?? o.iconoFile ?? o.icono,
    galleryFiles: o.galleryFiles ?? o.galleryFiles ?? o.gallery ?? o.files,
  };
};

const normalizeSubgroupInput = (val: unknown) => {
  if (!val || typeof val !== 'object') return val;
  const o = val as Record<string, unknown>;
  return {
    name: o.name ?? o.nombre,
    description: o.description ?? o.descripcion,
    branchId: o.branchId ?? o.ramaId ?? o.section_id ?? o.sectionId,
    leader: o.leader ?? o.lider,
    galleryFiles: o.galleryFiles ?? o.galleryFiles ?? o.files,
  };
};

export const createRamaSchema = z.preprocess(normalizeBranchInput, z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede exceder 50 caracteres'),
  description: z.string().optional(),
  minAge: z.number().min(0, 'La edad mínima debe ser mayor o igual a 0').max(30, 'La edad mínima no puede ser mayor a 30'),
  maxAge: z.number().min(0, 'La edad máxima debe ser mayor o igual a 0').max(30, 'La edad máxima no puede ser mayor a 30'),
  year: z.number().min(2020, 'El año debe ser mayor o igual a 2020').max(2030, 'El año no puede ser mayor a 2030'),
  iconFile: z.unknown().optional(),
  galleryFiles: z.unknown().optional(),
})).refine((data: Record<string, unknown>) => {
  const maxAge = data['maxAge'] as number | undefined;
  const minAge = data['minAge'] as number | undefined;
  if (typeof maxAge !== 'number' || typeof minAge !== 'number') return false;
  return maxAge >= minAge;
}, {
  message: 'La edad máxima debe ser mayor o igual a la edad mínima',
  path: ['maxAge'],
});

export const updateRamaSchema = z.preprocess(normalizeBranchInput, z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede exceder 50 caracteres').optional(),
  description: z.string().optional(),
  minAge: z.number().min(0, 'La edad mínima debe ser mayor o igual a 0').max(30, 'La edad mínima no puede ser mayor a 30').optional(),
  maxAge: z.number().min(0, 'La edad máxima debe ser mayor o igual a 0').max(30, 'La edad máxima no puede ser mayor a 30').optional(),
  // status is provided in legacy Spanish 'estado' or frontend 'status'
  status: z.union([z.literal('active'), z.literal('inactive'), z.literal('activa'), z.literal('inactiva')]).optional(),
  iconFile: z.unknown().optional(),
  galleryFiles: z.unknown().optional(),
}));

export const createSubramaSchema = z.preprocess(normalizeSubgroupInput, z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede exceder 50 caracteres'),
  description: z.string().optional(),
  branchId: z.string().min(1, 'La rama es requerida'),
  leader: z.string().optional(),
  galleryFiles: z.unknown().optional(),
}));

export const updateSubramaSchema = z.preprocess(normalizeSubgroupInput, z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede exceder 50 caracteres').optional(),
  description: z.string().optional(),
  leader: z.string().optional(),
  status: z.union([z.literal('active'), z.literal('inactive'), z.literal('activa'), z.literal('inactiva')]).optional(),
  galleryFiles: z.unknown().optional(),
}));

export type CreateRamaFormData = z.infer<typeof createRamaSchema>;
export type UpdateRamaFormData = z.infer<typeof updateRamaSchema>;
export type CreateSubramaFormData = z.infer<typeof createSubramaSchema>;
export type UpdateSubramaFormData = z.infer<typeof updateSubramaSchema>;