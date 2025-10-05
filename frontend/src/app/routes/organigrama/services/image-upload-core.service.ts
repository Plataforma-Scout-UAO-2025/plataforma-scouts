import { apiClient } from './apiClient';
import { PATCH_ENDPOINTS } from '../constants/api-endpoints';

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

    // Paso 3: Verificar resultado usando una llamada directa al API
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}`;
    const backendRama = await apiClient.get<any>(endpoint);
    const resultCount = backendRama?.sectionGalleryObjectIds?.length || 0;

    const result = {
      uploaded: 1,
      returned: resultCount,
      details: {
        originalObjectId: uploadResponse.objectId,
        returnedUrls: backendRama?.sectionGalleryObjectIds || [],
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
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
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
): Promise<string> => {
  console.log('📤 [ImageUploadService] Subiendo imagen principal de sección...');
  
  try {
    // Paso 1: Subir archivo al sistema de archivos
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    
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

// Función básica para subir múltiples imágenes sin verificaciones adicionales
export const uploadGalleryImages = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  files: File[]
): Promise<string[]> => {
  console.log('📤 [ImageUploadService] Subiendo imágenes de galería...');
  
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
      
      // Retornar las URLs subidas inicialmente como fallback
      console.log('✅ [ImageUploadService] Imágenes de galería subidas con éxito');
      return urls;
    } catch (patchError) {
      console.error('❌ [ImageUploadService] Error en endpoint PATCH para galería:', patchError);
      console.error('❌ [ImageUploadService] Payload enviado:', JSON.stringify(galleryPayload, null, 2));
      console.error('❌ [ImageUploadService] Endpoint usado:', patchEndpoint);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [ImageUploadService] Error subiendo galería:', error);
    throw error;
  }
};

// ==========================================================
// 🗑️ Eliminar ícono de sección (PATCH remove)
// ==========================================================
export const removeSectionIcon = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string
): Promise<void> => {
  console.log("🗑️ [ImageUploadService] Eliminando ícono de sección...");

  const patchEndpoint = PATCH_ENDPOINTS.ICON(tenantSlug, groupSlug, sectionId);
  const payload = {
    operations: [
      {
        op: "remove",
        targetUuid: null,
      },
    ],
  };

  await apiClient.patch(patchEndpoint, payload);
  console.log("✅ Ícono eliminado correctamente de la sección");
};

// ==========================================================
// 🗑️ Eliminar imagen principal de sección (PATCH remove)
// ==========================================================
export const removeSectionMainImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string
): Promise<void> => {
  console.log("🗑️ [ImageUploadService] Eliminando imagen principal de sección...");

  const patchEndpoint = PATCH_ENDPOINTS.MAIN_IMAGE(tenantSlug, groupSlug, sectionId);
  const payload = {
    operations: [
      {
        op: "remove",
        targetUuid: null,
      },
    ],
  };

  await apiClient.patch(patchEndpoint, payload);
  console.log("✅ Imagen principal eliminada correctamente de la sección");
};
