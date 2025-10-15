// Fachada ligera para centralizar operaciones de imagen del organigrama.
// Reexporta y envuelve las funciones existentes para facilitar una futura
// consolidación sin tocar la lógica actual en los servicios individuales.

import {
  diagnoseBatchImageUpload as diagUploadCore,
  uploadSectionIcon as uploadIconCore,
  uploadSectionMainImage as uploadMainCore,
  uploadGalleryImages as uploadGalleryCore,
} from '../organigramaRamas_Subramas/services/image-upload.service';
import {
  removeSectionIcon as removeIconCore,
  removeSectionMainImage as removeMainCore,
} from '../organigramaRamas_Subramas/services/image-upload-core.service';
import {
  addGalleryImage as addGalleryCore,
  getGalleryImageUuids as getGalleryUuidsCore,
  replaceGalleryImage as replaceGalleryCore,
  removeGalleryImage as removeGalleryCore,
  deleteGalleryImageById as deleteGalleryByIdCore,
  resolveGalleryItem as resolveGalleryItemCore,
  replaceGalleryList as replaceGalleryListCore,
} from '../organigramaRamas_Subramas/services/gallery.service';

import { GalleryItemSchema } from '../schemas/gallery.schema';
import { GalleryItemsSchema } from '../schemas/gallery.schema';
import type { GalleryItemZ } from '../schemas/gallery.schema';  
import type { GalleryItemsZ } from '../schemas/gallery.schema';

// Reexportar la API con nombres estables
export const diagnoseBatchImageUpload = (...args: Parameters<typeof diagUploadCore>) => diagUploadCore(...args);
export const uploadSectionIcon = (...args: Parameters<typeof uploadIconCore>) => uploadIconCore(...args);
export const uploadSectionMainImage = (...args: Parameters<typeof uploadMainCore>) => uploadMainCore(...args);
export const uploadGalleryImages = (...args: Parameters<typeof uploadGalleryCore>) => uploadGalleryCore(...args);

export const removeSectionIcon = (...args: Parameters<typeof removeIconCore>) => removeIconCore(...args);
export const removeSectionMainImage = (...args: Parameters<typeof removeMainCore>) => removeMainCore(...args);

// Nota: funciones de gallery/service se mantienen donde están (gallery.service.ts)
// La fachada facilita redirigir llamadas futuras desde aquí.

export default {
  diagnoseBatchImageUpload,
  uploadSectionIcon,
  uploadSectionMainImage,
  uploadGalleryImages,
  removeSectionIcon,
  removeSectionMainImage,
};

// Gallery advanced wrappers
export const addGalleryImage = (...args: Parameters<typeof addGalleryCore>) => addGalleryCore(...args);
export const getGalleryImageUuids = (...args: Parameters<typeof getGalleryUuidsCore>) => getGalleryUuidsCore(...args);
export const replaceGalleryImage = (...args: Parameters<typeof replaceGalleryCore>) => replaceGalleryCore(...args);
export const removeGalleryImage = (...args: Parameters<typeof removeGalleryCore>) => removeGalleryCore(...args);
export const deleteGalleryImageById = (...args: Parameters<typeof deleteGalleryByIdCore>) => deleteGalleryByIdCore(...args);
export const resolveGalleryItem: (...args: Parameters<typeof resolveGalleryItemCore>) => Promise<GalleryItemZ> = async (...args) => {
  const raw = await resolveGalleryItemCore(...args);
  const parsed = GalleryItemSchema.safeParse(raw);
  if (!parsed.success) {
    // Si la validación falla, intentamos construir un objeto compatible
    // GalleryItemZ a partir de las keys presentes (best-effort) para no
    // romper a los consumidores que esperan `.id` o `.objectId`.
    console.warn('imageFacade: gallery item inválido según schema', parsed.error.format());
    try {
      const rec = raw as Record<string, unknown>;
      const maybeId = rec['id'] ?? rec['objectId'] ?? rec['object_id'] ?? rec['uuid'];
      const maybeUrl = rec['url'] ?? rec['raw_url'] ?? rec['src'];
      const bestEffort: GalleryItemZ = {
        id: maybeId !== undefined && maybeId !== null ? String(maybeId) : undefined,
        objectId: rec['objectId'] !== undefined && rec['objectId'] !== null ? String(rec['objectId']) : undefined,
        url: maybeUrl !== undefined && maybeUrl !== null ? String(maybeUrl) : undefined,
      };
      return bestEffort;
    } catch {
      return {} as GalleryItemZ;
    }
  }
  return parsed.data;
};
export const replaceGalleryList = async (...args: Parameters<typeof replaceGalleryListCore>) => {
  const raw = await replaceGalleryListCore(...args);
  if (!raw) return raw;
  try {
    // Prefer 'gallery' array of objects when present
    const maybeGallery = (raw as Record<string, unknown>)['gallery'];
    if (Array.isArray(maybeGallery) && maybeGallery.length > 0) {
      const gParsed = GalleryItemsSchema.safeParse(maybeGallery);
      if (gParsed.success) {
        const out = { ...(raw as Record<string, unknown>) };
        out.gallery = gParsed.data as GalleryItemsZ;
        return out;
      }
    }
    // Fallback: if there are galleryObjectIds, coerce to simple items
    const maybeIds = (raw as Record<string, unknown>)['galleryObjectIds'] ?? (raw as Record<string, unknown>)['sectionGalleryObjectIds'] ?? (raw as Record<string, unknown>)['subgroupGalleryObjectIds'];
    if (Array.isArray(maybeIds) && maybeIds.length > 0) {
      const items = (maybeIds as unknown[]).map(g => ({ id: String(g) }));
      const gParsed2 = GalleryItemsSchema.safeParse(items);
      if (gParsed2.success) {
        const out = { ...(raw as Record<string, unknown>) };
        out.gallery = gParsed2.data as GalleryItemsZ;
        return out;
      }
    }
    return raw;
  } catch (e) {
    console.warn('imageFacade.replaceGalleryList: error normalizando respuesta', e);
    return raw;
  }
};

// facade helpers exported above