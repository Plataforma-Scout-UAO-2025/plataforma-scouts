export type DocumentType = "CC" | "CE" | "PA";
export type Status = "APPROVED" | "PENDING" | "REJECTED";

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
  rol: "ACUDIENTE" | "ADMIN" | "USUARIO"
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

export interface AvailableGuardianDTO {
  guardianId: number;
  firstName: string;
  lastName: string;
  identification: string;
  phone?: string;
  email?: string;
  membersCount?: number;
}