import type { 
  Subgroup as Subrama,
  CreateSubgroupData as CreateSubramaData, 
  UpdateSubgroupData as UpdateSubramaData, 
} from '../types/frontend';
import type { BackendSubgroup as BackendSubrama } from '../types/backend';

import api from "@/api/axios";
import { 
  mapBackendSubramaToFrontend,
  mapFrontendCreateSubramaToBackend,
  mapFrontendUpdateSubramaToBackend
} from '../utils/mappers';

// CRUD para Subramas (SUBGROUPS)
export const getSubramasByRamaId = async (tenantSlug: string, groupSlug: string, ramaId: string): Promise<Subrama[]> => {
  const normalizedRamaId = typeof ramaId === 'string' ? ramaId.trim() : String(ramaId ?? '').trim();
  console.log('🔄 [SubramaService] Obteniendo subramas de rama:', normalizedRamaId || '(sin id)');

  if (!normalizedRamaId) {
    console.warn('⚠️ [SubramaService] Rama sin ID válido, se omite la consulta de subramas.');
    return [];
  }

  try {
    const endpoint = `/tenants/${tenantSlug}/groups/${groupSlug}/sections/${encodeURIComponent(normalizedRamaId)}/subgroups`;
    const response = await api.get<BackendSubrama[]>(endpoint);
    const backendSubramas = response.data;

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
    const endpoint = `/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${id}`;
    const response = await api.get<BackendSubrama>(endpoint);
    const backendSubrama = response.data;

    const subrama = mapBackendSubramaToFrontend(backendSubrama);
  console.log('✅ [SubramaService] Subrama obtenida:', subrama.nombre ?? subrama.name);
    return subrama;
  } catch (error) {
    console.error('❌ [SubramaService] Error obteniendo subrama por ID:', error);
    return null;
  }
};

export const createSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, data: CreateSubramaData): Promise<Subrama | null> => {
  const maybe = data as unknown as Record<string, unknown>;
  const displayName = (maybe['nombre'] as string | undefined) ?? data.name;
  console.log('🔄 [SubramaService] Creando nueva subrama:', displayName);
  
  try {
  const endpoint = `/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups`;
    
    // Transformar datos del frontend al formato del backend
    const backendData = mapFrontendCreateSubramaToBackend(data);
    
    // Crear la subrama
    console.log('📤 [SubramaService] Endpoint a POST:', endpoint);
    try {
      console.log('📤 [SubramaService] Payload a enviar:', JSON.stringify(backendData, null, 2));
    } catch (e) {
      console.log('📤 [SubramaService] Payload (no serializable):', backendData);
    }
    const response = await api.post<BackendSubrama>(endpoint, backendData);
    const backendSubrama = response.data;

    const subrama = mapBackendSubramaToFrontend(backendSubrama);
  console.log('✅ [SubramaService] Subrama creada:', subrama.nombre ?? subrama.name);
    return subrama;
  } catch (error: any) {
    console.error('❌ [SubramaService] Error creando subrama:', error);
    // Mostrar cuerpo de respuesta del backend si existe para diagnóstico
    if (error?.response?.data) {
      console.error('❌ [SubramaService] Respuesta del backend:', error.response.data);
    }
    throw error;
  }
};

export const updateSubrama = async (tenantSlug: string, groupSlug: string, data: UpdateSubramaData): Promise<Subrama | null> => {
  console.log('🔄 [SubramaService] Actualizando subrama:', data.id);
  
  try {
  // Prefer canonical branchId then legacy ramaId then section_id
  const maybe = data as unknown as Record<string, unknown>;
  const sectionId = (maybe['branchId'] as string | undefined) ?? (maybe['ramaId'] as string | undefined) ?? (maybe['section_id'] as string | undefined) ?? '';
    if (!sectionId) {
      throw new Error('ramaId/branchId es requerido para actualizar subrama');
    }
    
    const endpoint = `/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${data.id}`;
    
    // Transformar datos del frontend al formato del backend
    const backendData = mapFrontendUpdateSubramaToBackend(data);
    
    // Actualizar la subrama
    const response = await api.put<BackendSubrama>(endpoint, backendData);
    const backendSubrama = response.data;

    const subrama = mapBackendSubramaToFrontend(backendSubrama);
  console.log('✅ [SubramaService] Subrama actualizada:', subrama.nombre ?? subrama.name);
    return subrama;
  } catch (error) {
    console.error('❌ [SubramaService] Error actualizando subrama:', error);
    throw error;
  }
};

export const deleteSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, id: string): Promise<boolean> => {
  console.log('🔄 [SubramaService] Eliminando subrama:', id);
  
  try {
    const endpoint = `/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${id}`;
  await api.delete(endpoint);
    
    console.log('✅ [SubramaService] Subrama eliminada');
    return true;
  } catch (error) {
    console.error('❌ [SubramaService] Error eliminando subrama:', error);
    return false;
  }
};