import { apiClient } from './apiClient';
import { PATCH_ENDPOINTS } from '../constants/api-endpoints';

// ===============================================================
// 🔧 Función auxiliar: obtiene una rama sin dependencias circulares
// ===============================================================
const getRamaByIdDirect = async (tenantSlug: string, groupSlug: string, id: string) => {
  const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${id}`;
  // Retornamos un record desconocido y el consumidor puede castear a la forma esperada
  return await apiClient.get<Record<string, unknown> | undefined>(endpoint);
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
// 🖼️ Agregar nueva imagen a galería
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

    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>(
      '/api/storage/upload',
      formData,
      undefined,
      signal
    );
    console.log('✅ [GalleryService] Nueva imagen subida, objectId:', uploadResponse.objectId);

    // 2️⃣ Validar UUID del nuevo objeto
    const newUuid = extractUuidFromString(uploadResponse.objectId);
    if (!newUuid) throw new Error('Upload did not return a valid UUID');

    // 3️⃣ Enviar PATCH para agregar imagen
    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);
    const addPayload = { operations: [{ op: 'add', newValue: newUuid }] };

    console.log('📦 [GalleryService] PATCH payload para agregar imagen:', addPayload);
    await apiClient.patch(patchEndpoint, addPayload);

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
    // Preferimos la propiedad canónica 'galleryObjectIds' y caemos
    // a 'sectionGalleryObjectIds' si la primera no existe.
    const maybe = rama as unknown as Record<string, unknown> | undefined;
    const uuids: string[] = (maybe?.['galleryObjectIds'] as string[] | undefined) ?? (maybe?.['sectionGalleryObjectIds'] as string[] | undefined) ?? [];
    if (uuids && uuids.length > 0) {
      console.log('✅ [GalleryService] UUIDs de galería obtenidos:', uuids);
      return uuids;
    }
    console.log('ℹ️ [GalleryService] No hay imágenes en la galería');
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

    const uploadResponse = await apiClient.postFormData<{ objectId: string, url: string }>(
      '/api/storage/upload',
      formData,
      undefined,
      signal
    );
    console.log('✅ [GalleryService] Nueva imagen subida:', uploadResponse.objectId);

    // 3️⃣ Validar UUID del nuevo archivo
    const newUuid = extractUuidFromString(uploadResponse.objectId);
    if (!newUuid) throw new Error('Upload did not return a valid UUID');

    // 4️⃣ Crear payload y enviar PATCH
    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);
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
    await apiClient.patch(patchEndpoint, replacePayload);
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

    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);
    const removePayload = { operations: [{ op: 'remove', targetUuid: validTargetUuid }] };

    console.log('📦 [GalleryService] PATCH payload para eliminar imagen:', removePayload);
    await apiClient.patch(patchEndpoint, removePayload);

    console.log('✅ [GalleryService] Imagen eliminada correctamente');
  } catch (error) {
    console.error('❌ [GalleryService] Error eliminando imagen de galería:', error);
    throw error;
  }
};
