import type { 
  Subgroup as Subrama,
  CreateSubgroupData as CreateSubramaData, 
  UpdateSubgroupData as UpdateSubramaData, 
} from '../types/frontend';
import type { BackendSubgroup as BackendSubrama } from '../types/backend';

import api from "@/api/axios";
import { subgroupsPath, subgroupPath } from '@/api/organigramaApi';
import { 
  mapBackendSubramaToFrontend,
  mapFrontendCreateSubramaToBackend,
  mapFrontendUpdateSubramaToBackend
} from '../utils/mappers';

type MaybeAxiosError = { response?: { data?: unknown } };

// CRUD para Subramas (SUBGROUPS)
export const getSubramasByRamaId = async (tenantSlug: string, groupSlug: string, ramaId: string): Promise<Subrama[]> => {
  const normalizedRamaId = typeof ramaId === 'string' ? ramaId.trim() : String(ramaId ?? '').trim();
  // Obteniendo subramas de rama: normalizedRamaId || '(sin id)'

  if (!normalizedRamaId) {
    console.warn('⚠️ [SubramaService] Rama sin ID válido, se omite la consulta de subramas.');
    return [];
  }

  try {
  const endpoint = subgroupsPath(normalizedRamaId, tenantSlug, groupSlug);
  const response = await api.get<BackendSubrama[]>(endpoint);
    const backendSubramas = response.data;

  const subramas = backendSubramas.map(mapBackendSubramaToFrontend);
  // Subramas obtenidas: subramas.length
  return subramas;
  } catch (error) {
    console.error('❌ [SubramaService] Error obteniendo subramas:', error);
    throw error;
  }
};

export const getSubramaById = async (tenantSlug: string, groupSlug: string, sectionId: string, id: string): Promise<Subrama | null> => {
  // Obteniendo subrama por ID: id
  
  try {
  const endpoint = subgroupPath(sectionId, id, tenantSlug, groupSlug);
  const response = await api.get<BackendSubrama>(endpoint);
    const backendSubrama = response.data;

    const subrama = mapBackendSubramaToFrontend(backendSubrama);
    return subrama;
  } catch (error) {
    console.error('❌ [SubramaService] Error obteniendo subrama por ID:', error);
    return null;
  }
};

export const createSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, data: CreateSubramaData): Promise<Subrama | null> => {
  // Creando nueva subrama — nombre disponible en `data`
  
  try {
  const endpoint = subgroupsPath(sectionId, tenantSlug, groupSlug);
    
    // Transformar datos del frontend al formato del backend
    const backendData = mapFrontendCreateSubramaToBackend(data);
    
    // Crear la subrama — endpoint y payload preparados
    const response = await api.post<BackendSubrama>(endpoint, backendData);
    const backendSubrama = response.data;

    const subrama = mapBackendSubramaToFrontend(backendSubrama);
  // Subrama creada: subrama.nombre || subrama.name
    return subrama;
    } catch (error: unknown) {
    console.error('❌ [SubramaService] Error creando subrama:', error);
    // Mostrar cuerpo de respuesta del backend si existe para diagnóstico
    if ((error as MaybeAxiosError)?.response?.data) {
      console.error('❌ [SubramaService] Respuesta del backend:', (error as MaybeAxiosError).response?.data);
    }
    throw error;
  }
};

export const updateSubrama = async (tenantSlug: string, groupSlug: string, data: UpdateSubramaData): Promise<Subrama | null> => {
  // Actualizando subrama: data.id
  
  try {
  // Prefer canonical branchId then legacy ramaId then section_id
  const maybe = data as unknown as Record<string, unknown>;
  const sectionId = (maybe['branchId'] as string | undefined) ?? (maybe['ramaId'] as string | undefined) ?? (maybe['section_id'] as string | undefined) ?? '';
    if (!sectionId) {
      throw new Error('ramaId/branchId es requerido para actualizar subrama');
    }
    
  const endpoint = subgroupPath(sectionId, data.id, tenantSlug, groupSlug);
    
    // Transformar datos del frontend al formato del backend
    const backendData = mapFrontendUpdateSubramaToBackend(data);
    // Actualizar la subrama — endpoint y payload preparados
    const response = await api.put<BackendSubrama>(endpoint, backendData);
    const backendSubrama = response.data;

    const subrama = mapBackendSubramaToFrontend(backendSubrama);
  // Subrama actualizada: subrama.nombre || subrama.name
    return subrama;
  } catch (error: unknown) {
    console.error('❌ [SubramaService] Error actualizando subrama:', error);
    if ((error as MaybeAxiosError)?.response?.data) {
      console.error('❌ [SubramaService] Respuesta del backend (update):', (error as MaybeAxiosError).response?.data);
    }
    throw error;
  }
};

export const deleteSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, id: string): Promise<boolean> => {
  // Eliminando subrama: id
  
  try {
    const endpoint = subgroupPath(sectionId, id, tenantSlug, groupSlug);
  await api.delete(endpoint);
    
  // Subrama eliminada
    return true;
  } catch (error: unknown) {
    console.error('❌ [SubramaService] Error eliminando subrama:', error);
    return false;
  }
};