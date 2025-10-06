import type { 
  Subrama,
  CreateSubramaData, 
  UpdateSubramaData, 
  BackendSubrama
} from '../types/rama.type';

import { apiClient } from './apiClient';
import { 
  mapBackendSubramaToFrontend,
  mapFrontendCreateSubramaToBackend,
  mapFrontendUpdateSubramaToBackend
} from '../utils/mappers';

// CRUD para Subramas (SUBGROUPS)
export const getSubramasByRamaId = async (tenantSlug: string, groupSlug: string, ramaId: string): Promise<Subrama[]> => {
  console.log('🔄 [SubramaService] Obteniendo subramas de rama:', ramaId);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${ramaId}/subgroups`;
    const backendSubramas = await apiClient.get<BackendSubrama[]>(endpoint);
    
    const subramas = backendSubramas.map(mapBackendSubramaToFrontend);
    console.log('✅ [SubramaService] Subramas obtenidas:', subramas.length);
    return subramas;
  } catch (error) {
    console.error('❌ [SubramaService] Error obteniendo subramas:', error);
    throw error;
  }
};

export const getSubramaById = async (tenantSlug: string, groupSlug: string, sectionId: string, id: string): Promise<Subrama | null> => {
  console.log('🔄 [SubramaService] Obteniendo subrama por ID:', id);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${id}`;
    const backendSubrama = await apiClient.get<BackendSubrama>(endpoint);
    
    const subrama = mapBackendSubramaToFrontend(backendSubrama);
    console.log('✅ [SubramaService] Subrama obtenida:', subrama.nombre);
    return subrama;
  } catch (error) {
    console.error('❌ [SubramaService] Error obteniendo subrama por ID:', error);
    return null;
  }
};

export const createSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, data: CreateSubramaData): Promise<Subrama | null> => {
  console.log('🔄 [SubramaService] Creando nueva subrama:', data.nombre);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups`;
    
    // Transformar datos del frontend al formato del backend
    const backendData = mapFrontendCreateSubramaToBackend(data);
    
    // Crear la subrama
    const backendSubrama = await apiClient.post<BackendSubrama>(endpoint, backendData);
    
    const subrama = mapBackendSubramaToFrontend(backendSubrama);
    console.log('✅ [SubramaService] Subrama creada:', subrama.nombre);
    return subrama;
  } catch (error) {
    console.error('❌ [SubramaService] Error creando subrama:', error);
    throw error;
  }
};

export const updateSubrama = async (tenantSlug: string, groupSlug: string, data: UpdateSubramaData): Promise<Subrama | null> => {
  console.log('🔄 [SubramaService] Actualizando subrama:', data.id);
  
  try {
    if (!data.ramaId) {
      throw new Error('ramaId es requerido para actualizar subrama');
    }
    
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${data.ramaId}/subgroups/${data.id}`;
    
    // Transformar datos del frontend al formato del backend
    const backendData = mapFrontendUpdateSubramaToBackend(data);
    
    // Actualizar la subrama
    const backendSubrama = await apiClient.put<BackendSubrama>(endpoint, backendData);
    
    const subrama = mapBackendSubramaToFrontend(backendSubrama);
    console.log('✅ [SubramaService] Subrama actualizada:', subrama.nombre);
    return subrama;
  } catch (error) {
    console.error('❌ [SubramaService] Error actualizando subrama:', error);
    throw error;
  }
};

export const deleteSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, id: string): Promise<boolean> => {
  console.log('🔄 [SubramaService] Eliminando subrama:', id);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${id}`;
    await apiClient.delete(endpoint);
    
    console.log('✅ [SubramaService] Subrama eliminada');
    return true;
  } catch (error) {
    console.error('❌ [SubramaService] Error eliminando subrama:', error);
    return false;
  }
};