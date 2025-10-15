// Frontend-facing types (Stage 3)
export interface Branch {
  id: string;
  sectionId?: string;
  // Legacy / Spanish aliases (kept for compatibility during migration)
  section_id?: string | number;
  name: string;
  // Spanish alias (used in exports)
  nombre?: string;
  description?: string;
  // Spanish legacy alias for description (used in exports)
  descripcion?: string;
  iconUrl?: string;
  // legacy alias for icon URL (used in components)
  icono?: string;
  iconObjectId?: string;
  // legacy alias for icon object id (used in components)
  iconoObjectId?: string;
  mainImageUrl?: string;
  // legacy alias for main image (used in components)
  imagenPrincipal?: string;
  mainImageObjectId?: string;
  minAge: number;
  maxAge: number;
  year: number;
  status: 'active' | 'inactive';
  // Spanish alias for status (used in mappers)
  estado?: 'activa' | 'inactiva';
  createdAt: string;
  galleryObjectIds: string[];
  gallery?: Array<{ id: string; url: string }>;
  // legacy alias for gallery object ids (used in diagnostics)
  sectionGalleryObjectIds?: string[];
  subgroups: Subgroup[];
  // Spanish alias for subgroups (used in exports)
  subramas?: Subgroup[];
}

export interface Subgroup {
  id: string;
  // Spanish alias for subgroup id (used in services)
  subgroup_id?: string;
  subgroupName?: string;
  name: string;
  // Spanish alias (used in exports)
  nombre?: string;
  description?: string;
  // Spanish legacy alias for description (used in exports)
  descripcion?: string;
  iconUrl?: string;
  iconObjectId?: string;
  mainImageUrl?: string;
  // legacy alias for main image (used in components/services)
  imagenPrincipal?: string;
  mainImageObjectId?: string;
  branchId: string;
  // legacy alias for branch/section id
  section_id?: string;
  // legacy alias for branch id (used in components)
  ramaId?: string;
  leader?: string;
  status: 'active' | 'inactive';
  // Spanish alias for status (used in mappers)
  estado?: 'activa' | 'inactiva';
  createdAt: string;
  memberCount: number;
  galleryObjectIds?: string[];
  // legacy alias used in services
  subgroupGalleryObjectIds?: string[];
  gallery?: Array<{ id: string; url: string }>;
}

// Frontend create/update payloads
export interface CreateBranchData {
  name: string;
  description?: string;
  minAge: number;
  maxAge: number;
  year: number;
  iconFile?: File;
  galleryFiles?: File[];
}

export interface UpdateBranchData {
  id: string;
  name?: string;
  description?: string;
  minAge?: number;
  maxAge?: number;
  status?: 'active' | 'inactive';
  iconFile?: File;
  galleryFiles?: File[];
}

export interface CreateSubgroupData {
  name: string;
  description?: string;
  branchId: string;
  leader?: string;
  galleryFiles?: File[];
}

export interface UpdateSubgroupData {
  id: string;
  name?: string;
  description?: string;
  leader?: string;
  status?: 'active' | 'inactive';
  branchId?: string;
}
