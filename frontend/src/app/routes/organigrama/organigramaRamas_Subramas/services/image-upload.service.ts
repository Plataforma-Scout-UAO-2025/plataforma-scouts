import api from "@/api/axios";
import { postFormData, uploadToStorage } from '@/api/upload';
import { sectionPath, subgroupPath } from '@/api/organigramaApi';
import { createAddPayload, createReplacePayload, createAddsPayloadFromArray, createRemovePayload, createPayloadForBackend } from '../utils/galleryPayload';
import type { GalleryAddOperation, GalleryReplaceOperation, GalleryRemoveOperation } from '../types/operations';
type MaybeAxiosError = { response?: { data?: unknown } };

type FileProgressHandler = (fileName: string, percent: number) => void;
type OverallProgressHandler = (percent: number) => void;

const getRamaByIdDirect = async (tenantSlug: string, groupSlug: string, id: string) => {
  const endpoint = sectionPath(id, tenantSlug, groupSlug);
  const response = await api.get<Record<string, unknown> | undefined>(endpoint);
  return response.data;
};

export const diagnoseBatchImageUpload = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<{ uploaded: number; returned: number; details: Record<string, unknown> }> => {

  try {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData);

  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery`;
    const addPayload = createAddPayload(uploadResponse.objectId);
    await api.patch(patchEndpoint, addPayload);

    const updatedRama = await getRamaByIdDirect(tenantSlug, groupSlug, sectionId);
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

    return result;
  } catch (error) {
    console.error(" [DIAGNÓSTICO] Error:", error);
    throw error;
  }
};

(globalThis as unknown as Record<string, unknown>).diagnosticImageUpload = diagnoseBatchImageUpload;

export const uploadSectionIcon = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File,
  onFileProgress?: FileProgressHandler,
  signal?: AbortSignal
): Promise<string> => {

  try {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, {
      onUploadProgress: (percent: number) => onFileProgress?.(file.name, percent),
      signal,
    });

    
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/icon`;

    
    const attempts = [
      { description: 'snake_case object_id', payload: { object_id: uploadResponse.objectId } },
    ];

    let lastError: unknown = null;
    let patched = false;
    for (const attempt of attempts) {
      try {
        const payloadToSend = attempt.payload && typeof attempt.payload === 'object' && 'operations' in attempt.payload
          ? (Array.isArray((attempt.payload as unknown as { operations?: unknown }).operations)
              ? createPayloadForBackend((attempt.payload as unknown as { operations: unknown[] }).operations as unknown as (import('../types/operations').GalleryAddOperation | import('../types/operations').GalleryReplaceOperation | import('../types/operations').GalleryRemoveOperation)[])
              : attempt.payload)
          : attempt.payload;
        console.info('🔄 [ImageUploadService] Enviando PATCH (icon):', { endpoint: patchEndpoint, attempt: attempt.description, payload: payloadToSend });
        await api.patch(patchEndpoint, payloadToSend as unknown);
        patched = true;
        break;
      } catch (patchError) {
        lastError = patchError;
        if ((patchError as MaybeAxiosError)?.response) {
          console.error(' [ImageUploadService] Respuesta del backend en intento:', (patchError as MaybeAxiosError).response?.data);
        } else {
          console.error(' [ImageUploadService] Error en intento PATCH (sin respuesta):', patchError);
        }
      }
    }

    if (!patched) {
      console.error(' [ImageUploadService] Ningún formato de PATCH funcionó para asociar el icono. Último error:', lastError);
      throw lastError;
    }


    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error(" [ImageUploadService] Error subiendo icono:", error);
    throw error;
  }
};

export const uploadSectionMainImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File,
  onFileProgress?: FileProgressHandler,
  signal?: AbortSignal
): Promise<string> => {

  try {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, {
      onUploadProgress: (percent: number) => onFileProgress?.(file.name, percent),
      signal,
    });

  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/photo-principal`;

    const attemptsMain = [
      { description: 'snake_case object_id', payload: { object_id: uploadResponse.objectId } },
    ];

    let lastMainError: unknown = null;
    let mainPatched = false;
    for (const attempt of attemptsMain) {
      try {
        const payloadToSend = attempt.payload && typeof attempt.payload === 'object' && 'operations' in attempt.payload
          ? (Array.isArray((attempt.payload as unknown as { operations?: unknown }).operations)
              ? createPayloadForBackend((attempt.payload as unknown as { operations: unknown[] }).operations as unknown as (import('../types/operations').GalleryAddOperation | import('../types/operations').GalleryReplaceOperation | import('../types/operations').GalleryRemoveOperation)[])
              : attempt.payload)
          : attempt.payload;
        console.info('🔄 [ImageUploadService] Enviando PATCH (main image):', { endpoint: patchEndpoint, attempt: attempt.description, payload: payloadToSend });
        await api.patch(patchEndpoint, payloadToSend as unknown);
        mainPatched = true;
        break;
      } catch (patchError) {
        lastMainError = patchError;
          if ((patchError as MaybeAxiosError)?.response) {
          console.error(' [ImageUploadService] Respuesta del backend en intento imagen principal:', (patchError as MaybeAxiosError).response?.data);
        } else {
          console.error(' [ImageUploadService] Error en intento PATCH imagen principal (sin respuesta):', patchError);
        }
      }
    }

    if (!mainPatched) {
      console.error(' [ImageUploadService] Ningún formato de PATCH funcionó para asociar la imagen principal. Último error:', lastMainError);
      throw lastMainError;
    }


    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error(" [ImageUploadService] Error subiendo imagen principal:", error);
    throw error;
  }
};

export const uploadGalleryImages = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  files: File[],
  onFileProgress?: FileProgressHandler,
  onOverallProgress?: OverallProgressHandler,
  signal?: AbortSignal
): Promise<string[]> => {
  console.log(" [ImageUploadService] Subiendo imágenes de galería...");

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
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery`;

    const galleryPayload = createAddsPayloadFromArray(objectIds);

  console.log(" [ImageUploadService] PATCH payload para galería (formato operations):", galleryPayload);

    try {
      const galleryPayloadToSend = galleryPayload && typeof galleryPayload === 'object' && 'operations' in galleryPayload
        ? (Array.isArray((galleryPayload as unknown as { operations?: unknown }).operations)
            ? createPayloadForBackend((galleryPayload as unknown as { operations: unknown[] }).operations as unknown as (import('../types/operations').GalleryAddOperation | import('../types/operations').GalleryReplaceOperation | import('../types/operations').GalleryRemoveOperation)[])
            : galleryPayload)
        : galleryPayload;
      console.info(' [ImageUploadService] Enviando PATCH (gallery):', { endpoint: patchEndpoint, payload: galleryPayloadToSend });
      await api.patch(patchEndpoint, galleryPayloadToSend);
      console.log(" [ImageUploadService] Galería asociada correctamente con endpoint PATCH");

      console.log(
        "🔄 [ImageUploadService] Obteniendo datos actualizados de la rama después de agregar a galería..."
      );
      const updatedRama = await getRamaByIdDirect(tenantSlug, groupSlug, sectionId);
      const updatedRec = updatedRama as unknown as Record<string, unknown> | undefined;
      const galleryUrls =
        (updatedRec?.["galleryObjectIds"] as string[] | undefined) ??
        (updatedRec?.["sectionGalleryObjectIds"] as string[] | undefined) ??
        [];

      if (galleryUrls && galleryUrls.length > 0) {
        console.log(" [ImageUploadService] URLs de galería actualizadas obtenidas del backend");
        console.log(" [ImageUploadService] Galería completa actual:", galleryUrls);
        return galleryUrls;
      }

      console.warn(
        "⚠️ [ImageUploadService] No se pudieron obtener URLs actualizadas, usando URLs del upload"
      );
      return urls;
    } catch (patchError) {
      console.error(" [ImageUploadService] Error en endpoint PATCH para galería:", patchError);
      console.error(" [ImageUploadService] Payload enviado:", JSON.stringify(galleryPayload, null, 2));
      console.error(" [ImageUploadService] Endpoint usado:", patchEndpoint);
      throw patchError;
    }
  } catch (error) {
    console.error(" [ImageUploadService] Error subiendo galería:", error);
    throw error;
  }
};

// Operaciones para la galería de SUBRAMAS (replace / remove)
export const replaceSubramaGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  oldObjectId: string | null,
  file: File
): Promise<string> => {
  console.log(" [ImageUploadService] Reemplazando imagen de galería en subrama...", {
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

    const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/gallery`;
  const targetForReplace = oldObjectId ?? '';
    const replaceOp = createReplacePayload(targetForReplace, uploadResponse.objectId);
    const replaceOpToSend = replaceOp && typeof replaceOp === 'object' && 'operations' in replaceOp
      ? (Array.isArray((replaceOp as unknown as { operations?: unknown }).operations)
          ? createPayloadForBackend((replaceOp as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
          : replaceOp)
      : replaceOp;
    await api.patch(patchEndpoint, replaceOpToSend);
    console.log(" [ImageUploadService] Replace PATCH enviado con éxito");

    const response = await api.get<Record<string, unknown>>(
      subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)
    );
    const rec = response.data as Record<string, unknown> | undefined;
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
    console.error(" [ImageUploadService] Error reemplazando imagen de galería en subrama:", error);
    throw error;
  }
};

export const removeSubramaGalleryImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  subgroupId: string,
  objectIdToRemove: string
): Promise<void> => {
  console.log(" [ImageUploadService] Eliminando imagen de galería en subrama...", {
    sectionId,
    subgroupId,
    objectIdToRemove,
  });
  try {
    const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/gallery`;
    const payload = createRemovePayload(objectIdToRemove);
    const payloadToSend = payload && typeof payload === 'object' && 'operations' in payload
  ? createPayloadForBackend((payload as unknown as { operations: unknown[] }).operations as unknown as (import('../types/operations').GalleryAddOperation | import('../types/operations').GalleryReplaceOperation | import('../types/operations').GalleryRemoveOperation)[])
      : payload;
    await api.patch(patchEndpoint, payloadToSend);
    console.log(" [ImageUploadService] Imagen eliminada de la galería de subrama");
  } catch (error) {
    console.error(" [ImageUploadService] Error eliminando imagen de galería en subrama:", error);
    throw error;
  }
};