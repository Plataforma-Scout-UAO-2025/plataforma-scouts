import api from "./axios";
import type { 
  GroupResponseDTO as Group, 
  UpdateGroupDTO, 
  GroupMembersDTO, 
  TopGroupByMembersDTO, 
  GroupWithLeaderDTO,
  GroupWithLeaderResponseDTO
} from "@/types/group.type";

// Helper para convertir snake_case a camelCase
const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Helper para transformar objeto de snake_case a camelCase
const transformKeys = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(transformKeys);
  if (typeof obj !== 'object') return obj;

  const transformed: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = transformKeys(obj[key]);
    }
  }
  return transformed;
};

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

// Obtener todos los grupos desde el endpoint de members
export const getGroups = async () => {
  const response = await api.get<GroupWithLeaderResponseDTO[]>("/members/getAll");
  
  // Transformar toda la respuesta (inChargeOf y group) de snake_case a camelCase
  const groupsWithLeaders = response.data.map((item) => ({
    inChargeOf: item.inChargeOf ? transformKeys(item.inChargeOf) : null,
    group: transformKeys(item.group)
  }));
  
  return groupsWithLeaders as GroupWithLeaderDTO[];
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

// Crear grupo (multipart) enviando el dto como JSON y opcionalmente una imagen
export const createGroupMultipart = async (
  tenantId: string,
  dto: Record<string, unknown>,
  image?: File,
) => {
  const fd = new FormData();
  
  // El DTO debe ser enviado como application/json dentro del FormData
  const dtoBlob = new Blob([JSON.stringify(dto)], { type: "application/json" });
  fd.append("dto", dtoBlob);
  
  // Si hay una imagen, agregarla como multipart file
  if (image) {
    fd.append("image", image);
  }
  
  // El navegador automáticamente establece el Content-Type a multipart/form-data
  const response = await api.post<Group>(`/tenants/${tenantId}/groups`, fd);
  return response.data;
};

// Validar slug
export const validateSlug = async (slug: string) => {
  // El endpoint usa "non-tenant" como placeholder ya que la validación es global
  const response = await api.get<{ slug: string; valid: boolean; reason?: string; message?: string }>(
    `/tenants/non-tenant/groups/slug/validate`,
    { params: { slug } }
  );
  return response.data;
};