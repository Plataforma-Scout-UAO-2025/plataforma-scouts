import api from "./axios";
import type { GroupResponseDTO as Group, UpdateGroupDTO, GroupMembersDTO, TopGroupByMembersDTO, GroupWithAdminBackendDTO } from "@/types/group.type";
interface CreateGroupRequest {
  tenant_id: string;
  slug: string;
  name: string;
  district?: string | null;
  identifier_number?: string | null;
  address?: string | null;
  phone?: string | null;
  email: string;
  founded_in?: string | null;
  motto?: string | null;
  mission?: string | null;
  vision?: string | null;
  history?: string | null;
  logo_object_id?: string | null;
  scarf_object_id?: string | null;
  social_links?: Record<string, unknown> | null;
  config?: Record<string, unknown> | null;
  is_active?: boolean;
  status?: string;
}

export const createGroup = async (data: CreateGroupRequest) => {
  const formData = new FormData();
  
  const dto = {
    tenant_id: data.tenant_id,
    slug: data.slug,
    name: data.name,
    district: data.district || null,
    identifier_number: data.identifier_number || null,
    address: data.address || null,
    phone: data.phone || null,
    email: data.email,
    founded_in: data.founded_in || null,
    motto: data.motto || null,
    mission: data.mission || null,
    vision: data.vision || null,
    history: data.history || null,
    logo_object_id: data.logo_object_id || null,
    scarf_object_id: data.scarf_object_id || null,
    social_links: data.social_links || null,
    config: data.config || null,
    is_active: data.is_active ?? true,
    status: data.status || "ACTIVE",
  };
  
  const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
  formData.append('dto', dtoBlob);
  
  const response = await api.post("/tenants/*/groups", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Obtener grupo por tenantId (retorna el primer grupo del tenant)
export const getGroup = async (tenantId: string) => {
  const response = await api.get<Group[]>(`/tenants/${tenantId}/groups`);
  return response.data[0] || null;
};

// Obtener de todos los grupos
export const getGroups = async () => {
  const response = await api.get<Group[]>("/tenants/A/groups/getAll");
  return response.data;
};

export const getGroupsWithAdmins = async () => {
  const response = await api.get<GroupWithAdminBackendDTO[]>("/members/getAll");
  return response.data;
};

// Crear administrador de grupo
export const createGroupAdmin = async (
  tenantId: string,
  slug: string,
  data: {
    email: string;
    password: string;
    username: string;
    member: Record<string, unknown>;
  }
) => {
  const response = await api.post(
    `/tenants/${tenantId}/groups/${slug}/admins`,
    data
  );
  return response.data;
};

// Crear administrador de grupo con conexión específica (usa la conexión correcta del grupo)
export const createGroupAdminWithConnection = async (
  tenantId: string,
  slug: string,
  data: {
    email: string;
    password: string;
    username: string;
    member: Record<string, unknown>;
  }
) => {
  const response = await api.post(
    `/tenants/${tenantId}/groups/${slug}/admins-with-connection`,
    data
  );
  return response.data;
};

// Actualizar grupo
export const updateGroup = async (
  tenantId: string,
  groupSlug: string,
  updates: Partial<UpdateGroupDTO>,
) => {
  const response = await api.patch(`/tenants/${tenantId}/groups/${groupSlug}/update`, updates);
  return response.data;
};

// Actualizar logo del grupo
export const updateGroupLogo = async (
  tenantId: string,
  groupSlug: string,
  objectId: string,
) => {
  const response = await api.patch(`/tenants/${tenantId}/groups/${groupSlug}/logo`, {
    object_id: objectId,
  });
  return response.data;
};

// Actualizar scarf/pañoleta del grupo
export const updateGroupScarf = async (
  tenantId: string,
  groupSlug: string,
  objectId: string,
) => {
  const response = await api.patch(`/tenants/${tenantId}/groups/${groupSlug}/scarf`, {
    object_id: objectId,
  });
  return response.data;
};

// Enviar un DTO completo para update_member_by_id
export const updateMemberByDto = async (
  id: string,
  memberDto: Record<string, unknown>,
) => {
  const response = await api.put(
    `/members/update_member_by_id/${id}`,
    memberDto,
  );
  return response.data;
};

// Stats de grupos

// Obtener conteo de miembros por grupo
export const getMembersCountByGroup = async () => {
  const response = await api.get<GroupMembersDTO[]>("/statistics/groups/members-count");
  return response.data;
};

// Obtener conteo total de miembros
export const getTotalMembersCount = async () => {
  const response = await api.get<{ total_members_count: number }>("/statistics/members/total");
  return response.data;
}

// Obtener conteo de grupos activos
export const getActiveGroupsCount = async () => {
  const response = await api.get<{ active_groups_count: number }>("/statistics/groups");
  return response.data;
}

// Obtener conteo de grupos inactivos
export const getInactiveGroupsCount = async () => {
  const response = await api.get<{ inactive_groups_count: number }>("/statistics/groups/inactive");
  return response.data;
}

// Obtener grupos con más miembros
export const getTopGroupsByMembers = async () => {
  const response = await api.get<TopGroupByMembersDTO[]>("/statistics/groups/most-members");
  return response.data;
}

// Validar si un slug de grupo ya existe
export const validateGroupSlug = async (slug: string) => {
  const response = await api.get<{ slug: string; valid: boolean; reason: string | null; message: string | null }>(
    `/tenants/A/groups/slug/validate`,
    { params: { slug } }
  );
  return response.data;
}