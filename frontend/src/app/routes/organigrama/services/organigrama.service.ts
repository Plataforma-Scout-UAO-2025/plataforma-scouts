import type { Rama, CreateRamaData, UpdateRamaData, CreateSubramaData, UpdateSubramaData, Subrama } from '../types/rama.type';
import { apiClient } from './apiClient';
import { subirImagen } from './storage.service';
import { buildApiPath } from '../hooks/useTenantParams';
import {
  mapBackendRamaToFrontend,
  mapBackendSubramaToFrontend,
  mapFrontendCreateRamaToBackend,
  mapFrontendUpdateRamaToBackend,
  mapFrontendCreateSubramaToBackend
} from '../utils/mappers';

// CRUD para Ramas (SECTIONS)
export const getRamas = async (tenantSlug: string, groupSlug: string, año?: number): Promise<Rama[]> => {
  try {
    const endpoint = buildApiPath(tenantSlug, groupSlug, 'sections');
    const backendRamas = await apiClient.get<any[]>(endpoint);

    // Mapear datos del backend al formato del frontend (sin subramas todavía)
    const mappedRamas: Rama[] = backendRamas.map((backendRama) => {
      const mappedRama = mapBackendRamaToFrontend(backendRama);
      mappedRama.subramas = [];
      return mappedRama;
    });

    const subramasPromises = mappedRamas.map(async (rama) => {
      try {
  const subramas = await getSubramasByRamaId(tenantSlug, groupSlug, String(rama.section_id));
        return subramas;
      } catch (error) {
        console.warn(`⚠️ [OrganigramaService] Error cargando subramas para rama ${rama.id}:`, error);
        return [] as any[];
      }
    });

    const allSubramas = await Promise.all(subramasPromises);

    const ramas = mappedRamas.map((rama, idx) => {
      rama.subramas = allSubramas[idx] as any;
      // Rama mapped
      return rama;
    });
    
    const filteredRamas = año ? ramas.filter(rama => rama.año === año) : ramas;
    
    return filteredRamas;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error obteniendo ramas:', error);
    throw error;
  }
};

export const getRamaById = async (tenantSlug: string, groupSlug: string, id: string): Promise<Rama | null> => {
  try {
    console.log('🔄 [OrganigramaService] Obteniendo rama por ID del backend', { tenantSlug, groupSlug, id });
    
    const endpoint = buildApiPath(tenantSlug, groupSlug, 'sections', id);
    const backendRama = await apiClient.get<any>(endpoint);
    
    const rama = mapBackendRamaToFrontend(backendRama);
    
    // Intentar cargar subramas asociadas y anexarlas al objeto Rama
    try {
      const subramas = await getSubramasByRamaId(tenantSlug, groupSlug, String(rama.section_id));
      rama.subramas = subramas;
      console.log('✅ [OrganigramaService] Subramas anexadas a la rama', { id: rama.id, count: subramas.length });
    } catch (subErr) {
      console.warn('⚠️ [OrganigramaService] No se pudieron cargar subramas para la rama, devolviendo rama sin subramas', { id: rama.id, error: subErr });
      rama.subramas = [];
    }

    console.log('✅ [OrganigramaService] Rama obtenida exitosamente', { id: rama.id });
    return rama;
  } catch (error: any) {
    if (error?.status === 404) {
      console.warn('⚠️ [OrganigramaService] Rama no encontrada', { id });
      return null;
    }
    
    console.error('❌ [OrganigramaService] Error obteniendo rama por ID:', error);
    throw error;
  }
};

export const createRama = async (tenantSlug: string, groupSlug: string, data: CreateRamaData): Promise<Rama> => {
  try {
    console.log('🔄 [OrganigramaService] Creando nueva rama en backend', { tenantSlug, groupSlug, data });
    
    const endpoint = buildApiPath(tenantSlug, groupSlug, 'sections');
    const backendData = mapFrontendCreateRamaToBackend(data);
    
    const backendRama = await apiClient.post<any>(endpoint, backendData);
    const rama = mapBackendRamaToFrontend(backendRama);
    
    console.log('✅ [OrganigramaService] Rama creada exitosamente', { id: rama.id });
    return rama;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error creando rama:', error);
    throw error;
  }
};

export const updateRama = async (tenantSlug: string, groupSlug: string, data: UpdateRamaData): Promise<Rama | null> => {
  try {
    console.log('🔄 [OrganigramaService] Actualizando rama en backend', { tenantSlug, groupSlug, data });
    
    const endpoint = buildApiPath(tenantSlug, groupSlug, 'sections', data.id);
    const backendData = mapFrontendUpdateRamaToBackend(data);
    
    const backendRama = await apiClient.put<any>(endpoint, backendData);
    const rama = mapBackendRamaToFrontend(backendRama);
    
    console.log('✅ [OrganigramaService] Rama actualizada exitosamente', { id: rama.id });
    return rama;
  } catch (error: any) {
    if (error?.status === 404) {
      console.warn('⚠️ [OrganigramaService] Rama no encontrada para actualizar', { id: data.id });
      return null;
    }
    
    console.error('❌ [OrganigramaService] Error actualizando rama:', error);
    throw error;
  }
};

export const deleteRama = async (tenantSlug: string, groupSlug: string, id: string): Promise<boolean> => {
  try {
    console.log('🔄 [OrganigramaService] Eliminando rama en backend', { tenantSlug, groupSlug, id });
    
    const endpoint = buildApiPath(tenantSlug, groupSlug, 'sections', id);
    await apiClient.delete(endpoint);
    
    console.log('✅ [OrganigramaService] Rama eliminada exitosamente', { id });
    return true;
  } catch (error: any) {
    if (error?.status === 404) {
      console.warn('⚠️ [OrganigramaService] Rama no encontrada para eliminar', { id });
      return false;
    }
    
    console.error('❌ [OrganigramaService] Error eliminando rama:', error);
    throw error;
  }
};

// CRUD para Subramas (SUBGROUPS)
export const getSubramasByRamaId = async (tenantSlug: string, groupSlug: string, sectionId: string): Promise<Subrama[]> => {
  try {
    console.log('🔄 [OrganigramaService] Obteniendo subramas por section ID del backend', { tenantSlug, groupSlug, sectionId });
    
    const endpoint = buildApiPath(tenantSlug, groupSlug, 'sections', sectionId, 'subgroups');
    const backendSubramas = await apiClient.get<any[]>(endpoint);
    
    // Mapear datos del backend al formato del frontend
    const subramas = backendSubramas.map(mapBackendSubramaToFrontend);
    
    console.log('✅ [OrganigramaService] Subramas obtenidas exitosamente', { sectionId, count: subramas.length });
    return subramas;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error obteniendo subramas:', error);
    throw error;
  }
};

export const createSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, data: CreateSubramaData): Promise<Subrama | null> => {
  try {
    console.log('🔄 [OrganigramaService] Creando nueva subrama en backend', { tenantSlug, groupSlug, sectionId, data });
    
    const endpoint = buildApiPath(tenantSlug, groupSlug, 'sections', sectionId, 'subgroups');
    const backendData = mapFrontendCreateSubramaToBackend(data);
    
    const backendSubrama = await apiClient.post<any>(endpoint, backendData);
    const subrama = mapBackendSubramaToFrontend(backendSubrama);
    
    console.log('✅ [OrganigramaService] Subrama creada exitosamente', { id: subrama.id });
    return subrama;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error creando subrama:', error);
    throw error;
  }
};

export const updateSubrama = async (tenantSlug: string, groupSlug: string, data: UpdateSubramaData): Promise<Subrama | null> => {
  try {
    console.log('🔄 [OrganigramaService] Actualizando subrama en backend', { tenantSlug, groupSlug, data });
    
    const sectionId = data.ramaId;
    const subgroupId = data.subgroup_id || data.id;
    
    if (!sectionId) {
      throw new Error('SectionId no proporcionado');
    }
    
    const endpoint = buildApiPath(tenantSlug, groupSlug, 'sections', sectionId, 'subgroups', subgroupId);
    
    const backendData = {
      subgroupName: data.nombre,
      subgroupDescription: data.descripcion,
      subgroupGalleryObjectIds: [],
      isActive: data.estado === 'activa'
    };
    
    console.log('🔍 [OrganigramaService] Endpoint:', endpoint);
    console.log('🔍 [OrganigramaService] Backend data:', backendData);
    
    const backendSubrama = await apiClient.put<any>(endpoint, backendData);
    const subrama = mapBackendSubramaToFrontend(backendSubrama);
    
    console.log('✅ [OrganigramaService] Subrama actualizada exitosamente', { id: subrama.id });
    return subrama;
  } catch (error: any) {
    console.error('❌ [OrganigramaService] Error actualizando subrama:', error);
    throw error;
  }
};

export const deleteSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, id: string): Promise<boolean> => {
  try {
    console.log('🔄 [OrganigramaService] Eliminando subrama en backend', { tenantSlug, groupSlug, sectionId, id });
    
    const endpoint = buildApiPath(tenantSlug, groupSlug, 'sections', sectionId, 'subgroups', id);
    await apiClient.delete(endpoint);
    
    console.log('✅ [OrganigramaService] Subrama eliminada exitosamente', { id });
    return true;
  } catch (error: any) {
    if (error?.status === 404) {
      console.warn('⚠️ [OrganigramaService] Subrama no encontrada para eliminar', { id });
      return false;
    }
    
    console.error('❌ [OrganigramaService] Error eliminando subrama:', error);
    throw error;
  }
};

// Utility functions
export const getAvailableYears = async (tenantSlug: string, groupSlug: string): Promise<number[]> => {
  try {
    console.log('🔄 [OrganigramaService] Obteniendo años disponibles del backend');
    
    const ramas = await getRamas(tenantSlug, groupSlug);
    const years = Array.from(new Set(ramas.map(rama => rama.año))).sort((a, b) => b - a);
    
    console.log('✅ [OrganigramaService] Años disponibles obtenidos', { years });
    return years.length > 0 ? years : [new Date().getFullYear()];
  } catch (error) {
    console.error('❌ [OrganigramaService] Error obteniendo años disponibles:', error);
    return [new Date().getFullYear()];
  }
};

// Obtener una subrama por su ID
export const getSubramaById = async (tenantSlug: string, groupSlug: string, sectionId: string, id: string): Promise<Subrama | null> => {
  try {
    console.log('🔄 [OrganigramaService] Obteniendo subrama por ID del backend', { tenantSlug, groupSlug, sectionId, id });
    
    const endpoint = buildApiPath(tenantSlug, groupSlug, 'sections', sectionId, 'subgroups', id);
    const backendSubrama = await apiClient.get<any>(endpoint);
    
    const subrama = mapBackendSubramaToFrontend(backendSubrama);
    
    console.log('✅ [OrganigramaService] Subrama obtenida exitosamente', { id: subrama.id });
    return subrama;
  } catch (error: any) {
    if (error?.status === 404) {
      console.warn('⚠️ [OrganigramaService] Subrama no encontrada', { id });
      return null;
    }
    
    console.error('❌ [OrganigramaService] Error obteniendo subrama por ID:', error);
    throw error;
  }
};

// CRUD para Imágenes y Galería
export const uploadGalleryImages = async (
  tenantSlug: string, 
  groupSlug: string, 
  sectionId: string, 
  files: File[]
): Promise<string[]> => {
  try {
    console.log('🔄 [OrganigramaService] Subiendo imágenes de galería', { 
      tenantSlug, groupSlug, sectionId, filesCount: files.length 
    });
    
    const imageIds: string[] = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadEndpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/upload`;
      const response = await apiClient.postFormData<{ objectId: string }>(uploadEndpoint, formData);
      
      imageIds.push(response.objectId);
    }
    
    // Actualizar la galería de la sección
    const updateEndpoint = buildApiPath(tenantSlug, groupSlug, 'sections', sectionId);
    await apiClient.patch(updateEndpoint, {
      sectionGalleryObjectIds: imageIds
    });
    
    console.log('✅ [OrganigramaService] Imágenes de galería subidas exitosamente', { imageIds });
    return imageIds;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error subiendo imágenes de galería:', error);
    throw error;
  }
};

export const uploadSectionIcon = async (
  tenantSlug: string, 
  groupSlug: string, 
  sectionId: string, 
  file: File
): Promise<string> => {
  try {
    console.log('🔄 [OrganigramaService] Subiendo ícono de sección', { 
      tenantSlug, groupSlug, sectionId, fileName: file.name 
    });
    // Subir directamente a Supabase Storage usando el servicio local
    const fileId = await subirImagen(file);

    console.log('✅ [OrganigramaService] Ícono de sección subido a Supabase Storage', { fileId });
    return fileId;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error subiendo ícono de sección:', error);
    throw error;
  }
};