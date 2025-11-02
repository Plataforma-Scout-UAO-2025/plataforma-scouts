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