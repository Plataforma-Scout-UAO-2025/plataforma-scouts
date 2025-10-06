import { apiClient } from './apiClient';
import { PATCH_ENDPOINTS } from '../constants/api-endpoints';

// Función auxiliar para obtener rama directamente sin dependencias circulares
const getRamaByIdDirect = async (tenantSlug: string, groupSlug: string, id: string) => {
  const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${id}`;
  return await apiClient.get<Record<string, unknown> | undefined>(endpoint);
};

// Función de diagnóstico para verificar comportamiento del backend con imágenes
export const diagnoseBatchImageUpload = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<{ uploaded: number; returned: number; details: Record<string, unknown> }> => {
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
  const updatedRama = await getRamaByIdDirect(tenantSlug, groupSlug, sectionId);
  const updatedRec = updatedRama as unknown as Record<string, unknown> | undefined;
  const gallery = (updatedRec?.['galleryObjectIds'] as string[] | undefined) ?? (updatedRec?.['sectionGalleryObjectIds'] as string[] | undefined) ?? [];
  const resultCount = gallery?.length || 0;

    const result = {
      uploaded: 1,
      returned: resultCount,
      details: {
        originalObjectId: uploadResponse.objectId,
        returnedUrls: (updatedRec?.['sectionGalleryObjectIds'] as string[] | undefined) ?? [],
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
(globalThis as unknown as Record<string, unknown>).diagnosticImageUpload = diagnoseBatchImageUpload;

// Funciones de carga de archivos - Implementación de dos pasos según backend
export const uploadSectionIcon = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File,
  onFileProgress?: (fileName: string, percent: number) => void,
  signal?: AbortSignal
): Promise<string> => {
  console.log('📤 [ImageUploadService] Subiendo icono de sección...');
  console.log('📝 [ImageUploadService] Parámetros:', {
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
    
    console.log('🔄 [ImageUploadService] Subiendo archivo al storage...');
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>(
      '/api/storage/upload',
      formData,
      (percent) => onFileProgress?.(file.name, percent),
      signal
    );
    console.log('✅ [ImageUploadService] Archivo subido, objectId:', uploadResponse.objectId);
    
    // Paso 2: Usar endpoint PATCH específico para icono
    console.log('🔄 [ImageUploadService] Asociando icono usando endpoint PATCH específico...');
    const patchEndpoint = PATCH_ENDPOINTS.ICON(tenantSlug, groupSlug, sectionId);
    console.log('📍 [ImageUploadService] Endpoint PATCH:', patchEndpoint);
    
    // Basándome en las pruebas de Postman, el payload es: { "objectId": "uuid" }
    const iconPayload = {
      objectId: uploadResponse.objectId
    };
    
    console.log('🔄 [ImageUploadService] PATCH payload para icono:', iconPayload);
    
    try {
      await apiClient.patch(patchEndpoint, iconPayload);
      console.log('✅ [ImageUploadService] Icono asociado correctamente con endpoint PATCH');
    } catch (patchError) {
      console.error('❌ [ImageUploadService] Error en endpoint PATCH para icono:', patchError);
      throw patchError;
    }
    
    console.log('✅ [ImageUploadService] Icono de sección subido con éxito');
    console.log('📝 [ImageUploadService] ObjectId guardado:', uploadResponse.objectId);
    
    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error('❌ [ImageUploadService] Error subiendo icono:', error);
    throw error;
  }
};

// Nueva función específica para imagen principal
export const uploadSectionMainImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File
  ,
  onFileProgress?: (fileName: string, percent: number) => void,
  signal?: AbortSignal
): Promise<string> => {
  console.log('📤 [ImageUploadService] Subiendo imagen principal de sección...');
  
  try {
    // Paso 1: Subir archivo al sistema de archivos
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>(
      '/api/storage/upload',
      formData,
      (percent) => onFileProgress?.(file.name, percent),
      signal
    );
    
    // Paso 2: Usar endpoint PATCH específico para imagen principal
    console.log('🔄 [ImageUploadService] Asociando imagen principal usando endpoint PATCH específico...');
    const patchEndpoint = PATCH_ENDPOINTS.MAIN_IMAGE(tenantSlug, groupSlug, sectionId);
    
    // Basándome en las pruebas de Postman, el payload es: { "objectId": "uuid" }
    const mainImagePayload = {
      objectId: uploadResponse.objectId
    };
    
    console.log('🔄 [ImageUploadService] PATCH payload para imagen principal:', mainImagePayload);
    
    try {
      await apiClient.patch(patchEndpoint, mainImagePayload);
      console.log('✅ [ImageUploadService] Imagen principal asociada correctamente con endpoint PATCH');
    } catch (patchError) {
      console.error('❌ [ImageUploadService] Error en endpoint PATCH para imagen principal:', patchError);
      throw patchError;
    }
    
    console.log('✅ [ImageUploadService] Imagen principal de sección subida con éxito');
    console.log('📝 [ImageUploadService] ObjectId de imagen principal:', uploadResponse.objectId);
    
    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error('❌ [ImageUploadService] Error subiendo imagen principal:', error);
    throw error;
  }
};

export const uploadGalleryImages = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  files: File[]
  ,
  onFileProgress?: (fileName: string, percent: number) => void,
  onOverallProgress?: (percent: number) => void
  , signal?: AbortSignal
): Promise<string[]> => {
  console.log('📤 [ImageUploadService] Subiendo imágenes de galería...');
  
  try {
    const objectIds: string[] = [];
    const urls: string[] = [];
    
    // Paso 1: Subir cada archivo individualmente
    // Para calcular progreso general, acumulamos el avance de cada archivo
    const perFileProgress: Record<string, number> = {};
    const totalFiles = files.length;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>(
        '/api/storage/upload',
        formData,
        (percent) => {
          perFileProgress[file.name] = percent;
          // Reportar progreso individual
          onFileProgress?.(file.name, percent);

          // Calcular progreso general como promedio simple
          const sum = Object.values(perFileProgress).reduce((a, b) => a + b, 0);
          const overall = Math.round(sum / totalFiles);
          onOverallProgress?.(overall);
        },
        signal
      );

      objectIds.push(uploadResponse.objectId);
      urls.push(uploadResponse.url || uploadResponse.objectId);
    }
    
    // Paso 2: Usar endpoint PATCH específico para galería
    console.log('🔄 [ImageUploadService] Asociando galería usando endpoint PATCH específico...');
    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);
    
    // Usar el formato de operaciones para AGREGAR imágenes según la guía del backend
    const galleryPayload = {
      operations: objectIds.map(objectId => ({
        op: "add",
        newValue: objectId
      }))
    };
    
    console.log('🔄 [ImageUploadService] PATCH payload para galería (formato operations):', galleryPayload);
    
    try {
      await apiClient.patch(patchEndpoint, galleryPayload);
      console.log('✅ [ImageUploadService] Galería asociada correctamente con endpoint PATCH');
      
      // Obtener los datos actualizados de la rama para tener las URLs correctas
      console.log('🔄 [ImageUploadService] Obteniendo datos actualizados de la rama después de agregar a galería...');
  const updatedRama = await getRamaByIdDirect(tenantSlug, groupSlug, sectionId);
  const updatedRec = updatedRama as unknown as Record<string, unknown> | undefined;
  const galleryUrls = (updatedRec?.['galleryObjectIds'] as string[] | undefined) ?? (updatedRec?.['sectionGalleryObjectIds'] as string[] | undefined) ?? [];
      if (galleryUrls && galleryUrls.length > 0) {
        // Retornar las URLs de la galería actualizada del backend
        console.log('✅ [ImageUploadService] URLs de galería actualizadas obtenidas del backend');
        console.log('📸 [ImageUploadService] Galería completa actual:', galleryUrls);
        return galleryUrls; // URLs reales del backend
      } else {
        console.warn('⚠️ [ImageUploadService] No se pudieron obtener URLs actualizadas, usando URLs del upload');
        return urls; // Fallback a URLs del upload inicial
      }
    } catch (patchError) {
      console.error('❌ [ImageUploadService] Error en endpoint PATCH para galería:', patchError);
      console.error('❌ [ImageUploadService] Payload enviado:', JSON.stringify(galleryPayload, null, 2));
      console.error('❌ [ImageUploadService] Endpoint usado:', patchEndpoint);
      throw patchError;
    }
    
    console.log('✅ [ImageUploadService] Imágenes de galería subidas con éxito');
  } catch (error) {
    console.error('❌ [ImageUploadService] Error subiendo galería:', error);
    throw error;
  }
};