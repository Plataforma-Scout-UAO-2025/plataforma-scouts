import { uploadToStorage } from "@/api/upload";
import { getSection, patchGallery, setIcon } from "@/api/organigramaApi";
import {
  createAddsPayloadFromArray,
  createPayloadForBackend,
} from "../utils/galleryPayload";
import type { AppDispatch } from "@/store/store";
import { setPhotoPrincipalAction } from "@/store/organigrama/organigramaActions";

type FileProgressHandler = (fileName: string, percent: number) => void;
type OverallProgressHandler = (percent: number) => void;

const getRamaByIdDirect = async (
  tenantId: string,
  groupSlug: string,
  id: string
) => {
  return await getSection(id, tenantId, groupSlug);
};

export const uploadSectionIcon = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  file: File,
  onFileProgress?: FileProgressHandler,
  signal?: AbortSignal
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await uploadToStorage<{
      objectId: string;
      url: string;
    }>(formData, {
      onUploadProgress: (percent: number) =>
        onFileProgress?.(file.name, percent),
      signal,
    });

    // handled by organigramaClient wrappers below

    const payload = { objectId: uploadResponse.objectId };
    console.info("🔄 [ImageUploadService] Enviando PATCH (icon) via client:", {
      payload,
    });
    await setIcon(sectionId, payload, tenantId, groupSlug);

    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error(" [ImageUploadService] Error subiendo icono:", error);
    throw error;
  }
};

export const uploadSectionMainImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  file: File,
  dispatch: AppDispatch,
  onFileProgress?: FileProgressHandler,
  signal?: AbortSignal
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await uploadToStorage<{
      objectId: string;
      url: string;
    }>(formData, {
      onUploadProgress: (percent: number) =>
        onFileProgress?.(file.name, percent),
      signal,
    });

    console.info(
      "🔄 [ImageUploadService] Usando Redux action para photo-principal:",
      { objectId: uploadResponse.objectId }
    );
    await dispatch(
      setPhotoPrincipalAction({
        tenantId,
        groupSlug,
        sectionId,
        objectId: uploadResponse.objectId,
      })
    );

    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error(
      " [ImageUploadService] Error subiendo imagen principal:",
      error
    );
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
  console.log(" [ImageUploadService] Subiendo imágenes de galería...");

  try {
    const objectIds: string[] = [];
    const urls: string[] = [];

    const perFileProgress: Record<string, number> = {};
    const totalFiles = files.length;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await uploadToStorage<{
        objectId: string;
        url: string;
      }>(formData, {
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

    console.log(
      " [ImageUploadService] Asociando galería usando endpoint PATCH específico..."
    );
    const patchEndpoint = null; // handled by organigramaClient

    const galleryPayload = createAddsPayloadFromArray(objectIds);

    console.log(
      " [ImageUploadService] PATCH payload para galería (formato operations):",
      galleryPayload
    );

    try {
      const galleryPayloadToSend =
        galleryPayload &&
        typeof galleryPayload === "object" &&
        "operations" in galleryPayload
          ? Array.isArray(
              (galleryPayload as unknown as { operations?: unknown }).operations
            )
            ? createPayloadForBackend(
                (galleryPayload as unknown as { operations: unknown[] })
                  .operations as unknown as (
                  | import("../types/operations").GalleryAddOperation
                  | import("../types/operations").GalleryReplaceOperation
                )[]
              )
            : galleryPayload
          : galleryPayload;
      console.info(
        " [ImageUploadService] Enviando PATCH (gallery) via client:",
        { payload: galleryPayloadToSend }
      );
      await patchGallery(
        sectionId,
        galleryPayloadToSend as Record<string, unknown>,
        tenantId,
        groupSlug
      );
      console.log(
        " [ImageUploadService] Galería asociada correctamente con endpoint PATCH"
      );

      console.log(
        "🔄 [ImageUploadService] Obteniendo datos actualizados de la rama después de agregar a galería..."
      );
      const updatedRama = await getRamaByIdDirect(
        tenantId,
        groupSlug,
        sectionId
      );
      const updatedRec = updatedRama as unknown as
        | Record<string, unknown>
        | undefined;
      const galleryUrls =
        (updatedRec?.["galleryObjectIds"] as string[] | undefined) ??
        (updatedRec?.["sectionGalleryObjectIds"] as string[] | undefined) ??
        [];

      if (galleryUrls && galleryUrls.length > 0) {
        console.log(
          " [ImageUploadService] URLs de galería actualizadas obtenidas del backend"
        );
        console.log(
          " [ImageUploadService] Galería completa actual:",
          galleryUrls
        );
        return galleryUrls;
      }

      console.warn(
        "⚠️ [ImageUploadService] No se pudieron obtener URLs actualizadas, usando URLs del upload"
      );
      return urls;
    } catch (patchError) {
      console.error(
        " [ImageUploadService] Error en endpoint PATCH para galería:",
        patchError
      );
      console.error(
        " [ImageUploadService] Payload enviado:",
        JSON.stringify(galleryPayload, null, 2)
      );
      console.error(" [ImageUploadService] Endpoint usado:", patchEndpoint);
      throw patchError;
    }
  } catch (error) {
    console.error(" [ImageUploadService] Error subiendo galería:", error);
    throw error;
  }
};
