export interface Member {
  memberId: bigint;
  userId: string;
  tenantId?: string;
  guardianId?: number;
  relationship?: string;
  subgroupId?: number;
  role?: "admin_group" | "admin_global" | "scout";
  status?: string;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  age?: number;
  identification?: string;
  documentType?: string;
  email?: string;
  gender?: string;
  birthDate?: Date;
  address?: string;
  phone?: string;
  weight?: string;
  height?: string;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  acceptanceDate: Date;
  emergencyPhone?: string;
  createdAt?: string;
  updatedAt?: string;
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
  firstName?: string;
  lastName?: string;
  age?: number;
  role?: "admin_group" | "admin_global" | "scout";
  identification?: string;
  documentType?: string;
  email?: string;
  gender?: string;
  birthDate?: Date;
  address?: string;
  phone?: string;
  weight?: number;
  height?: number;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  status?: string;
  acceptanceDate?: Date;
  guardianId?: number;
  relationship?: string;
  subgroupId?: number;
  emergencyPhone?: string;
}
