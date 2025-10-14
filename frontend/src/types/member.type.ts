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
  acceptance_date?: Date;
  emergency_contacts?: EmergencyContact[];
  created_at?: string;
  updated_at?: string;
  branch?: Section[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}
