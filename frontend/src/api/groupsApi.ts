import api from "./axios";
import type { GroupResponseDTO as Group, UpdateGroupDTO, GroupMembersDTO, TopGroupByMembersDTO, GroupWithAdminBackendDTO } from "@/types/group.type";

// Crear un nuevo grupo
export const createGroup = async (data: Group) => {
  const response = await api.post("/groups/create_group", data);
  return response.data;
};

// Obtener grupo por tenantId (retorna el primer grupo del tenant)
export const getGroup = async (tenantId: string) => {
  const response = await api.get<Group[]>(`/tenants/${tenantId}/groups`);
  // Cada tenant tiene solo un grupo según la lógica del backend
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

// Actualizar perfil de usuario
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