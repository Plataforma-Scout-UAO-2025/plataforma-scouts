import api from "@/api/axios";
import { postFormData, uploadToStorage } from '@/api/upload';
import { sectionPath, subgroupPath } from '@/api/organigramaApi';
type MaybeAxiosError = { response?: { data?: unknown } };

type FileProgressHandler = (fileName: string, percent: number) => void;
type OverallProgressHandler = (percent: number) => void;

// Función auxiliar para obtener rama directamente sin dependencias circulares
const getRamaByIdDirect = async (tenantSlug: string, groupSlug: string, id: string) => {
  const endpoint = sectionPath(id, tenantSlug, groupSlug);
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

    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData);
    console.log("✅ [DIAGNÓSTICO] Upload exitoso, objectId:", uploadResponse.objectId);

    // Paso 2: Agregar a galería usando PATCH
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery`;
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
    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, {
      onUploadProgress: (percent: number) => onFileProgress?.(file.name, percent),
      signal,
    });
    console.log("✅ [ImageUploadService] Archivo subido, objectId:", uploadResponse.objectId);

    // Paso 2: Usar endpoint PATCH específico para icono
    console.log("🔄 [ImageUploadService] Asociando icono usando endpoint PATCH específico...");
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/icon`;
    console.log("📍 [ImageUploadService] Endpoint PATCH:", patchEndpoint);

    // Intentaremos varios formatos de payload porque el backend puede esperar snake_case o estructura "operations"
    const attempts = [
      { description: 'camelCase objectId', payload: { objectId: uploadResponse.objectId } },
      { description: 'snake_case object_id', payload: { object_id: uploadResponse.objectId } },
      { description: 'operations add', payload: { operations: [{ op: 'add', newValue: uploadResponse.objectId }] } },
      { description: 'operations replace', payload: { operations: [{ op: 'replace', newValue: uploadResponse.objectId }] } },
    ];

    let lastError: unknown = null;
    let patched = false;
    for (const attempt of attempts) {
      console.log(`🔄 [ImageUploadService] Intentando PATCH (${attempt.description}) ->`, attempt.payload);
      try {
        const res = await api.patch(patchEndpoint, attempt.payload as unknown);
        console.log(`✅ [ImageUploadService] PATCH exitoso con formato: ${attempt.description}`, res?.data ?? res);
        patched = true;
        break;
      } catch (patchError) {
        lastError = patchError;
        // Loguear respuesta del backend si está disponible para diagnóstico
        if ((patchError as MaybeAxiosError)?.response) {
          console.error('❌ [ImageUploadService] Respuesta del backend en intento:', (patchError as MaybeAxiosError).response?.data);
        } else {
          console.error('❌ [ImageUploadService] Error en intento PATCH (sin respuesta):', patchError);
        }
        // seguir probando con el siguiente payload
      }
    }

    if (!patched) {
      console.error('❌ [ImageUploadService] Ningún formato de PATCH funcionó para asociar el icono. Último error:', lastError);
      throw lastError;
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

    const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, {
      onUploadProgress: (percent: number) => onFileProgress?.(file.name, percent),
      signal,
    });

    // Paso 2: Usar endpoint PATCH específico para imagen principal
    console.log(
      "🔄 [ImageUploadService] Asociando imagen principal usando endpoint PATCH específico..."
    );
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/photo-principal`;

    // Intentar varios formatos por compatibilidad con el backend
    const attemptsMain = [
      { description: 'camelCase objectId', payload: { objectId: uploadResponse.objectId } },
      { description: 'snake_case object_id', payload: { object_id: uploadResponse.objectId } },
      { description: 'operations add', payload: { operations: [{ op: 'add', newValue: uploadResponse.objectId }] } },
      { description: 'operations replace', payload: { operations: [{ op: 'replace', newValue: uploadResponse.objectId }] } },
    ];

    let lastMainError: unknown = null;
    let mainPatched = false;
    for (const attempt of attemptsMain) {
      console.log(`🔄 [ImageUploadService] Intentando PATCH imagen principal (${attempt.description}) ->`, attempt.payload);
      try {
        const res = await api.patch(patchEndpoint, attempt.payload as unknown);
        console.log(`✅ [ImageUploadService] PATCH imagen principal exitoso con formato: ${attempt.description}`, res?.data ?? res);
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

    console.log("🔄 [ImageUploadService] Asociando galería usando endpoint PATCH específico...");
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery`;

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
    const uploadResponse = await postFormData<{ objectId: string; url: string }>(
      "storage/upload",
      formData
    );

    const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/gallery`;
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
    const patchEndpoint = `${subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug)}/gallery`;
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