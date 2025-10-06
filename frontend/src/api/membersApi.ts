import api from "./axios";
import type { Member } from "../models/types/memberTypes";

// Obtener perfil de miembro
export const getMember = async (id: string) => {
  const response = await api.get(`/api/members/list_member_by_id/${id}`);
  return response.data;
};

// Obtener perfiles de miembros
export const getMembers = async () => {
  const response = await api.get("/api/members/list_members");
  return response.data;
};

// Actualizar perfil de usuario
export const updateMember = async (
  id: string,
  updates: Partial<Member>
) => {
  const response = await api.put(`/api/members/update_member_by_id/${id}`, updates);
  return response.data;
};