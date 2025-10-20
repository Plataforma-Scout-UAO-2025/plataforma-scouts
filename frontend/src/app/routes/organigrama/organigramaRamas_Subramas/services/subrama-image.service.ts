import { postFormData, uploadToStorage } from '@/api/upload';
import { getSubramaById } from './subrama.service';
import { createAddsPayloadFromArray, createAddPayload, createReplacePayload, createPayloadForBackend } from '../utils/galleryPayload';
import { setSubgroupPhotoPrincipal, patchSubgroupGallery, deleteSubgroupPhotoPrincipal } from '@/api/organigramaApi';
import type { GalleryAddOperation, GalleryReplaceOperation } from '../types/operations';


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
      { description: 'operations add', payload: { objectId: uploadResponse.objectId } },
      { description: 'operations replace', payload: { objectId: uploadResponse.objectId } },
    ];

    let patched = false;
    let lastErr: unknown = null;
    for (const attempt of attempts) {
      try {
        const payloadToSend = attempt.payload && typeof attempt.payload === 'object' && 'operations' in attempt.payload
          ? (Array.isArray((attempt.payload as unknown as { operations?: unknown }).operations)
              ? createPayloadForBackend((attempt.payload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation)[] }).operations)
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
          ? createPayloadForBackend((galleryPayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation)[] }).operations)
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
          ? createPayloadForBackend((addPayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation)[] }).operations)
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
          ? createPayloadForBackend((replacePayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation)[] }).operations)
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

export const removeSubramaGalleryImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  objectId: string
): Promise<void> => {
  console.log("🗑️ [SubramaImageService] Eliminando imagen de galería de subrama...");
  try {
    // Para subgrupos, no hay endpoint DELETE individual, usar PATCH con operations para eliminar
    // Como no hay op "remove", por ahora loggear y no hacer nada o implementar con PATCH completo
    console.warn(` [SubramaImageService] Eliminación de imagen individual de galería de subrama no implementada. Tenant: ${tenantId}, Group: ${groupSlug}, Section: ${sectionId}, Subgroup: ${subgroupId}, ObjectId: ${objectId}`);
    // TODO: Implementar eliminación individual si es necesario
  } catch (error: unknown) {
    console.error(' Error eliminando imagen de galería de subrama:', error);
    throw error;
  }
};