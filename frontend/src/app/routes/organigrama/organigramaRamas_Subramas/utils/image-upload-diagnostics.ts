import api from "@/api/axios";
import { uploadToStorage } from '@/api/upload';
import { createPayloadForBackend } from '../utils/galleryPayload';
import type { GalleryAddOperation, GalleryReplaceOperation, GalleryRemoveOperation } from '../types/operations';
import { getRamaById } from '../services';
import { sectionPath } from '@/api/organigramaApi';

interface UploadDiagnostic {
  fileInfo: {
    name: string;
    size: number;
    type: string;
  };
  uploadResult: {
    objectId: string;
    url?: string;
  };
  backendResponse: {
    totalImages: number;
    allUrls: string[];
    newUrls: string[];
  };
  analysis: {
    isMultipleVariants: boolean;
    possibleCause: string;
    recommendation: string;
  };
}

/**
 * Realiza un diagnóstico completo del comportamiento de upload
 */
export const diagnosticImageUpload = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<UploadDiagnostic> => {
  // Iniciando diagnóstico de upload
  
  // Paso 1: Obtener estado inicial de la galería
  const initialRama = await getRamaById(tenantSlug, groupSlug, sectionId);
  const initialGallery = (initialRama as unknown as Record<string, unknown>)?.['gallery'] as unknown[] | undefined;
  const initialUrls = Array.isArray(initialGallery) ? (initialGallery as Array<Record<string, unknown>>).map(g => String(g.url)).filter(Boolean) : [...(initialRama?.sectionGalleryObjectIds || [])];
  const initialImageCount = initialUrls.length;
  
  // Estado inicial: imageCount, initialUrls

  // Paso 2: Subir archivo individual
  const formData = new FormData();
  formData.append('file', file);
  
  const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData);
  
  // Upload response available in uploadResponse

  // Paso 3: Agregar a galería usando PATCH
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery`;
  const addPayload = {
    operations: [{ 
      op: "add", 
      newValue: uploadResponse.objectId 
    }]
  };

  const addPayloadToSend = Array.isArray(addPayload.operations)
    ? createPayloadForBackend(addPayload.operations as unknown as (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[])
    : createPayloadForBackend([]);
  await api.patch(patchEndpoint, addPayloadToSend);
  // PATCH completado

  // Paso 4: Obtener estado final
  const finalRama = await getRamaById(tenantSlug, groupSlug, sectionId);
  const finalGallery = (finalRama as unknown as Record<string, unknown>)?.['gallery'] as unknown[] | undefined;
  const finalUrls = Array.isArray(finalGallery) ? (finalGallery as Array<Record<string, unknown>>).map(g => String(g.url)).filter(Boolean) : [...(finalRama?.sectionGalleryObjectIds || [])];
  const finalImageCount = finalUrls.length;
  
  // Paso 5: Analizar diferencias
  const newUrls = finalUrls.filter(url => !initialUrls.includes(url));
  const addedCount = finalImageCount - initialImageCount;
  
  // Estado final: finalImageCount, addedCount, newUrls, finalUrls

  // Análisis
  const isMultipleVariants = addedCount > 1;
  let possibleCause = '';
  let recommendation = '';

  if (isMultipleVariants) {
    possibleCause = 'Backend está generando múltiples variantes automáticamente (thumbnails, diferentes resoluciones, etc.)';
    recommendation = 'Verificar configuración de Supabase Storage o backend para image processing';
  } else {
    possibleCause = 'Comportamiento normal - 1 imagen subida, 1 imagen en galería';
    recommendation = 'No se requiere acción';
  }

  const diagnostic: UploadDiagnostic = {
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type
    },
    uploadResult: {
      objectId: uploadResponse.objectId,
      url: uploadResponse.url
    },
    backendResponse: {
      totalImages: finalImageCount,
      allUrls: finalUrls,
      newUrls
    },
    analysis: {
      isMultipleVariants,
      possibleCause,
      recommendation
    }
  };

  // Resultado completo disponible en `diagnostic`
  return diagnostic;
};

/**
 * Analiza las URLs devueltas por el backend para entender el patrón
 */
export const analyzeImageUrls = (urls: string[]): {
  basePattern: string;
  variations: Array<{ url: string; possibleType: string; uuid: string }>;
  summary: string;
} => {
  const variations = urls.map(url => {
    // Extraer UUID de la URL
    const uuidMatch = url.match(/\/([a-f0-9-]{36})\.[a-zA-Z0-9]+$/);
    const uuid = uuidMatch ? uuidMatch[1] : 'unknown';
    
    // Intentar detectar el tipo basado en la URL o patrón
    let possibleType = 'original';
    if (url.includes('thumb') || url.includes('thumbnail')) {
      possibleType = 'thumbnail';
    } else if (url.includes('small') || url.includes('medium') || url.includes('large')) {
      possibleType = 'resized';
    } else if (url.includes('webp') || url.includes('avif')) {
      possibleType = 'optimized_format';
    }
    
    return {
      url,
      possibleType,
      uuid
    };
  });

  const basePattern = urls[0]?.split('/').slice(0, -1).join('/') || 'unknown';
  
  const uniqueUuids = [...new Set(variations.map(v => v.uuid))];
  const summary = uniqueUuids.length === 1 
    ? `Múltiples variantes de la misma imagen (${variations.length} versiones)`
    : `Múltiples imágenes diferentes (${uniqueUuids.length} imágenes únicas)`;

  return {
    basePattern,
    variations,
    summary
  };
};

/**
 * Función helper para llamar desde la consola del navegador
 */
(window as unknown as Record<string, unknown>).diagnosticImageUpload = diagnosticImageUpload;
(window as unknown as Record<string, unknown>).analyzeImageUrls = analyzeImageUrls;

/**
 * Envía varias variantes de payload al endpoint /gallery para detectar qué formato acepta el backend.
 * Exponer esta función en `window.tryGalleryPayloadVariants` para ejecutarla desde la consola del navegador.
 */
export const tryGalleryPayloadVariants = async (
  tenantSlug: string,
  groupSlug: string,
  sectionId: string,
  objectId: string
) => {
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery`;

  const variants = [
  { name: 'value (payload)', payload: createPayloadForBackend([{ op: 'add', newValue: objectId } as GalleryAddOperation]) },
  { name: 'newValue (payload)', payload: createPayloadForBackend([{ op: 'add', newValue: objectId } as GalleryAddOperation]) },
    { name: 'object_id snake_case', payload: { object_id: objectId } },
  { name: 'raw array operations', payload: createPayloadForBackend([{ op: 'add', newValue: objectId } as GalleryAddOperation, { op: 'replace', targetUuid: objectId, newValue: objectId } as GalleryReplaceOperation]) },
  ];

  const results: Record<string, { success: boolean; status?: number; data?: unknown; error?: unknown }> = {};

  for (const v of variants) {
    try {
  const resp = await api.patch(patchEndpoint, v.payload);
  results[v.name] = { success: true, status: (resp as unknown as { status?: number })?.status, data: (resp as unknown as { data?: unknown })?.data };
      console.log(`✅ Variant ${v.name} succeeded:`, resp);
    } catch (err) {
      results[v.name] = { success: false, error: err };
      console.warn(`❌ Variant ${v.name} failed:`, err);
    }
  }

  return results;
};

(window as unknown as Record<string, unknown>).tryGalleryPayloadVariants = tryGalleryPayloadVariants;

// Funciones de diagnóstico expuestas: diagnosticImageUpload, analyzeImageUrls