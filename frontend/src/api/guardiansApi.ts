import api from "./axios";
import type { Guardian, CreateGuardianDTO, UpdateGuardianDTO } from "./guardian.types";

/**
 * API Service para Guardianes (Acudientes)
 * 
 * Endpoints del backend:
 * - POST /api/members/guardian/create
 * - GET /api/members/guardian/{id}
 * - PUT /api/members/guardian/{id}
 */

/**
 * Crear un nuevo guardian
 * @param data - Datos del guardian a crear
 * @returns Guardian creado con información completa
 */
export const createGuardian = async (data: CreateGuardianDTO): Promise<Guardian> => {
  const response = await api.post<Guardian>("/members/guardian/create", data);
  return response.data;
};

/**
 * Obtener un guardian por su ID
 * @param id - ID del guardian (userId)
 * @returns Guardian con información completa incluyendo miembros a cargo
 */
export const getGuardianById = async (id: string): Promise<Guardian> => {
  const response = await api.get<Guardian>(`/members/guardian/${id}`);
  return response.data;
};

/**
 * Actualizar datos de un guardian existente
 * @param id - ID del guardian (userId)
 * @param data - Datos a actualizar (solo los campos que cambien)
 * @returns Guardian actualizado
 */
export const updateGuardian = async (
  id: string,
  data: UpdateGuardianDTO
): Promise<Guardian> => {
  const response = await api.put<Guardian>(`/members/guardian/${id}`, data);
  return response.data;
};
