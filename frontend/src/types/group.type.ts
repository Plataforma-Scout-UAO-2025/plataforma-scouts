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