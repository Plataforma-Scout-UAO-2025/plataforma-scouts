import api from '@/api/axios';
import { postFormData } from '@/api/formData';
import { sectionPath } from '@/api/organigramaApi';

type MaybeAxiosError = { response?: { data?: unknown } };

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
  console.log('🔬 [DIAGNÓSTICO] Iniciando análisis de comportamiento del backend...');
  console.log('📝 [DIAGNÓSTICO] Archivo:', {
    name: file.name,
    size: file.size,
    type: file.type
  });

  try {
    // Paso 1: Subir archivo individual
    const formData = new FormData();
    formData.append('file', file);
    
  const uploadResponse = await postFormData<UploadResponse>('/storage/upload', formData);
    console.log('✅ [DIAGNÓSTICO] Upload exitoso, objectId:', uploadResponse.objectId);

    // Paso 2: Agregar a galería usando PATCH
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery`;
    const addPayload = {
      operations: [{ op: "add", newValue: uploadResponse.objectId }]
    };

    await api.patch(patchEndpoint, addPayload);
    console.log('✅ [DIAGNÓSTICO] PATCH exitoso');

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

    console.log('🔬 [DIAGNÓSTICO] RESULTADO FINAL:', result);
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
  console.log('📤 [ImageUploadService] Subiendo icono de sección...');
  console.log('📝 [ImageUploadService] Parámetros:', {
    tenantSlug,
    groupSlug,
    sectionId,
    fileName: file.name,
    fileSize: file.size
  });
  
  try {
    // Paso 1: Subir archivo al sistema de archivos
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('🔄 [ImageUploadService] Subiendo archivo al storage...');
  const uploadResponse = await postFormData<UploadResponse>('/storage/upload', formData);
    console.log('✅ [ImageUploadService] Archivo subido, objectId:', uploadResponse.objectId);
    
    // Paso 2: Usar endpoint PATCH específico para icono
    console.log('🔄 [ImageUploadService] Asociando icono usando endpoint PATCH específico...');
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/icon`;
    console.log('📍 [ImageUploadService] Endpoint PATCH:', patchEndpoint);
    
    // Basándome en las pruebas de Postman, el payload es: { "objectId": "uuid" }
    const iconPayload = { objectId: uploadResponse.objectId };
    console.log('🔄 [ImageUploadService] PATCH payload para icono (primary):', iconPayload);

    try {
      await api.patch(patchEndpoint, iconPayload);
      console.log('✅ [ImageUploadService] Icono asociado correctamente con endpoint PATCH (primary)');
    } catch (primaryError: unknown) {
      console.error('❌ [ImageUploadService] Error en endpoint PATCH para icono (primary):', primaryError);
  console.error('❌ [ImageUploadService] Respuesta del backend (primary):', (primaryError as MaybeAxiosError)?.response?.data ?? (primaryError as MaybeAxiosError)?.response ?? primaryError);

      // Intentar payload alternativo: snake_case object_id
      const alt1 = { object_id: uploadResponse.objectId };
      console.log('🔄 [ImageUploadService] Intentando PATCH alternativo (object_id):', alt1);
      try {
        await api.patch(patchEndpoint, alt1);
        console.log('✅ [ImageUploadService] Icono asociado con payload alternativo (object_id)');
      } catch (alt1Error: unknown) {
        console.error('❌ [ImageUploadService] Falla alt1 (object_id):', alt1Error);
  console.error('❌ [ImageUploadService] Respuesta backend (alt1):', (alt1Error as MaybeAxiosError)?.response?.data ?? (alt1Error as MaybeAxiosError)?.response ?? alt1Error);

        // Intentar formato operations (similar a galería)
        const alt2 = { operations: [{ op: 'add', newValue: uploadResponse.objectId }] };
        console.log('🔄 [ImageUploadService] Intentando PATCH alternativo (operations add):', alt2);
        try {
          await api.patch(patchEndpoint, alt2);
          console.log('✅ [ImageUploadService] Icono asociado con payload alternativo (operations add)');
        } catch (alt2Error: unknown) {
          console.error('❌ [ImageUploadService] Falla alt2 (operations add):', alt2Error);
          console.error('❌ [ImageUploadService] Respuesta backend (alt2):', (alt2Error as MaybeAxiosError)?.response?.data ?? (alt2Error as MaybeAxiosError)?.response ?? alt2Error);

          // Intentar operations replace
          const alt3 = { operations: [{ op: 'replace', newValue: uploadResponse.objectId }] };
          console.log('🔄 [ImageUploadService] Intentando PATCH alternativo (operations replace):', alt3);
          try {
            await api.patch(patchEndpoint, alt3);
            console.log('✅ [ImageUploadService] Icono asociado con payload alternativo (operations replace)');
          } catch (alt3Error: unknown) {
            console.error('❌ [ImageUploadService] Falla alt3 (operations replace):', alt3Error);
            console.error('❌ [ImageUploadService] Respuesta backend (alt3):', (alt3Error as MaybeAxiosError)?.response?.data ?? (alt3Error as MaybeAxiosError)?.response ?? alt3Error);
            // Si todo falla, volver a lanzar el error original para que el UI lo muestre
            throw primaryError;
          }
        }
      }
    }
    
    console.log('✅ [ImageUploadService] Icono de sección subido con éxito');
    console.log('📝 [ImageUploadService] ObjectId guardado:', uploadResponse.objectId);
    
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
  console.log('📤 [ImageUploadService] Subiendo imagen principal de sección...');
  
  try {
    // Paso 1: Subir archivo al sistema de archivos
    const formData = new FormData();
    formData.append('file', file);
    
  const uploadResponse = await postFormData<UploadResponse>('/storage/upload', formData);
    
    // Paso 2: Usar endpoint PATCH específico para imagen principal
    console.log('🔄 [ImageUploadService] Asociando imagen principal usando endpoint PATCH específico...');
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/photo-principal`;
    
    // Basándome en las pruebas de Postman, el payload es: { "objectId": "uuid" }
    const mainImagePayload = { objectId: uploadResponse.objectId };
    console.log('🔄 [ImageUploadService] PATCH payload para imagen principal (primary):', mainImagePayload);

    try {
      await api.patch(patchEndpoint, mainImagePayload);
      console.log('✅ [ImageUploadService] Imagen principal asociada correctamente con endpoint PATCH (primary)');
    } catch (primaryError: unknown) {
      console.error('❌ [ImageUploadService] Error en endpoint PATCH para imagen principal (primary):', primaryError);
  console.error('❌ [ImageUploadService] Respuesta del backend (primary):', (primaryError as MaybeAxiosError)?.response?.data ?? (primaryError as MaybeAxiosError)?.response ?? primaryError);

      const alt1 = { object_id: uploadResponse.objectId };
      console.log('🔄 [ImageUploadService] Intentando PATCH alternativo (object_id) para imagen principal:', alt1);
      try {
        await api.patch(patchEndpoint, alt1);
        console.log('✅ [ImageUploadService] Imagen principal asociada con payload alternativo (object_id)');
  } catch (alt1Error: unknown) {
  console.error('❌ [ImageUploadService] Falla alt1 (object_id) imagen principal:', alt1Error);
          console.error('❌ [ImageUploadService] Respuesta backend (alt1):', (alt1Error as MaybeAxiosError)?.response?.data ?? (alt1Error as MaybeAxiosError)?.response ?? alt1Error);

        const alt2 = { operations: [{ op: 'add', newValue: uploadResponse.objectId }] };
        console.log('🔄 [ImageUploadService] Intentando PATCH alternativo (operations add) para imagen principal:', alt2);
        try {
          await api.patch(patchEndpoint, alt2);
          console.log('✅ [ImageUploadService] Imagen principal asociada con payload alternativo (operations add)');
        } catch (alt2Error: unknown) {
          console.error('❌ [ImageUploadService] Falla alt2 (operations add) imagen principal:', alt2Error);
          console.error('❌ [ImageUploadService] Respuesta backend (alt2):', (alt2Error as MaybeAxiosError)?.response?.data ?? (alt2Error as MaybeAxiosError)?.response ?? alt2Error);

          const alt3 = { operations: [{ op: 'replace', newValue: uploadResponse.objectId }] };
          console.log('🔄 [ImageUploadService] Intentando PATCH alternativo (operations replace) para imagen principal:', alt3);
          try {
            await api.patch(patchEndpoint, alt3);
            console.log('✅ [ImageUploadService] Imagen principal asociada con payload alternativo (operations replace)');
          } catch (alt3Error: unknown) {
            console.error('❌ [ImageUploadService] Falla alt3 (operations replace) imagen principal:', alt3Error);
            console.error('❌ [ImageUploadService] Respuesta backend (alt3):', (alt3Error as MaybeAxiosError)?.response?.data ?? (alt3Error as MaybeAxiosError)?.response ?? alt3Error);
            throw primaryError;
          }
        }
      }
    }
    
    console.log('✅ [ImageUploadService] Imagen principal de sección subida con éxito');
    console.log('📝 [ImageUploadService] ObjectId de imagen principal:', uploadResponse.objectId);
    
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
  console.log('📤 [ImageUploadService] Subiendo imágenes de galería...');
  
  try {
    const objectIds: string[] = [];
    const urls: string[] = [];
    
    // Paso 1: Subir cada archivo individualmente
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
  const uploadResponse = await postFormData<UploadResponse>('/storage/upload', formData);
      objectIds.push(uploadResponse.objectId);
      urls.push(uploadResponse.url || uploadResponse.objectId);
    }
    
    // Paso 2: Usar endpoint PATCH específico para galería
    console.log('🔄 [ImageUploadService] Asociando galería usando endpoint PATCH específico...');
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/gallery`;
    
    // Usar el formato de operaciones para AGREGAR imágenes según la guía del backend
    const galleryPayload = {
      operations: objectIds.map(objectId => ({
        op: "add",
        newValue: objectId
      }))
    };
    
    console.log('🔄 [ImageUploadService] PATCH payload para galería (formato operations):', galleryPayload);
    
    try {
      await api.patch(patchEndpoint, galleryPayload);
      console.log('✅ [ImageUploadService] Galería asociada correctamente con endpoint PATCH');
      
      // Retornar las URLs subidas inicialmente como fallback
      console.log('✅ [ImageUploadService] Imágenes de galería subidas con éxito');
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
  console.log("🗑️ [ImageUploadService] Eliminando ícono de sección...");
  const patchEndpoint = `${sectionPath(sectionId, tenantSlug, groupSlug)}/icon`;

  const attempts = [
    { description: 'operations remove (targetUuid null)', payload: { operations: [{ op: 'remove', targetUuid: null }] } },
    { description: 'operations remove (newValue null)', payload: { operations: [{ op: 'remove', newValue: null }] } },
    { description: 'camelCase objectId null', payload: { objectId: null } },
    { description: 'snake_case object_id null', payload: { object_id: null } },
  ];

  let lastErr: unknown = null;
  let removed = false;
  for (const attempt of attempts) {
    console.log('📡 PATCH →', patchEndpoint, attempt.description, attempt.payload);
  try {
  const res = await api.patch(patchEndpoint, attempt.payload as unknown);
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

  const attempts = [
    { description: 'operations remove (targetUuid null)', payload: { operations: [{ op: 'remove', targetUuid: null }] } },
    { description: 'operations remove (newValue null)', payload: { operations: [{ op: 'remove', newValue: null }] } },
    { description: 'camelCase objectId null', payload: { objectId: null } },
    { description: 'snake_case object_id null', payload: { object_id: null } },
  ];

  let lastErr: unknown = null;
  let removed = false;
  for (const attempt of attempts) {
    console.log('📡 PATCH →', patchEndpoint, attempt.description, attempt.payload);
    try {
      const res = await api.patch(patchEndpoint, attempt.payload as unknown);
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
