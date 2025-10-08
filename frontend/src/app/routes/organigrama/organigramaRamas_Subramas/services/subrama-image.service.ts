import api from "@/api/axios";
import { postFormData } from "@/api/formData";
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
  file: File,
  onFileProgress?: (fileName: string, percent: number) => void,
  signal?: AbortSignal
): Promise<string> => {
  console.log('📤 [SubramaImageService] Actualizando foto principal de subrama...');

  try {
    // 1️⃣ Subir el archivo a storage
    const formData = new FormData();
    formData.append('file', file);
    const uploadResponse = await postFormData<{ objectId: string; url: string }>(
      'storage/upload',
      formData,
      {
        onUploadProgress: (percent: number) => onFileProgress?.(file.name, percent),
        signal,
      }
    );
    console.log('✅ Archivo subido:', uploadResponse.objectId);

    // Si la señal fue abortada inmediatamente después del upload, no asociamos
    // el objeto al backend: el usuario canceló la operación. Lanzamos un
    // error controlado para que el caller restaure el preview y no se ejecute
    // el PATCH que actualiza la imagen principal.
    if (signal?.aborted) {
      console.warn('⚠️ [SubramaImageService] Upload abortado tras subir el archivo; no se realizará el PATCH.');
      // Nota: no intentamos borrar el objeto subido aquí (backend/storage)
      // porque podría requerir credenciales adicionales; dejarlo para limpieza
      // asíncrona en el servidor o tarea de mantenimiento.
      throw new Error('UploadCanceled');
    }

    // 2️⃣ PATCH al endpoint de imagen principal: intentaremos varios formatos porque el backend puede esperar snake_case u operaciones
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_MAIN_IMAGE(tenantSlug, groupSlug, sectionId, subgroupId);
    const attempts = [
      { description: 'camelCase objectId', payload: { objectId: uploadResponse.objectId } },
      { description: 'snake_case object_id', payload: { object_id: uploadResponse.objectId } },
      { description: 'operations add', payload: { operations: [{ op: 'add', newValue: uploadResponse.objectId }] } },
      { description: 'operations replace', payload: { operations: [{ op: 'replace', newValue: uploadResponse.objectId }] } },
    ];

    let patched = false;
    let lastErr: unknown = null;
    for (const attempt of attempts) {
      console.log('📡 PATCH →', patchEndpoint, attempt.description, attempt.payload);
      try {
        const res = await api.patch(patchEndpoint, attempt.payload as unknown);
          console.log(`✅ Foto principal de subrama actualizada correctamente con formato: ${attempt.description}`, res?.data ?? res);
        patched = true;
        break;
      } catch (e: unknown) {
        lastErr = e;
        const errorWithResponse = e as { response?: { data?: unknown } };
        if (errorWithResponse?.response) {
          console.error('❌ Respuesta del backend en intento PATCH:', errorWithResponse.response?.data);
        } else {
          console.error('❌ Error en intento PATCH (sin response):', e);
        }
        // continuar con siguiente intento
      }
    }

    if (!patched) {
      console.error('❌ Ningún formato de PATCH funcionó para foto principal de subrama. Último error:', lastErr);
      throw lastErr;
    }

    // 3️⃣ Obtener la subrama actualizada
  const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
  // Prefer new english-named properties, fallback to legacy spanish ones
  const updatedUrl = updatedSubrama?.mainImageUrl ?? updatedSubrama?.imagenPrincipal ?? undefined;
    if (updatedUrl) {
      console.log('✅ URL actualizada recibida:', updatedUrl);
      return updatedUrl;
    }

    console.warn('⚠️ No se encontró imagenPrincipal actualizada, usando URL del upload.');
    return uploadResponse.url || uploadResponse.objectId;

    } catch (error: unknown) {
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
      const uploadResponse = await postFormData<{ objectId: string; url: string }>(
        'storage/upload',
        formData
      );
      objectIds.push(uploadResponse.objectId);
      urls.push(uploadResponse.url || uploadResponse.objectId);
    }

    // PATCH al endpoint de galería
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    const galleryPayload = {
      operations: objectIds.map(objectId => ({ op: "add", newValue: objectId }))
    };

    console.log('📡 PATCH →', patchEndpoint, galleryPayload);
  await api.patch(patchEndpoint, galleryPayload);
    console.log('✅ Galería de subrama actualizada correctamente.');

    // Refrescar la subrama
    const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
    // Prefer new galleryObjectIds, fallback to legacy subgroupGalleryObjectIds (legacy prop is untyped)
  const returnedUrls = updatedSubrama?.galleryObjectIds ?? updatedSubrama?.subgroupGalleryObjectIds ?? urls;
  return returnedUrls;

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
    const uploadResponse = await postFormData<{ objectId: string; url: string }>(
      'storage/upload',
      formData
    );

    // PATCH al endpoint de galería
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    const addPayload = { operations: [{ op: "add", newValue: uploadResponse.objectId }] };
    console.log('📡 PATCH →', patchEndpoint, addPayload);

  await api.patch(patchEndpoint, addPayload);
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
    const uploadResponse = await postFormData<{ objectId: string; url: string }>(
      'storage/upload',
      formData
    );

    // 🧠 Extraer solo UUID limpio
    const cleanUuid = targetImageUuid.match(/[0-9a-fA-F-]{36}/)?.[0] || targetImageUuid;
    console.log('🧠 UUID limpio para reemplazo:', cleanUuid);

    // 2️⃣ PATCH con operación replace
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(tenantSlug, groupSlug, sectionId, subgroupId);
    const replacePayload = {
      operations: [{ op: "replace", targetUuid: cleanUuid, newValue: uploadResponse.objectId }]
    };
    console.log('📡 PATCH →', patchEndpoint, replacePayload);

  await api.patch(patchEndpoint, replacePayload);
    console.log('✅ Imagen reemplazada correctamente en la galería.');

    // 3️⃣ Obtener datos actualizados
  const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
  const urls = updatedSubrama?.galleryObjectIds ?? updatedSubrama?.subgroupGalleryObjectIds ?? [];
    return urls.find((url: string) => url.includes(uploadResponse.objectId))
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

    // Intentar varios formatos por compatibilidad
    const attempts = [
      { description: 'camelCase objectId null', payload: { objectId: null } },
      { description: 'snake_case object_id null', payload: { object_id: null } },
      { description: 'operations remove (targetUuid null)', payload: { operations: [{ op: 'remove', targetUuid: null }] } },
      { description: 'operations remove (newValue null)', payload: { operations: [{ op: 'remove', newValue: null }] } },
    ];

    let lastErr: unknown = null;
    let removed = false;
    for (const attempt of attempts) {
      console.log('📡 PATCH →', patchEndpoint, attempt.description, attempt.payload);
      try {
        const res = await api.patch(patchEndpoint, attempt.payload as Record<string, unknown>);
        console.log(`✅ Foto principal de subrama eliminada correctamente con formato: ${attempt.description}`, res?.data ?? res);
        removed = true;
        break;
      } catch (e: unknown) {
        lastErr = e;
        const errorWithResponse = e as { response?: { data?: unknown } };
        if (errorWithResponse?.response) {
          console.error('❌ Respuesta del backend en intento de eliminación:', errorWithResponse.response?.data);
        } else {
          console.error('❌ Error en intento de eliminación (sin response):', e);
        }
      }
    }

    if (!removed) {
      console.error('❌ Ningún formato funcionó para eliminar la foto principal de subrama. Último error:', lastErr);
      throw lastErr;
    }
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

  await api.patch(patchEndpoint, removePayload);
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
  const uuids = subrama?.galleryObjectIds ?? subrama?.subgroupGalleryObjectIds ?? [];
    if (uuids && uuids.length > 0) {
      console.log('✅ UUIDs obtenidos:', uuids);
      return uuids;
    }
    console.log('ℹ️ No hay imágenes en la galería de subrama.');
    return [];

  } catch (error) {
    console.error('❌ Error obteniendo UUIDs de galería de subrama:', error);
    return [];
  }
};
