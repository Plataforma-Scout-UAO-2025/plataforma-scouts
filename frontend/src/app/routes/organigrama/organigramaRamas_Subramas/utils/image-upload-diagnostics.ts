import api from "@/api/axios";
import { uploadToStorage } from '@/api/upload';
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
  const initialImageCount = initialRama?.sectionGalleryObjectIds?.length || 0;
  const initialUrls = [...(initialRama?.sectionGalleryObjectIds || [])];
  
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

  await api.patch(patchEndpoint, addPayload);
  // PATCH completado

  // Paso 4: Obtener estado final
  const finalRama = await getRamaById(tenantSlug, groupSlug, sectionId);
  const finalImageCount = finalRama?.sectionGalleryObjectIds?.length || 0;
  const finalUrls = [...(finalRama?.sectionGalleryObjectIds || [])];
  
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

// Funciones de diagnóstico expuestas: diagnosticImageUpload, analyzeImageUrls