export interface GroupResponseDTO {
  groupId: number;
  tenantId: string;
  slug: string;
  name: string;
  district?: string;
  identifierNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  foundedIn?: string;
  motto?: string;
  mission?: string;
  vision?: string;
  history?: string;
  logoObjectId?: string;
  scarfObjectId?: string;
  socialLinks?: Record<string, unknown>;
  config?: Record<string, unknown>;
  isActive: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGroupDTO {
  groupId?: number;
  name: string;
  district?: string;
  identifierNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  foundedIn?: string;
  motto?: string;
  mission?: string;
  vision?: string;
  history?: string;
  logoObjectId?: string;
  scarfObjectId?: string;
  socialLinks?: Record<string, unknown>;
  config?: Record<string, unknown>;
  isActive: boolean;
  status?: string;
}

export interface UpdateGroupDTO {
  groupId?: number;
  name: string;
  district?: string;
  identifierNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  foundedIn?: string;
  motto?: string;
  mission?: string;
  vision?: string;
  history?: string;
  logoObjectId?: string;
  scarfObjectId?: string;
  socialLinks?: Record<string, unknown>;
  config?: Record<string, unknown>;
  isActive: boolean;
  status?: string;
}

export interface TenantDTO {
  tenantId?: number;
  slug: string;
  name: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupMembersDTO {
  group_id: number;
  group_name: string;
  member_count: number;
  status?: string;
}

export interface TopGroupByMembersDTO {
  group_id: number;
  group_name: string;
  members_count: number;
}

export interface group_response_dto {
  group_id: number;
  tenant_id: string;
  slug: string;
  name: string;
  district?: string;
  identifier_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  founded_in?: string;
  motto?: string;
  mission?: string;
  vision?: string;
  history?: string;
  logo_object_url?: string;
  scarf_object_url?: string;
  social_links?: Record<string, unknown>;
  config?: Record<string, unknown>;
  is_active: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Interfaz para el member en snake_case como viene del backend
export interface member_response_dto {
  member_id: number;
  user_id: string;
  tenant_id: string;
  guardian_id?: number | null;
  first_name: string;
  last_name: string;
  age: number;
  role: string;
  identification: string;
  document_type?: string | null;
  email?: string | null;
  gender: string;
  birth_date?: string | null;
  address?: string | null;
  phone?: string | null;
  weight?: number | null;
  height?: number | null;
  hobbies?: string | null;
  sports?: string | null;
  instruments?: string | null;
  is_active: boolean;
  relationship?: string | null;
  status: string;
  acceptance_date?: string | null;
  emergency_contacts?: any | null;
  created_at: string;
  updated_at: string;
  full_name?: string;
}

// Interfaz para la respuesta del backend (snake_case)
export interface GroupWithLeaderResponseDTO {
  inChargeOf: member_response_dto | null;
  group: group_response_dto;
}

// Interfaz para el uso en el frontend (camelCase) - ya transformado
export interface GroupWithLeaderDTO {
  inChargeOf: {
    memberId: number;
    userId: string;
    tenantId: string;
    guardianId?: number | null;
    firstName: string;
    lastName: string;
    age: number;
    role: string;
    identification: string;
    documentType?: string | null;
    email?: string | null;
    gender: string;
    birthDate?: string | null;
    address?: string | null;
    phone?: string | null;
    weight?: number | null;
    height?: number | null;
    hobbies?: string | null;
    sports?: string | null;
    instruments?: string | null;
    isActive: boolean;
    relationship?: string | null;
    status: string;
    acceptanceDate?: string | null;
    emergencyContacts?: any | null;
    createdAt: string;
    updatedAt: string;
    fullName?: string;
  } | null;
  group: GroupResponseDTO;
}