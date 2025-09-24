export interface Rama {
  id: string;
  nombre: string;
  descripcion?: string;
  edadMinima: number;
  edadMaxima: number;
  año: number;
  estado: 'activa' | 'inactiva';
  fechaCreacion: string;
  subramas: Subrama[];
}

export interface Subrama {
  id: string;
  nombre: string;
  descripcion?: string;
  ramaId: string;
  lider?: string;
  estado: 'activa' | 'inactiva';
  fechaCreacion: string;
  numeroMiembros: number;
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
  nombre?: string;
  descripcion?: string;
  lider?: string;
  estado?: 'activa' | 'inactiva';
}