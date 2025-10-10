import api from '@/api/axios';
import { postFormData } from '@/api/formData';
import { sectionPath } from '@/api/organigramaApi';

// Helper para reemplazar la lista completa de la sección vía PUT (force remove)
const replaceGalleryList = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  keepGalleryUuids: string[]
): Promise<Record<string, unknown> | null> => {
  console.log('🔁 [GalleryService] Reemplazando lista completa de galería (PUT) para sección:', sectionId, ' keep:', keepGalleryUuids.length);
  const endpoint = sectionPath(sectionId, tenantSlug, groupSlug);
  try {
    // Obtener la rama actual para reutilizar nombre y otros campos requeridos
    const response = await getRamaByIdDirect(tenantSlug, groupSlug, sectionId);
    const backendRec = response?.data as Record<string, unknown> | undefined;
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

    console.log('📦 [GalleryService] PUT payload para reemplazar galería:', payload);
    const result = await api.put<Record<string, unknown>>(endpoint, payload);
    console.log('✅ [GalleryService] PUT reemplazo de galería completado');
    return result.data ?? null;
  } catch (error) {
    console.error('❌ [GalleryService] Error al reemplazar lista de galería via PUT:', error);
    throw error;
  }
};

// ===============================================================
// 🔧 Función auxiliar: obtiene una rama sin dependencias circulares
// ===============================================================
const getRamaByIdDirect = async (tenantSlug: string, groupSlug: string, id: string) => {
  const endpoint = sectionPath(id, tenantSlug, groupSlug);
  // Retornamos un record desconocido y el consumidor puede castear a la forma esperada
  return await api.get<Record<string, unknown> | undefined>(endpoint);
};

// ===============================================================
// 🧩 Función auxiliar: extraer UUID válido desde string o URL
// ===============================================================
const extractUuidFromString = (value: string): string | null => {
  if (!value) return null;
  const match = value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
  return match ? match[0] : null;
};

// ===============================================================
// � Resolver item de galería (id + url) a partir de URL o UUID
// ===============================================================
export const resolveGalleryItem = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  targetUuidOrUrl: string
): Promise<{ id: string; url: string } | null> => {
  try {
    const backend = await getRamaByIdDirect(tenantSlug, groupSlug, sectionId);
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
    console.error('❌ [GalleryService] Error resolviendo item de galería:', error);
    return null;
  }
};

// ===============================================================
// �🖼️ Agregar nueva imagen a galería
// ===============================================================
export const addGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File
  , signal?: AbortSignal
): Promise<string> => {
  console.log('📤 [GalleryService] Agregando imagen a galería...');
  console.log('📝 [GalleryService] Parámetros:', { sectionId, fileName: file.name });

  try {
    // 1️⃣ Subir archivo a Supabase
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await postFormData<{ objectId: string; url: string }>(
      'storage/upload',
      formData,
      {
        signal,
      }
    );
    console.log('✅ [GalleryService] Nueva imagen subida, objectId:', uploadResponse.objectId);

    // 2️⃣ Validar UUID del nuevo objeto
    const newUuid = extractUuidFromString(uploadResponse.objectId);
    if (!newUuid) throw new Error('Upload did not return a valid UUID');

    // 3️⃣ Enviar PATCH para agregar imagen
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery`;
    const addPayload = { operations: [{ op: 'add', newValue: newUuid }] };

    console.log('📦 [GalleryService] PATCH payload para agregar imagen:', addPayload);
    await api.patch(patchEndpoint, addPayload);

    console.log('✅ [GalleryService] Imagen agregada correctamente a galería');
    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error('❌ [GalleryService] Error agregando imagen a galería:', error);
    throw error;
  }
};

// ===============================================================
// 🔍 Obtener UUIDs actuales de la galería
// ===============================================================
export const getGalleryImageUuids = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string
): Promise<string[]> => {
  console.log('🔍 [GalleryService] Obteniendo UUIDs de galería para sección:', sectionId);

  try {
    const rama = await getRamaByIdDirect(tenantSlug, groupSlug, sectionId);
    const maybe = rama as unknown as Record<string, unknown> | undefined;

    // Colección de candidate ids
    const ids: string[] = [];

    // 1) Formato canonical: gallery -> [{id,url}, ...]
    const galleryArr = maybe?.['gallery'] as unknown[] | undefined;
    if (Array.isArray(galleryArr) && galleryArr.length > 0) {
      for (const item of galleryArr) {
        try {
          const rec = item as unknown as Record<string, unknown>;
          const id = String(rec['id'] ?? rec['objectId'] ?? '');
          const uuid = extractUuidFromString(id) || extractUuidFromString(String(rec['url'] ?? ''));
          if (uuid) ids.push(uuid);
        } catch {
          // ignore malformed item
        }
      }
    }

    // 2) galleryObjectIds or sectionGalleryObjectIds (may contain UUIDs or URLs)
    const maybeIds = (maybe?.['galleryObjectIds'] as string[] | undefined) ?? (maybe?.['sectionGalleryObjectIds'] as string[] | undefined) ?? [];
    if (Array.isArray(maybeIds) && maybeIds.length > 0) {
      for (const v of maybeIds) {
        const uuid = extractUuidFromString(String(v));
        if (uuid) ids.push(uuid);
        else {
          // maybe it's a URL containing the uuid
          const fromUrl = extractUuidFromString(String(v));
          if (fromUrl) ids.push(fromUrl);
        }
      }
    }

    // 3) galleryObjectUrls (legacy) - extract uuids from URLs
    const galleryUrls = (maybe?.['galleryObjectUrls'] as string[] | undefined) ?? [];
    if (Array.isArray(galleryUrls) && galleryUrls.length > 0) {
      for (const url of galleryUrls) {
        const uuid = extractUuidFromString(String(url));
        if (uuid) ids.push(uuid);
      }
    }

    // Deduplicate
    const unique = Array.from(new Set(ids));
    if (unique.length > 0) {
      console.log('✅ [GalleryService] UUIDs de galería obtenidos (normalized):', unique);
      return unique;
    }

    console.log('ℹ️ [GalleryService] No hay imágenes en la galería (no se detectaron UUIDs)');
    return [];
    } catch (error) {
    console.error('❌ [GalleryService] Error obteniendo UUIDs de galería:', error);
    return [];
  }
};

// ===============================================================
// 🔄 Reemplazar imagen específica en galería
// ===============================================================
export const replaceGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  targetImageUuid: string,
  newFile: File
  , signal?: AbortSignal
): Promise<string> => {
  console.log('🔄 [GalleryService] Reemplazando imagen en galería...');
  console.log('🧾 Parámetros iniciales:', {
    sectionId,
    targetImageUuid,
    newFileName: newFile.name,
    newFileSize: newFile.size
  });

  try {
    // 1️⃣ Extraer y validar UUID de la imagen objetivo
    const validTargetUuid = extractUuidFromString(targetImageUuid);
    if (!validTargetUuid) {
      console.error('❌ [GalleryService] UUID inválido detectado. Abortando PATCH.');
      throw new Error('Invalid UUID format detected');
    }

    // 2️⃣ Subir el nuevo archivo
    console.log('📤 [GalleryService] Subiendo nueva imagen...');
    const formData = new FormData();
    formData.append('file', newFile);

    const uploadResponse = await postFormData<{ objectId: string; url: string }>(
      'storage/upload',
      formData,
      {
        signal,
      }
    );
    console.log('✅ [GalleryService] Nueva imagen subida:', uploadResponse.objectId);

    // 3️⃣ Validar UUID del nuevo archivo
    const newUuid = extractUuidFromString(uploadResponse.objectId);
    if (!newUuid) throw new Error('Upload did not return a valid UUID');

    // 4️⃣ Crear payload y enviar PATCH
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery`;
    const replacePayload = {
      operations: [
        {
          op: 'replace' as const,
          targetUuid: validTargetUuid,
          newValue: newUuid
        }
      ]
    };

    console.log('📦 [GalleryService] PATCH payload para reemplazar imagen:', replacePayload);
    await api.patch(patchEndpoint, replacePayload);
    console.log('✅ [GalleryService] Imagen reemplazada correctamente');

    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error('❌ [GalleryService] Error reemplazando imagen en galería:', error);
    throw error;
  }
};

// ===============================================================
// 🗑️ Eliminar imagen de galería
// ===============================================================
export const removeGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  targetImageUuid: string
): Promise<void> => {
  console.log('🗑️ [GalleryService] Eliminando imagen de galería...');
  console.log('🧾 Parámetros:', { sectionId, targetImageUuid });

  try {
    const validTargetUuid = extractUuidFromString(targetImageUuid);
    if (!validTargetUuid) {
      console.error('❌ [GalleryService] UUID inválido detectado. Abortando eliminación.');
      throw new Error('Invalid UUID format detected');
    }

  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery`;
    const removePayload = { operations: [{ op: 'remove', targetUuid: validTargetUuid }] };

    console.log('📦 [GalleryService] PATCH payload para eliminar imagen:', removePayload);
    await api.patch(patchEndpoint, removePayload);

    console.log('✅ [GalleryService] Imagen eliminada correctamente');
  } catch (error) {
    console.error('❌ [GalleryService] Error eliminando imagen de galería:', error);
    throw error;
  }
};

// ===============================================================
// 🗑️ Eliminar imagen de galería usando endpoint DELETE por objectId
// ===============================================================
export const deleteGalleryImageById = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  targetImageUuidOrUrl: string,
  deleteFromStorage = false
): Promise<Record<string, unknown> | null> => {
  console.log('🗑️ [GalleryService] Eliminando imagen de galería via DELETE...', { sectionId, targetImageUuidOrUrl, deleteFromStorage });

  try {
    const validTargetUuid = extractUuidFromString(targetImageUuidOrUrl);
    if (!validTargetUuid) {
      console.error('❌ [GalleryService] UUID inválido detectado. Abortando eliminación via DELETE.');
      throw new Error('Invalid UUID format detected');
    }

    // Pre-check: asegurarse que el UUID objetivo pertenece actualmente a la galería
    const currentUuids = await getGalleryImageUuids(tenantSlug, groupSlug, sectionId);
    if (!currentUuids.includes(validTargetUuid)) {
      console.warn('⚠️ [GalleryService] UUID objetivo no pertenece a la galería actual. Abortando DELETE/PATCH.', { validTargetUuid, currentUuids });
      throw new Error(`UUID ${validTargetUuid} no encontrado en la galería local de la sección`);
    }

  const endpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery/${validTargetUuid}?deleteFromStorage=${deleteFromStorage ? 'true' : 'false'}`;
    console.log('📍 [GalleryService] DELETE endpoint:', endpoint);

    // La API devuelve el SectionResponseDTO actualizado según el contrato
    const result = await api.delete<Record<string, unknown>>(endpoint);

    console.log('✅ [GalleryService] Eliminación via DELETE completada, servidor devolvió:', result.data);
    return result.data ?? null;
  } catch (error) {
    console.error('❌ [GalleryService] Error eliminando imagen de galería via DELETE:', error);

    // Si DELETE falla, intentar re-fetch de la sección para confirmar estado
    try {
      console.log('🔁 [GalleryService] Intentando re-fetch de la sección tras DELETE fallido...');
      const refreshed = await getRamaByIdDirect(tenantSlug, groupSlug, sectionId);
      const refreshedRec = refreshed as unknown as Record<string, unknown> | undefined;
  const refreshedGallery: string[] = (refreshedRec?.['gallery'] as unknown[] | undefined)?.map((it) => String((it as Record<string, unknown>)?.id)) ?? [];
      const refreshedUuids = (refreshedRec?.['galleryObjectIds'] as string[] | undefined) ?? (refreshedRec?.['sectionGalleryObjectIds'] as string[] | undefined) ?? [];
      const combined = Array.from(new Set([...(refreshedGallery || []), ...(refreshedUuids || [])]));
      console.log('🔍 [GalleryService] UUIDs tras re-fetch:', combined);

      const validTargetUuid = extractUuidFromString(targetImageUuidOrUrl);
      if (!validTargetUuid) {
        console.error('❌ [GalleryService] UUID objetivo inválido al reintentar:', targetImageUuidOrUrl);
        throw error;
      }

      // Si tras el re-fetch la imagen ya no está en la galería, no intentamos PATCH y devolvemos null
      if (!combined.includes(validTargetUuid)) {
        console.warn('⚠️ [GalleryService] Tras re-fetch la imagen ya no figura en la galería; abortando operación:', validTargetUuid);
        return null;
      }

      // Si sigue presente, intentar PATCH remove como fallback. Pero antes,
      // buscar en la lista `gallery` si hay un objeto cuya URL contiene
      // el UUID objetivo y usar su campo `id` (server-internal id) si difiere.
      console.warn('⚠️ [GalleryService] DELETE falló pero la imagen sigue presente — intentando fallback con datos del gallery');
      try {
        const galleryArr = (refreshedRec?.['gallery'] as unknown[] | undefined) ?? [];
        let candidateId = validTargetUuid;

        // Buscar objeto en gallery cuyo url contenga el UUID objetivo
          for (const it of galleryArr) {
            try {
              const rec = it as unknown as Record<string, unknown>;
              const url = String(rec['url'] ?? '');
              const idField = String(rec['id'] ?? '');
              if (url.includes(validTargetUuid)) {
                // Si encontramos una entrada cuyo url contiene el UUID, preferimos usar su id
                if (idField && idField !== validTargetUuid) {
                  console.log('🔎 [GalleryService] Encontrado objeto en gallery; usando su id como candidato para eliminación:', idField, ' (url:', url, ')');
                  candidateId = idField;
                  break;
                }
              }
            } catch {
              // ignore malformed item
            }
          }

        // Intentar DELETE con candidateId
        try {
          const endpointCandidate = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery/${candidateId}?deleteFromStorage=${deleteFromStorage ? 'true' : 'false'}`;
          console.log('📍 [GalleryService] Intentando DELETE con candidateId endpoint:', endpointCandidate);
          await api.delete<Record<string, unknown>>(endpointCandidate);
          const updatedAfterDelete = await getRamaByIdDirect(tenantSlug, groupSlug, sectionId);
          console.log('✅ [GalleryService] Eliminación con candidateId por DELETE completada, rama actualizada:', updatedAfterDelete.data);
          return updatedAfterDelete.data ?? null;
        } catch (deleteCandidateErr) {
          console.warn('⚠️ [GalleryService] DELETE con candidateId falló, intentando PATCH remove con candidateId:', deleteCandidateErr);
        }

        // Intentar PATCH remove con candidateId
        try {
          await removeGalleryImage(tenantSlug, groupSlug, sectionId, candidateId);
          const updated = await getRamaByIdDirect(tenantSlug, groupSlug, sectionId);
          console.log('✅ [GalleryService] Fallback PATCH remove con candidateId completado, rama actualizada:', updated.data);
          return updated.data ?? null;
          } catch (fallbackErr) {
          console.error('❌ [GalleryService] Fallback con PATCH remove también falló (candidateId):', fallbackErr);
          // Último recurso: reconstruir la lista de gallery sin el UUID objetivo y hacer PUT (reemplazo completo)
          try {
            console.warn('⚠️ [GalleryService] Intentando reemplazo completo de la galería (PUT) sin el UUID objetivo como último recurso');
            // Obtener current uuids y filtrar
            const current = await getGalleryImageUuids(tenantSlug, groupSlug, sectionId);
            const filtered = current.filter(u => u !== validTargetUuid && u !== candidateId);
            const resultPut = await replaceGalleryList(tenantSlug, groupSlug, sectionId, filtered);
            return resultPut;
          } catch (putErr) {
            console.error('❌ [GalleryService] Reemplazo completo (PUT) también falló:', putErr);
            const enriched = new Error(`DELETE failed, PATCH fallback failed, and PUT replace failed for UUID ${validTargetUuid} (candidateId ${candidateId}): ${(putErr as Error)?.message ?? String(putErr)}`);
            throw enriched;
          }
        }
      } catch (fallbackErr) {
        console.error('❌ [GalleryService] Error construyendo fallback con gallery data:', fallbackErr);
        throw fallbackErr;
      }
    } catch (refetchErr) {
      console.error('❌ [GalleryService] Error durante re-fetch/fallback tras DELETE fallido:', refetchErr);
      throw error;
    }
  }
};
