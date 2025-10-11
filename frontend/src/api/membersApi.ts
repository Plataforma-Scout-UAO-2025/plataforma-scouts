import api from "./axios";
import type { Member } from "../models/types/memberTypes";
import type {
  CreateMemberRequest,
  CreateMemberWithSchoolRequest,
} from "@/app/routes/grupos/basic-info/types/enrollment.type";

// Crear un nuevo miembro - Acepta CreateMemberRequest
export const createMember = async (memberData: CreateMemberRequest) => {
  const response = await api.post("/members/create_member", memberData);
  return response.data;
};

// Crear un miembro con datos escolares - Acepta CreateMemberWithSchoolRequest
export const createMemberWithSchool = async (
  data: CreateMemberWithSchoolRequest
) => {
  const response = await api.post("/members/create_member_with_school", data);
  return response.data;
};

// Obtener todos los miembros
export const getMembers = async () => {
  const response = await api.get<Member[]>("/members/list_members");
  return response.data;
};

// Obtener miembro por ID
export const getMember = async (id: string | number | bigint) => {
  const response = await api.get<Member>("/members/list_member_by_id", {
    params: { id },
  });
  return response.data;
};

// Obtener miembros por estado
export const getMembersByStatus = async (
  status: "PENDING" | "ACCEPTED" | "NOT_ACCEPTED"
) => {
  const response = await api.get<Member[]>("/members/list_members_by_status", {
    params: { status },
  });
  return response.data;
};

// Actualizar estado de un miembro
export const updateMemberStatus = async (
  id: string | number,
  status: "PENDING" | "ACCEPTED" | "NOT_ACCEPTED"
) => {
  const response = await api.put(`/members/update_member_status/${id}`, null, {
    params: { status },
  });
  return response.data;
};

// Actualizar rol de un miembro
export const updateMemberRole = async (
  id: string | number,
  role: string
) => {
  const response = await api.put(`/members/update_member_role/${id}`, null, {
    params: { role },
  });
  return response.data;
};

// Actualizar miembro por ID
export const updateMember = async (
  id: string | number,
  updates: Partial<Member>
) => {
  const response = await api.put<Member>(
    `/members/update_member_by_id/${id}`,
    updates
  );
  return response.data;
};
