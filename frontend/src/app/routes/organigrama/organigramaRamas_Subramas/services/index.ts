

// CRUD para Ramas
export {
  getRamas,
  getRamaById,
  getRamasWithSubramas,
  createRama,
  updateRama,
  deleteRama,
  getAvailableYears
} from './rama.service';

// CRUD para Subramas
export {
  getSubramasByRamaId,
  getSubramaById,
  createSubrama,
  updateSubrama,
  deleteSubrama
} from './subrama.service';

// Gestión de imágenes básicas
export {
  diagnoseBatchImageUpload,
  uploadSectionIcon,
  uploadSectionMainImage,
  uploadGalleryImages,
} from './image-upload.service';

export {
  removeSectionIcon,
  removeSectionMainImage
} from './image-upload-core.service';

// Gestión avanzada de galería de Ramas
export {
  addGalleryImage,
  getGalleryImageUuids,
  replaceGalleryImage,
  removeGalleryImage,
  deleteGalleryImageById,
  resolveGalleryItem
} from './gallery.service';

// Gestión de imágenes de Subramas
export {
  updateSubramaMainImage,
  uploadSubramaGalleryImages,
  addSubramaGalleryImage,
  replaceSubramaGalleryImage,
  removeSubramaGalleryImage,
  getSubramaGalleryImageUuids,
  removeSubramaMainImage
} from './subrama-image.service';

// Constantes y configuraciones
// NOTE: `PATCH_ENDPOINTS` has been deprecated in favor of builders in `src/api/organigramaApi.ts`
// Los consumers deben usar builders como `sectionPath`/`subgroupPath`.

// ============================================================================
// UTILIDADES Y HELPERS
// ============================================================================

// ✅ Función robusta para extraer UUIDs de URLs de Supabase
export const extractObjectIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  // Buscar cualquier UUID válido (36 caracteres)
  const match = url.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
  return match ? match[0] : null;
};

// Extrae múltiples UUIDs desde un array de URLs
export const extractObjectIdsFromUrls = (urls: string[]): string[] => {
  return urls
    .map(extractObjectIdFromUrl)
    .filter((id): id is string => id !== null);
};

// Limpieza local (solo placeholder)
export const clearAllStorageData = (): void => {
  console.warn('clearAllStorageData no está disponible en modo backend real');
};


