

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

// Gestión de imágenes (reexportadas desde la fachada central)
export {
  uploadSectionIcon,
  uploadSectionMainImage,
  uploadGalleryImages,
  removeSectionIcon,
  removeSectionMainImage,
  addGalleryImage,
  getGalleryImageUuids,
  replaceGalleryImage,
  deleteGalleryImageById,
  resolveGalleryItem,
  replaceGalleryList,
} from '../../services/imageFacade';

// Nota: las funciones de galería se reexportan desde la fachada central (imageFacade)
// El antiguo reexport desde './gallery.service' fue eliminado para evitar duplicados.

// Gestión de íconos de secciones
export {
  getCurrentIconUuid,
  setIcon,
  deleteIcon,
  updateIcon
} from './icon.service';

// Gestión de imágenes de subramas
export {
  updateSubramaMainImage,
  removeSubramaMainImage,
  replaceSubramaGalleryImage,
  removeSubramaGalleryImage
} from './subrama-image.service';



// UTILIDADES Y HELPERS

//  Función robusta para extraer UUIDs de URLs de Supabase
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