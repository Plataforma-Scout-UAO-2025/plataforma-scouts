import api from '@/api/axios';
import { uploadToStorage } from '@/api/upload';
import { sectionPath } from '@/api/organigramaApi';
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
  tenantSlug: string,
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

    // Paso 2: Agregar a galería usando PATCH
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery`;
    const addPayload = createAddPayload(uploadResponse.objectId);
    const addPayloadToSend = addPayload && typeof addPayload === 'object' && 'operations' in addPayload
      ? (Array.isArray((addPayload as unknown as PayloadWithOperations).operations)
          ? createPayloadForBackend((addPayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
          : addPayload)
      : addPayload;
    console.info('🔄 [ImageUploadCore] Enviando PATCH (gallery add):', { endpoint: patchEndpoint, payload: addPayloadToSend });
    await api.patch(patchEndpoint, addPayloadToSend);

    // Paso 3: Verificar resultado usando una llamada directa al API
    const endpoint = sectionPath(sectionId, tenantSlug, groupSlug);
  const backendRama = await api.get<Record<string, unknown> | undefined>(endpoint);
  const backendRec = backendRama as unknown as Record<string, unknown> | undefined;
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
  tenantSlug: string,
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
    
    // Paso 2: Usar endpoint PATCH específico para icono
    // Associate icon via PATCH to section
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/icon`;
    
    // Backend expects UpdateImageRequest (snake_case) for icon — do not send `operations` here
    const attempts = [
      { description: 'snake_case object_id', payload: { object_id: uploadResponse.objectId } },
    ];

    let lastErr: unknown = null;
    let patched = false;
    for (const attempt of attempts) {
      try {
    const payloadToSend = attempt.payload && typeof attempt.payload === 'object' && 'operations' in attempt.payload
  ? (Array.isArray((attempt.payload as unknown as PayloadWithOperations).operations)
  ? createPayloadForBackend((attempt.payload as unknown as { operations: unknown[] }).operations as unknown as (import('../types/operations').GalleryAddOperation | import('../types/operations').GalleryReplaceOperation | import('../types/operations').GalleryRemoveOperation)[])
    : attempt.payload)
  : attempt.payload;
        console.info('🔄 [ImageUploadCore] Enviando PATCH (icon):', { endpoint: patchEndpoint, attempt: attempt.description, payload: payloadToSend });
        await api.patch(patchEndpoint, payloadToSend as unknown);
        console.log('✅ [ImageUploadService] Icono asociado correctamente con endpoint PATCH (primary)');
        patched = true;
        break;
      } catch (primaryError: unknown) {
        lastErr = primaryError;
        console.error('❌ [ImageUploadService] Error en intento PATCH para icono:', primaryError);
        console.error('❌ [ImageUploadService] Respuesta del backend:', (primaryError as MaybeAxiosError)?.response?.data ?? (primaryError as MaybeAxiosError)?.response ?? primaryError);
        // continuar con siguiente intento
      }
    }

    if (!patched) {
      console.error('❌ Ningún formato de PATCH funcionó para icono. Último error:', lastErr);
      throw lastErr;
    }
    
  // Icon uploaded successfully; objectId available in uploadResponse.objectId
    
    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error('❌ [ImageUploadService] Error subiendo icono:', error);
    throw error;
  }
};

// Nueva función específica para imagen principal
export const uploadSectionMainImage = async (
  tenantSlug: string,
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
    
    // Associate main image via PATCH to section
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/photo-principal`;
    
  // Primary payload will be attempted in snake_case first

    // Use simple snake_case payload only for main image
    try {
      const primarySnake = { object_id: uploadResponse.objectId };
      console.info('🔄 [ImageUploadCore] Enviando PATCH (main image primary snake):', { endpoint: patchEndpoint, payload: primarySnake });
      await api.patch(patchEndpoint, primarySnake);
      console.log('✅ [ImageUploadService] Imagen principal asociada correctamente con endpoint PATCH (primary)');
    } catch (primaryError: unknown) {
      console.error('❌ [ImageUploadService] Error en endpoint PATCH para imagen principal (primary):', primaryError);
      console.error('❌ [ImageUploadService] Respuesta del backend (primary):', (primaryError as MaybeAxiosError)?.response?.data ?? (primaryError as MaybeAxiosError)?.response ?? primaryError);
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
  tenantSlug: string,
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
    
    // Use PATCH to associate gallery images
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery`;
    
    // Usar el formato de operaciones para AGREGAR imágenes según la guía del backend
    const galleryPayload = createAddsPayloadFromArray(objectIds);
    
    // PATCH payload prepared in galleryPayload
    
    try {
      const galleryPayloadToSend = galleryPayload && typeof galleryPayload === 'object' && 'operations' in galleryPayload
        ? (Array.isArray((galleryPayload as unknown as PayloadWithOperations).operations)
            ? createPayloadForBackend((galleryPayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
            : galleryPayload)
        : galleryPayload;
      await api.patch(patchEndpoint, galleryPayloadToSend);
  // Gallery associated successfully; return uploaded URLs as fallback if backend doesn't return updated URLs
  return urls;
    } catch (patchError) {
      console.error('❌ [ImageUploadService] Error en endpoint PATCH para galería:', patchError);
      console.error('❌ [ImageUploadService] Payload enviado:', JSON.stringify(galleryPayload, null, 2));
      console.error('❌ [ImageUploadService] Endpoint usado:', patchEndpoint);
      throw patchError;
    }
  } catch (error) {
    console.error('❌ [ImageUploadService] Error subiendo galería:', error);
    throw error;
  }
};

// ==========================================================
// 🗑️ Eliminar ícono de sección (PATCH remove)
// ==========================================================
export const removeSectionIcon = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string
): Promise<void> => {
  // Añadir trazas y un guard para evitar eliminaciones accidentales y poder
  // diagnosticar quién invoca esta función si aparece inesperadamente en logs.
  console.log("🗑️ [ImageUploadService] Eliminando ícono de sección...", { tenantSlug, groupSlug, sectionId });
  // Imprimir stack trace para identificar la llamada que provocó la eliminación
  // (útil temporalmente para depuración en entorno de desarrollo).
  try { console.trace('Stack trace removeSectionIcon'); } catch { /* ignore if console.trace no disponible */ }

  // Safety guard: si sectionId es inválido, abortamos la operación para evitar
  // enviar un PATCH que ponga `object_id: null` por accidente.
  if (!sectionId) {
    console.warn('🔒 [ImageUploadService] removeSectionIcon llamado con sectionId vacío — abortando.');
    return;
  }

  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/icon`;

    // Prefer snake_case null payload for icon removal
    const attempts = [
      { description: 'snake_case object_id null', payload: { object_id: null } },
    ];

  let lastErr: unknown = null;
  let removed = false;
  for (const attempt of attempts) {
    console.log('📡 PATCH →', patchEndpoint, attempt.description, attempt.payload);
  try {
    const payloadToSend = attempt.payload && typeof attempt.payload === 'object' && 'operations' in attempt.payload
  ? (Array.isArray((attempt.payload as unknown as PayloadWithOperations).operations)
    ? createPayloadForBackend((attempt.payload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[] }).operations)
    : attempt.payload)
  : attempt.payload;
  const res = await api.patch(patchEndpoint, payloadToSend as unknown);
  console.log(`✅ Ícono eliminado correctamente con formato: ${attempt.description}`, res?.data ?? res);
      removed = true;
      break;
    } catch (e: unknown) {
      lastErr = e;
      const errorWithResponse = e as { response?: { data?: unknown } };
      if (errorWithResponse?.response) {
        console.error('❌ Respuesta del backend en intento de eliminación de icono:', errorWithResponse.response?.data);
      } else {
        console.error('❌ Error en intento de eliminación de icono (sin response):', e);
      }
    }
  }

  if (!removed) {
    console.error('❌ Ningún formato funcionó para eliminar el ícono de la sección. Último error:', lastErr);
    throw lastErr;
  }
};

// ==========================================================
// 🗑️ Eliminar imagen principal de sección (PATCH remove)
// ==========================================================
export const removeSectionMainImage = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string
): Promise<void> => {
  console.log("🗑️ [ImageUploadService] Eliminando imagen principal de sección...");
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/photo-principal`;

  // Prefer snake_case null payload for main image removal
  const attempts = [
    { description: 'snake_case object_id null', payload: { object_id: null } },
  ];

  let lastErr: unknown = null;
  let removed = false;
  for (const attempt of attempts) {
    console.log('📡 PATCH →', patchEndpoint, attempt.description, attempt.payload);
    try {
      const payloadToSend = attempt.payload && typeof attempt.payload === 'object' && 'operations' in attempt.payload
        ? (Array.isArray((attempt.payload as unknown as { operations?: unknown }).operations)
            ? createPayloadForBackend((attempt.payload as unknown as { operations: unknown[] }).operations as unknown as (import('../types/operations').GalleryAddOperation | import('../types/operations').GalleryReplaceOperation | import('../types/operations').GalleryRemoveOperation)[])
            : attempt.payload)
        : attempt.payload;
      const res = await api.patch(patchEndpoint, payloadToSend as unknown);
      console.log(`✅ Imagen principal eliminada correctamente con formato: ${attempt.description}`, res?.data ?? res);
      removed = true;
      break;
    } catch (e: unknown) {
      lastErr = e;
      const errorWithResponse = e as { response?: { data?: unknown } };
      if (errorWithResponse?.response) {
        console.error('❌ Respuesta del backend en intento de eliminación imagen principal:', errorWithResponse.response?.data);
      } else {
        console.error('❌ Error en intento de eliminación imagen principal (sin response):', e);
      }
    }
  }

  if (!removed) {
    console.error('❌ Ningún formato funcionó para eliminar la imagen principal de la sección. Último error:', lastErr);
    throw lastErr;
  }
};
