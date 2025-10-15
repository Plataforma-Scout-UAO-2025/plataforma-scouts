import { postFormData, uploadToStorage } from '@/api/upload';
import { getSubramaById } from './subrama.service';
import { createAddsPayloadFromArray, createAddPayload, createReplacePayload, createRemovePayload, createPayloadForBackend } from '../utils/galleryPayload';
import { setSubgroupPhotoPrincipal, patchSubgroupGallery, deleteSubgroupPhotoPrincipal } from '@/api/organigramaApi';
import type { GalleryAddOperation, GalleryReplaceOperation, GalleryRemoveOperation } from '../types/operations';


export const updateSubramaMainImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  file: File,
  onFileProgress?: (fileName: string, percent: number) => void,
  signal?: AbortSignal
): Promise<string> => {

  try {
    const formData = new FormData();
    formData.append('file', file);
    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, {
      onUploadProgress: (percent: number) => onFileProgress?.(file.name, percent),
      signal,
    });

    if (signal?.aborted) {
      console.warn(' [SubramaImageService] Upload abortado tras subir el archivo; no se realizará el PATCH.');
      
      throw new Error('UploadCanceled');
    }

    
  // handled by organigramaClient
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
  console.info('🔄 [SubramaImageService] Enviando PATCH (main image) via client:', { attempt: attempt.description, payload: payloadToSend });
  await setSubgroupPhotoPrincipal(sectionId, subgroupId, payloadToSend as Record<string, unknown>, tenantId, groupSlug);
        patched = true;
        break;
      } catch (e: unknown) {
        lastErr = e;
        const errorWithResponse = e as { response?: { data?: unknown } };
        if (errorWithResponse?.response) {
          console.error(' Respuesta del backend en intento PATCH:', errorWithResponse.response?.data);
        } else {
          console.error(' Error en intento PATCH (sin response):', e);
        }
      }
    }

    if (!patched) {
      console.error(' Ningún formato de PATCH funcionó para foto principal de subrama. Último error:', lastErr);
      throw lastErr;
    }

  const updatedSubrama = await getSubramaById(tenantId, groupSlug, sectionId, subgroupId);
  const updatedUrl = updatedSubrama?.mainImageUrl ?? updatedSubrama?.imagenPrincipal ?? undefined;
    if (updatedUrl) {
      return updatedUrl;
    }

    console.warn(' No se encontró imagenPrincipal actualizada, usando URL del upload.');
    return uploadResponse.url || uploadResponse.objectId;

    } catch (error: unknown) {
    console.error(' Error actualizando foto principal de subrama:', error);
    throw error;
  }
};

export const uploadSubramaGalleryImages = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  files: File[]
): Promise<string[]> => {

  try {
    const objectIds: string[] = [];
    const urls: string[] = [];

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

  // handled by organigramaClient
    const galleryPayload = createAddsPayloadFromArray(objectIds);
    const galleryPayloadToSend = galleryPayload && typeof galleryPayload === 'object' && 'operations' in galleryPayload
      ? (Array.isArray((galleryPayload as unknown as { operations?: unknown }).operations)
          ? createPayloadForBackend((galleryPayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
          : galleryPayload)
      : galleryPayload;
  await patchSubgroupGallery(sectionId, subgroupId, galleryPayloadToSend as Record<string, unknown>, tenantId, groupSlug);

  const updatedSubrama = await getSubramaById(tenantId, groupSlug, sectionId, subgroupId);
  const returnedUrls = updatedSubrama?.galleryObjectIds ?? updatedSubrama?.subgroupGalleryObjectIds ?? urls;
  return returnedUrls;

  } catch (error) {
    console.error(' Error subiendo galería de subrama:', error);
    throw error;
  }
};

export const addSubramaGalleryImage = async (
  tenantId: string,
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

    const addPayload = createAddPayload(uploadResponse.objectId);
    const addPayloadToSend = addPayload && typeof addPayload === 'object' && 'operations' in addPayload
      ? (Array.isArray((addPayload as unknown as { operations?: unknown }).operations)
          ? createPayloadForBackend((addPayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
          : addPayload)
      : addPayload;
  await patchSubgroupGallery(sectionId, subgroupId, addPayloadToSend as Record<string, unknown>, tenantId, groupSlug);

    return uploadResponse.url || uploadResponse.objectId;

  } catch (error) {
    console.error(' Error agregando imagen a la galería de subrama:', error);
    throw error;
  }
};

export const replaceSubramaGalleryImage = async (
  tenantId: string,
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

    const replacePayload = createReplacePayload(cleanUuid, uploadResponse.objectId);
    const replacePayloadToSend = replacePayload && typeof replacePayload === 'object' && 'operations' in replacePayload
      ? (Array.isArray((replacePayload as unknown as { operations?: unknown }).operations)
          ? createPayloadForBackend((replacePayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
          : replacePayload)
      : replacePayload;
  await patchSubgroupGallery(sectionId, subgroupId, replacePayloadToSend as Record<string, unknown>, tenantId, groupSlug);

  const updatedSubrama = await getSubramaById(tenantId, groupSlug, sectionId, subgroupId);
  const urls = updatedSubrama?.galleryObjectIds ?? updatedSubrama?.subgroupGalleryObjectIds ?? [];
    return urls.find((url: string) => url.includes(uploadResponse.objectId))
      || uploadResponse.url
      || uploadResponse.objectId;

  } catch (error) {
    console.error(' Error reemplazando imagen en galería de subrama:', error);
    throw error;
  }
};

export const removeSubramaMainImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string
): Promise<void> => {

  try {
    console.debug('🔁 [SubramaImageService] Eliminando foto principal de subrama...');
    await deleteSubgroupPhotoPrincipal(sectionId, subgroupId, tenantId, groupSlug);
    console.debug('🔁 [SubramaImageService] Foto principal eliminada correctamente');
    
    try {
      const refreshed = await getSubramaById(tenantId, groupSlug, sectionId, subgroupId);
      const mainStill = refreshed?.mainImageUrl ?? refreshed?.imagenPrincipal ?? null;
      if (mainStill) {
        console.warn(' [SubramaImageService] El DELETE devolvió éxito pero la referencia a mainImage sigue presente:', mainStill);
        console.info('[TELEMETRY] remove_main_image.result', { tenantId, groupSlug, sectionId, subgroupId, removed: false });
      } else {
        console.info('[TELEMETRY] remove_main_image.result', { tenantId, groupSlug, sectionId, subgroupId, removed: true });
      }
    } catch (refreshErr) {
      console.error(' Error refrescando subrama tras remove main image:', refreshErr);
      console.info('[TELEMETRY] remove_main_image.result', { tenantId, groupSlug, sectionId, subgroupId, removed: 'unknown', error: String(refreshErr) });
    }
  } catch (error) {
    console.error(' Error eliminando foto principal de subrama:', error);
    throw error;
  }
};

export const removeSubramaGalleryImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  targetImageUuid: string
): Promise<void> => {

  try {
    const cleanUuid = targetImageUuid.match(/[0-9a-fA-F-]{36}/)?.[0] || targetImageUuid;

  // handled by organigramaClient
    const removePayload = createRemovePayload(cleanUuid);
    const removePayloadToSend = removePayload && typeof removePayload === 'object' && 'operations' in removePayload
      ? (Array.isArray((removePayload as unknown as { operations?: unknown }).operations)
          ? createPayloadForBackend((removePayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
          : removePayload)
      : removePayload;
    try {
    console.debug('🔁 [SubramaImageService] Enviando PATCH remove (gallery):', { payload: removePayloadToSend });
    const resp = await patchSubgroupGallery(sectionId, subgroupId, removePayloadToSend as Record<string, unknown>, tenantId, groupSlug);
  console.debug('🔁 [SubramaImageService] Respuesta PATCH remove (gallery):', { data: resp });
    } catch (patchErr) {
      console.error(' Error PATCH remove en galería:', patchErr);
      throw patchErr;
    }

    try {
      const updated = await getSubramaById(tenantId, groupSlug, sectionId, subgroupId);
      const remaining = updated?.galleryObjectIds ?? updated?.subgroupGalleryObjectIds ?? [];
      const stillPresent = remaining.some((u: string) => u.includes(cleanUuid));
      if (stillPresent) {
        console.warn(` [SubramaImageService] Remove operation reported success but UUID still present: ${cleanUuid}`);
  console.info('[TELEMETRY] remove_gallery_reference.result', { tenantId, groupSlug, sectionId, subgroupId, targetUuid: cleanUuid, removed: false });
      } else {
        console.info(` [SubramaImageService] Reference removed from gallery: ${cleanUuid}`);
  console.info('[TELEMETRY] remove_gallery_reference.result', { tenantId, groupSlug, sectionId, subgroupId, targetUuid: cleanUuid, removed: true });
      }
    } catch (refreshErr) {
      console.error(' Error refrescando subrama tras remove gallery:', refreshErr);
  console.info('[TELEMETRY] remove_gallery_reference.result', { tenantId, groupSlug, sectionId, subgroupId, targetUuid: cleanUuid, removed: 'unknown', error: String(refreshErr) });
    }

  } catch (error) {
    console.error(' Error eliminando imagen de galería de subrama:', error);
    throw error;
  }
};

export const getSubramaGalleryImageUuids = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string
): Promise<string[]> => {

  try {
  const subrama = await getSubramaById(tenantId, groupSlug, sectionId, subgroupId);
  const uuids = subrama?.galleryObjectIds ?? subrama?.subgroupGalleryObjectIds ?? [];
    if (uuids && uuids.length > 0) {
      return uuids;
    }
    return [];

  } catch (error) {
    console.error(' Error obteniendo UUIDs de galería de subrama:', error);
    return [];
  }
};