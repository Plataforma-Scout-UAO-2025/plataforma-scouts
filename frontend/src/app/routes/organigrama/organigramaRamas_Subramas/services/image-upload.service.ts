import api from "@/api/axios";
import { PATCH_ENDPOINTS } from "../constants/api-endpoints";

type FileProgressHandler = (fileName: string, percent: number) => void;
type OverallProgressHandler = (percent: number) => void;

// Función auxiliar para obtener rama directamente sin dependencias circulares
const getRamaByIdDirect = async (tenantSlug: string, groupSlug: string, id: string) => {
  const endpoint = `tenants/${tenantSlug}/groups/${groupSlug}/sections/${id}`;
  const response = await api.get<Record<string, unknown> | undefined>(endpoint);
  return response.data;
};

// Función de diagnóstico para verificar comportamiento del backend con imágenes
export const diagnoseBatchImageUpload = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<{ uploaded: number; returned: number; details: Record<string, unknown> }> => {
  console.log("🔬 [DIAGNÓSTICO] Iniciando análisis de comportamiento del backend...");
  console.log("📝 [DIAGNÓSTICO] Archivo:", {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  try {
    // Paso 1: Subir archivo individual
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await api.postFormData<{ objectId: string; url: string }>(
      "storage/upload",
      formData
    );
    console.log("✅ [DIAGNÓSTICO] Upload exitoso, objectId:", uploadResponse.objectId);

    // Paso 2: Agregar a galería usando PATCH
    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);
    const addPayload = {
      operations: [{ op: "add", newValue: uploadResponse.objectId }],
    };

    await api.patch(patchEndpoint, addPayload);
    console.log("✅ [DIAGNÓSTICO] PATCH exitoso");

    // Paso 3: Verificar resultado
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

    console.log("🔬 [DIAGNÓSTICO] RESULTADO FINAL:", result);
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
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File,
  onFileProgress?: FileProgressHandler,
  signal?: AbortSignal
): Promise<string> => {
  console.log("📤 [ImageUploadService] Subiendo icono de sección...");
  console.log("📝 [ImageUploadService] Parámetros:", {
    tenantSlug,
    groupSlug,
    sectionId,
    fileName: file.name,
    fileSize: file.size,
  });

  try {
    // Paso 1: Subir archivo al sistema de archivos
    const formData = new FormData();
    formData.append("file", file);

    console.log("🔄 [ImageUploadService] Subiendo archivo al storage...");
    const uploadResponse = await api.postFormData<{ objectId: string; url: string }>(
      "storage/upload",
      formData,
      {
        onUploadProgress: (percent: number) => onFileProgress?.(file.name, percent),
        signal,
      }
    );
    console.log("✅ [ImageUploadService] Archivo subido, objectId:", uploadResponse.objectId);

    // Paso 2: Usar endpoint PATCH específico para icono
    console.log("🔄 [ImageUploadService] Asociando icono usando endpoint PATCH específico...");
    const patchEndpoint = PATCH_ENDPOINTS.ICON(tenantSlug, groupSlug, sectionId);
    console.log("📍 [ImageUploadService] Endpoint PATCH:", patchEndpoint);

    const iconPayload = {
      objectId: uploadResponse.objectId,
    };

    console.log("🔄 [ImageUploadService] PATCH payload para icono:", iconPayload);

    try {
      await api.patch(patchEndpoint, iconPayload);
      console.log("✅ [ImageUploadService] Icono asociado correctamente con endpoint PATCH");
    } catch (patchError) {
      console.error("❌ [ImageUploadService] Error en endpoint PATCH para icono:", patchError);
      throw patchError;
    }

    console.log("✅ [ImageUploadService] Icono de sección subido con éxito");
    console.log("📝 [ImageUploadService] ObjectId guardado:", uploadResponse.objectId);

    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error("❌ [ImageUploadService] Error subiendo icono:", error);
    throw error;
  }
};

// Nueva función específica para imagen principal
export const uploadSectionMainImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File,
  onFileProgress?: FileProgressHandler,
  signal?: AbortSignal
): Promise<string> => {
  console.log("📤 [ImageUploadService] Subiendo imagen principal de sección...");

  try {
    // Paso 1: Subir archivo al sistema de archivos
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await api.postFormData<{ objectId: string; url: string }>(
      "storage/upload",
      formData,
      {
        onUploadProgress: (percent: number) => onFileProgress?.(file.name, percent),
        signal,
      }
    );

    // Paso 2: Usar endpoint PATCH específico para imagen principal
    console.log(
      "🔄 [ImageUploadService] Asociando imagen principal usando endpoint PATCH específico..."
    );
    const patchEndpoint = PATCH_ENDPOINTS.MAIN_IMAGE(tenantSlug, groupSlug, sectionId);

    const mainImagePayload = {
      objectId: uploadResponse.objectId,
    };

    console.log("🔄 [ImageUploadService] PATCH payload para imagen principal:", mainImagePayload);

    try {
      await api.patch(patchEndpoint, mainImagePayload);
      console.log(
        "✅ [ImageUploadService] Imagen principal asociada correctamente con endpoint PATCH"
      );
    } catch (patchError) {
      console.error("❌ [ImageUploadService] Error en endpoint PATCH para imagen principal:", patchError);
      throw patchError;
    }

    console.log("✅ [ImageUploadService] Imagen principal de sección subida con éxito");
    console.log("📝 [ImageUploadService] ObjectId de imagen principal:", uploadResponse.objectId);

    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error("❌ [ImageUploadService] Error subiendo imagen principal:", error);
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
  console.log("📤 [ImageUploadService] Subiendo imágenes de galería...");

  try {
    const objectIds: string[] = [];
    const urls: string[] = [];

    const perFileProgress: Record<string, number> = {};
    const totalFiles = files.length;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await api.postFormData<{ objectId: string; url: string }>(
        "storage/upload",
        formData,
        {
          onUploadProgress: (percent: number) => {
            perFileProgress[file.name] = percent;
            onFileProgress?.(file.name, percent);

            const sum = Object.values(perFileProgress).reduce((a, b) => a + b, 0);
            const overall = Math.round(sum / totalFiles);
            onOverallProgress?.(overall);
          },
          signal,
        }
      );

      objectIds.push(uploadResponse.objectId);
      urls.push(uploadResponse.url || uploadResponse.objectId);
    }

    console.log("🔄 [ImageUploadService] Asociando galería usando endpoint PATCH específico...");
    const patchEndpoint = PATCH_ENDPOINTS.GALLERY(tenantSlug, groupSlug, sectionId);

    const galleryPayload = {
      operations: objectIds.map((objectId) => ({
        op: "add",
        newValue: objectId,
      })),
    };

    console.log("🔄 [ImageUploadService] PATCH payload para galería (formato operations):", galleryPayload);

    try {
      await api.patch(patchEndpoint, galleryPayload);
      console.log("✅ [ImageUploadService] Galería asociada correctamente con endpoint PATCH");

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
  tenantSlug: string,
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
    const uploadResponse = await api.postFormData<{ objectId: string; url: string }>(
      "storage/upload",
      formData
    );

    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(
      tenantSlug,
      groupSlug,
      sectionId,
      subgroupId
    );
    const replaceOp = {
      operations: [
        {
          op: "replace" as const,
          targetUuid: oldObjectId ?? null,
          newValue: uploadResponse.objectId,
        },
      ],
    };

    await api.patch(patchEndpoint, replaceOp);
    console.log("✅ [ImageUploadService] Replace PATCH enviado con éxito");

    const response = await api.get<Record<string, unknown>>(
      `tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}`
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
    console.error("❌ [ImageUploadService] Error reemplazando imagen de galería en subrama:", error);
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
  console.log("🗑️ [ImageUploadService] Eliminando imagen de galería en subrama...", {
    sectionId,
    subgroupId,
    objectIdToRemove,
  });
  try {
    const patchEndpoint = PATCH_ENDPOINTS.SUBRAMA_GALLERY(
      tenantSlug,
      groupSlug,
      sectionId,
      subgroupId
    );
    const payload = {
      operations: [
        {
          op: "remove",
          targetUuid: objectIdToRemove,
        },
      ],
    };

    await api.patch(patchEndpoint, payload);
    console.log("✅ [ImageUploadService] Imagen eliminada de la galería de subrama");
  } catch (error) {
    console.error("❌ [ImageUploadService] Error eliminando imagen de galería en subrama:", error);
    throw error;
  }
};