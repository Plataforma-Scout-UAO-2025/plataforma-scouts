import type { Rama } from "@/app/routes/organigrama/types/rama.type";
import type { Insignia } from "@/models/types/insigniaTypes";

export interface Member {
  member_id: bigint;
  user_id: string;
  tenant_id?: string;
  guardian_id?: number;
  relationship?: string;
  subgroup_id?: number;
  role?: "admin_group" | "admin_global" | "scout";
  status?: string;
  isActive?: boolean;
  first_name?: string;
  last_name?: string;
  age?: number;
  identification?: string;
  document_type?: string;
  email?: string;
  gender?: string;
  birth_date?: Date;
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
  branch?: Rama[];
  badges?: Insignia[];
}

export interface MemberPayload {
  tenant_id: string;
  subgroup_id: string;
  userId: string;
  first_name: string;
  last_name: string;
  age: number;
  role: "admin_group" | "admin_global" | "scout";
  identification: string;
  document_type: string;
  email: string;
  gender: string;
  birth_date: Date;
  address: string;
  phone: string;
  weight: number;
  height: number;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  status: string;
  acceptance_date: Date;
  in_charge_of: string;
  emergency_phone: string;
}

export interface UpdateMember {
  first_name?: string;
  last_name?: string;
  age?: number;
  role?: "admin_group" | "admin_global" | "scout";
  identification?: string;
  document_type?: string;
  email?: string;
  gender?: string;
  birth_date?: Date;
  address?: string;
  phone?: string;
  weight?: number;
  height?: number;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  status?: string;
  acceptance_date?: Date;
  in_charge_of?: string;
  emergency_phone?: string;
}
