export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface CreateMemberDTO {
  user_id?: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  age: number;
  role: string;
  identification: string;
  document_type: "CC" | "TI" | "CE" | "PASSPORT" | "RC";
  email?: string;
  gender: string;
  birth_date: string; // formato: YYYY-MM-DD
  address?: string;
  phone?: string;
  weight?: string;
  height?: string;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  is_active: boolean;
  relationship?: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  acceptance_date?: string; // formato: YYYY-MM-DD
  emergency_contacts?: EmergencyContact[];
  accept_treatment: boolean;
}

export interface CreateGroupAdminRequestDTO {
  email: string;
  password: string;
  username: string;
  member: CreateMemberDTO;
}
