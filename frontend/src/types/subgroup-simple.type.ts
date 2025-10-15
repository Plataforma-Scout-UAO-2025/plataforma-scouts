export type Subgroup = {
  // ID principal (según backend)
  subgroupId: number;
  // Compatibilidad hacia atrás - siempre igual a subgroupId
  id: number;
  // Relaciones
  tenantId: string;
  groupId: number;
  sectionId: number | string;
  // Contenido obligatorio
  name: string;
  // Contenido opcional
  description?: string | null;
  // Medios
  photoPrincipal?: string | null; // UUID en request, URL en response
  // Estado
  isActive?: boolean;
  // Auditoría
  createdAt: string;
  updatedAt: string;
};