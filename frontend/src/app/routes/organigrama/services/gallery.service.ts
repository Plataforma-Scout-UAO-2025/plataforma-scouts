import { apiClient } from './apiClient';
import { PATCH_ENDPOINTS } from '../constants/api-endpoints';

// Función auxiliar para obtener rama sin dependencias circulares
const getRamaByIdDirect = async (tenantSlug: string, groupSlug: string, id: string) => {
  const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${id}`;
  return await apiClient.get<any>(endpoint);
};

// Función para agregar una nueva imagen a la galería de una rama
// Basada en la guía del backend usando operaciones
export const addGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<string> => {
  console.log('📤 [GalleryService] Agregando imagen a galería...');
  console.log('📝 [GalleryService] Parámetros:', {
    sectionId,
    fileName: file.name,
    fileSize: file.size
  });
  
  try {
    // Paso 1: Subir el archivo
    console.log('🔄 [GalleryService] Subiendo nueva imagen...');
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    console.log('✅ [GalleryService] Nueva imagen subida, objectId:', uploadResponse.objectId);
    
    // Paso 2: Usar endpoint PATCH para agregar a la galería
    console.log('🔄 [GalleryService] Agregando imagen a galería usando endpoint PATCH...');
    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);
    console.log('📍 [GalleryService] Endpoint PATCH:', patchEndpoint);
    
    // Crear el payload de operación según la guía del backend
    const addPayload = {
      operations: [
        {
          op: "add",
          newValue: uploadResponse.objectId
        }
      ]
    };
    
    console.log('🔄 [GalleryService] PATCH payload para agregar imagen:', addPayload);
    console.log('📝 [GalleryService] ANÁLISIS DETALLADO (RAMA):');
    console.log('   - Subiendo UNA imagen con objectId:', uploadResponse.objectId);
    console.log('   - Esperamos que backend maneje solo esta imagen...');
    
    try {
      await apiClient.patch(patchEndpoint, addPayload);
      console.log('✅ [GalleryService] Imagen agregada correctamente a galería');
      
      // Obtener datos actualizados para verificar cuántas imágenes devuelve el backend
      console.log('🔍 [GalleryService] Verificando resultado en backend para RAMA...');
      const updatedRama = await getRamaByIdDirect(tenantSlug, groupSlug, sectionId);
      
      if (updatedRama && updatedRama.sectionGalleryObjectIds) {
        console.log('🔍 [GalleryService] RESULTADO BACKEND (RAMA):');
        console.log('   - Subimos: 1 imagen');
        console.log('   - Backend devolvió:', updatedRama.sectionGalleryObjectIds.length, 'URLs');
        console.log('   - URLs devueltas:', updatedRama.sectionGalleryObjectIds);
        
        // Análisis detallado de URLs
        console.log('🔍 [GalleryService] ANÁLISIS DE URLs:');
        updatedRama.sectionGalleryObjectIds.forEach((url: string, index: number) => {
          const uuidMatch = url.match(/\/([a-f0-9-]{36})\.[a-zA-Z0-9]+$/);
          const uuid = uuidMatch ? uuidMatch[1] : 'unknown';
          console.log(`   ${index + 1}. UUID: ${uuid}`);
          console.log(`      URL: ${url}`);
        });
        
        // Verificar si todas las URLs tienen el mismo UUID (variantes) o UUIDs diferentes (imágenes distintas)
        const uuids = updatedRama.sectionGalleryObjectIds.map((url: string) => {
          const match = url.match(/\/([a-f0-9-]{36})\.[a-zA-Z0-9]+$/);
          return match ? match[1] : null;
        }).filter(Boolean);
        
        const uniqueUuids = [...new Set(uuids)];
        
        if (uniqueUuids.length === 1) {
          console.log('💡 [GalleryService] DIAGNÓSTICO: Todas las URLs tienen el mismo UUID →', uniqueUuids[0]);
          console.log('💡 [GalleryService] CAUSA PROBABLE: Backend genera múltiples variantes (thumbnails, formatos, resoluciones)');
        } else {
          console.log('⚠️ [GalleryService] DIAGNÓSTICO: URLs tienen UUIDs diferentes →', uniqueUuids);
          console.log('⚠️ [GalleryService] CAUSA PROBABLE: Backend está creando múltiples imágenes independientes');
        }
        
        if (updatedRama.sectionGalleryObjectIds.length > 1) {
          console.log('⚠️ [GalleryService] CONFIRMADO: Backend está generando múltiples variantes automáticamente');
          console.log('💡 [GalleryService] Supabase probablemente está configurado para generar thumbnails/resoluciones');
        }
      }
      
      return uploadResponse.url || uploadResponse.objectId;
    } catch (patchError) {
      console.error('❌ [GalleryService] Error en endpoint PATCH para agregar imagen:', patchError);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [GalleryService] Error agregando imagen a galería:', error);
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
  console.log('🔍 [GalleryService] Obteniendo UUIDs de galería para sección:', sectionId);
  
  try {
    const rama = await getRamaByIdDirect(tenantSlug, groupSlug, sectionId);
    if (rama && rama.sectionGalleryObjectIds) {
      console.log('✅ [GalleryService] UUIDs de galería obtenidos:', rama.sectionGalleryObjectIds);
      return rama.sectionGalleryObjectIds;
    }
    console.log('ℹ️ [GalleryService] No hay imágenes en la galería');
    return [];
  } catch (error) {
    console.error('❌ [GalleryService] Error obteniendo UUIDs de galería:', error);
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
  console.log('🔄 [GalleryService] Reemplazando imagen en galería...');
  console.log('📝 [GalleryService] Parámetros:', {
    sectionId,
    targetImageUuid,
    newFileName: newFile.name,
    newFileSize: newFile.size
  });
  
  try {
    // Paso 1: Subir el nuevo archivo
    console.log('🔄 [GalleryService] Subiendo nueva imagen...');
    const formData = new FormData();
    formData.append('file', newFile);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    console.log('✅ [GalleryService] Nueva imagen subida, objectId:', uploadResponse.objectId);
    
    // Paso 2: Usar endpoint PATCH para reemplazar la imagen en la galería
    console.log('🔄 [GalleryService] Reemplazando imagen en galería usando endpoint PATCH...');
    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);
    console.log('📍 [GalleryService] Endpoint PATCH:', patchEndpoint);
    
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
    
    console.log('🔄 [GalleryService] PATCH payload para reemplazar imagen:', replacePayload);
    
    try {
      await apiClient.patch(patchEndpoint, replacePayload);
      console.log('✅ [GalleryService] Imagen reemplazada correctamente en galería');
      
      // Obtener datos actualizados de la rama para tener las URLs correctas
      console.log('🔄 [GalleryService] Obteniendo datos actualizados de la rama...');
      const updatedRama = await getRamaByIdDirect(tenantSlug, groupSlug, sectionId);
      
      if (updatedRama && updatedRama.sectionGalleryObjectIds.length > 0) {
        // Buscar la nueva URL en la galería actualizada
        // Como el backend reemplaza en el mismo índice, podemos retornar la URL del upload
        console.log('✅ [GalleryService] Datos actualizados obtenidos');
        return uploadResponse.url || uploadResponse.objectId;
      } else {
        console.warn('⚠️ [GalleryService] No se pudieron obtener datos actualizados, usando URL del upload');
        return uploadResponse.url || uploadResponse.objectId;
      }
    } catch (patchError) {
      console.error('❌ [GalleryService] Error en endpoint PATCH para reemplazar imagen:', patchError);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [GalleryService] Error reemplazando imagen en galería:', error);
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
  console.log('🗑️ [GalleryService] Eliminando imagen de galería...');
  console.log('📝 [GalleryService] Parámetros:', {
    sectionId,
    targetImageUuid
  });
  
  try {
    // Usar endpoint PATCH para eliminar de la galería
    console.log('🔄 [GalleryService] Eliminando imagen de galería usando endpoint PATCH...');
    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);
    console.log('📍 [GalleryService] Endpoint PATCH:', patchEndpoint);
    
    // Crear el payload de operación según la guía del backend
    const removePayload = {
      operations: [
        {
          op: "remove",
          targetUuid: targetImageUuid
        }
      ]
    };
    
    console.log('🔄 [GalleryService] PATCH payload para eliminar imagen:', removePayload);
    
    try {
      await apiClient.patch(patchEndpoint, removePayload);
      console.log('✅ [GalleryService] Imagen eliminada correctamente de galería');
    } catch (patchError) {
      console.error('❌ [GalleryService] Error en endpoint PATCH para eliminar imagen:', patchError);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [GalleryService] Error eliminando imagen de galería:', error);
    throw error;
  }
};