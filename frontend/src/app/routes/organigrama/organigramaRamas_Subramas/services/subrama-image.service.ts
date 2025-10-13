import api from "@/api/axios";
import { postFormData, uploadToStorage } from '@/api/upload';
import { subgroupPath } from '@/api/organigramaApi';
import { getSubramaById } from './subrama.service';
import { createAddsPayloadFromArray, createAddPayload, createReplacePayload, createRemovePayload, createPayloadForBackend } from '../utils/galleryPayload';
import type { GalleryAddOperation, GalleryReplaceOperation, GalleryRemoveOperation } from '../types/operations';


export const updateSubramaMainImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  file: File,
  onFileProgress?: (fileName: string, percent: number) => void,
  signal?: AbortSignal
): Promise<string> => {

  try {
    //  Subir el archivo a storage
    const formData = new FormData();
    formData.append('file', file);
    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, {
      onUploadProgress: (percent: number) => onFileProgress?.(file.name, percent),
      signal,
    });

    if (signal?.aborted) {
      console.warn('⚠️ [SubramaImageService] Upload abortado tras subir el archivo; no se realizará el PATCH.');
      
      throw new Error('UploadCanceled');
    }

    
  const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/photo-principal`;
    const attempts = [
      { description: 'snake_case object_id', payload: { object_id: uploadResponse.objectId } },
      { description: 'operations add', payload: createAddPayload(uploadResponse.objectId) },
      { description: 'operations replace', payload: createReplacePayload(uploadResponse.objectId, uploadResponse.objectId) },
    ];

    let patched = false;
    let lastErr: unknown = null;
    for (const attempt of attempts) {
      try {
        const payloadToSend = attempt.payload && typeof attempt.payload === 'object' && 'operations' in attempt.payload
          ? (Array.isArray((attempt.payload as unknown as { operations?: unknown }).operations)
              ? createPayloadForBackend((attempt.payload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
              : attempt.payload)
          : attempt.payload;
        console.info('🔄 [SubramaImageService] Enviando PATCH (main image):', { endpoint: patchEndpoint, attempt: attempt.description, payload: payloadToSend });
        await api.patch(patchEndpoint, payloadToSend as unknown);
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
      }
    }

    if (!patched) {
      console.error('❌ Ningún formato de PATCH funcionó para foto principal de subrama. Último error:', lastErr);
      throw lastErr;
    }

  const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
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



//Subir múltiples imágenes a la galería
export const uploadSubramaGalleryImages = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  files: File[]
): Promise<string[]> => {

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

  const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/gallery`;
    const galleryPayload = createAddsPayloadFromArray(objectIds);
    const galleryPayloadToSend = galleryPayload && typeof galleryPayload === 'object' && 'operations' in galleryPayload
      ? (Array.isArray((galleryPayload as unknown as { operations?: unknown }).operations)
          ? createPayloadForBackend((galleryPayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
          : galleryPayload)
      : galleryPayload;
    await api.patch(patchEndpoint, galleryPayloadToSend);

    const updatedSubrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
  const returnedUrls = updatedSubrama?.galleryObjectIds ?? updatedSubrama?.subgroupGalleryObjectIds ?? urls;
  return returnedUrls;

  } catch (error) {
    console.error('❌ Error subiendo galería de subrama:', error);
    throw error;
  }
};

//  Agregar una sola imagen a la galería
export const addSubramaGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  file: File
): Promise<string> => {

  try {
    const formData = new FormData();
    formData.append('file', file);
    const uploadResponse = await postFormData<{ objectId: string; url: string }>(
      'storage/upload',
      formData
    );

  const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/gallery`;
    const addPayload = createAddPayload(uploadResponse.objectId);
    const addPayloadToSend = addPayload && typeof addPayload === 'object' && 'operations' in addPayload
      ? (Array.isArray((addPayload as unknown as { operations?: unknown }).operations)
          ? createPayloadForBackend((addPayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
          : addPayload)
      : addPayload;
    await api.patch(patchEndpoint, addPayloadToSend);

    return uploadResponse.url || uploadResponse.objectId;

  } catch (error) {
    console.error('❌ Error agregando imagen a la galería de subrama:', error);
    throw error;
  }
};

export const replaceSubramaGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  targetImageUuid: string,
  newFile: File
): Promise<string> => {

  try {
    const formData = new FormData();
    formData.append('file', newFile);
    const uploadResponse = await postFormData<{ objectId: string; url: string }>(
      'storage/upload',
      formData
    );

    const cleanUuid = targetImageUuid.match(/[0-9a-fA-F-]{36}/)?.[0] || targetImageUuid;

  const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/gallery`;
    const replacePayload = createReplacePayload(cleanUuid, uploadResponse.objectId);
    const replacePayloadToSend = replacePayload && typeof replacePayload === 'object' && 'operations' in replacePayload
      ? (Array.isArray((replacePayload as unknown as { operations?: unknown }).operations)
          ? createPayloadForBackend((replacePayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
          : replacePayload)
      : replacePayload;
    await api.patch(patchEndpoint, replacePayloadToSend);

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

//  Eliminar la foto principal de una subrama
export const removeSubramaMainImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string
): Promise<void> => {

  try {
  const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/photo-principal`;

    const attempts = [
      { description: 'snake_case object_id null', payload: { object_id: null } },
      { description: 'operations remove (targetUuid null)', payload: { operations: [{ op: 'remove', targetUuid: null }] } },
      { description: 'operations remove (value null)', payload: { operations: [{ op: 'remove', targetUuid: null }] } },
    ];

    let lastErr: unknown = null;
    let removed = false;
    for (const attempt of attempts) {
      try {
        const payloadToSend = attempt.payload && typeof attempt.payload === 'object' && 'operations' in attempt.payload
          ? (Array.isArray((attempt.payload as unknown as { operations?: unknown }).operations)
              ? createPayloadForBackend((attempt.payload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
              : attempt.payload)
          : attempt.payload;
        console.debug('🔁 [SubramaImageService] Intentando PATCH remove (main image):', { endpoint: patchEndpoint, attempt: attempt.description, payload: payloadToSend });
        const resp = await api.patch(patchEndpoint, payloadToSend as Record<string, unknown>);
  console.debug('🔁 [SubramaImageService] Respuesta PATCH remove (main image):', { status: (resp as unknown as { status?: number })?.status, data: (resp as unknown as { data?: unknown })?.data });
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


// Eliminar una imagen de la galería
export const removeSubramaGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  targetImageUuid: string
): Promise<void> => {

  try {
    const cleanUuid = targetImageUuid.match(/[0-9a-fA-F-]{36}/)?.[0] || targetImageUuid;

  const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/gallery`;
    const removePayload = createRemovePayload(cleanUuid);
    const removePayloadToSend = removePayload && typeof removePayload === 'object' && 'operations' in removePayload
      ? (Array.isArray((removePayload as unknown as { operations?: unknown }).operations)
          ? createPayloadForBackend((removePayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
          : removePayload)
      : removePayload;
    try {
      console.debug('🔁 [SubramaImageService] Enviando PATCH remove (gallery):', { endpoint: patchEndpoint, payload: removePayloadToSend });
      const resp = await api.patch(patchEndpoint, removePayloadToSend);
  console.debug('🔁 [SubramaImageService] Respuesta PATCH remove (gallery):', { status: (resp as unknown as { status?: number })?.status, data: (resp as unknown as { data?: unknown })?.data });
    } catch (patchErr) {
      console.error('❌ Error PATCH remove en galería:', patchErr);
      throw patchErr;
    }

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

// Obtener UUIDs de la galería de una subrama
export const getSubramaGalleryImageUuids = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string
): Promise<string[]> => {

  try {
  const subrama = await getSubramaById(tenantSlug, groupSlug, sectionId, subgroupId);
  const uuids = subrama?.galleryObjectIds ?? subrama?.subgroupGalleryObjectIds ?? [];
    if (uuids && uuids.length > 0) {
      // UUIDs obtenidos: uuids
      return uuids;
    }
    return [];

  } catch (error) {
    console.error('❌ Error obteniendo UUIDs de galería de subrama:', error);
    return [];
  }
};
