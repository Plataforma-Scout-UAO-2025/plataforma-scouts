import { uploadToStorage } from '@/api/upload';
import { patchGallery, getSection, deleteIcon, setIcon, deletePhotoPrincipal, setPhotoPrincipal } from '@/api/organigramaApi';
import { createAddPayload, createAddsPayloadFromArray, createPayloadForBackend } from '../utils/galleryPayload';
import type { GalleryAddOperation, GalleryReplaceOperation, GalleryRemoveOperation } from '../types/operations';

type MaybeAxiosError = { response?: { data?: unknown } };
type PayloadWithOperations = { operations?: unknown };

// Tipo para la respuesta del upload de archivos
interface UploadResponse {
  objectId: string;
  url?: string;
}

// Función de diagnóstico para verificar comportamiento del backend con imágenes
export const diagnoseBatchImageUpload = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<{ uploaded: number; returned: number; details: Record<string, unknown> }> => {
  // Diagnostic: starting batch image upload analysis
  // File info: name, size, type available in `file`

  try {
    // Paso 1: Subir archivo individual
    const formData = new FormData();
    formData.append('file', file);
    
  const uploadResponse = await uploadToStorage<UploadResponse>(formData);

    const addPayload = createAddPayload(uploadResponse.objectId);
    const addPayloadToSend = addPayload && typeof addPayload === 'object' && 'operations' in addPayload
      ? (Array.isArray((addPayload as unknown as PayloadWithOperations).operations)
          ? createPayloadForBackend((addPayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
          : addPayload)
      : addPayload;
    console.info(' [ImageUploadCore] Enviando PATCH (gallery add) via client:', { payload: addPayloadToSend });
    await patchGallery(sectionId, addPayloadToSend as Record<string, unknown>, tenantId, groupSlug);

    const backendRec = await getSection(sectionId, tenantId, groupSlug) as Record<string, unknown> | undefined;
  const gallery: string[] = (backendRec?.['galleryObjectIds'] as string[] | undefined) ?? (backendRec?.['sectionGalleryObjectIds'] as string[] | undefined) ?? [];
  const resultCount = gallery?.length || 0;

    const result = {
      uploaded: 1,
      returned: resultCount,
      details: {
        originalObjectId: uploadResponse.objectId,
        returnedUrls: (backendRec?.['galleryObjectIds'] as string[] | undefined) ?? (backendRec?.['sectionGalleryObjectIds'] as string[] | undefined) ?? [],
        isProbablyMultiVariant: resultCount > 1
      }
    };

  // Diagnostic result available in `result`
    return result;

  } catch (error) {
    console.error('❌ [DIAGNÓSTICO] Error:', error);
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
  file: File
): Promise<string> => {
  // Uploading section icon — parameters available in arguments
  
  try {
    // Paso 1: Subir archivo al sistema de archivos
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload file to storage
  const uploadResponse = await uploadToStorage<UploadResponse>(formData);
    
  // handled by organigramaClient
    
    const payload = { object_id: uploadResponse.objectId };
    console.info(' [ImageUploadCore] Enviando PATCH (icon) via client:', { payload });
    await setIcon(sectionId, payload, tenantId, groupSlug);
    console.log(' [ImageUploadService] Icono asociado correctamente con endpoint PATCH (icon)');
    
  // Icon uploaded successfully; objectId available in uploadResponse.objectId
    
    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error('❌ [ImageUploadService] Error subiendo icono:', error);
    throw error;
  }
};

// Nueva función específica para imagen principal
export const uploadSectionMainImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<string> => {
  // Uploading main section image
  
  try {
    // Paso 1: Subir archivo al sistema de archivos
    const formData = new FormData();
    formData.append('file', file);
    
  const uploadResponse = await uploadToStorage<UploadResponse>(formData);
    
  // handled by organigramaClient
    
  // Primary payload will be attempted in snake_case first

    // Use simple snake_case payload only for main image
    try {
      const primaryPayload = { objectId: uploadResponse.objectId };
  console.info(' [ImageUploadCore] Enviando PATCH a photo-principal con objectId');
  await setPhotoPrincipal(sectionId, primaryPayload, tenantId, groupSlug);
      console.log(' [ImageUploadService] Imagen principal asociada correctamente con endpoint PATCH (photo-principal)');
    } catch (primaryError: unknown) {
      console.error(' [ImageUploadService] Error en endpoint PATCH para imagen principal (photo-principal):', primaryError);
      console.error(' [ImageUploadService] Respuesta del backend (photo-principal):', (primaryError as MaybeAxiosError)?.response?.data ?? (primaryError as MaybeAxiosError)?.response ?? primaryError);
      throw primaryError;
    }
    
  // Main image uploaded successfully; objectId available in uploadResponse.objectId
    
    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error('❌ [ImageUploadService] Error subiendo imagen principal:', error);
    throw error;
  }
};

// Función básica para subir múltiples imágenes sin verificaciones adicionales
export const uploadGalleryImages = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  files: File[]
): Promise<string[]> => {
  // Uploading gallery images
  
  try {
    const objectIds: string[] = [];
    const urls: string[] = [];
    
    // Paso 1: Subir cada archivo individualmente
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
  const uploadResponse = await uploadToStorage<UploadResponse>(formData);
      objectIds.push(uploadResponse.objectId);
      urls.push(uploadResponse.url || uploadResponse.objectId);
    }
    
  // handled by organigramaClient
    
    // Usar el formato de operaciones para AGREGAR imágenes según la guía del backend
    const galleryPayload = createAddsPayloadFromArray(objectIds);
    
    // PATCH payload prepared in galleryPayload
    
    try {
      const galleryPayloadToSend = galleryPayload && typeof galleryPayload === 'object' && 'operations' in galleryPayload
        ? (Array.isArray((galleryPayload as unknown as PayloadWithOperations).operations)
            ? createPayloadForBackend((galleryPayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
            : galleryPayload)
        : galleryPayload;
      await patchGallery(sectionId, galleryPayloadToSend as Record<string, unknown>, tenantId, groupSlug);
  return urls;
    } catch (patchError) {
      console.error(' [ImageUploadService] Error en endpoint PATCH para galería:', patchError);
      console.error(' [ImageUploadService] Payload enviado:', JSON.stringify(galleryPayload, null, 2));
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [ImageUploadService] Error subiendo galería:', error);
    throw error;
  }
};

//  Eliminar ícono de sección (DELETE icon)
export const removeSectionIcon = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string
): Promise<void> => {
  console.log("🗑️ [ImageUploadService] Eliminando ícono de sección...");
  try {
    await deleteIcon(sectionId, tenantId, groupSlug);
    console.log(" Ícono eliminado correctamente");
  } catch (error: unknown) {
    console.error(' Error eliminando ícono de sección:', error);
    throw error;
  }
};

// ==========================================================
// 🗑️ Eliminar imagen principal de sección (PATCH remove)
// ==========================================================
export const removeSectionMainImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string
): Promise<void> => {
  console.log(" [ImageUploadService] Eliminando imagen principal de sección...");
  try {
    await deletePhotoPrincipal(sectionId, tenantId, groupSlug);
    console.log(" Imagen principal eliminada correctamente");
  } catch (error: unknown) {
    console.error(' Error eliminando imagen principal de sección:', error);
    throw error;
  }
};
