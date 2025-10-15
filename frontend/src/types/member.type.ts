import type { Section } from "./section.type";

export interface Member {
  member_id?: number;
  first_name?: string;
  last_name?: string;
  subgroup_id?: number;
  subgroup_name?: string;
  section_id?: number;
  section_name?: string;
  age?: number;
  user_id?: string;
  tenant_id?: string;
  guardian_id?: number;
  relationship?: string;
  role?: "admin_group" | "admin_global" | "scout" | "SCOUT";
  status?: string;
  is_active?: boolean;
  identification?: string;
  document_type?: string;
  email?: string;
  gender?: string;
  birth_date?: string | Date;
  address?: string;
  phone?: string;
  weight?: string;
  height?: string;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  acceptance_date?: string;
  emergency_contacts?: EmergencyContact[];
  created_at?: string;
  updated_at?: string;
  branch?: Section[];
}

export interface CreateMember {
  memberId?: number;
  firstName?: string;
  lastName?: string;
  subgroupId?: number;
  subgroupName?: string;
  sectionId?: number;
  sectionName?: string;
  age?: number;
  userId?: string;
  tenantId?: string;
  guardianId?: number;
  relationship?: string;
  role?: "admin_group" | "admin_global" | "scout" | "SCOUT";
  status?: string;
  isActive?: boolean;
  identification?: string;
  documentType?: string;
  email?: string;
  gender?: string;
  birthDate?: string | Date;
  address?: string;
  phone?: string;
  weight?: string;
  height?: string;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  acceptanceDate?: Date;
  emergencyContacts?: EmergencyContact[];
  createdAt?: string;
  updatedAt?: string;
  branch?: Section[];
}

export interface UpdateMember {
  memberId?: number;
  firstName?: string;
  lastName?: string;
  subgroupId?: number;
  subgroupName?: string;
  age?: number;
  userId?: string;
  tenantId?: string;
  guardianId?: number;
  relationship?: string;
  role?: "admin_group" | "admin_global" | "scout" | "SCOUT";
  status?: string;
  isActive?: boolean;
  identification?: string;
  documentType?: string;
  email?: string;
  gender?: string;
  birthDate?: string | Date;
  address?: string;
  phone?: string;
  weight?: string;
  height?: string;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  acceptanceDate?: Date;
  emergencyContacts?: EmergencyContact[];
  createdAt?: string;
  updatedAt?: string;
  branch?: Section[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}
