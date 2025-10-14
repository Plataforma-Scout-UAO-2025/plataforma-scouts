import type { 
  Subgroup as Subrama,
  CreateSubgroupData as CreateSubramaData, 
  UpdateSubgroupData as UpdateSubramaData, 
} from '../types/frontend';

import api from "@/api/axios";
import { subgroupsPath, subgroupPath } from '@/api/organigramaApi';
import { 
  mapBackendSubramaToFrontend,
  mapFrontendCreateSubramaToBackend,
  mapFrontendUpdateSubramaToBackend
} from '../utils/mappers';
import type { SubgroupDTO } from '../types/api';

type MaybeAxiosError = { response?: { data?: unknown; status?: number }; status?: number; code?: string };

export const getSubramasByRamaId = async (tenantSlug: string, groupSlug: string, ramaId: string): Promise<Subrama[]> => {
  const normalizedRamaId = typeof ramaId === 'string' ? ramaId.trim() : String(ramaId ?? '').trim();

  if (!normalizedRamaId) {
    console.warn(' [SubramaService] Rama sin ID válido, se omite la consulta de subramas.');
    return [];
  }

  try {
  const endpoint = subgroupsPath(normalizedRamaId, tenantSlug, groupSlug);
  const response = await api.get<SubgroupDTO[]>(endpoint);
    const backendSubramas = response.data;

  const subramas = backendSubramas.map(mapBackendSubramaToFrontend);
  return subramas;
  } catch (error) {
    console.error(' [SubramaService] Error obteniendo subramas:', error);
    throw error;
  }
};

export const getSubramaById = async (tenantSlug: string, groupSlug: string, sectionId: string, id: string): Promise<Subrama | null> => {
  
  try {
  const endpoint = subgroupPath(sectionId, id, tenantSlug, groupSlug);
  const response = await api.get<SubgroupDTO>(endpoint);
    const backendSubrama = response.data;

    const subrama = mapBackendSubramaToFrontend(backendSubrama);
    return subrama;
  } catch (error) {
    console.error(' [SubramaService] Error obteniendo subrama por ID:', error);
    return null;
  }
};

export const createSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, data: CreateSubramaData): Promise<Subrama | null> => {
  
  try {
  const endpoint = subgroupsPath(sectionId, tenantSlug, groupSlug);
    
    const backendData = mapFrontendCreateSubramaToBackend(data);
    
  const response = await api.post<SubgroupDTO>(endpoint, backendData);
  const backendSubrama = response.data;

    const subrama = mapBackendSubramaToFrontend(backendSubrama);
    return subrama;
    } catch (error: unknown) {
    console.error(' [SubramaService] Error creando subrama:', error);
    if ((error as MaybeAxiosError)?.response?.data) {
      console.error(' [SubramaService] Respuesta del backend:', (error as MaybeAxiosError).response?.data);
    }
    throw error;
  }
};

export const updateSubrama = async (tenantSlug: string, groupSlug: string, data: UpdateSubramaData): Promise<Subrama | null> => {
  
  try {
  const maybe = data as unknown as Record<string, unknown>;
  const sectionId = (maybe['branchId'] as string | undefined) ?? (maybe['ramaId'] as string | undefined) ?? (maybe['section_id'] as string | undefined) ?? '';
    if (!sectionId) {
      throw new Error('ramaId/branchId es requerido para actualizar subrama');
    }
    
  const endpoint = subgroupPath(sectionId, data.id, tenantSlug, groupSlug);
    
    const backendData = mapFrontendUpdateSubramaToBackend(data);
  const response = await api.put<SubgroupDTO>(endpoint, backendData);
  const backendSubrama = response.data;

    const subrama = mapBackendSubramaToFrontend(backendSubrama);
    return subrama;
  } catch (error: unknown) {
    console.error(' [SubramaService] Error actualizando subrama:', error);
    if ((error as MaybeAxiosError)?.response?.data) {
      console.error(' [SubramaService] Respuesta del backend (update):', (error as MaybeAxiosError).response?.data);
    }
    throw error;
  }
};

export const deleteSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, id: string): Promise<boolean> => {
  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const endpoint = subgroupPath(sectionId, id, tenantSlug, groupSlug);
      console.debug('[SubramaService] DELETE endpoint:', endpoint, { attempt });
      await api.delete(endpoint);
      return true;
    } catch (error: unknown) {
      console.error(' [SubramaService] Error eliminando subrama (attempt ' + attempt + '):', error);
      try {
        const maybe = error as MaybeAxiosError;
        if (maybe.response && maybe.response.data) {
          console.error(' [SubramaService] Respuesta del backend (delete):', maybe.response.data);
        }
      } catch (errLogging) {
        // Log the secondary error to avoid unused-variable lint issues
        console.debug(' [SubramaService] Secondary logging error:', errLogging);
      }

      const maybe = error as MaybeAxiosError;
      const status = maybe?.response?.status ?? maybe?.status;
      const isServerError = status === 500 || maybe?.code === 'ERR_BAD_RESPONSE';

      if (attempt < maxRetries && isServerError) {
        const delayMs = 300 * (attempt + 1);
        console.debug(`[SubramaService] Retry delete in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((res) => setTimeout(res, delayMs));
        continue;
      }

      throw error;
    }
  }
  return false;
};