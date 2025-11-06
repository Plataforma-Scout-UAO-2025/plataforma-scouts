export const DOCUMENT_TYPES = ["CC", "TI", "CE", "PA"] as const;
export type DocumentType = typeof DOCUMENT_TYPES[number];

export const STATUSES = ["APPROVED", "PENDING", "REJECTED"] as const;
export type Status = typeof STATUSES[number];

export const ROLES = ["ACUDIENTE", "ADMIN", "USUARIO"] as const;
export type Role = typeof ROLES[number];

export interface SubgroupDTO {
  subgroupId?: number;
  name?: string;
  sectionId?: number;
}

export interface EmergencyContactDTO {
  name?: string;
  phone?: string;
  relationship?: string;
}

export interface MemberBasicInfo {
  memberId?: string;
  tenantId?: string;
  subgroup?: SubgroupDTO;
  first_name?: string;
  last_name?: string;
  age?: number;
  role?: string;
  identification?: string;
  documentType?: DocumentType;
  document_type?: DocumentType;
  email?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  weight?: string;
  height?: string;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  is_active?: boolean;
  relationship?: string;
  status?: Status;
  acceptanceDate?: string;
  guardianId?: number;
  emergencyContacts?: EmergencyContactDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Guardian {
  member_id?: number
  user_id: string
  role: Role
  tenant_id: string
  firstName: string
  lastName: string
  age: number
  identification: string
  document_type: DocumentType
  phone: string
  is_active: boolean
  status: Status
  acceptance_date: string
  address: string
}

export interface GuardianWithMembers {
  userId?: string;
  subgroup?: SubgroupDTO;
  tenantId?: string;
  firstName: string;
  lastName: string;
  age?: number;
  identification?: string;
  documentType?: DocumentType;
  phone?: string;
  isActive?: boolean;
  relationship?: string;
  status?: Status;
  acceptanceDate?: string;
  members?: MemberBasicInfo[];
}

export interface GuardianCompleteData {
  user_id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  role: 'ACUDIENTE'; // se quema ya que se está creando un acudiente
  gender: string;
  address: string;
  birth_date: string;
  identification: string;
  document_type: DocumentType;
  phone: string;
  is_active: boolean;
  status: 'PENDING'; //se quema ya que se está terminando de crear la cuenta
  accept_treatment: true; //se quema ya que si llega a este punto siempre es true
}

export interface GuardianCreateResponse {
  member_id: number;
}

export interface CreateGuardianDTO {
  userId?: string;
  subgroup?: SubgroupDTO;
  role?: Role;
  tenantId?: string;
  subgroupId?: string;
  firstName: string;
  lastName: string;
  age?: number;
  identification?: string;
  documentType?: DocumentType;
  phone?: string;
  relationship?: string;
  isActive?: boolean;
  status?: Status;
  acceptanceDate?: string;
}

export interface UpdateGuardianDTO {
  userId?: string;
  subgroup?: SubgroupDTO;
  role?: Role;
  tenantId?: string;
  subgroupId?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  identification?: string;
  documentType?: DocumentType;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  relationship?: string;
  isActive?: boolean;
  status?: Status;
  acceptanceDate?: string;
}

export interface AvailableGuardianDTO {
  guardianId: number;
  firstName: string;
  lastName: string;
  identification: string;
  phone?: string;
  email?: string;
  membersCount?: number;
}

export interface Member {
  is_active?: boolean | string | number;
  isActive?: boolean | string | number;
}

export interface ExtendedMemberInfo extends MemberBasicInfo {
  member_id?: string | number;
  userId?: string | number;
  firstName?: string;
  lastName?: string;
  birth_date?: string;
}