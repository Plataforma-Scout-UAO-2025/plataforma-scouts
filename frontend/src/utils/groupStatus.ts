import type { GroupResponseDTO } from "@/types/group.type";

/**
 * Evalúa si un grupo está activo basándose en múltiples fuentes de datos
 * Prioriza 'status' del backend sobre 'isActive' para mayor precisión
 */
export function isGroupActive(group: GroupResponseDTO | any): boolean {
  // Priorizar la propiedad 'status' que viene del backend
  if (group.status) {
    return group.status.toUpperCase() === "ACTIVE";
  }
  
  // Fallback a isActive boolean
  if (typeof group.isActive === "boolean") {
    return group.isActive;
  }
  
  // Fallback para otros formatos de isActive
  const value = group.isActive as any;
  if (typeof value === "string") {
    return value === "ACTIVE" || value.toLowerCase() === "true";
  }
  if (typeof value === "number") {
    return value === 1;
  }
  
  // Fallback adicional para is_active (snake_case del backend)
  if (group.is_active !== undefined) {
    if (typeof group.is_active === "string") {
      return group.is_active.toUpperCase() === "ACTIVE";
    }
    return Boolean(group.is_active);
  }
  
  return Boolean(value);
}

/**
 * Obtiene el texto del estado del grupo
 */
export function getGroupStatusText(group: GroupResponseDTO | any): string {
  return isGroupActive(group) ? "Activo" : "Inactivo";
}

/**
 * Obtiene las clases CSS para el badge del estado
 */
export function getGroupStatusClasses(group: GroupResponseDTO | any): string {
  return isGroupActive(group) 
    ? 'bg-green-100 text-green-800 border-green-300' 
    : 'bg-red-100 text-red-800 border-red-300';
}

/**
 * Filtra grupos activos de una lista
 */
export function filterActiveGroups(groups: GroupResponseDTO[]): GroupResponseDTO[] {
  return groups.filter(group => isGroupActive(group));
}

/**
 * Filtra grupos inactivos de una lista
 */
export function filterInactiveGroups(groups: GroupResponseDTO[]): GroupResponseDTO[] {
  return groups.filter(group => !isGroupActive(group));
}