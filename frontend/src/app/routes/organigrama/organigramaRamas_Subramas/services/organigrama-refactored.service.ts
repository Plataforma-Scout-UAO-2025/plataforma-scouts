// ============================================================================
// SERVICIO PRINCIPAL DE ORGANIGRAMA - REFACTORIZADO Y MODULAR
// ============================================================================
// Este archivo actúa como punto de entrada principal que re-exporta
// todas las funcionalidades organizadas en módulos especializados

// Integración directa con backend real - NO MÁS MOCKS
console.log('🔄 [OrganigramaService] Iniciado en modo backend real - REFACTORIZADO');

// ============================================================================
// RE-EXPORTACIONES DE SERVICIOS MODULARES
// ============================================================================

// CRUD para Ramas
export {
  getRamas,
  getRamaById,
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

// Gestión de imágenes básicas (iconos, imagen principal, galería básica)
export {
  diagnoseBatchImageUpload,
  uploadSectionIcon,
  uploadSectionMainImage,
  uploadGalleryImages
} from './image-upload.service';

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
  getSubramaGalleryImageUuids
} from './subrama-image.service';

// Constantes y configuraciones
export { PATCH_ENDPOINTS } from '../constants/api-endpoints';

// ============================================================================
// FUNCIONES AUXILIARES Y UTILITARIOS
// ============================================================================

// Función utilitaria para extraer objectId de una URL de Supabase
export const extractObjectIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  
  // Patron: https://xxx.supabase.co/storage/v1/object/public/images/organigrama/[UUID].extension
  const match = url.match(/\/([a-f0-9-]{36})\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
};

// Función utilitaria para extraer múltiples objectIds de un array de URLs
export const extractObjectIdsFromUrls = (urls: string[]): string[] => {
  return urls.map(extractObjectIdFromUrl).filter(Boolean) as string[];
};

// 🧹 Función de limpieza no aplicable al backend real
export const clearAllStorageData = (): void => {
  console.warn('clearAllStorageData no está disponible en modo backend real');
};

// ============================================================================
// REGISTRO DE MÓDULOS CARGADOS
// ============================================================================
console.log('✅ [OrganigramaService] Módulos cargados:');
console.log('   📁 rama.service.ts - CRUD de Ramas');
console.log('   📁 subrama.service.ts - CRUD de Subramas');
console.log('   📁 image-upload.service.ts - Upload básico de imágenes');
console.log('   📁 gallery.service.ts - Gestión de galería de Ramas');
console.log('   📁 subrama-image.service.ts - Gestión de imágenes de Subramas');
console.log('   📁 api-endpoints.ts - Configuración de endpoints');
console.log('🚀 [OrganigramaService] Listo para usar - Arquitectura modular implementada');