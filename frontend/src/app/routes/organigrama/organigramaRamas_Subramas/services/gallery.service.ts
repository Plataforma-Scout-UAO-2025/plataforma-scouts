import { uploadToStorage } from '@/api/upload';
import { getSection, patchGallery, updateSection, deleteGalleryImageById as deleteGalleryImageByIdApi } from '@/api/organigramaApi';
import {
  createAddPayload,
  createReplacePayload,
} from '../utils/galleryPayload';

// Helper para obtener una rama directamente
const getRamaByIdDirect = async (tenantId: string, groupSlug: string, id: string) => {
  try {
    const data = await getSection(id, tenantId, groupSlug) as Record<string, unknown>;
    return data;
  } catch {
    return undefined;
  }
};

//  Función auxiliar: extraer UUID válido desde string o URL
const extractUuidFromString = (value: string | null | undefined): string | null => {
  console.info(' [GalleryService] extractUuidFromString called with:', String(value)?.slice?.(0, 120));
  if (!value) return null;
  const match = String(value).match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
  return match ? match[0] : null;
};

// Obtener UUIDs actuales de la galería
export const getGalleryImageUuids = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string
): Promise<string[]> => {
  try {
    console.info(' [GalleryService] getGalleryImageUuids called for:', { tenantId, groupSlug, sectionId });
    const rama = await getRamaByIdDirect(tenantId, groupSlug, sectionId);
    const maybe = rama as unknown as Record<string, unknown> | undefined;

    const ids: string[] = [];

    // 1) gallery array canonical
    const galleryArr = maybe?.['gallery'] as unknown[] | undefined;
    if (Array.isArray(galleryArr) && galleryArr.length > 0) {
      for (const item of galleryArr) {
        try {
          const rec = item as unknown as Record<string, unknown>;
          const id = String(rec['id'] ?? rec['objectId'] ?? '');
          const uuid = extractUuidFromString(id) || extractUuidFromString(String(rec['url'] ?? ''));
          if (uuid) ids.push(uuid);
        } catch (errItem) {
          console.debug('getGalleryImageUuids: skipping gallery entry due to parse error', errItem);
        }
      }
    }

    const maybeIds = (maybe?.['galleryObjectIds'] as string[] | undefined)
      ?? (maybe?.['gallery_object_ids'] as string[] | undefined)
      ?? (maybe?.['sectionGalleryObjectIds'] as string[] | undefined)
      ?? (maybe?.['section_gallery_object_ids'] as string[] | undefined)
      ?? [];
    if (Array.isArray(maybeIds) && maybeIds.length > 0) {
      for (const v of maybeIds) {
        const uuid = extractUuidFromString(String(v));
        if (uuid) ids.push(uuid);
        else {
          const fromUrl = extractUuidFromString(String(v));
          if (fromUrl) ids.push(fromUrl);
        }
      }
    }

    const galleryUrls = (maybe?.['galleryObjectUrls'] as string[] | undefined)
      ?? (maybe?.['gallery_object_urls'] as string[] | undefined)
      ?? [];
    if (Array.isArray(galleryUrls) && galleryUrls.length > 0) {
      for (const url of galleryUrls) {
        const uuid = extractUuidFromString(String(url));
        if (uuid) ids.push(uuid);
      }
    }

    const unique = Array.from(new Set(ids));
    return unique.length > 0 ? unique : [];
  } catch (error) {
    console.error(' [GalleryService] Error obteniendo UUIDs de galería:', error);
    return [];
  }
};

// Resolver item de galería (id + url) a partir de URL o UUID
export const resolveGalleryItem = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  targetUuidOrUrl: string
): Promise<{ id: string; url: string } | null> => {
  try {
    console.info(' [GalleryService] resolveGalleryItem called for:', { tenantId, groupSlug, sectionId, target: String(targetUuidOrUrl)?.slice?.(0,120) });
    const backend = await getRamaByIdDirect(tenantId, groupSlug, sectionId);
    const rec = backend as unknown as Record<string, unknown> | undefined;
    const galleryArr = (rec?.['gallery'] as unknown[] | undefined) ?? [];
    const targetUuid = extractUuidFromString(targetUuidOrUrl);

    let candidate: Record<string, unknown> | undefined;
    if (targetUuid) {
      candidate = galleryArr.find((it) => {
        const entry = it as Record<string, unknown>;
        const id = String(entry['id'] ?? entry['objectId'] ?? '');
        const url = String(entry['url'] ?? '');
        return id === targetUuid || url.includes(targetUuid);
      }) as Record<string, unknown> | undefined;
    }

    if (!candidate) {
      candidate = galleryArr.find((it) => {
        const entry = it as Record<string, unknown>;
        const url = String(entry['url'] ?? '');
        return !!targetUuidOrUrl && url === targetUuidOrUrl;
      }) as Record<string, unknown> | undefined;
    }

    if (!candidate) return null;

    const id = String(candidate['id'] ?? candidate['objectId'] ?? '');
    const url = String(candidate['url'] ?? candidate['objectUrl'] ?? '');
    if (!id) return null;
    return { id, url };
  } catch (error) {
    console.error(' [GalleryService] Error resolviendo item de galería:', error);
    return null;
  }
};

//  Agregar nueva imagen a galería
export const addGalleryImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  file: File
  , signal?: AbortSignal
): Promise<string> => {
    console.info(' [GalleryService] addGalleryImage called:', { tenantId, groupSlug, sectionId, filename: file?.name });
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, { signal });

    const newUuid = extractUuidFromString(uploadResponse.objectId);
    if (!newUuid) throw new Error('Upload did not return a valid UUID');

    const addPayload = createAddPayload(newUuid);
    await patchGallery(sectionId, addPayload, tenantId, groupSlug);

    return uploadResponse.url || uploadResponse.objectId;
};

export const replaceGalleryList = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  keepGalleryUuids: string[]
): Promise<Record<string, unknown> | null> => {
  console.info(' [GalleryService] replaceGalleryList called (force replace):', { tenantId, groupSlug, sectionId, keep: keepGalleryUuids?.length });
    const backendRec = await getRamaByIdDirect(tenantId, groupSlug, sectionId) as Record<string, unknown> | undefined;
    const name = String(backendRec?.['name'] ?? backendRec?.['nombre'] ?? '');
    const description = backendRec?.['description'] ?? backendRec?.['descripcion'] ?? null;
    const iconObjectId = backendRec?.['iconObjectId'] ?? backendRec?.['iconoObjectId'] ?? null;
    const photoPrincipal = backendRec?.['photoPrincipalObjectId'] ?? backendRec?.['imagenPrincipalObjectId'] ?? null;

    const payload: Record<string, unknown> = {
      name,
      description,
      iconObjectId,
      photoPrincipal,
      galleryObjectIds: keepGalleryUuids
    };

    const result = await updateSection(sectionId, payload, tenantId, groupSlug) as Record<string, unknown>;
    return (result as Record<string, unknown>) ?? null;
};
export const replaceGalleryImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  targetImageUuid: string,
  newFile: File
  , signal?: AbortSignal
): Promise<string> => {
  console.info(' [GalleryService] replaceGalleryImage called:', { tenantId, groupSlug, sectionId, targetImageUuid, filename: newFile?.name });
    const validTargetUuid = extractUuidFromString(targetImageUuid);
    if (!validTargetUuid) {
      console.error(' [GalleryService] UUID inválido detectado. Abortando PATCH.');
      throw new Error('Invalid UUID format detected');
    }

    const formData = new FormData();
    formData.append('file', newFile);

    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, { signal });

    const newUuid = extractUuidFromString(uploadResponse.objectId);
    if (!newUuid) throw new Error('Upload did not return a valid UUID');
    await patchGallery(sectionId, createReplacePayload(validTargetUuid, newUuid), tenantId, groupSlug);

    return uploadResponse.url || uploadResponse.objectId;
};

//  Eliminar imagen de galería usando endpoint DELETE por objectId
export const deleteGalleryImageById = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  targetImageUuidOrUrl: string,
  deleteFromStorage = false
): Promise<Record<string, unknown> | null> => {
  console.info(' [GalleryService] Iniciando eliminación de imagen por ID (DELETE):', { 
    targetImageUuidOrUrl, 
    deleteFromStorage,
    sectionId 
  });

  try {
    const validTargetUuid = extractUuidFromString(targetImageUuidOrUrl);
    if (!validTargetUuid) {
      console.error(' [GalleryService] UUID inválido detectado. Abortando eliminación via DELETE.');
      throw new Error('Invalid UUID format detected');
    }

    console.info(' [GalleryService] Verificando existencia de imagen en galería antes de DELETE...');
    const currentUuids = await getGalleryImageUuids(tenantId, groupSlug, sectionId);
    if (!currentUuids.includes(validTargetUuid)) {
      console.warn(' [GalleryService] UUID objetivo no pertenece a la galería local (primer check). Intentando re-fetch antes de abortar.', { validTargetUuid, currentUuids });
      
      const recheckUuids = await getGalleryImageUuids(tenantId, groupSlug, sectionId);
      if (!recheckUuids.includes(validTargetUuid)) {
        console.warn(' [GalleryService] Tras re-fetch la imagen no figura en la galería; abortando operación sin error:', { validTargetUuid, recheckUuids });
        return null;
      }
      console.info(' [GalleryService] Re-check detectó la UUID en la galería; procediendo con DELETE:', { validTargetUuid });
    }

    console.info(' [GalleryService] Enviando DELETE al endpoint via client');
    const result = await deleteGalleryImageByIdApi(sectionId, validTargetUuid, tenantId, groupSlug, deleteFromStorage);
    console.info(' [GalleryService] Eliminación via DELETE completada, servidor devolvió datos');
    return result;
    
  } catch (error) {
    console.error(' [GalleryService] Error eliminando imagen de galería via DELETE:', error);

    try {
      const recheckUuids = await getGalleryImageUuids(tenantId, groupSlug, sectionId);
      const validTargetUuid = extractUuidFromString(targetImageUuidOrUrl);
      if (!validTargetUuid) {
        console.error(' [GalleryService] UUID objetivo inv\u00e1lido al reintentar:', targetImageUuidOrUrl);
        throw error;
      }

      if (!recheckUuids.includes(validTargetUuid)) {
        console.warn(' [GalleryService] Tras re-fetch la imagen ya no figura en la galer\u00eda; abortando operaci\u00f3n sin error:', validTargetUuid);
        return null;
      }

      throw error;
    } catch (recheckErr) {
      console.error(' [GalleryService] Error durante re-fetch tras DELETE fallido:', recheckErr);
      throw error;
    }
  }
};