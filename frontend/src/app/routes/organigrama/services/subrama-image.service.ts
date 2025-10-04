import { apiClient } from './apiClient';
import { PATCH_ENDPOINTS } from '../constants/api-endpoints';
import { getSubramaById } from './subrama.service';

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
  console.log('📤 [SubramaImageService] Actualizando foto principal de subrama...');
  
  try {
    // Paso 1: Subir el archivo
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    console.log('✅ [SubramaImageService] Archivo subido, objectId:', uploadResponse.objectId);
    
    // Paso 2: Usar endpoint PATCH específico para foto principal de subrama
    console.log('🔄 [SubramaImageService] Asociando foto principal de subrama usando endpoint PATCH específico...');
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_MAIN_IMAGE(tenantSlug, groupSlug, sectionId, subgroupId);
    
    // Basándome en el patrón de los otros endpoints, el payload sería un objectId
    const mainImagePayload = {
      objectId: uploadResponse.objectId
    };
    
    console.log('🔄 [SubramaImageService] PATCH payload para foto principal de subrama:', mainImagePayload);
    
    try {
      await apiClient.patch(patchEndpoint, mainImagePayload);
      console.log('✅ [SubramaImageService] Foto principal de subrama asociada correctamente con endpoint PATCH');
      
      // Paso 3: Obtener los datos actualizados de la subrama para tener la URL correcta
      console.log('🔄 [SubramaImageService] Obteniendo datos actualizados de la subrama...');
      const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
      
      if (updatedSubrama && updatedSubrama.imagenPrincipal) {
        console.log('✅ [SubramaImageService] URL de imagen principal obtenida del backend:', updatedSubrama.imagenPrincipal);
        return updatedSubrama.imagenPrincipal;
      } else {
        console.warn('⚠️ [SubramaImageService] No se pudo obtener la URL actualizada, usando URL del upload');
        return uploadResponse.url || uploadResponse.objectId;
      }
    } catch (patchError) {
      console.error('❌ [SubramaImageService] Error en endpoint PATCH para foto principal de subrama:', patchError);
      throw patchError;
    }
    
    console.log('✅ [SubramaImageService] Foto principal de subrama actualizada con éxito');
  } catch (error) {
    console.error('❌ [SubramaImageService] Error actualizando foto principal de subrama:', error);
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
  console.log('📤 [SubramaImageService] Subiendo imágenes de galería de subrama...');
  console.log('📝 [SubramaImageService] Parámetros:', {
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
    console.log('🔄 [SubramaImageService] Asociando galería de subrama usando endpoint PATCH específico...');
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    console.log('📍 [SubramaImageService] Endpoint PATCH:', patchEndpoint);
    
    // Usar el formato de operaciones para AGREGAR imágenes según la guía del backend
    const galleryPayload = {
      operations: objectIds.map(objectId => ({
        op: "add",
        newValue: objectId
      }))
    };
    
    console.log('🔄 [SubramaImageService] PATCH payload para galería de subrama (formato operations):', galleryPayload);
    console.log('📝 [SubramaImageService] Subiendo', files.length, 'archivo(s) con objectIds:', objectIds);
    
    // Obtener estado inicial para comparación
    const initialSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
    const initialGalleryUrls = initialSubrama?.subgroupGalleryObjectIds || [];
    const initialCount = initialGalleryUrls.length;
    console.log('📊 [SubramaImageService] Estado inicial - galería subrama tiene:', initialCount, 'imágenes');
    console.log('📋 [SubramaImageService] URLs iniciales:', initialGalleryUrls);
    
    try {
      await apiClient.patch(patchEndpoint, galleryPayload);
      console.log('✅ [SubramaImageService] Galería de subrama asociada correctamente con endpoint PATCH');
      
      // Obtener los datos actualizados de la subrama para tener las URLs correctas
      console.log('🔄 [SubramaImageService] Obteniendo datos actualizados de la subrama después de agregar a galería...');
      const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
      
      console.log('🔍 [SubramaImageService] Subrama actualizada recibida:', {
        hasSubgroupGalleryObjectIds: !!(updatedSubrama?.subgroupGalleryObjectIds),
        galleryCount: updatedSubrama?.subgroupGalleryObjectIds?.length || 0,
        galleryUrls: updatedSubrama?.subgroupGalleryObjectIds || []
      });
      
      if (updatedSubrama && updatedSubrama.subgroupGalleryObjectIds && updatedSubrama.subgroupGalleryObjectIds.length > 0) {
        const finalCount = updatedSubrama.subgroupGalleryObjectIds.length;
        const addedCount = finalCount - initialCount;
        
        // Retornar las URLs de la galería actualizada del backend
        console.log('✅ [SubramaImageService] URLs de galería de subrama actualizadas obtenidas del backend');
        console.log('📸 [SubramaImageService] Galería completa actual de subrama:', updatedSubrama.subgroupGalleryObjectIds);
        console.log('🔍 [SubramaImageService] ANÁLISIS SUBRAMA:');
        console.log(`   - Archivos subidos: ${files.length}`);
        console.log(`   - Imágenes agregadas al backend: ${addedCount}`);
        console.log(`   - Total en galería ahora: ${finalCount}`);
        
        if (addedCount > files.length) {
          console.log('⚠️ [SubramaImageService] MÚLTIPLES VARIANTES DETECTADAS');
          console.log('💡 [SubramaImageService] Backend está generando', Math.round(addedCount / files.length), 'variantes por imagen');
          console.log('🎯 [SubramaImageService] Esto es normal si Supabase está configurado para thumbnails/optimización');
          
          // Análisis de UUIDs para confirmar si son variantes o imágenes diferentes
          const recentUrls = updatedSubrama.subgroupGalleryObjectIds.slice(-addedCount);
          const uuids = recentUrls.map(url => {
            const match = url.match(/\/([a-f0-9-]{36})\.[a-zA-Z0-9]+$/);
            return match ? match[1] : null;
          }).filter(Boolean);
          
          const uniqueUuids = [...new Set(uuids)];
          console.log('🔍 [SubramaImageService] UUIDs únicos en imágenes recientes:', uniqueUuids.length);
          
          if (uniqueUuids.length === files.length) {
            console.log('✅ [SubramaImageService] CONFIRMADO: Backend genera múltiples variantes por imagen original');
          } else {
            console.log('⚠️ [SubramaImageService] INESPERADO: Patrón de UUIDs no coincide con expectativa');
          }
        }
        
        return updatedSubrama.subgroupGalleryObjectIds; // URLs reales del backend
      } else {
        console.warn('⚠️ [SubramaImageService] No se pudieron obtener URLs actualizadas de subrama, usando URLs del upload');
        return urls; // Fallback a URLs del upload inicial
      }
    } catch (patchError) {
      console.error('❌ [SubramaImageService] Error en endpoint PATCH para galería de subrama:', patchError);
      console.error('❌ [SubramaImageService] Payload enviado:', JSON.stringify(galleryPayload, null, 2));
      console.error('❌ [SubramaImageService] Endpoint usado:', patchEndpoint);
      throw patchError;
    }
    
    console.log('✅ [SubramaImageService] Imágenes de galería de subrama subidas con éxito');
  } catch (error) {
    console.error('❌ [SubramaImageService] Error subiendo galería de subrama:', error);
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
  console.log('📤 [SubramaImageService] Agregando imagen a galería de subrama...');
  console.log('📝 [SubramaImageService] Parámetros:', {
    sectionId,
    subgroupId,
    fileName: file.name,
    fileSize: file.size
  });
  
  try {
    // Paso 1: Subir el archivo
    console.log('🔄 [SubramaImageService] Subiendo nueva imagen...');
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    console.log('✅ [SubramaImageService] Nueva imagen subida, objectId:', uploadResponse.objectId);
    
    // Paso 2: Usar endpoint PATCH para agregar a la galería de subrama
    console.log('🔄 [SubramaImageService] Agregando imagen a galería de subrama usando endpoint PATCH...');
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    console.log('📍 [SubramaImageService] Endpoint PATCH:', patchEndpoint);
    
    // Crear el payload de operación según la guía del backend
    const addPayload = {
      operations: [
        {
          op: "add",
          newValue: uploadResponse.objectId
        }
      ]
    };
    
    console.log('🔄 [SubramaImageService] PATCH payload para agregar imagen a subrama:', addPayload);
    console.log('📝 [SubramaImageService] ANÁLISIS DETALLADO:');
    console.log('   - Subiendo UNA imagen con objectId:', uploadResponse.objectId);
    console.log('   - Esperamos que backend maneje solo esta imagen...');
    
    try {
      await apiClient.patch(patchEndpoint, addPayload);
      console.log('✅ [SubramaImageService] Imagen agregada correctamente a galería de subrama');
      
      // Obtener datos actualizados para verificar cuántas imágenes devuelve el backend
      console.log('🔍 [SubramaImageService] Verificando resultado en backend...');
      const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
      
      if (updatedSubrama && updatedSubrama.subgroupGalleryObjectIds) {
        console.log('🔍 [SubramaImageService] RESULTADO BACKEND:');
        console.log('   - Subimos: 1 imagen');
        console.log('   - Backend devolvió:', updatedSubrama.subgroupGalleryObjectIds.length, 'URLs');
        console.log('   - URLs devueltas:', updatedSubrama.subgroupGalleryObjectIds);
        
        if (updatedSubrama.subgroupGalleryObjectIds.length > 1) {
          console.log('⚠️ [SubramaImageService] POSIBLE CAUSA: Backend está generando variantes automáticamente (thumbnails, diferentes resoluciones, etc.)');
          console.log('💡 [SubramaImageService] Esto podría ser normal si Supabase está configurado para generar múltiples versiones');
        }
      }
      
      return uploadResponse.url || uploadResponse.objectId;
    } catch (patchError) {
      console.error('❌ [SubramaImageService] Error en endpoint PATCH para agregar imagen a subrama:', patchError);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [SubramaImageService] Error agregando imagen a galería de subrama:', error);
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
  console.log('🔄 [SubramaImageService] Reemplazando imagen en galería de subrama...');
  console.log('📝 [SubramaImageService] Parámetros:', {
    sectionId,
    subgroupId,
    targetImageUuid,
    newFileName: newFile.name,
    newFileSize: newFile.size
  });
  
  try {
    // Paso 1: Subir el nuevo archivo
    console.log('🔄 [SubramaImageService] Subiendo nueva imagen...');
    const formData = new FormData();
    formData.append('file', newFile);
    
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    console.log('✅ [SubramaImageService] Nueva imagen subida, objectId:', uploadResponse.objectId);
    
    // Paso 2: Usar endpoint PATCH para reemplazar la imagen en la galería de subrama
    console.log('🔄 [SubramaImageService] Reemplazando imagen en galería de subrama usando endpoint PATCH...');
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    console.log('📍 [SubramaImageService] Endpoint PATCH:', patchEndpoint);
    
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
    
    console.log('🔄 [SubramaImageService] PATCH payload para reemplazar imagen en subrama:', replacePayload);
    
    try {
      await apiClient.patch(patchEndpoint, replacePayload);
      console.log('✅ [SubramaImageService] Imagen reemplazada correctamente en galería de subrama');
      
      // Obtener datos actualizados de la subrama para tener las URLs correctas
      console.log('🔄 [SubramaImageService] Obteniendo datos actualizados de la subrama...');
      const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
      
      if (updatedSubrama && updatedSubrama.subgroupGalleryObjectIds && updatedSubrama.subgroupGalleryObjectIds.length > 0) {
        // Como el backend reemplaza en el mismo índice, podemos retornar la URL del upload
        console.log('✅ [SubramaImageService] Datos actualizados de subrama obtenidos');
        return uploadResponse.url || uploadResponse.objectId;
      } else {
        console.warn('⚠️ [SubramaImageService] No se pudieron obtener datos actualizados de subrama, usando URL del upload');
        return uploadResponse.url || uploadResponse.objectId;
      }
    } catch (patchError) {
      console.error('❌ [SubramaImageService] Error en endpoint PATCH para reemplazar imagen en subrama:', patchError);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [SubramaImageService] Error reemplazando imagen en galería de subrama:', error);
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
  console.log('🗑️ [SubramaImageService] Eliminando imagen de galería de subrama...');
  console.log('📝 [SubramaImageService] Parámetros:', {
    sectionId,
    subgroupId,
    targetImageUuid
  });
  
  try {
    // Usar endpoint PATCH para eliminar de la galería de subrama
    console.log('🔄 [SubramaImageService] Eliminando imagen de galería de subrama usando endpoint PATCH...');
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    console.log('📍 [SubramaImageService] Endpoint PATCH:', patchEndpoint);
    
    // Crear el payload de operación según la guía del backend
    const removePayload = {
      operations: [
        {
          op: "remove",
          targetUuid: targetImageUuid
        }
      ]
    };
    
    console.log('🔄 [SubramaImageService] PATCH payload para eliminar imagen de subrama:', removePayload);
    
    try {
      await apiClient.patch(patchEndpoint, removePayload);
      console.log('✅ [SubramaImageService] Imagen eliminada correctamente de galería de subrama');
    } catch (patchError) {
      console.error('❌ [SubramaImageService] Error en endpoint PATCH para eliminar imagen de subrama:', patchError);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [SubramaImageService] Error eliminando imagen de galería de subrama:', error);
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
  console.log('🔍 [SubramaImageService] Obteniendo UUIDs de galería para subrama:', subgroupId);
  
  try {
    const subrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
    if (subrama && subrama.subgroupGalleryObjectIds) {
      console.log('✅ [SubramaImageService] UUIDs de galería de subrama obtenidos:', subrama.subgroupGalleryObjectIds);
      return subrama.subgroupGalleryObjectIds;
    }
    console.log('ℹ️ [SubramaImageService] No hay imágenes en la galería de subrama');
    return [];
  } catch (error) {
    console.error('❌ [SubramaImageService] Error obteniendo UUIDs de galería de subrama:', error);
    return [];
  }
};