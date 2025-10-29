import api from "./axios";
import type { 
  Guardian, 
  GuardianWithMembers, 
  CreateGuardianDTO, 
  UpdateGuardianDTO, 
  MemberBasicInfo, 
  GuardianCreateResponse 
} from "@/types/guardian.type";

// Crear un nuevo guardian
export const createGuardian = async (data: CreateGuardianDTO) => {
  const response = await api.post<GuardianCreateResponse>("/guardian", data);
  return response.data;
};

// Obtener guardian por ID (solo datos básicos)
export const getGuardianById = async (id: number | string) => {
  const response = await api.get<Guardian>(`/guardian/${id}`);
  return response.data;
};

// Obtener guardian con sus miembros asociados
export const getGuardianWithMembers = async (id: number | string) => {
  const response = await api.get<GuardianWithMembers>(`/guardian/${id}/members`);
  return response.data;
};

// Obtener lista de miembros a cargo de un guardian
export const getMembersInChargeOf = async (guardianId: number | string) => {
  const response = await api.get<MemberBasicInfo[]>(`/guardian/${guardianId}/members-list`);
  return response.data;
};

// Actualizar datos de un guardian existente
export const updateGuardian = async (id: number | string, data: UpdateGuardianDTO) => {
  const response = await api.put(`/guardian/${id}`, data);
  return response.data;
};

export const getAvailableMembers = async (): Promise<MemberBasicInfo[]> => {
  const response = await api.get<MemberBasicInfo[]>('/guardian/members/available-guardian');
  return response.data;
};

// Agregar un miembro al guardian
export const addMemberToGuardian = async (guardianId: number | string, memberId: number | string) => {
  const response = await api.post(`/guardian/${guardianId}/members/${memberId}`);
  return response.data;
};

// Remover un miembro del guardian
export const removeMemberFromGuardian = async (guardianId: number | string, memberId: number | string) => {
  const response = await api.delete(`/guardian/${guardianId}/members/${memberId}`);
  return response.data;
};

// Eliminar un guardian
export const deleteGuardian = async (id: number | string) => {
  const response = await api.delete(`/guardian/${id}`);
  return response.data;
};
