/**
 * Tipos para la funcionalidad de galería de imágenes en secciones (ramas)
 * Basado en las instrucciones del backend para gestión de galerías
 */

export interface GalleryItem {
  /** UUID del objeto en Supabase Storage */
  id: string;
  /** URL pública de la imagen */
  url: string;
}

export interface GalleryPatchOperation {
  /** Tipo de operación a realizar */
  op: 'add' | 'replace' | 'remove';
  /** UUID de la imagen objetivo para replace/remove */
  targetUuid?: string;
  /** UUID del nuevo archivo para add/replace */
  newValue?: string;
}

export interface GalleryPatchRequest {
  /** Array de operaciones a aplicar a la galería */
  operations: GalleryPatchOperation[];
}

export interface GalleryDeleteParams {
  /** Si true, elimina también del storage de Supabase */
  deleteFromStorage?: boolean;
}

/**
 * Respuesta del endpoint de sección que incluye galería
 */
export interface SectionWithGallery {
  sectionId: number;
  name: string;
  /** Galería de imágenes (nuevo formato) */
  gallery: GalleryItem[];
  /** Formato legacy - array de URLs (para compatibilidad) */
  galleryObjectUrls?: string[];
  // Otros campos de la sección pueden agregarse aquí
}

/**
 * Parámetros para subir una imagen
 */
export interface ImageUploadParams {
  file: File;
  tenantId: string;
  groupSlug: string;
  sectionId: number;
}

/**
 * Estado del hook useGallery
 */
export interface GalleryState {
  gallery: GalleryItem[];
  loading: boolean;
  error: string | null;
  uploading: boolean;
}

/**
 * Acciones disponibles en el hook useGallery
 */
export interface GalleryActions {
  loadGallery: () => Promise<void>;
  addImage: (file: File) => Promise<void>;
  removeImage: (imageId: string, deleteFromStorage?: boolean) => Promise<void>;
  replaceImage: (index: number, file: File) => Promise<void>;
  clearGallery: () => Promise<void>;
  clearError: () => void;
}