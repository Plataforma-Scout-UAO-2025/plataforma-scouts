export interface Rama {
  section_id: string;
  sectionName: string;
  sectionDescription?: string;
  sectionGalleryObjectIds: string[];
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  iconoObjectId?: string; // ID para la imagen en localStorage
  imagenPrincipal?: string; // URL de la imagen principal
  imagenPrincipalObjectId?: string; // ID para la imagen principal en localStorage
  edadMinima: number;
  edadMaxima: number;
  año: number;
  estado: 'activa' | 'inactiva';
  fechaCreacion: string;
  subramas: Subrama[];
}

export interface Subrama {
  subgroup_id: string; 
  subgroupName: string;
  subgroupDescription?: string;
  subgroupGalleryObjectIds?: string[]; // IDs de imágenes de galería en localStorage
  section_id: string; 
  id: string; 
  nombre: string;
  descripcion?: string;
  icono?: string;
  iconoObjectId?: string; // ID para la imagen en localStorage
  imagenPrincipal?: string; // URL de la imagen principal
  imagenPrincipalObjectId?: string; // ID para la imagen principal en localStorage
  ramaId: string;
  lider?: string;
  estado: 'activa' | 'inactiva';
  fechaCreacion: string;
  numeroMiembros: number;
}

export interface CreateRamaBackendData {
  name: string;
  description?: string;
  iconObjectId: string | null;
  galleryObjectIds: string[];
}

export interface CreateSubramaBackendData {
  name: string;
  description?: string;
  galleryObjectIds: string[];
  isActive: boolean;
}
export interface UpdateRamaBackendData {
  name?: string;
  description?: string;
  iconObjectId?: string | null;
  galleryObjectIds?: string[];
}

export interface UpdateSubramaBackendData {
  name?: string;
  description?: string;
  galleryObjectIds?: string[];
  isActive?: boolean;
}

<<<<<<< HEAD
=======
export interface UpdateSubramaMainImageData {
  objectId: string;
}

// Tipos para operaciones de galería según la guía del backend
export interface GalleryReplaceOperation {
  op: "replace";
  targetUuid: string;
  newValue: string;
}

export interface GalleryAddOperation {
  op: "add";
  newValue: string;
}

export interface GalleryRemoveOperation {
  op: "remove";
  targetUuid: string;
}

export interface GalleryUpdatePayload {
  operations: (GalleryReplaceOperation | GalleryAddOperation | GalleryRemoveOperation)[];
}

>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
export interface CreateRamaData {
  nombre: string;
  descripcion?: string;
  edadMinima: number;
  edadMaxima: number;
  año: number;
  iconFile?: File;
  galleryFiles?: File[];
}

export interface UpdateRamaData {
  id: string;
  nombre?: string;
  descripcion?: string;
  edadMinima?: number;
  edadMaxima?: number;
  estado?: 'activa' | 'inactiva';
  iconFile?: File;
  galleryFiles?: File[];
}

export interface CreateSubramaData {
  nombre: string;
  descripcion?: string;
  ramaId: string;
  lider?: string;
  galleryFiles?: File[];
}

export interface UpdateSubramaData {
  id: string;
  subgroup_id?: string;
  nombre?: string;
  descripcion?: string;
  lider?: string;
  estado?: 'activa' | 'inactiva';
  ramaId?: string;
}

// Tipos para las respuestas del backend
export interface BackendRama {
<<<<<<< HEAD
  sectionId?: string;
=======
  sectionId?: string | number;
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
  section_id?: string;
  id?: string;
  ID?: string;
  Section_ID?: string;
<<<<<<< HEAD
=======
  tenantId?: number;
  groupId?: number;
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
  name?: string;
  sectionName?: string;
  description?: string;
  sectionDescription?: string;
<<<<<<< HEAD
  iconObjectUrl?: string;
  iconObjectId?: string;
=======
  iconObjectUrl?: string | null;
  iconObjectId?: string;
  photoPrincipalUrl?: string | null;
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
  galleryObjectUrls?: string[];
  galleryObjectIds?: string[];
  sectionGalleryObjectIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  minAge?: number;
  maxAge?: number;
}

export interface BackendSubrama {
  subgroup_id?: string;
  subgroupId?: string;
  id?: string;
  ID?: string;
  subgroupIdLegacy?: string;
  subgroupName?: string;
  subgroup_name?: string;
  name?: string;
  nombre?: string;
  subgroupDescription?: string;
  subgroup_description?: string;
  description?: string;
  section_id?: string;
  sectionId?: string;
  leader?: string;
  leaderName?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  memberCount?: number;
  members?: number;
<<<<<<< HEAD
=======
  // Campos de imágenes (añadidos)
  iconObjectUrl?: string | null;
  photoPrincipalUrl?: string | null;
  galleryObjectUrls?: string[];
  iconObjectId?: string;
  photoPrincipalObjectId?: string;
  galleryObjectIds?: string[];
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
}