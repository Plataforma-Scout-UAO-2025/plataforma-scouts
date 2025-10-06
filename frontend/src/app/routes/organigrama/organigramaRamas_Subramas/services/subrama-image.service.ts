import { apiClient } from './apiClient';
import { PATCH_ENDPOINTS } from '../constants/api-endpoints';
import { getSubramaById } from './subrama.service';

// ============================================================================
// 📸 ACTUALIZAR FOTO PRINCIPAL DE SUBRAMA
// ============================================================================
export const updateSubramaMainImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  file: File
): Promise<string> => {
  console.log('📤 [SubramaImageService] Actualizando foto principal de subrama...');

  try {
    // 1️⃣ Subir el archivo a storage
    const formData = new FormData();
    formData.append('file', file);
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
    console.log('✅ Archivo subido:', uploadResponse.objectId);

    // 2️⃣ PATCH al endpoint de imagen principal
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_MAIN_IMAGE(tenantSlug, groupSlug, sectionId, subgroupId);
    const mainImagePayload = { objectId: uploadResponse.objectId };
    console.log('📡 PATCH →', patchEndpoint, mainImagePayload);

    await apiClient.patch(patchEndpoint, mainImagePayload);
    console.log('✅ Foto principal de subrama actualizada correctamente.');

    // 3️⃣ Obtener la subrama actualizada
    const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
    if (updatedSubrama?.imagenPrincipal) {
      console.log('✅ URL actualizada recibida:', updatedSubrama.imagenPrincipal);
      return updatedSubrama.imagenPrincipal;
    }

    console.warn('⚠️ No se encontró imagenPrincipal actualizada, usando URL del upload.');
    return uploadResponse.url || uploadResponse.objectId;

  } catch (error) {
    console.error('❌ Error actualizando foto principal de subrama:', error);
    throw error;
  }
};

// ============================================================================
// 🖼️ GALERÍA DE SUBRAMAS
// ============================================================================

// 📤 Subir múltiples imágenes a la galería
export const uploadSubramaGalleryImages = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  files: File[]
): Promise<string[]> => {
  console.log('📤 [SubramaImageService] Subiendo imágenes de galería de subrama...');

  try {
    const objectIds: string[] = [];
    const urls: string[] = [];

    // Subir cada archivo
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);
      objectIds.push(uploadResponse.objectId);
      urls.push(uploadResponse.url || uploadResponse.objectId);
    }

    // PATCH al endpoint de galería
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    const galleryPayload = {
      operations: objectIds.map(objectId => ({ op: "add", newValue: objectId }))
    };

    console.log('📡 PATCH →', patchEndpoint, galleryPayload);
    await apiClient.patch(patchEndpoint, galleryPayload);
    console.log('✅ Galería de subrama actualizada correctamente.');

    // Refrescar la subrama
    const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
    return updatedSubrama?.subgroupGalleryObjectIds || urls;

  } catch (error) {
    console.error('❌ Error subiendo galería de subrama:', error);
    throw error;
  }
};

// 📸 Agregar una sola imagen a la galería
export const addSubramaGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  file: File
): Promise<string> => {
  console.log('📤 [SubramaImageService] Agregando imagen individual a galería...');

  try {
    // Subir el archivo
    const formData = new FormData();
    formData.append('file', file);
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);

    // PATCH al endpoint de galería
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    const addPayload = { operations: [{ op: "add", newValue: uploadResponse.objectId }] };
    console.log('📡 PATCH →', patchEndpoint, addPayload);

    await apiClient.patch(patchEndpoint, addPayload);
    console.log('✅ Imagen agregada correctamente a la galería.');

    return uploadResponse.url || uploadResponse.objectId;

  } catch (error) {
    console.error('❌ Error agregando imagen a la galería de subrama:', error);
    throw error;
  }
};

// 🔄 Reemplazar una imagen existente en la galería
export const replaceSubramaGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  targetImageUuid: string,
  newFile: File
): Promise<string> => {
  console.log('🔄 [SubramaImageService] Reemplazando imagen en galería de subrama...');

  try {
    // 1️⃣ Subir el nuevo archivo
    const formData = new FormData();
    formData.append('file', newFile);
    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>('/api/storage/upload', formData);

    // 🧠 Extraer solo UUID limpio
    const cleanUuid = targetImageUuid.match(/[0-9a-fA-F-]{36}/)?.[0] || targetImageUuid;
    console.log('🧠 UUID limpio para reemplazo:', cleanUuid);

    // 2️⃣ PATCH con operación replace
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    const replacePayload = {
      operations: [{ op: "replace", targetUuid: cleanUuid, newValue: uploadResponse.objectId }]
    };
    console.log('📡 PATCH →', patchEndpoint, replacePayload);

    await apiClient.patch(patchEndpoint, replacePayload);
    console.log('✅ Imagen reemplazada correctamente en la galería.');

    // 3️⃣ Obtener datos actualizados
    const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
    return updatedSubrama?.subgroupGalleryObjectIds?.find(url => url.includes(uploadResponse.objectId))
      || uploadResponse.url
      || uploadResponse.objectId;

  } catch (error) {
    console.error('❌ Error reemplazando imagen en galería de subrama:', error);
    throw error;
  }
};

// 🗑️ Eliminar la foto principal de una subrama
export const removeSubramaMainImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string
): Promise<void> => {
  console.log('🗑️ [SubramaImageService] Eliminando foto principal de subrama...');

  try {
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_MAIN_IMAGE(tenantSlug, groupSlug, sectionId, subgroupId);
    const payload = { objectId: null }; // El backend interpreta null como eliminar
    console.log('📡 PATCH →', patchEndpoint, payload);

    await apiClient.patch(patchEndpoint, payload);
    console.log('✅ Foto principal de subrama eliminada correctamente.');
  } catch (error) {
    console.error('❌ Error eliminando foto principal de subrama:', error);
    throw error;
  }
};


// 🗑️ Eliminar una imagen de la galería
export const removeSubramaGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  targetImageUuid: string
): Promise<void> => {
  console.log('🗑️ [SubramaImageService] Eliminando imagen de galería de subrama...');

  try {
    // 🧠 Extraer solo UUID limpio
    const cleanUuid = targetImageUuid.match(/[0-9a-fA-F-]{36}/)?.[0] || targetImageUuid;
    console.log('🧠 UUID limpio para eliminación:', cleanUuid);

    // PATCH con operación remove
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    const removePayload = { operations: [{ op: "remove", targetUuid: cleanUuid }] };
    console.log('📡 PATCH →', patchEndpoint, removePayload);

    await apiClient.patch(patchEndpoint, removePayload);
    console.log('✅ Imagen eliminada correctamente de la galería.');

  } catch (error) {
    console.error('❌ Error eliminando imagen de galería de subrama:', error);
    throw error;
  }
};

// 🔍 Obtener UUIDs de la galería de una subrama
export const getSubramaGalleryImageUuids = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string
): Promise<string[]> => {
  console.log('🔍 [SubramaImageService] Obteniendo UUIDs de galería para subrama:', subgroupId);

  try {
    const subrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
    if (subrama?.subgroupGalleryObjectIds) {
      console.log('✅ UUIDs obtenidos:', subrama.subgroupGalleryObjectIds);
      return subrama.subgroupGalleryObjectIds;
    }
    console.log('ℹ️ No hay imágenes en la galería de subrama.');
    return [];

  } catch (error) {
    console.error('❌ Error obteniendo UUIDs de galería de subrama:', error);
    return [];
  }
};
