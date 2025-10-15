// Frontend-facing types (Stage 3)
export interface Branch {
  id: string;
  sectionId?: string;
  // Legacy / Spanish aliases (kept for compatibility during migration)
  section_id?: string | number;
  name: string;
  // Spanish alias
  nombre?: string;
  description?: string;
  // Spanish legacy alias for description
  descripcion?: string;
  iconUrl?: string;
  // legacy alias for icon URL
  icono?: string;
  iconObjectId?: string;
  // legacy alias for icon object id
  iconoObjectId?: string;
  mainImageUrl?: string;
  // legacy alias for main image
  imagenPrincipal?: string;
  mainImageObjectId?: string;
  // legacy alias for main image object id
  imagenPrincipalObjectId?: string;
  minAge: number;
  maxAge: number;
  year: number;
  // legacy alias for year
  año?: number;
  status: 'active' | 'inactive';
  // Spanish alias for status
  estado?: 'activa' | 'inactiva';
  createdAt: string;
  galleryObjectIds: string[];
  gallery?: Array<{ id: string; url: string }>;
  // legacy alias for gallery object ids
  sectionGalleryObjectIds?: string[];
  // extra compatibility alias used in some legacy code paths
  sectionGalleryObjectIdsLegacy?: string[];
  subgroups: Subgroup[];
  // Spanish alias for subgroups
  subramas?: Subgroup[];
}

export interface Subgroup {
  id: string;
  // Spanish alias for subgroup id
  subgroup_id?: string;
  subgroupName?: string;
  name: string;
  // Spanish alias
  nombre?: string;
  // Spanish legacy alias for description
  descripcion?: string;
  description?: string;
  iconUrl?: string;
  // legacy alias
  icono?: string;
  iconObjectId?: string;
  iconoObjectId?: string;
  mainImageUrl?: string;
  imagenPrincipal?: string;
  mainImageObjectId?: string;
  branchId: string;
  // legacy alias for branch/section id
  section_id?: string;
  ramaId?: string;
  leader?: string;
  status: 'active' | 'inactive';
  // Spanish alias for status
  estado?: 'activa' | 'inactiva';
  createdAt: string;
  memberCount: number;
  galleryObjectIds?: string[];
  // legacy alias used in some backend variants
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
