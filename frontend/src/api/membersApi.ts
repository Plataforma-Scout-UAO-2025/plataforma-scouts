import api from "./axios";
import type { Member, UpdateMember } from "@/types/member.type";
import type { CreateMemberWithSchoolRequest } from "@/types/enrollment.type";

// Crear un nuevo miembro
export const createMember = async (data: Member) => {
  const response = await api.post("/members/create_member", data);
  return response.data;
};

// Crear un miembro con datos escolares
export const createMemberWithSchool = async (
  data: CreateMemberWithSchoolRequest
) => {
  const response = await api.post("/members/create_member_with_school", data);
  return response.data;
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
  status: "PENDING" | "APPROVED" | "REJECTED"
) => {
  const response = await api.get<Member[]>("/members/list_members_by_status", {
    params: { status },
  });
  return response.data;
};

// Actualizar estado de un miembro
export const updateMemberStatus = async (
  id: string | number,
  status: "PENDING" | "APPROVED" | "REJECTED"
) => {
  const response = await api.put(`/members/update_member_status/${id}`, null, {
    params: { status },
  });
  return response.data;
};

// Actualizar perfil de usuario
export const updateMember = async (
  id: string,
  updates: Partial<UpdateMember>
) => {
  const response = await api.put(`/members/update_member_by_id/${id}`, updates);
  return response.data;
};
