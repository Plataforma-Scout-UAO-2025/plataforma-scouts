import type { Section } from "./section.type";

export interface Member {
  member_id: number;
  first_name: string;
  last_name: string;
  subgroup_id: number;
  subgroup_name: string;
  section_id: number;
  section_name: string;
  age: number;
  user_id: string;
  tenant_id?: string;
  guardian_id?: number;
  relationship?: string;
  role?: "admin_group" | "admin_global" | "scout";
  status?: string;
  isActive?: boolean;
  identification?: string;
  document_type?: string;
  email?: string;
  gender?: string;
  birth_day?: Date;
  address?: string;
  phone?: string;
  weight?: string;
  height?: string;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  acceptance_date?: Date;
  emergency_phone?: [string];
  created_at?: string;
  updated_at?: string;
  branch?: Section[];
}
