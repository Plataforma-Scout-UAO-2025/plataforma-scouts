import type { Subgroup } from './subgroup-simple.type';

export type Section = {
  // ID principal (según backend)
  sectionId: number | string;
  // Compatibilidad hacia atrás - siempre igual a sectionId
  id: number;
  // Relaciones
  tenantId: string;
  groupId: number;
  // Contenido obligatorio
  name: string;
  // Contenido opcional
  description?: string | null;
  // Medios
  iconObjectId?: string | null;
  photoPrincipal?: string | null;
  galleryObjectIds?: string[];
  // Auditoría
  createdAt: string;
  updatedAt: string;
  // Relaciones
  subgroups?: Subgroup[];
  // Campos adicionales recomendados para futura extensibilidad
  isActive?: boolean;
  order?: number;
  branchType?: 'MANADA' | 'TROPA' | 'COMUNIDAD' | 'CLAN';
  ageRange?: string;
  maxMembers?: number;
};