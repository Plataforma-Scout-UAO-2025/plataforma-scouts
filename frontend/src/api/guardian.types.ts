/**
 * Types para API de Guardianes (Acudientes)
 * 
 * Estos tipos corresponden a los DTOs del backend en:
 * - GuardianCreateDTO (input)
 * - GuardianWithMemberDTO (output)
 */

/**
 * Tipos de documento válidos
 */
export type DocumentType = "CC" | "TI" | "CE" | "PASSPORT";

/**
 * Estados posibles de un guardian
 */
export type GuardianStatus = "PENDING" | "ACCEPTED" | "NOT_ACCEPTED" | "ACTIVE" | "INACTIVE";

/**
 * Datos básicos de un miembro asociado al guardian
 */
export interface MemberBasicInfo {
  userId: string;
  firstName: string;
  lastName: string;
}

/**
 * Información de subgrupo
 */
export interface SubgroupInfo {
  subgroupId: number;
  name: string;
}

/**
 * Contacto de emergencia
 */
export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

/**
 * Guardian - Respuesta completa del backend
 * Corresponde a GuardianWithMemberDTO
 */
export interface Guardian {
  userId: string;
  tenantId: string;
  subgroupId: string | number;
  subgroup?: SubgroupInfo;
  firstName: string;
  lastName: string;
  age?: number;
  identification: string;
  documentType?: DocumentType | string;
  phone: string;
  isActive: boolean;
  relationship?: string;
  status?: GuardianStatus | string;
  acceptanceDate?: string; // ISO date string
  gender?: string;
  birthDate?: string; // ISO date string
  address?: string;
  email?: string;
  members?: MemberBasicInfo[]; // Miembros a cargo
  membersInCharge?: MemberBasicInfo[]; // Alias alternativo
}

/**
 * DTO para crear un nuevo guardian
 * Corresponde a GuardianCreateDTO del backend
 */
export interface CreateGuardianDTO {
  tenantId: string;
  subgroupId: number;
  firstName: string;
  lastName: string;
  age?: number;
  identification: string;
  documentType?: DocumentType | string;
  email?: string;
  gender?: string;
  birthDate?: string; // YYYY-MM-DD
  address?: string;
  phone: string;
  isActive?: boolean;
  relationship: string;
  status?: GuardianStatus | string;
  acceptanceDate?: string; // YYYY-MM-DD
  memberIdsInCharge?: string[];
  emergencyContacts?: EmergencyContact[];
}

/**
 * DTO para actualizar un guardian existente
 * Campos opcionales que se pueden actualizar
 */
export interface UpdateGuardianDTO {
  identification?: string;
  documentType?: DocumentType | string;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string; // YYYY-MM-DD
  age?: number;
  email?: string;
  relationship?: string;
  status?: GuardianStatus | string;
  isActive?: boolean;
}

/**
 * Respuesta simplificada de guardian (para listados)
 */
export interface GuardianSummary {
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  isActive: boolean;
  membersCount?: number;
}
