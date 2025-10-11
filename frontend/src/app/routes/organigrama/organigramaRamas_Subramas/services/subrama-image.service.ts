import api from "@/api/axios";
import { postFormData, uploadToStorage } from '@/api/upload';
import { subgroupPath } from '@/api/organigramaApi';
import { getSubramaById } from './subrama.service';
import { createAddsPayloadFromArray, createAddPayload, createReplacePayload, createRemovePayload, createPayloadForBackend } from '../utils/galleryPayload';

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
  // Actualizando foto principal de subrama

  try {
    // 1️⃣ Subir el archivo a storage
    const formData = new FormData();
    formData.append('file', file);
    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, {
      onUploadProgress: (percent: number) => onFileProgress?.(file.name, percent),
      signal,
    });
  // Archivo subido: uploadResponse.objectId

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
  const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/photo-principal`;
    const attempts = [
      { description: 'camelCase objectId', payload: { objectId: uploadResponse.objectId } },
      { description: 'snake_case object_id', payload: { object_id: uploadResponse.objectId } },
      { description: 'operations add', payload: createAddPayload(uploadResponse.objectId) },
      { description: 'operations replace', payload: createReplacePayload(uploadResponse.objectId, uploadResponse.objectId) },
    ];

    let patched = false;
    let lastErr: unknown = null;
    for (const attempt of attempts) {
      // Intentando PATCH: attempt.description
      try {
        const payloadToSend = attempt.payload && typeof attempt.payload === 'object' && 'operations' in attempt.payload
          ? createPayloadForBackend((attempt.payload as any).operations)
          : attempt.payload;
        await api.patch(patchEndpoint, payloadToSend as unknown);
        // PATCH succeeded for attempt.description
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
      // URL actualizada recibida: updatedUrl
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
  // Subiendo imágenes de galería de subrama

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
  const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/gallery`;
    const galleryPayload = createAddsPayloadFromArray(objectIds);
    // PATCH gallery payload prepared
    const galleryPayloadToSend = galleryPayload && typeof galleryPayload === 'object' && 'operations' in galleryPayload
      ? createPayloadForBackend((galleryPayload as any).operations)
      : galleryPayload;
    await api.patch(patchEndpoint, galleryPayloadToSend);

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
  // Agregando imagen individual a galería

  try {
    // Subir el archivo
    const formData = new FormData();
    formData.append('file', file);
    const uploadResponse = await postFormData<{ objectId: string; url: string }>(
      'storage/upload',
      formData
    );

    // PATCH al endpoint de galería
  const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/gallery`;
    const addPayload = createAddPayload(uploadResponse.objectId);
    // PATCH add payload prepared
    const addPayloadToSend = addPayload && typeof addPayload === 'object' && 'operations' in addPayload
      ? createPayloadForBackend((addPayload as any).operations)
      : addPayload;
    await api.patch(patchEndpoint, addPayloadToSend);

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
  // Reemplazando imagen en galería de subrama

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
  // UUID limpio para reemplazo: cleanUuid

    // 2️⃣ PATCH con operación replace
  const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/gallery`;
    const replacePayload = createReplacePayload(cleanUuid, uploadResponse.objectId);
    // PATCH replace payload prepared
    const replacePayloadToSend = replacePayload && typeof replacePayload === 'object' && 'operations' in replacePayload
      ? createPayloadForBackend((replacePayload as any).operations)
      : replacePayload;
    await api.patch(patchEndpoint, replacePayloadToSend);

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
  // Eliminando foto principal de subrama

  try {
  const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/photo-principal`;

    // Intentar varios formatos por compatibilidad
    const attempts = [
      { description: 'camelCase objectId null', payload: { objectId: null } },
      { description: 'snake_case object_id null', payload: { object_id: null } },
  { description: 'operations remove (targetUuid null)', payload: { operations: [{ op: 'remove', targetUuid: null }] } },
  { description: 'operations remove (value null)', payload: { operations: [{ op: 'remove', targetUuid: null }] } },
    ];

    let lastErr: unknown = null;
    let removed = false;
    for (const attempt of attempts) {
      // Intentando PATCH remove: attempt.description
      try {
        const payloadToSend = attempt.payload && typeof attempt.payload === 'object' && 'operations' in attempt.payload
          ? createPayloadForBackend((attempt.payload as any).operations)
          : attempt.payload;
        console.debug('🔁 [SubramaImageService] Intentando PATCH remove (main image):', { endpoint: patchEndpoint, attempt: attempt.description, payload: payloadToSend });
        const resp = await api.patch(patchEndpoint, payloadToSend as Record<string, unknown>);
        console.debug('🔁 [SubramaImageService] Respuesta PATCH remove (main image):', { status: (resp as any)?.status, data: (resp as any)?.data });
        // Eliminado con formato: attempt.description
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
    // After a successful remove attempt for main image, refresh and verify
    try {
      const refreshed = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
      const mainStill = refreshed?.mainImageUrl ?? refreshed?.imagenPrincipal ?? null;
      if (mainStill) {
        console.warn('⚠️ [SubramaImageService] El PATCH de remove devolvió éxito pero la referencia a mainImage sigue presente:', mainStill);
        console.info('[TELEMETRY] remove_main_image.result', { tenantSlug, groupSlug, sectionId, subgroupId, removed: false });
      } else {
        console.info('[TELEMETRY] remove_main_image.result', { tenantSlug, groupSlug, sectionId, subgroupId, removed: true });
      }
    } catch (refreshErr) {
      console.error('❌ Error refrescando subrama tras remove main image:', refreshErr);
      console.info('[TELEMETRY] remove_main_image.result', { tenantSlug, groupSlug, sectionId, subgroupId, removed: 'unknown', error: String(refreshErr) });
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
  // Eliminando imagen de galería de subrama

  try {
    // 🧠 Extraer solo UUID limpio
    const cleanUuid = targetImageUuid.match(/[0-9a-fA-F-]{36}/)?.[0] || targetImageUuid;
  // UUID limpio para eliminación: cleanUuid

    // PATCH con operación remove
  const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/gallery`;
    const removePayload = createRemovePayload(cleanUuid);
    // PATCH remove payload prepared
    const removePayloadToSend = removePayload && typeof removePayload === 'object' && 'operations' in removePayload
      ? createPayloadForBackend((removePayload as any).operations)
      : removePayload;
    try {
      console.debug('🔁 [SubramaImageService] Enviando PATCH remove (gallery):', { endpoint: patchEndpoint, payload: removePayloadToSend });
      const resp = await api.patch(patchEndpoint, removePayloadToSend);
      console.debug('🔁 [SubramaImageService] Respuesta PATCH remove (gallery):', { status: (resp as any)?.status, data: (resp as any)?.data });
    } catch (patchErr) {
      console.error('❌ Error PATCH remove en galería:', patchErr);
      throw patchErr;
    }

    // After PATCH, refresh and check whether the UUID is still present in the gallery
    try {
      const updated = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
      const remaining = updated?.galleryObjectIds ?? updated?.subgroupGalleryObjectIds ?? [];
      const stillPresent = remaining.some((u: string) => u.includes(cleanUuid));
      if (stillPresent) {
        console.warn(`⚠️ [SubramaImageService] Remove operation reported success but UUID still present: ${cleanUuid}`);
        console.info('[TELEMETRY] remove_gallery_reference.result', { tenantSlug, groupSlug, sectionId, subgroupId, targetUuid: cleanUuid, removed: false });
      } else {
        console.info(`✅ [SubramaImageService] Reference removed from gallery: ${cleanUuid}`);
        console.info('[TELEMETRY] remove_gallery_reference.result', { tenantSlug, groupSlug, sectionId, subgroupId, targetUuid: cleanUuid, removed: true });
      }
    } catch (refreshErr) {
      console.error('❌ Error refrescando subrama tras remove gallery:', refreshErr);
      console.info('[TELEMETRY] remove_gallery_reference.result', { tenantSlug, groupSlug, sectionId, subgroupId, targetUuid: cleanUuid, removed: 'unknown', error: String(refreshErr) });
    }

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
  // Obteniendo UUIDs de galería para subrama: subgroupId

  try {
  const subrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
  const uuids = subrama?.galleryObjectIds ?? subrama?.subgroupGalleryObjectIds ?? [];
    if (uuids && uuids.length > 0) {
      // UUIDs obtenidos: uuids
      return uuids;
    }
    // No hay imágenes en la galería de subrama
    return [];

  } catch (error) {
    console.error('❌ Error obteniendo UUIDs de galería de subrama:', error);
    return [];
  }
};
