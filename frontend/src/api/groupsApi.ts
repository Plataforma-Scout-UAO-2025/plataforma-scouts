import api from "./axios";
import type { GroupResponseDTO as Group, UpdateGroupDTO } from "@/types/group.type";

// Crear un nuevo grupo
export const createGroup = async (data: Group) => {
  const response = await api.post("/groups/create_group", data);
  return response.data;
};

// Obtener grupo por ID
export const getGroup = async (id: string | number | bigint) => {
  const response = await api.get<Group>("/groups/list_group_by_id", {
    params: { id },
  });
  return response.data;
};

// Obtener de todos los grupos
export const getGroups = async () => {
  const response = await api.get<Group[]>("/groups/list_groups");
  return response.data;
};

// Actualizar perfil de usuario
export const updateGroup = async (
  id: string,
  updates: Partial<UpdateGroupDTO>,
) => {
  const response = await api.put(`/groups/update_group_by_id/${id}`, updates);
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

// Asignar subgrupo y sección a un miembro
export const assignSubgroupAndSection = async (data: {
  memberId: number | string;
  subGroupId?: number | string;
  sectionId?: number | string;
}) => {
  const response = await api.put(`/members/assign_subgroup_and_section`, data);
  return response.data;
};