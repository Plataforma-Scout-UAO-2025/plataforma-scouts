import type { 
  Rama, 
  CreateRamaData, 
  UpdateRamaData, 
  CreateSubramaData, 
  UpdateSubramaData, 
  Subrama,
  BackendRama,
  BackendSubrama
} from '../types/rama.type';

import { apiClient } from './apiClient';
import { 
  mapBackendRamaToFrontend, 
  mapBackendSubramaToFrontend,
  mapFrontendCreateRamaToBackend, 
  mapFrontendUpdateRamaToBackend,
  mapFrontendCreateSubramaToBackend,
  mapFrontendUpdateSubramaToBackend
} from '../utils/mappers';

// Integración directa con backend real - NO MÁS MOCKS
console.log('🔄 [OrganigramaService] Iniciado en modo backend real');

// CRUD para Ramas (SECTIONS)
export const getRamas = async (tenantSlug: string, groupSlug: string, año?: number): Promise<Rama[]> => {
  console.log('🔄 [OrganigramaService] Obteniendo ramas del backend real');
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections`;
    console.log('🔄 [OrganigramaService] Haciendo request a:', endpoint);
    
    const backendRamas = await apiClient.get<BackendRama[]>(endpoint);
    
    // 🔍 LOG DETALLADO: Ver exactamente qué devuelve el backend
    console.log('📊 [Backend Response] Estructura completa recibida:');
    console.log('📊 [Backend Response] Cantidad de ramas:', backendRamas.length);
    if (backendRamas.length > 0) {
      console.log('📊 [Backend Response] Primera rama completa:', JSON.stringify(backendRamas[0], null, 2));
      console.log('📊 [Backend Response] Campos de imágenes en primera rama:');
      console.log('   - iconObjectUrl:', backendRamas[0].iconObjectUrl);
      console.log('   - photoPrincipalUrl:', backendRamas[0].photoPrincipalUrl);
      console.log('   - galleryObjectUrls:', backendRamas[0].galleryObjectUrls);
    }
    
    // Transformar datos del backend al formato frontend
    const ramas = backendRamas.map(mapBackendRamaToFrontend);
    
    // 🔄 PASO CRÍTICO: Hidratar cada rama con sus subramas
    console.log('🔄 [OrganigramaService] Hidratando ramas con sus subramas...');
    const ramasConSubramas = await Promise.all(
      ramas.map(async (rama) => {
        try {
          const subramas = await getSubramasByRamaId(tenantSlug, groupSlug, rama.id);
          return { ...rama, subramas };
        } catch (error) {
          console.warn(`⚠️ [OrganigramaService] No se pudieron cargar subramas para rama ${rama.nombre}:`, error);
          return { ...rama, subramas: [] };
        }
      })
    );
    
    // Filtrar por año si se especifica
    const ramasFiltradas = año ? ramasConSubramas.filter((rama: Rama) => rama.año === año) : ramasConSubramas;
    
    console.log('✅ [OrganigramaService] Ramas hidratadas con subramas:', ramasFiltradas.length);
    console.log('📊 [OrganigramaService] Subramas totales:', ramasFiltradas.reduce((total, rama) => total + rama.subramas.length, 0));
    return ramasFiltradas;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error obteniendo ramas:', error);
    throw error;
  }
};

export const getRamaById = async (tenantSlug: string, groupSlug: string, id: string): Promise<Rama | null> => {
  console.log('🔄 [OrganigramaService] Obteniendo rama por ID:', id);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${id}`;
    const backendRama = await apiClient.get<BackendRama>(endpoint);
    
    const rama = mapBackendRamaToFrontend(backendRama);
    
    // 🔄 Hidratar rama con sus subramas
    try {
      const subramas = await getSubramasByRamaId(tenantSlug, groupSlug, rama.id);
      rama.subramas = subramas;
      console.log('✅ [OrganigramaService] Rama obtenida con', subramas.length, 'subramas:', rama.nombre);
    } catch (subramaError) {
      console.warn(`⚠️ [OrganigramaService] No se pudieron cargar subramas para rama ${rama.nombre}:`, subramaError);
      rama.subramas = [];
    }
    
    return rama;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error obteniendo rama por ID:', error);
    return null;
  }
};

export const createRama = async (tenantSlug: string, groupSlug: string, data: CreateRamaData): Promise<Rama> => {
  console.log('🔄 [OrganigramaService] Creando nueva rama:', data.nombre);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections`;
    
    // Transformar datos del frontend al formato del backend
    const backendData = mapFrontendCreateRamaToBackend(data);
    
    // Crear la rama
    const backendRama = await apiClient.post<BackendRama>(endpoint, backendData);
    
    // Si hay archivos de imagen, subirlos después de crear la rama
    if (data.iconFile && backendRama.section_id) {
      await uploadSectionIcon(tenantSlug, groupSlug, backendRama.section_id, data.iconFile);
    }
    
    if (data.galleryFiles && data.galleryFiles.length > 0 && backendRama.section_id) {
      await uploadGalleryImages(tenantSlug, groupSlug, backendRama.section_id, data.galleryFiles);
    }
    
    const rama = mapBackendRamaToFrontend(backendRama);
    console.log('✅ [OrganigramaService] Rama creada:', rama.nombre);
    return rama;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error creando rama:', error);
    throw error;
  }
};

export const updateRama = async (tenantSlug: string, groupSlug: string, data: UpdateRamaData): Promise<Rama | null> => {
  console.log('🔄 [OrganigramaService] Actualizando rama:', data.id);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${data.id}`;
    
    // Transformar datos del frontend al formato del backend
    const backendData = mapFrontendUpdateRamaToBackend(data);
    
    // Actualizar la rama
    const backendRama = await apiClient.put<BackendRama>(endpoint, backendData);
    
    // Si hay archivos de imagen nuevos, subirlos
    if (data.iconFile) {
      await uploadSectionIcon(tenantSlug, groupSlug, data.id, data.iconFile);
    }
    
    if (data.galleryFiles && data.galleryFiles.length > 0) {
      await uploadGalleryImages(tenantSlug, groupSlug, data.id, data.galleryFiles);
    }
    
    const rama = mapBackendRamaToFrontend(backendRama);
    console.log('✅ [OrganigramaService] Rama actualizada:', rama.nombre);
    return rama;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error actualizando rama:', error);
    throw error;
  }
};

export const deleteRama = async (tenantSlug: string, groupSlug: string, id: string): Promise<boolean> => {
  console.log('🔄 [OrganigramaService] Eliminando rama:', id);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${id}`;
    await apiClient.delete(endpoint);
    
    console.log('✅ [OrganigramaService] Rama eliminada');
    return true;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error eliminando rama:', error);
    return false;
  }
};

// CRUD para Subramas (SUBGROUPS) - Solo implementar según el alcance del backend actual
export const getSubramasByRamaId = async (tenantSlug: string, groupSlug: string, ramaId: string): Promise<Subrama[]> => {
  console.log('🔄 [OrganigramaService] Obteniendo subramas de rama:', ramaId);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${ramaId}/subgroups`;
    const backendSubramas = await apiClient.get<BackendSubrama[]>(endpoint);
    
    const subramas = backendSubramas.map(mapBackendSubramaToFrontend);
    console.log('✅ [OrganigramaService] Subramas obtenidas:', subramas.length);
    return subramas;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error obteniendo subramas:', error);
    throw error;
  }
};

export const getSubramaById = async (tenantSlug: string, groupSlug: string, sectionId: string, id: string): Promise<Subrama | null> => {
  console.log('🔄 [OrganigramaService] Obteniendo subrama por ID:', id);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${id}`;
    const backendSubrama = await apiClient.get<BackendSubrama>(endpoint);
    
    const subrama = mapBackendSubramaToFrontend(backendSubrama);
    console.log('✅ [OrganigramaService] Subrama obtenida:', subrama.nombre);
    return subrama;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error obteniendo subrama por ID:', error);
    return null;
  }
};

export const createSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, data: CreateSubramaData): Promise<Subrama | null> => {
  console.log('🔄 [OrganigramaService] Creando nueva subrama:', data.nombre);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups`;
    
    // Transformar datos del frontend al formato del backend
    const backendData = mapFrontendCreateSubramaToBackend(data);
    
    // Crear la subrama
    const backendSubrama = await apiClient.post<BackendSubrama>(endpoint, backendData);
    
    const subrama = mapBackendSubramaToFrontend(backendSubrama);
    console.log('✅ [OrganigramaService] Subrama creada:', subrama.nombre);
    return subrama;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error creando subrama:', error);
    throw error;
  }
};

export const updateSubrama = async (tenantSlug: string, groupSlug: string, data: UpdateSubramaData): Promise<Subrama | null> => {
  console.log('🔄 [OrganigramaService] Actualizando subrama:', data.id);
  
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
    console.log('✅ [OrganigramaService] Subrama actualizada:', subrama.nombre);
    return subrama;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error actualizando subrama:', error);
    throw error;
  }
};

export const deleteSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, id: string): Promise<boolean> => {
  console.log('🔄 [OrganigramaService] Eliminando subrama:', id);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${id}`;
    await apiClient.delete(endpoint);
    
    console.log('✅ [OrganigramaService] Subrama eliminada');
    return true;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error eliminando subrama:', error);
    return false;
  }
};

// Funciones auxiliares
export const getAvailableYears = async (tenantSlug: string, groupSlug: string): Promise<number[]> => {
  console.log('🔄 [OrganigramaService] Obteniendo años disponibles');
  
  try {
    const ramas = await getRamas(tenantSlug, groupSlug);
    const years = [...new Set(ramas.map(rama => rama.año).filter(año => año !== undefined && año !== null))];
    const sortedYears = years.sort((a, b) => b - a);
    
    console.log('✅ [OrganigramaService] Años disponibles:', sortedYears);
    return sortedYears;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error obteniendo años:', error);
    return [];
  }
};

// Funciones de carga de archivos - Implementación de dos pasos según backend
export const uploadSectionIcon = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<string> => {
  console.log('📤 [OrganigramaService] Subiendo icono de sección...');
  
  try {
    // Paso 1: Subir archivo al sistema de archivos
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    
    // Paso 2: Por ahora NO asociamos con la sección debido a limitaciones del backend
    // TODO: Cuando el backend esté listo, descomentar estas líneas:
    /*
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}`;
    await apiClient.patch(endpoint, { iconObjectId: uploadResponse.objectId });
    */
    
    console.log('✅ [OrganigramaService] Icono de sección subido con éxito (solo upload, sin asociación por ahora)');
    console.log('📝 [OrganigramaService] ObjectId guardado:', uploadResponse.objectId);
    
    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error subiendo icono:', error);
    throw error;
  }
};

// Nueva función específica para imagen principal
export const uploadSectionMainImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<string> => {
  console.log('📤 [OrganigramaService] Subiendo imagen principal de sección...');
  
  try {
    // Paso 1: Subir archivo al sistema de archivos
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    
    // Paso 2: Por ahora NO asociamos con la sección debido a limitaciones del backend
    // TODO: Cuando el backend esté listo, usar el campo correcto para imagen principal:
    /*
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}`;
    await apiClient.patch(endpoint, { photoPrincipalObjectId: uploadResponse.objectId });
    */
    
    console.log('✅ [OrganigramaService] Imagen principal subida con éxito (solo upload, sin asociación por ahora)');
    console.log('📝 [OrganigramaService] ObjectId de imagen principal:', uploadResponse.objectId);
    
    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error subiendo imagen principal:', error);
    throw error;
  }
};

export const uploadGalleryImages = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  files: File[]
): Promise<string[]> => {
  console.log('📤 [OrganigramaService] Subiendo imágenes de galería...');
  
  try {
    const objectIds: string[] = [];
    const urls: string[] = [];
    
    // Subir cada archivo individualmente
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
      objectIds.push(uploadResponse.objectId);
      urls.push(uploadResponse.url || uploadResponse.objectId);
    }
    
    // Por ahora NO asociamos con la sección debido a limitaciones del backend
    // TODO: Cuando el backend esté listo, descomentar estas líneas:
    /*
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}`;
    await apiClient.patch(endpoint, { galleryObjectIds: objectIds });
    */
    
    console.log('✅ [OrganigramaService] Imágenes de galería subidas con éxito (solo upload, sin asociación por ahora)');
    console.log('📝 [OrganigramaService] ObjectIds guardados:', objectIds);
    
    return urls; // Retornar URLs para mostrar inmediatamente
  } catch (error) {
    console.error('❌ [OrganigramaService] Error subiendo galería:', error);
    throw error;
  }
};

// 🧹 Función de limpieza no aplicable al backend real
export const clearAllStorageData = (): void => {
  console.warn('clearAllStorageData no está disponible en modo backend real');
};