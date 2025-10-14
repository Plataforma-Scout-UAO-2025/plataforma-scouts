import type { Section } from "./section.type";

export interface Member {
  // Campos opcionales para manejar ambas convenciones de nombres
  // (camelCase y snake_case)
  tenantId?: string;
  memberId?: number | 0;
  subgroupId?: number | 0;
  subgroupName?: string;
  sectionId?: number | 0;
  sectionName?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  documentType?: string;
  birthDate?: string | Date;
  emergencyContacts?: EmergencyContact[];

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
  role?: "ADMIN_GRUPO" | "COMITE_ADMIN" | "SCOUTER" | "ACUDIENTE" | "TESORERO" | "ADMIN_GLOBAL" | "SCOUT" | "scout";
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
  acceptance_date?: string | Date;
  emergency_contacts?: EmergencyContact[];
  created_at?: string;
  updated_at?: string;
  full_name?: string;
  branch?: Section[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}
