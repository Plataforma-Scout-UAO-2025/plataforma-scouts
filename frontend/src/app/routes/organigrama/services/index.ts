// ============================================================================
// ÍNDICE PRINCIPAL DE SERVICIOS DE ORGANIGRAMA - REFACTORIZADO
// ============================================================================
// Este archivo sirve como punto de entrada único para todos los servicios
// del módulo de organigrama refactorizado

// ============================================================================
// SERVICIOS PRINCIPALES REFACTORIZADOS
// ============================================================================

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
  removeGalleryImage
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
export { PATCH_ENDPOINTS } from '../constants/api-endpoints';

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


// ============================================================================
// INFORMACIÓN DE LA REFACTORIZACIÓN
// ============================================================================
console.log('✅ [OrganigamaServices] Servicios refactorizados cargados:');
console.log('   📁 rama.service.ts - CRUD de Ramas (separado)');
console.log('   📁 subrama.service.ts - CRUD de Subramas (separado)');
console.log('   📁 image-upload-core.service.ts - Upload básico (separado)');
console.log('   📁 gallery.service.ts - Gestión galería Ramas (separado)');
console.log('   📁 subrama-image.service.ts - Gestión imágenes Subramas (separado)');
console.log('   📁 api-endpoints.ts - Configuración endpoints (separado)');
console.log('🚀 [OrganigamaServices] Arquitectura modular implementada exitosamente');
console.log('📝 [OrganigamaServices] Archivo original: ~1227 líneas → 6 módulos especializados');
console.log('🎯 [OrganigamaServices] Beneficios: Mantenibilidad, Separación de responsabilidades, Testing unitario');