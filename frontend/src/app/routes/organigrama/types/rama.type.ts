export interface Rama {
  section_id: string;
  sectionName: string;
  sectionDescription?: string;
  sectionGalleryObjectIds: string[];
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
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
  section_id: string; 
  id: string; 
  nombre: string;
  descripcion?: string;
  icono?: string;
  ramaId: string;
  lider?: string;
  estado: 'activa' | 'inactiva';
  fechaCreacion: string;
  numeroMiembros: number;
}

export interface CreateRamaBackendData {
  name: string;
  description?: string;
  iconObjectId: null;
  galleryObjectIds: string[];
}

export interface CreateSubramaBackendData {
  subgroupName: string;
  subgroupDescription?: string;
}
export interface UpdateRamaBackendData {
  name?: string;
  description?: string;
  iconObjectId?: null;
  galleryObjectIds?: string[];
}

export interface UpdateSubramaBackendData {
  subgroupName?: string;
  subgroupDescription?: string;
}

export interface CreateRamaData {
  nombre: string;
  descripcion?: string;
  edadMinima: number;
  edadMaxima: number;
  año: number;
}

export interface UpdateRamaData {
  id: string;
  nombre?: string;
  descripcion?: string;
  edadMinima?: number;
  edadMaxima?: number;
  estado?: 'activa' | 'inactiva';
}

export interface CreateSubramaData {
  nombre: string;
  descripcion?: string;
  ramaId: string;
  lider?: string;
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
  sectionId?: string;
  section_id?: string;
  id?: string;
  ID?: string;
  Section_ID?: string;
  name?: string;
  sectionName?: string;
  description?: string;
  sectionDescription?: string;
  iconObjectUrl?: string;
  galleryObjectUrls?: string[];
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
}