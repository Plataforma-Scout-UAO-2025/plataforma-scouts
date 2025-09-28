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
  sectionName: string;
  sectionDescription?: string;
  sectionGalleryObjectIds: string[];
}

export interface CreateSubramaBackendData {
  subgroupName: string;
  subgroupDescription?: string;
}
export interface UpdateRamaBackendData {
  sectionName?: string;
  sectionDescription?: string;
  sectionGalleryObjectIds?: string[];
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