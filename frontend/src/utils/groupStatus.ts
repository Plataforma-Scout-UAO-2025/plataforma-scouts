import type { GroupResponseDTO } from "@/types/group.type";

/**
 * Tipo que maneja la compatibilidad entre diferentes formatos del backend
 */
type BackendCompatGroup = GroupResponseDTO & Record<string, unknown> & {
  // Snake case del backend (campos adicionales)
  group_id?: number;
  identifier_number?: string;
  founded_in?: string;
  logo_object_url?: string;
  scarf_object_id?: string;
  social_links?: Record<string, unknown>;
  is_active?: boolean | string | number;
};

/**
 * Evalúa si un grupo está activo basándose en múltiples fuentes de datos
 * Prioriza 'status' del backend sobre 'isActive' para mayor precisión
 */
export function isGroupActive(group: BackendCompatGroup): boolean {
  // Priorizar la propiedad 'status' que viene del backend
  if (group.status) {
    return group.status.toUpperCase() === "ACTIVE";
  }
  
  // Acceso directo al objeto para evitar problemas de tipos
  const groupData = group as Record<string, unknown>;
  
  // Fallback a isActive boolean
  const isActiveValue = groupData.isActive;
  if (typeof isActiveValue === "boolean") {
    return isActiveValue;
  }
  
  // Fallback para otros formatos de isActive
  if (typeof isActiveValue === "string") {
    return isActiveValue.toUpperCase() === "ACTIVE" || isActiveValue.toLowerCase() === "true";
  }
  if (typeof isActiveValue === "number") {
    return isActiveValue === 1;
  }
  
  // Fallback adicional para is_active (snake_case del backend)
  const isActiveSnake = groupData.is_active;
  if (isActiveSnake !== undefined) {
    if (typeof isActiveSnake === "string") {
      return isActiveSnake.toUpperCase() === "ACTIVE";
    }
    return Boolean(isActiveSnake);
  }
  
  return Boolean(isActiveValue);
}

/**
 * Obtiene el texto del estado del grupo
 */
export function getGroupStatusText(group: BackendCompatGroup): string {
  return isGroupActive(group) ? "Activo" : "Inactivo";
}

/**
 * Obtiene las clases CSS para el badge del estado
 */
export function getGroupStatusClasses(group: BackendCompatGroup): string {
  return isGroupActive(group) 
    ? 'bg-green-100 text-green-800 border-green-300' 
    : 'bg-red-100 text-red-800 border-red-300';
}

/**
 * Filtra grupos activos de una lista
 */
export function filterActiveGroups(groups: GroupResponseDTO[]): GroupResponseDTO[] {
  return groups.filter(group => isGroupActive(group as BackendCompatGroup));
}

/**
 * Filtra grupos inactivos de una lista
 */
export function filterInactiveGroups(groups: GroupResponseDTO[]): GroupResponseDTO[] {
  return groups.filter(group => !isGroupActive(group as BackendCompatGroup));
}