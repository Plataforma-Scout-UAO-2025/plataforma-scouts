export interface GroupResponseDTO {
  groupId: number;
  tenant_id: string;
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

// Tipos específicos para el endpoint /members/getAll (respuesta en snake_case del backend)
export interface GroupWithAdminBackendDTO {
  inChargeOf: {
    member_id: number;
    user_id: string;
    tenant_id: string;
    guardian_id: number | null;
    first_name: string;
    last_name: string;
    age: number;
    role: string;
    identification: string;
    document_type: string | null;
    email: string | null;
    gender: string;
    birth_date: string | null;
    address: string | null;
    phone: string | null;
    weight: string | null;
    height: string | null;
    hobbies: string | null;
    sports: string | null;
    instruments: string | null;
    is_active: boolean;
    relationship: string | null;
    status: string;
    acceptance_date: string | null;
    emergency_contacts: unknown | null;
    created_at: string;
    updated_at: string;
    full_name: string;
  } | null;
  group: {
    group_id: number;
    tenant_id: string;
    slug: string;
    name: string;
    district: string;
    identifier_number: string;
    address: string;
    phone: string;
    email: string;
    founded_in: string;
    motto: string;
    mission: string;
    vision: string;
    history: string;
    logo_object_url: string | null;
    scarf_object_url: string | null;
    social_links: Record<string, unknown>;
    config: Record<string, unknown>;
    is_active: boolean;
    status: string;
    created_at: string;
    updated_at: string;
  };
}