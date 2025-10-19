import api from "./axios";
import type { Member, UpdateMember } from "@/types/member.type";
import type {
  CreateMemberWithSchoolRequest,
  CreateAuth0Request,
  CreateAuth0Response,
} from "@/types/enrollment.type";

// Crear un nuevo miembro
export const createMember = async (data: Member) => {
  const response = await api.post("/members/create_member", data);
  return response.data;
};

// Crear un miembro con datos escolares
export const createMemberWithSchool = async (
  data: CreateMemberWithSchoolRequest,
) => {
  const response = await api.post("/members/create_member_with_school", data);
  return response.data;
};

// Crear miembro en Auth0
export const createMemberAuth0 = async (
  data: CreateAuth0Request,
): Promise<CreateAuth0Response> => {
  const resp = await api.post<CreateAuth0Response>("/auth0/create-user", data);
  return resp.data;
};

// Crear scout en Auth0
export const createScoutAuth0 = async (
  data: CreateAuth0Request,
): Promise<CreateAuth0Response> => {
  const resp = await api.post<CreateAuth0Response>("/auth0/scouts", data);
  return resp.data;
};

// Obtener lista de roles
export interface RoleSummary {
  id: string;
  name: string;
  description?: string | null;
}

export const listRoles = async (): Promise<RoleSummary[]> => {
  const resp = await api.get<RoleSummary[]>("/auth0/roles");
  // Filtrar solo roles permitidos
  const allowed = new Set([
    "TESORERO",
    "SCOUT",
    "SCOUTER",
    "ACUDIENTE",
    "COMITE_ADMIN",
  ]);

  const normalize = (s: string) =>
    s?.toString().replace(/\s+/g, "_").replace(/-/g, "_").toUpperCase();

  return resp.data.filter((r) => allowed.has(normalize(r.name)));
};

// Obtener perfil de miembro
export const getMember = async (id: string | number | bigint) => {
  const response = await api.get<Member>("/members/list_member_by_id", {
    params: { id },
  });
  return response.data;
};

// Obtener perfiles de miembros
export const getMembers = async () => {
  const response = await api.get<Member[]>("/members/list_members");
  return response.data;
};

// Obtener miembros por estado
export const getMembersByStatus = async (
  status: "PENDING" | "APPROVED" | "REJECTED",
) => {
  const response = await api.get<Member[]>("/members/list_members_by_status", {
    params: { status },
  });
  return response.data;
};

// Obtener miembros por subrama
export const getMembersWithBranch = async () => {
  const response = await api.get<Member[]>(
    "/members/list_members_with_details",
  );
  return response.data;
};

// Actualizar estado de un miembro
export const updateMemberStatus = async (
  id: string | number,
  status: "PENDING" | "APPROVED" | "REJECTED",
) => {
  const response = await api.put(`/members/update_member_status/${id}`, null, {
    params: { status },
  });
  return response.data;
};

// Actualizar perfil de usuario
export const updateMember = async (
  id: string,
  updates: Partial<UpdateMember>,
) => {
  const response = await api.put(`/members/update_member_by_id/${id}`, updates);
  return response.data;
};

// Enviar un DTO completo para update_member_by_id (backend valida campos requeridos)
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
