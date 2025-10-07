export interface Member {
  member_id: string;
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
  birth_day: Date;
  address: string;
  phone: string;
  weight: number;
  height: number;
  hobbies: string;
  sports: string;
  instruments: string;
  status: string;
  acceptance_date: Date;
  in_charge_of: string;
  emergency_phone: string;
  created_at: Date;
  updated_at: Date;
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
  birth_day: Date;
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
  birth_day?: Date;
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
