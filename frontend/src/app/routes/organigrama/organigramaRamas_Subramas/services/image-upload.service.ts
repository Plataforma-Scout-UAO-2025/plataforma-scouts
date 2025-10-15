import { postFormData, uploadToStorage } from '@/api/upload';
import { getSection, patchGallery, getSubgroup, patchSubgroupGallery, setIcon, setPhotoPrincipal } from '@/api/organigramaApi';
import { createAddPayload, createReplacePayload, createAddsPayloadFromArray, createRemovePayload, createPayloadForBackend } from '../utils/galleryPayload';
import type { GalleryAddOperation, GalleryReplaceOperation, GalleryRemoveOperation } from '../types/operations';
type MaybeAxiosError = { response?: { data?: unknown } };

type FileProgressHandler = (fileName: string, percent: number) => void;
type OverallProgressHandler = (percent: number) => void;

const getRamaByIdDirect = async (tenantId: string, groupSlug: string, id: string) => {
  return await getSection(id, tenantId, groupSlug);
};

// Función de diagnóstico para verificar comportamiento del backend con imágenes
export const diagnoseBatchImageUpload = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<{ uploaded: number; returned: number; details: Record<string, unknown> }> => {
  // Diagnostic: starting batch image upload analysis
  // File info available in `file`

  try {
    // Paso 1: Subir archivo individual
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData);
  // Upload successful; objectId available in uploadResponse.objectId

  await patchGallery(sectionId, createPayloadForBackend(createAddPayload(uploadResponse.objectId).operations), tenantId, groupSlug);

  const updatedRama = await getRamaByIdDirect(tenantId, groupSlug, sectionId);
    const updatedRec = updatedRama as unknown as Record<string, unknown> | undefined;
    const gallery =
      (updatedRec?.["galleryObjectIds"] as string[] | undefined) ??
      (updatedRec?.["sectionGalleryObjectIds"] as string[] | undefined) ??
      [];
    const resultCount = gallery?.length || 0;

    const result = {
      uploaded: 1,
      returned: resultCount,
      details: {
        originalObjectId: uploadResponse.objectId,
        returnedUrls:
          (updatedRec?.["sectionGalleryObjectIds"] as string[] | undefined) ?? [],
        isProbablyMultiVariant: resultCount > 1,
      },
    };

  // Diagnostic final result available in `result`
    return result;
  } catch (error) {
    console.error("❌ [DIAGNÓSTICO] Error:", error);
    throw error;
  }
};

// Función helper para hacer el diagnóstico accesible desde la consola del navegador
(globalThis as unknown as Record<string, unknown>).diagnosticImageUpload = diagnoseBatchImageUpload;

// Funciones de carga de archivos - Implementación de dos pasos según backend
export const uploadSectionIcon = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  file: File,
  onFileProgress?: FileProgressHandler,
  signal?: AbortSignal
): Promise<string> => {
  // Uploading section icon — parameters available in arguments

  try {
    // Paso 1: Subir archivo al sistema de archivos
    const formData = new FormData();
    formData.append("file", file);

    // Upload file to storage
    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, {
      onUploadProgress: (percent: number) => onFileProgress?.(file.name, percent),
      signal,
    });

    
  // handled by organigramaClient wrappers below

    
    const payload = { object_id: uploadResponse.objectId };
  console.info('🔄 [ImageUploadService] Enviando PATCH (icon) via client:', { payload });
  await setIcon(sectionId, payload, tenantId, groupSlug);

  // Icon uploaded successfully; objectId available in uploadResponse.objectId

    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error("❌ [ImageUploadService] Error subiendo icono:", error);
    throw error;
  }
};

// Nueva función específica para imagen principal
export const uploadSectionMainImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  file: File,
  onFileProgress?: FileProgressHandler,
  signal?: AbortSignal
): Promise<string> => {
  // Uploading main section image

  try {
    // Paso 1: Subir archivo al sistema de archivos
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, {
      onUploadProgress: (percent: number) => onFileProgress?.(file.name, percent),
      signal,
    });

  // handled by organigramaClient

    // Intentar varios formatos por compatibilidad con el backend
    // Prioritize snake_case (backend expects SNAKE_CASE). Keep operations payloads as fallback.
    // Backend expects UpdateImageRequest (snake_case). Avoid sending `operations` for /photo-principal.
    const attemptsMain = [
      { description: 'camelCase objectId', payload: { objectId: uploadResponse.objectId } },
    ];

    let lastMainError: unknown = null;
    let mainPatched = false;
    for (const attempt of attemptsMain) {
      // Trying PATCH attempt for main image: attempt.description
      try {
        const payloadToSend = attempt.payload && typeof attempt.payload === 'object' && 'operations' in attempt.payload
          ? (Array.isArray((attempt.payload as unknown as { operations?: unknown }).operations)
              ? createPayloadForBackend((attempt.payload as unknown as { operations: unknown[] }).operations as unknown as (import('../types/operations').GalleryAddOperation | import('../types/operations').GalleryReplaceOperation | import('../types/operations').GalleryRemoveOperation)[])
              : attempt.payload)
          : attempt.payload;
  console.info('🔄 [ImageUploadService] Enviando PATCH a photo-principal:', { attempt: attempt.description, payload: payloadToSend });
  await setPhotoPrincipal(sectionId, payloadToSend, tenantId, groupSlug);
        mainPatched = true;
        break;
      } catch (patchError) {
        lastMainError = patchError;
          if ((patchError as MaybeAxiosError)?.response) {
          console.error('❌ [ImageUploadService] Respuesta del backend en intento imagen principal:', (patchError as MaybeAxiosError).response?.data);
        } else {
          console.error('❌ [ImageUploadService] Error en intento PATCH imagen principal (sin respuesta):', patchError);
        }
      }
    }

    if (!mainPatched) {
      console.error('❌ [ImageUploadService] Ningún formato de PATCH funcionó para asociar la imagen principal. Último error:', lastMainError);
      throw lastMainError;
    }

  // Main image uploaded successfully; objectId available in uploadResponse.objectId

    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error("❌ [ImageUploadService] Error subiendo imagen principal:", error);
    throw error;
  }
};

export const uploadGalleryImages = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  files: File[],
  onFileProgress?: FileProgressHandler,
  onOverallProgress?: OverallProgressHandler,
  signal?: AbortSignal
): Promise<string[]> => {
  console.log("📤 [ImageUploadService] Subiendo imágenes de galería...");

  try {
    const objectIds: string[] = [];
    const urls: string[] = [];

    const perFileProgress: Record<string, number> = {};
    const totalFiles = files.length;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, {
        onUploadProgress: (percent: number) => {
          perFileProgress[file.name] = percent;
          onFileProgress?.(file.name, percent);

          const sum = Object.values(perFileProgress).reduce((a, b) => a + b, 0);
          const overall = Math.round(sum / totalFiles);
          onOverallProgress?.(overall);
        },
        signal,
      });

      objectIds.push(uploadResponse.objectId);
      urls.push(uploadResponse.url || uploadResponse.objectId);
    }

    console.log(" [ImageUploadService] Asociando galería usando endpoint PATCH específico...");
  const patchEndpoint = null; // handled by organigramaClient

    const galleryPayload = createAddsPayloadFromArray(objectIds);

  console.log("🔄 [ImageUploadService] PATCH payload para galería (formato operations):", galleryPayload);

    try {
      const galleryPayloadToSend = galleryPayload && typeof galleryPayload === 'object' && 'operations' in galleryPayload
        ? (Array.isArray((galleryPayload as unknown as { operations?: unknown }).operations)
            ? createPayloadForBackend((galleryPayload as unknown as { operations: unknown[] }).operations as unknown as (import('../types/operations').GalleryAddOperation | import('../types/operations').GalleryReplaceOperation | import('../types/operations').GalleryRemoveOperation)[])
            : galleryPayload)
        : galleryPayload;
  console.info(' [ImageUploadService] Enviando PATCH (gallery) via client:', { payload: galleryPayloadToSend });
  await patchGallery(sectionId, galleryPayloadToSend as Record<string, unknown>, tenantId, groupSlug);
      console.log(" [ImageUploadService] Galería asociada correctamente con endpoint PATCH");

      console.log(
        "🔄 [ImageUploadService] Obteniendo datos actualizados de la rama después de agregar a galería..."
      );
  const updatedRama = await getRamaByIdDirect(tenantId, groupSlug, sectionId);
      const updatedRec = updatedRama as unknown as Record<string, unknown> | undefined;
      const galleryUrls =
        (updatedRec?.["galleryObjectIds"] as string[] | undefined) ??
        (updatedRec?.["sectionGalleryObjectIds"] as string[] | undefined) ??
        [];

      if (galleryUrls && galleryUrls.length > 0) {
        console.log("✅ [ImageUploadService] URLs de galería actualizadas obtenidas del backend");
        console.log("📸 [ImageUploadService] Galería completa actual:", galleryUrls);
        return galleryUrls;
      }

      console.warn(
        "⚠️ [ImageUploadService] No se pudieron obtener URLs actualizadas, usando URLs del upload"
      );
      return urls;
    } catch (patchError) {
      console.error("❌ [ImageUploadService] Error en endpoint PATCH para galería:", patchError);
      console.error("❌ [ImageUploadService] Payload enviado:", JSON.stringify(galleryPayload, null, 2));
      console.error("❌ [ImageUploadService] Endpoint usado:", patchEndpoint);
      throw patchError;
    }
  } catch (error) {
    console.error("❌ [ImageUploadService] Error subiendo galería:", error);
    throw error;
  }
};

// ==========================================================
// ✅ Operaciones para la galería de SUBRAMAS (replace / remove)
// ==========================================================
export const replaceSubramaGalleryImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  oldObjectId: string | null,
  file: File
): Promise<string> => {
  console.log("🔄 [ImageUploadService] Reemplazando imagen de galería en subrama...", {
    sectionId,
    subgroupId,
    oldObjectId,
  });

  try {
    const formData = new FormData();
    formData.append("file", file);
    const uploadResponse = await postFormData<{ objectId: string; url: string }>(
      "storage/upload",
      formData
    );

  const targetForReplace = oldObjectId ?? '';
    const replaceOp = createReplacePayload(targetForReplace, uploadResponse.objectId);
    const replaceOpToSend = replaceOp && typeof replaceOp === 'object' && 'operations' in replaceOp
      ? (Array.isArray((replaceOp as unknown as { operations?: unknown }).operations)
          ? createPayloadForBackend((replaceOp as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
          : replaceOp)
      : replaceOp;
    await patchSubgroupGallery(sectionId, subgroupId, replaceOpToSend as Record<string, unknown>, tenantId, groupSlug);
    console.log(" [ImageUploadService] Replace PATCH enviado con éxito");

    const rec = await getSubgroup(sectionId, subgroupId, tenantId, groupSlug) as Record<string, unknown> | undefined;
    const galleryUrls =
      (rec?.["galleryObjectIds"] as string[] | undefined) ??
      (rec?.["subgroupGalleryObjectIds"] as string[] | undefined) ??
      [];

    return (
      uploadResponse.url ||
      uploadResponse.objectId ||
      galleryUrls.find((url) => url.includes(uploadResponse.objectId)) ||
      uploadResponse.objectId
    );
  } catch (error) {
    console.error("❌ [ImageUploadService] Error reemplazando imagen de galería en subrama:", error);
    throw error;
  }
};

export const removeSubramaGalleryImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  objectIdToRemove: string
): Promise<void> => {
  console.log("🗑️ [ImageUploadService] Eliminando imagen de galería en subrama...", {
    sectionId,
    subgroupId,
    objectIdToRemove,
  });
  try {
  const payload = createRemovePayload(objectIdToRemove);
    const payloadToSend = payload && typeof payload === 'object' && 'operations' in payload
  ? createPayloadForBackend((payload as unknown as { operations: unknown[] }).operations as unknown as (import('../types/operations').GalleryAddOperation | import('../types/operations').GalleryReplaceOperation | import('../types/operations').GalleryRemoveOperation)[])
      : payload;
    await patchSubgroupGallery(sectionId, subgroupId, payloadToSend, tenantId, groupSlug);
    console.log(" [ImageUploadService] Imagen eliminada de la galería de subrama");
  } catch (error) {
    console.error("❌ [ImageUploadService] Error eliminando imagen de galería en subrama:", error);
    throw error;
  }
};