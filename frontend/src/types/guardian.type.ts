// Types para API de Guardianes (Acudientes)

export type DocumentType = "CC" | "TI" | "CE" | "PASSPORT" | "RC" | "PA" | "PEP" | "PPT" | "NIT" | "NUIP";
export type Status = "PENDING" | "ACCEPTED" | "NOT_ACCEPTED" | "ACTIVE" | "INACTIVE";

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
  user_id: string
  rol: "ACUDIENTE" | "ADMIN" | "USUARIO"
  tenant_id: string
  first_name: string
  last_name: string
  age: number
  identification: string
  document_type: 'CC' | 'TI' | 'RC' | 'CE' | 'PA' | 'PEP' | 'PPT' | 'NIT' | 'NUIP'
  phone: string
  is_active: boolean
  status: "APPROVED" | "PENDING" | "REJECTED" | string
  acceptance_date: string
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

export interface GuardianCreateResponse {
  member_id: number;
}

export interface CreateGuardianDTO {
  userId?: string;
  subgroup?: SubgroupDTO;
  rol?: string;
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
  rol?: string;
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

export interface GuardianSummary {
  userId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  membersCount?: number;
}
