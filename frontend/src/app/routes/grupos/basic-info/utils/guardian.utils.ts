import type { Member } from "@/types/member.type";

/**
 * Extrae el guardian_id de un objeto Member que puede tener diferentes formatos
 * Soporta: guardian_id, guardianId, y guardian.id
 * 
 * @param member - El objeto miembro del cual extraer el guardian_id
 * @returns El guardian_id si existe, undefined en caso contrario
 */
export function getGuardianId(member: Member | null | undefined): number | undefined {
  if (!member) return undefined;

  const guardianId =
    (member as { guardian_id?: number })?.guardian_id ??
    (member as { guardianId?: number })?.guardianId ??
    (member as { guardian?: { id?: number } })?.guardian?.id;

  return guardianId;
}

/**
 * Verifica si un miembro tiene un acudiente asignado
 * 
 * @param member - El objeto miembro a verificar
 * @returns true si el miembro tiene un guardian_id válido
 */
export function hasGuardian(member: Member | null | undefined): boolean {
  const guardianId = getGuardianId(member);
  return guardianId !== undefined && guardianId !== null;
}

/**
 * Extrae múltiples IDs de guardian de una lista de miembros
 * 
 * @param members - Array de miembros
 * @returns Array de guardian_ids únicos (sin duplicados)
 */
export function getUniqueGuardianIds(members: Member[]): number[] {
  const guardianIds = members
    .map(getGuardianId)
    .filter((id): id is number => id !== undefined);
  
  return [...new Set(guardianIds)];
}