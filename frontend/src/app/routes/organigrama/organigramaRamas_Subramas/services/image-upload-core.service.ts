import { uploadToStorage } from '@/api/upload';
import { patchGallery, deleteIcon, setIcon } from '@/api/organigramaApi';
import { createAddsPayloadFromArray, createPayloadForBackend } from '../utils/galleryPayload';
import type { GalleryAddOperation, GalleryReplaceOperation } from '../types/operations';
import type { AppDispatch } from '@/store/store';
import { setPhotoPrincipalAction, deletePhotoPrincipalAction } from '@/store/organigrama/organigramaActions';

type MaybeAxiosError = { response?: { data?: unknown } };
type PayloadWithOperations = { operations?: unknown };

interface UploadResponse {
  objectId: string;
  url?: string;
}

export const uploadSectionIcon = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  file: File
): Promise<string> => {
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
  const uploadResponse = await uploadToStorage<UploadResponse>(formData);
    
  // handled by organigramaClient
    
    const payload = { objectId: uploadResponse.objectId };
    console.info(' [ImageUploadCore] Enviando PATCH (icon) via client:', { payload });
    await setIcon(sectionId, payload, tenantId, groupSlug);
    console.log(' [ImageUploadService] Icono asociado correctamente con endpoint PATCH (icon)');
    
    
    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error(' [ImageUploadService] Error subiendo icono:', error);
    throw error;
  }
};

export const uploadSectionMainImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  file: File,
  dispatch: AppDispatch
): Promise<string> => {
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await uploadToStorage<UploadResponse>(formData);
    
    try {
      console.info(' [ImageUploadCore] Usando Redux action para photo-principal:', { objectId: uploadResponse.objectId });
      await dispatch(setPhotoPrincipalAction({ 
        tenantId, 
        groupSlug, 
        sectionId, 
        objectId: uploadResponse.objectId 
      }));
      console.log(' [ImageUploadService] Imagen principal asociada correctamente con Redux action');
    } catch (primaryError: unknown) {
      console.error(' [ImageUploadService] Error ejecutando Redux action para imagen principal:', primaryError);
      console.error(' [ImageUploadService] Respuesta del error:', (primaryError as MaybeAxiosError)?.response?.data ?? (primaryError as MaybeAxiosError)?.response ?? primaryError);
      throw primaryError;
    }
    
    return uploadResponse.url || uploadResponse.objectId;
  } catch (error) {
    console.error(' [ImageUploadService] Error subiendo imagen principal:', error);
    throw error;
  }
};

export const uploadGalleryImages = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  files: File[]
): Promise<string[]> => {
  
  try {
    const objectIds: string[] = [];
    const urls: string[] = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
  const uploadResponse = await uploadToStorage<UploadResponse>(formData);
      objectIds.push(uploadResponse.objectId);
      urls.push(uploadResponse.url || uploadResponse.objectId);
    }
    
  // handled by organigramaClient
    
    const galleryPayload = createAddsPayloadFromArray(objectIds);
    
    
    try {
      const galleryPayloadToSend = galleryPayload && typeof galleryPayload === 'object' && 'operations' in galleryPayload
        ? (Array.isArray((galleryPayload as unknown as PayloadWithOperations).operations)
            ? createPayloadForBackend((galleryPayload as unknown as { operations: (GalleryAddOperation | GalleryReplaceOperation)[] }).operations)
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
    console.error(' [ImageUploadService] Error subiendo galería:', error);
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

//  Eliminar imagen principal de sección
export const removeSectionMainImage = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  dispatch: AppDispatch
): Promise<void> => {
  console.log(" [ImageUploadService] Eliminando imagen principal de sección...");
  try {
    console.info(' [ImageUploadCore] Usando Redux action para eliminar photo-principal');
    await dispatch(deletePhotoPrincipalAction({ tenantId, groupSlug, sectionId }));
    console.log(" Imagen principal eliminada correctamente con Redux action");
  } catch (error: unknown) {
    console.error(' Error eliminando imagen principal de sección:', error);
    throw error;
  }
};