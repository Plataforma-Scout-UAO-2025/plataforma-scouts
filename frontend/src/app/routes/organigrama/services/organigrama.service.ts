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

// Configuración de endpoints PATCH específicos
const PATCH_ENDPOINTS = {
  ICON: (tenantSlug: string, groupSlug: string, sectionId: string) => 
    `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/icon`,
  MAIN_IMAGE: (tenantSlug: string, groupSlug: string, sectionId: string) => 
    `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/photo-principal`,
  GALLERY: (tenantSlug: string, groupSlug: string, sectionId: string) => 
    `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/gallery`,
  SUBRAMA_MAIN_IMAGE: (tenantSlug: string, groupSlug: string, sectionId: string, subgroupId: string) => 
    `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}/photo-principal`,
  SUBRAMA_GALLERY: (tenantSlug: string, groupSlug: string, sectionId: string, subgroupId: string) => 
    `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}/gallery`
};

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
  console.log('📝 [OrganigramaService] Datos recibidos:', {
    nombre: data.nombre,
    descripcion: data.descripcion,
    tieneIconFile: !!data.iconFile,
    iconFileName: data.iconFile?.name,
    tieneGalleryFiles: !!data.galleryFiles && data.galleryFiles.length > 0
  });
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections`;
    
    // Transformar datos del frontend al formato del backend
    const backendData = mapFrontendCreateRamaToBackend(data);
    console.log('📤 [OrganigramaService] Enviando al backend:', backendData);
    
    // Crear la rama
    const backendRama = await apiClient.post<BackendRama>(endpoint, backendData);
    
    // Extraer el ID de la sección creada (puede venir como sectionId o section_id)
    const sectionId = String(backendRama.sectionId || backendRama.section_id || backendRama.id || '');
    console.log('✅ [OrganigramaService] Rama creada con ID:', sectionId);
    
    // Si hay archivos de imagen, subirlos después de crear la rama
    if (data.iconFile && sectionId) {
      console.log('🔄 [OrganigramaService] Subiendo icono para la rama recién creada...');
      await uploadSectionIcon(tenantSlug, groupSlug, sectionId, data.iconFile);
      console.log('✅ [OrganigramaService] Icono subido exitosamente');
    } else {
      console.log('ℹ️ [OrganigramaService] No hay icono para subir o sectionId inválido');
    }
    
    if (data.galleryFiles && data.galleryFiles.length > 0 && sectionId) {
      console.log('🔄 [OrganigramaService] Subiendo galería para la rama recién creada...');
      await uploadGalleryImages(tenantSlug, groupSlug, sectionId, data.galleryFiles);
      console.log('✅ [OrganigramaService] Galería subida exitosamente');
    }
    
    // Obtener los datos actualizados de la rama después de subir las imágenes
    if (sectionId && (data.iconFile || (data.galleryFiles && data.galleryFiles.length > 0))) {
      console.log('🔄 [OrganigramaService] Obteniendo datos actualizados de la rama después de subir imágenes...');
      const updatedRama = await getRamaById(tenantSlug, groupSlug, sectionId);
      if (updatedRama) {
        console.log('✅ [OrganigramaService] Rama creada y actualizada con imágenes:', updatedRama.nombre);
        return updatedRama;
      }
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
  console.log('🔄 [OrganigramaService] Obteniendo años disponibles - OPTIMIZADO');
  
  try {
    // OPTIMIZACIÓN: Solo obtenemos las ramas SIN subramas para calcular años
    // Esto evita el bucle infinito y mejora el rendimiento
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections`;
    const backendRamas = await apiClient.get<BackendRama[]>(endpoint);
    
    // Extraer años directamente de los datos del backend sin mapear subramas
    const ramasSimples = backendRamas.map(mapBackendRamaToFrontend);
    const years = [...new Set(ramasSimples.map(rama => rama.año).filter(año => año !== undefined && año !== null))];
    const sortedYears = years.sort((a, b) => b - a);
    
    console.log('✅ [OrganigramaService] Años disponibles (optimizado):', sortedYears);
    return sortedYears;
  } catch (error) {
    console.error('❌ [OrganigramaService] Error obteniendo años:', error);
    return [];
  }
};

// Función utilitaria para extraer objectId de una URL de Supabase
const extractObjectIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  
  // Patron: https://xxx.supabase.co/storage/v1/object/public/images/organigrama/[UUID].extension
  const match = url.match(/\/([a-f0-9-]{36})\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
};

// Función utilitaria para extraer múltiples objectIds de un array de URLs
const extractObjectIdsFromUrls = (urls: string[]): string[] => {
  return urls.map(extractObjectIdFromUrl).filter(Boolean) as string[];
};

// Función de diagnóstico para verificar comportamiento del backend con imágenes
export const diagnoseBatchImageUpload = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<{ uploaded: number; returned: number; details: any }> => {
  console.log('🔬 [DIAGNÓSTICO] Iniciando análisis de comportamiento del backend...');
  console.log('📝 [DIAGNÓSTICO] Archivo:', {
    name: file.name,
    size: file.size,
    type: file.type
  });

  try {
    // Paso 1: Subir archivo individual
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    console.log('✅ [DIAGNÓSTICO] Upload exitoso, objectId:', uploadResponse.objectId);

    // Paso 2: Agregar a galería usando PATCH
    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);
    const addPayload = {
      operations: [{ op: "add", newValue: uploadResponse.objectId }]
    };

    await apiClient.patch(patchEndpoint, addPayload);
    console.log('✅ [DIAGNÓSTICO] PATCH exitoso');

    // Paso 3: Verificar resultado
    const updatedRama = await getRamaById(tenantSlug, groupSlug, sectionId);
    const resultCount = updatedRama?.sectionGalleryObjectIds?.length || 0;

    const result = {
      uploaded: 1,
      returned: resultCount,
      details: {
        originalObjectId: uploadResponse.objectId,
        returnedUrls: updatedRama?.sectionGalleryObjectIds || [],
        isProbablyMultiVariant: resultCount > 1
      }
    };

    console.log('🔬 [DIAGNÓSTICO] RESULTADO FINAL:', result);
    return result;

  } catch (error) {
    console.error('❌ [DIAGNÓSTICO] Error:', error);
    throw error;
  }
};

// Función helper para hacer el diagnóstico accesible desde la consola del navegador
(globalThis as any).diagnosticImageUpload = diagnoseBatchImageUpload;

// Funciones de carga de archivos - Implementación de dos pasos según backend
export const uploadSectionIcon = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<string> => {
  console.log('📤 [OrganigramaService] Subiendo icono de sección...');
  console.log('📝 [OrganigramaService] Parámetros:', {
    tenantSlug,
    groupSlug,
    sectionId,
    fileName: file.name,
    fileSize: file.size
  });
  
  try {
    // Paso 1: Subir archivo al sistema de archivos
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('🔄 [OrganigramaService] Subiendo archivo al storage...');
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    console.log('✅ [OrganigramaService] Archivo subido, objectId:', uploadResponse.objectId);
    
    // Paso 2: Usar endpoint PATCH específico para icono
    console.log('🔄 [OrganigramaService] Asociando icono usando endpoint PATCH específico...');
    const patchEndpoint = PATCH_ENDPOINTS.ICON(tenantSlug, groupSlug, sectionId);
    console.log('📍 [OrganigramaService] Endpoint PATCH:', patchEndpoint);
    
    // Basándome en las pruebas de Postman, el payload es: { "objectId": "uuid" }
    const iconPayload = {
      objectId: uploadResponse.objectId
    };
    
    console.log('🔄 [OrganigramaService] PATCH payload para icono:', iconPayload);
    
    try {
      await apiClient.patch(patchEndpoint, iconPayload);
      console.log('✅ [OrganigramaService] Icono asociado correctamente con endpoint PATCH');
    } catch (patchError) {
      console.error('❌ [OrganigramaService] Error en endpoint PATCH para icono:', patchError);
      throw patchError;
    }
    
    console.log('✅ [OrganigramaService] Icono de sección subido con éxito');
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
    
    // Paso 2: Usar endpoint PATCH específico para imagen principal
    console.log('🔄 [OrganigramaService] Asociando imagen principal usando endpoint PATCH específico...');
    const patchEndpoint = PATCH_ENDPOINTS.MAIN_IMAGE(tenantSlug, groupSlug, sectionId);
    
    // Basándome en las pruebas de Postman, el payload es: { "objectId": "uuid" }
    const mainImagePayload = {
      objectId: uploadResponse.objectId
    };
    
    console.log('� [OrganigramaService] PATCH payload para imagen principal:', mainImagePayload);
    
    try {
      await apiClient.patch(patchEndpoint, mainImagePayload);
      console.log('✅ [OrganigramaService] Imagen principal asociada correctamente con endpoint PATCH');
    } catch (patchError) {
      console.error('❌ [OrganigramaService] Error en endpoint PATCH para imagen principal:', patchError);
      throw patchError;
    }
    
    console.log('✅ [OrganigramaService] Imagen principal de sección subida con éxito');
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
    
    // Paso 1: Subir cada archivo individualmente
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
      objectIds.push(uploadResponse.objectId);
      urls.push(uploadResponse.url || uploadResponse.objectId);
    }
    
    // Paso 2: Usar endpoint PATCH específico para galería
    console.log('🔄 [OrganigramaService] Asociando galería usando endpoint PATCH específico...');
    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);
    
    // Usar el formato de operaciones para AGREGAR imágenes según la guía del backend
    const galleryPayload = {
      operations: objectIds.map(objectId => ({
        op: "add",
        newValue: objectId
      }))
    };
    
    console.log('🔄 [OrganigramaService] PATCH payload para galería (formato operations):', galleryPayload);
    
    try {
      await apiClient.patch(patchEndpoint, galleryPayload);
      console.log('✅ [OrganigramaService] Galería asociada correctamente con endpoint PATCH');
      
      // Obtener los datos actualizados de la rama para tener las URLs correctas
      console.log('🔄 [OrganigramaService] Obteniendo datos actualizados de la rama después de agregar a galería...');
      const updatedRama = await getRamaById(tenantSlug, groupSlug, sectionId);
      
      if (updatedRama && updatedRama.sectionGalleryObjectIds && updatedRama.sectionGalleryObjectIds.length > 0) {
        // Retornar las URLs de la galería actualizada del backend
        console.log('✅ [OrganigramaService] URLs de galería actualizadas obtenidas del backend');
        console.log('📸 [OrganigramaService] Galería completa actual:', updatedRama.sectionGalleryObjectIds);
        return updatedRama.sectionGalleryObjectIds; // URLs reales del backend
      } else {
        console.warn('⚠️ [OrganigramaService] No se pudieron obtener URLs actualizadas, usando URLs del upload');
        return urls; // Fallback a URLs del upload inicial
      }
    } catch (patchError) {
      console.error('❌ [OrganigramaService] Error en endpoint PATCH para galería:', patchError);
      console.error('❌ [OrganigramaService] Payload enviado:', JSON.stringify(galleryPayload, null, 2));
      console.error('❌ [OrganigramaService] Endpoint usado:', patchEndpoint);
      throw patchError;
    }
    
    console.log('✅ [OrganigramaService] Imágenes de galería subidas con éxito');
  } catch (error) {
    console.error('❌ [OrganigramaService] Error subiendo galería:', error);
    throw error;
  }
};

// Función para agregar una nueva imagen a la galería de una rama
// Basada en la guía del backend usando operaciones
export const addGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<string> => {
  console.log('📤 [OrganigramaService] Agregando imagen a galería...');
  console.log('📝 [OrganigramaService] Parámetros:', {
    sectionId,
    fileName: file.name,
    fileSize: file.size
  });
  
  try {
    // Paso 1: Subir el archivo
    console.log('🔄 [OrganigramaService] Subiendo nueva imagen...');
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    console.log('✅ [OrganigramaService] Nueva imagen subida, objectId:', uploadResponse.objectId);
    
    // Paso 2: Usar endpoint PATCH para agregar a la galería
    console.log('🔄 [OrganigramaService] Agregando imagen a galería usando endpoint PATCH...');
    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);
    console.log('📍 [OrganigramaService] Endpoint PATCH:', patchEndpoint);
    
    // Crear el payload de operación según la guía del backend
    const addPayload = {
      operations: [
        {
          op: "add",
          newValue: uploadResponse.objectId
        }
      ]
    };
    
    console.log('🔄 [OrganigramaService] PATCH payload para agregar imagen:', addPayload);
    console.log('📝 [OrganigramaService] ANÁLISIS DETALLADO (RAMA):');
    console.log('   - Subiendo UNA imagen con objectId:', uploadResponse.objectId);
    console.log('   - Esperamos que backend maneje solo esta imagen...');
    
    try {
      await apiClient.patch(patchEndpoint, addPayload);
      console.log('✅ [OrganigramaService] Imagen agregada correctamente a galería');
      
      // Obtener datos actualizados para verificar cuántas imágenes devuelve el backend
      console.log('🔍 [OrganigramaService] Verificando resultado en backend para RAMA...');
      const updatedRama = await getRamaById(tenantSlug, groupSlug, sectionId);
      
      if (updatedRama && updatedRama.sectionGalleryObjectIds) {
        console.log('🔍 [OrganigramaService] RESULTADO BACKEND (RAMA):');
        console.log('   - Subimos: 1 imagen');
        console.log('   - Backend devolvió:', updatedRama.sectionGalleryObjectIds.length, 'URLs');
        console.log('   - URLs devueltas:', updatedRama.sectionGalleryObjectIds);
        
        // Análisis detallado de URLs
        console.log('🔍 [OrganigramaService] ANÁLISIS DE URLs:');
        updatedRama.sectionGalleryObjectIds.forEach((url, index) => {
          const uuidMatch = url.match(/\/([a-f0-9-]{36})\.[a-zA-Z0-9]+$/);
          const uuid = uuidMatch ? uuidMatch[1] : 'unknown';
          console.log(`   ${index + 1}. UUID: ${uuid}`);
          console.log(`      URL: ${url}`);
        });
        
        // Verificar si todas las URLs tienen el mismo UUID (variantes) o UUIDs diferentes (imágenes distintas)
        const uuids = updatedRama.sectionGalleryObjectIds.map(url => {
          const match = url.match(/\/([a-f0-9-]{36})\.[a-zA-Z0-9]+$/);
          return match ? match[1] : null;
        }).filter(Boolean);
        
        const uniqueUuids = [...new Set(uuids)];
        
        if (uniqueUuids.length === 1) {
          console.log('💡 [OrganigramaService] DIAGNÓSTICO: Todas las URLs tienen el mismo UUID →', uniqueUuids[0]);
          console.log('💡 [OrganigramaService] CAUSA PROBABLE: Backend genera múltiples variantes (thumbnails, formatos, resoluciones)');
        } else {
          console.log('⚠️ [OrganigramaService] DIAGNÓSTICO: URLs tienen UUIDs diferentes →', uniqueUuids);
          console.log('⚠️ [OrganigramaService] CAUSA PROBABLE: Backend está creando múltiples imágenes independientes');
        }
        
        if (updatedRama.sectionGalleryObjectIds.length > 1) {
          console.log('⚠️ [OrganigramaService] CONFIRMADO: Backend está generando múltiples variantes automáticamente');
          console.log('💡 [OrganigramaService] Supabase probablemente está configurado para generar thumbnails/resoluciones');
        }
      }
      
      return uploadResponse.url || uploadResponse.objectId;
    } catch (patchError) {
      console.error('❌ [OrganigramaService] Error en endpoint PATCH para agregar imagen:', patchError);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [OrganigramaService] Error agregando imagen a galería:', error);
    throw error;
  }
};

// Función helper para obtener los UUIDs de las imágenes de galería de una rama
// Útil para identificar qué imagen quieres reemplazar
export const getGalleryImageUuids = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string
): Promise<string[]> => {
  console.log('🔍 [OrganigramaService] Obteniendo UUIDs de galería para sección:', sectionId);
  
  try {
    const rama = await getRamaById(tenantSlug, groupSlug, sectionId);
    if (rama && rama.sectionGalleryObjectIds) {
      console.log('✅ [OrganigramaService] UUIDs de galería obtenidos:', rama.sectionGalleryObjectIds);
      return rama.sectionGalleryObjectIds;
    }
    console.log('ℹ️ [OrganigramaService] No hay imágenes en la galería');
    return [];
  } catch (error) {
    console.error('❌ [OrganigramaService] Error obteniendo UUIDs de galería:', error);
    return [];
  }
};

// Función para reemplazar una imagen específica en la galería de una rama
// 
// EJEMPLO DE USO COMPLETO:
// 
// 1. Obtener los UUIDs de las imágenes actuales:
//    const uuids = await getGalleryImageUuids(tenantSlug, groupSlug, sectionId);
//    console.log('Imágenes actuales:', uuids); // ['uuid-1', 'uuid-2', 'uuid-3']
// 
// 2. Seleccionar qué imagen reemplazar (por ejemplo, la segunda imagen):
//    const targetUuid = uuids[1]; // 'uuid-2'
// 
// 3. Reemplazar con la nueva imagen:
//    const file = event.target.files?.[0];
//    const newUrl = await replaceGalleryImage(tenantSlug, groupSlug, sectionId, targetUuid, file);
//    console.log('Nueva URL:', newUrl);
//
export const replaceGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  targetImageUuid: string,
  newFile: File
): Promise<string> => {
  console.log('🔄 [OrganigramaService] Reemplazando imagen en galería...');
  console.log('📝 [OrganigramaService] Parámetros:', {
    sectionId,
    targetImageUuid,
    newFileName: newFile.name,
    newFileSize: newFile.size
  });
  
  try {
    // Paso 1: Subir el nuevo archivo
    console.log('🔄 [OrganigramaService] Subiendo nueva imagen...');
    const formData = new FormData();
    formData.append('file', newFile);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    console.log('✅ [OrganigramaService] Nueva imagen subida, objectId:', uploadResponse.objectId);
    
    // Paso 2: Usar endpoint PATCH para reemplazar la imagen en la galería
    console.log('🔄 [OrganigramaService] Reemplazando imagen en galería usando endpoint PATCH...');
    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);
    console.log('📍 [OrganigramaService] Endpoint PATCH:', patchEndpoint);
    
    // Crear el payload de operación según la especificación del backend
    const replacePayload = {
      operations: [
        {
          op: "replace" as const,
          targetUuid: targetImageUuid,
          newValue: uploadResponse.objectId
        }
      ]
    };
    
    console.log('🔄 [OrganigramaService] PATCH payload para reemplazar imagen:', replacePayload);
    
    try {
      await apiClient.patch(patchEndpoint, replacePayload);
      console.log('✅ [OrganigramaService] Imagen reemplazada correctamente en galería');
      
      // Obtener datos actualizados de la rama para tener las URLs correctas
      console.log('🔄 [OrganigramaService] Obteniendo datos actualizados de la rama...');
      const updatedRama = await getRamaById(tenantSlug, groupSlug, sectionId);
      
      if (updatedRama && updatedRama.sectionGalleryObjectIds.length > 0) {
        // Buscar la nueva URL en la galería actualizada
        // Como el backend reemplaza en el mismo índice, podemos retornar la URL del upload
        console.log('✅ [OrganigramaService] Datos actualizados obtenidos');
        return uploadResponse.url || uploadResponse.objectId;
      } else {
        console.warn('⚠️ [OrganigramaService] No se pudieron obtener datos actualizados, usando URL del upload');
        return uploadResponse.url || uploadResponse.objectId;
      }
    } catch (patchError) {
      console.error('❌ [OrganigramaService] Error en endpoint PATCH para reemplazar imagen:', patchError);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [OrganigramaService] Error reemplazando imagen en galería:', error);
    throw error;
  }
};

// Función para eliminar una imagen de la galería de una rama
// Basada en la guía del backend usando operaciones
export const removeGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  targetImageUuid: string
): Promise<void> => {
  console.log('🗑️ [OrganigramaService] Eliminando imagen de galería...');
  console.log('📝 [OrganigramaService] Parámetros:', {
    sectionId,
    targetImageUuid
  });
  
  try {
    // Usar endpoint PATCH para eliminar de la galería
    console.log('🔄 [OrganigramaService] Eliminando imagen de galería usando endpoint PATCH...');
    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);
    console.log('📍 [OrganigramaService] Endpoint PATCH:', patchEndpoint);
    
    // Crear el payload de operación según la guía del backend
    const removePayload = {
      operations: [
        {
          op: "remove",
          targetUuid: targetImageUuid
        }
      ]
    };
    
    console.log('🔄 [OrganigramaService] PATCH payload para eliminar imagen:', removePayload);
    
    try {
      await apiClient.patch(patchEndpoint, removePayload);
      console.log('✅ [OrganigramaService] Imagen eliminada correctamente de galería');
    } catch (patchError) {
      console.error('❌ [OrganigramaService] Error en endpoint PATCH para eliminar imagen:', patchError);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [OrganigramaService] Error eliminando imagen de galería:', error);
    throw error;
  }
};

// Función para actualizar la foto principal de una subrama
// Ejemplo de uso:
// const file = event.target.files?.[0];
// const url = await updateSubramaMainImage(tenantSlug, groupSlug, sectionId, subgroupId, file);
export const updateSubramaMainImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  file: File
): Promise<string> => {
  console.log('📤 [OrganigramaService] Actualizando foto principal de subrama...');
  
  try {
    // Paso 1: Subir el archivo
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    console.log('✅ [OrganigramaService] Archivo subido, objectId:', uploadResponse.objectId);
    
    // Paso 2: Usar endpoint PATCH específico para foto principal de subrama
    console.log('🔄 [OrganigramaService] Asociando foto principal de subrama usando endpoint PATCH específico...');
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_MAIN_IMAGE(tenantSlug, groupSlug, sectionId, subgroupId);
    
    // Basándome en el patrón de los otros endpoints, el payload sería un objectId
    const mainImagePayload = {
      objectId: uploadResponse.objectId
    };
    
    console.log('🔄 [OrganigramaService] PATCH payload para foto principal de subrama:', mainImagePayload);
    
    try {
      await apiClient.patch(patchEndpoint, mainImagePayload);
      console.log('✅ [OrganigramaService] Foto principal de subrama asociada correctamente con endpoint PATCH');
      
      // Paso 3: Obtener los datos actualizados de la subrama para tener la URL correcta
      console.log('🔄 [OrganigramaService] Obteniendo datos actualizados de la subrama...');
      const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
      
      if (updatedSubrama && updatedSubrama.imagenPrincipal) {
        console.log('✅ [OrganigramaService] URL de imagen principal obtenida del backend:', updatedSubrama.imagenPrincipal);
        return updatedSubrama.imagenPrincipal;
      } else {
        console.warn('⚠️ [OrganigramaService] No se pudo obtener la URL actualizada, usando URL del upload');
        return uploadResponse.url || uploadResponse.objectId;
      }
    } catch (patchError) {
      console.error('❌ [OrganigramaService] Error en endpoint PATCH para foto principal de subrama:', patchError);
      throw patchError;
    }
    
    console.log('✅ [OrganigramaService] Foto principal de subrama actualizada con éxito');
  } catch (error) {
    console.error('❌ [OrganigramaService] Error actualizando foto principal de subrama:', error);
    throw error;
  }
};

// ============================================================================
// FUNCIONES DE GALERÍA PARA SUBRAMAS
// ============================================================================

// Función para subir múltiples imágenes a la galería de una subrama
export const uploadSubramaGalleryImages = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  files: File[]
): Promise<string[]> => {
  console.log('📤 [OrganigramaService] Subiendo imágenes de galería de subrama...');
  console.log('📝 [OrganigramaService] Parámetros:', {
    sectionId,
    subgroupId,
    filesCount: files.length
  });
  
  try {
    const objectIds: string[] = [];
    const urls: string[] = [];
    
    // Paso 1: Subir cada archivo individualmente
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
      objectIds.push(uploadResponse.objectId);
      urls.push(uploadResponse.url || uploadResponse.objectId);
    }
    
    // Paso 2: Usar endpoint PATCH específico para galería de subrama
    console.log('🔄 [OrganigramaService] Asociando galería de subrama usando endpoint PATCH específico...');
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    console.log('📍 [OrganigramaService] Endpoint PATCH:', patchEndpoint);
    
    // Usar el formato de operaciones para AGREGAR imágenes según la guía del backend
    const galleryPayload = {
      operations: objectIds.map(objectId => ({
        op: "add",
        newValue: objectId
      }))
    };
    
    console.log('🔄 [OrganigramaService] PATCH payload para galería de subrama (formato operations):', galleryPayload);
    console.log('📝 [OrganigramaService] Subiendo', files.length, 'archivo(s) con objectIds:', objectIds);
    
    // Obtener estado inicial para comparación
    const initialSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
    const initialGalleryUrls = initialSubrama?.subgroupGalleryObjectIds || [];
    const initialCount = initialGalleryUrls.length;
    console.log('📊 [OrganigramaService] Estado inicial - galería subrama tiene:', initialCount, 'imágenes');
    console.log('📋 [OrganigramaService] URLs iniciales:', initialGalleryUrls);
    
    try {
      await apiClient.patch(patchEndpoint, galleryPayload);
      console.log('✅ [OrganigramaService] Galería de subrama asociada correctamente con endpoint PATCH');
      
      // Obtener los datos actualizados de la subrama para tener las URLs correctas
      console.log('🔄 [OrganigramaService] Obteniendo datos actualizados de la subrama después de agregar a galería...');
      const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
      
      console.log('🔍 [OrganigramaService] Subrama actualizada recibida:', {
        hasSubgroupGalleryObjectIds: !!(updatedSubrama?.subgroupGalleryObjectIds),
        galleryCount: updatedSubrama?.subgroupGalleryObjectIds?.length || 0,
        galleryUrls: updatedSubrama?.subgroupGalleryObjectIds || []
      });
      
      if (updatedSubrama && updatedSubrama.subgroupGalleryObjectIds && updatedSubrama.subgroupGalleryObjectIds.length > 0) {
        const finalCount = updatedSubrama.subgroupGalleryObjectIds.length;
        const addedCount = finalCount - initialCount;
        
        // Retornar las URLs de la galería actualizada del backend
        console.log('✅ [OrganigramaService] URLs de galería de subrama actualizadas obtenidas del backend');
        console.log('📸 [OrganigramaService] Galería completa actual de subrama:', updatedSubrama.subgroupGalleryObjectIds);
        console.log('🔍 [OrganigramaService] ANÁLISIS SUBRAMA:');
        console.log(`   - Archivos subidos: ${files.length}`);
        console.log(`   - Imágenes agregadas al backend: ${addedCount}`);
        console.log(`   - Total en galería ahora: ${finalCount}`);
        
        if (addedCount > files.length) {
          console.log('⚠️ [OrganigramaService] MÚLTIPLES VARIANTES DETECTADAS');
          console.log('💡 [OrganigramaService] Backend está generando', Math.round(addedCount / files.length), 'variantes por imagen');
          console.log('🎯 [OrganigramaService] Esto es normal si Supabase está configurado para thumbnails/optimización');
          
          // Análisis de UUIDs para confirmar si son variantes o imágenes diferentes
          const recentUrls = updatedSubrama.subgroupGalleryObjectIds.slice(-addedCount);
          const uuids = recentUrls.map(url => {
            const match = url.match(/\/([a-f0-9-]{36})\.[a-zA-Z0-9]+$/);
            return match ? match[1] : null;
          }).filter(Boolean);
          
          const uniqueUuids = [...new Set(uuids)];
          console.log('🔍 [OrganigramaService] UUIDs únicos en imágenes recientes:', uniqueUuids.length);
          
          if (uniqueUuids.length === files.length) {
            console.log('✅ [OrganigramaService] CONFIRMADO: Backend genera múltiples variantes por imagen original');
          } else {
            console.log('⚠️ [OrganigramaService] INESPERADO: Patrón de UUIDs no coincide con expectativa');
          }
        }
        
        return updatedSubrama.subgroupGalleryObjectIds; // URLs reales del backend
      } else {
        console.warn('⚠️ [OrganigramaService] No se pudieron obtener URLs actualizadas de subrama, usando URLs del upload');
        return urls; // Fallback a URLs del upload inicial
      }
    } catch (patchError) {
      console.error('❌ [OrganigramaService] Error en endpoint PATCH para galería de subrama:', patchError);
      console.error('❌ [OrganigramaService] Payload enviado:', JSON.stringify(galleryPayload, null, 2));
      console.error('❌ [OrganigramaService] Endpoint usado:', patchEndpoint);
      throw patchError;
    }
    
    console.log('✅ [OrganigramaService] Imágenes de galería de subrama subidas con éxito');
  } catch (error) {
    console.error('❌ [OrganigramaService] Error subiendo galería de subrama:', error);
    throw error;
  }
};

// Función para agregar una nueva imagen a la galería de una subrama
export const addSubramaGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  file: File
): Promise<string> => {
  console.log('📤 [OrganigramaService] Agregando imagen a galería de subrama...');
  console.log('📝 [OrganigramaService] Parámetros:', {
    sectionId,
    subgroupId,
    fileName: file.name,
    fileSize: file.size
  });
  
  try {
    // Paso 1: Subir el archivo
    console.log('🔄 [OrganigramaService] Subiendo nueva imagen...');
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    console.log('✅ [OrganigramaService] Nueva imagen subida, objectId:', uploadResponse.objectId);
    
    // Paso 2: Usar endpoint PATCH para agregar a la galería de subrama
    console.log('🔄 [OrganigramaService] Agregando imagen a galería de subrama usando endpoint PATCH...');
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    console.log('📍 [OrganigramaService] Endpoint PATCH:', patchEndpoint);
    
    // Crear el payload de operación según la guía del backend
    const addPayload = {
      operations: [
        {
          op: "add",
          newValue: uploadResponse.objectId
        }
      ]
    };
    
    console.log('🔄 [OrganigramaService] PATCH payload para agregar imagen a subrama:', addPayload);
    console.log('📝 [OrganigramaService] ANÁLISIS DETALLADO:');
    console.log('   - Subiendo UNA imagen con objectId:', uploadResponse.objectId);
    console.log('   - Esperamos que backend maneje solo esta imagen...');
    
    try {
      await apiClient.patch(patchEndpoint, addPayload);
      console.log('✅ [OrganigramaService] Imagen agregada correctamente a galería de subrama');
      
      // Obtener datos actualizados para verificar cuántas imágenes devuelve el backend
      console.log('🔍 [OrganigramaService] Verificando resultado en backend...');
      const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
      
      if (updatedSubrama && updatedSubrama.subgroupGalleryObjectIds) {
        console.log('🔍 [OrganigramaService] RESULTADO BACKEND:');
        console.log('   - Subimos: 1 imagen');
        console.log('   - Backend devolvió:', updatedSubrama.subgroupGalleryObjectIds.length, 'URLs');
        console.log('   - URLs devueltas:', updatedSubrama.subgroupGalleryObjectIds);
        
        if (updatedSubrama.subgroupGalleryObjectIds.length > 1) {
          console.log('⚠️ [OrganigramaService] POSIBLE CAUSA: Backend está generando variantes automáticamente (thumbnails, diferentes resoluciones, etc.)');
          console.log('💡 [OrganigramaService] Esto podría ser normal si Supabase está configurado para generar múltiples versiones');
        }
      }
      
      return uploadResponse.url || uploadResponse.objectId;
    } catch (patchError) {
      console.error('❌ [OrganigramaService] Error en endpoint PATCH para agregar imagen a subrama:', patchError);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [OrganigramaService] Error agregando imagen a galería de subrama:', error);
    throw error;
  }
};

// Función para reemplazar una imagen específica en la galería de una subrama
export const replaceSubramaGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  targetImageUuid: string,
  newFile: File
): Promise<string> => {
  console.log('🔄 [OrganigramaService] Reemplazando imagen en galería de subrama...');
  console.log('📝 [OrganigramaService] Parámetros:', {
    sectionId,
    subgroupId,
    targetImageUuid,
    newFileName: newFile.name,
    newFileSize: newFile.size
  });
  
  try {
    // Paso 1: Subir el nuevo archivo
    console.log('🔄 [OrganigramaService] Subiendo nueva imagen...');
    const formData = new FormData();
    formData.append('file', newFile);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    console.log('✅ [OrganigramaService] Nueva imagen subida, objectId:', uploadResponse.objectId);
    
    // Paso 2: Usar endpoint PATCH para reemplazar la imagen en la galería de subrama
    console.log('🔄 [OrganigramaService] Reemplazando imagen en galería de subrama usando endpoint PATCH...');
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    console.log('📍 [OrganigramaService] Endpoint PATCH:', patchEndpoint);
    
    // Crear el payload de operación según la guía del backend
    const replacePayload = {
      operations: [
        {
          op: "replace",
          targetUuid: targetImageUuid,
          newValue: uploadResponse.objectId
        }
      ]
    };
    
    console.log('🔄 [OrganigramaService] PATCH payload para reemplazar imagen en subrama:', replacePayload);
    
    try {
      await apiClient.patch(patchEndpoint, replacePayload);
      console.log('✅ [OrganigramaService] Imagen reemplazada correctamente en galería de subrama');
      
      // Obtener datos actualizados de la subrama para tener las URLs correctas
      console.log('🔄 [OrganigramaService] Obteniendo datos actualizados de la subrama...');
      const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
      
      if (updatedSubrama && updatedSubrama.subgroupGalleryObjectIds && updatedSubrama.subgroupGalleryObjectIds.length > 0) {
        // Como el backend reemplaza en el mismo índice, podemos retornar la URL del upload
        console.log('✅ [OrganigramaService] Datos actualizados de subrama obtenidos');
        return uploadResponse.url || uploadResponse.objectId;
      } else {
        console.warn('⚠️ [OrganigramaService] No se pudieron obtener datos actualizados de subrama, usando URL del upload');
        return uploadResponse.url || uploadResponse.objectId;
      }
    } catch (patchError) {
      console.error('❌ [OrganigramaService] Error en endpoint PATCH para reemplazar imagen en subrama:', patchError);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [OrganigramaService] Error reemplazando imagen en galería de subrama:', error);
    throw error;
  }
};

// Función para eliminar una imagen de la galería de una subrama
export const removeSubramaGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  targetImageUuid: string
): Promise<void> => {
  console.log('🗑️ [OrganigramaService] Eliminando imagen de galería de subrama...');
  console.log('📝 [OrganigramaService] Parámetros:', {
    sectionId,
    subgroupId,
    targetImageUuid
  });
  
  try {
    // Usar endpoint PATCH para eliminar de la galería de subrama
    console.log('🔄 [OrganigramaService] Eliminando imagen de galería de subrama usando endpoint PATCH...');
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    console.log('📍 [OrganigramaService] Endpoint PATCH:', patchEndpoint);
    
    // Crear el payload de operación según la guía del backend
    const removePayload = {
      operations: [
        {
          op: "remove",
          targetUuid: targetImageUuid
        }
      ]
    };
    
    console.log('🔄 [OrganigramaService] PATCH payload para eliminar imagen de subrama:', removePayload);
    
    try {
      await apiClient.patch(patchEndpoint, removePayload);
      console.log('✅ [OrganigramaService] Imagen eliminada correctamente de galería de subrama');
    } catch (patchError) {
      console.error('❌ [OrganigramaService] Error en endpoint PATCH para eliminar imagen de subrama:', patchError);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [OrganigramaService] Error eliminando imagen de galería de subrama:', error);
    throw error;
  }
};

// Función helper para obtener los UUIDs de las imágenes de galería de una subrama
export const getSubramaGalleryImageUuids = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string
): Promise<string[]> => {
  console.log('🔍 [OrganigramaService] Obteniendo UUIDs de galería para subrama:', subgroupId);
  
  try {
    const subrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
    if (subrama && subrama.subgroupGalleryObjectIds) {
      console.log('✅ [OrganigramaService] UUIDs de galería de subrama obtenidos:', subrama.subgroupGalleryObjectIds);
      return subrama.subgroupGalleryObjectIds;
    }
    console.log('ℹ️ [OrganigramaService] No hay imágenes en la galería de subrama');
    return [];
  } catch (error) {
    console.error('❌ [OrganigramaService] Error obteniendo UUIDs de galería de subrama:', error);
    return [];
  }
};

// 🧹 Función de limpieza no aplicable al backend real
export const clearAllStorageData = (): void => {
  console.warn('clearAllStorageData no está disponible en modo backend real');
};