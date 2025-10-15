// Backend response / request types (Stage 3)

/** BackendBranch (BackendRama) */
export interface BackendBranch {
  section_id: number;
  tenant_id: string;
  group_id: number;
  name: string;
  description?: string;
  icon_object_url?: string | null;
  photo_principal_url?: string | null;
  gallery_object_urls?: string[];
  gallery?: Array<{ id: string; url: string }>;
  created_at?: string;
  updated_at?: string;
  min_age?: number;
  max_age?: number;
}

/** BackendSubgroup (BackendSubrama) */
export interface BackendSubgroup {
  subgroup_id: number;
  tenant_id: string;
  group_id: number;
  section_id: number;
  name: string;
  description?: string | null;
  photo_principal_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Backend request payloads
export interface CreateBranchBackendData {
  name: string;
  description?: string;
  iconObjectId: string | null;
  galleryObjectIds: string[];
}

export interface UpdateBranchBackendData {
  name?: string;
  description?: string;
  iconObjectId?: string | null;
  galleryObjectIds?: string[];
}

export interface CreateSubgroupBackendData {
  name: string;
  description?: string;
  galleryObjectIds?: string[];
  // Some backends expect snake_case field names for JSON. Keep both to be flexible.
  isActive?: boolean;
  is_active?: boolean;
}

export interface UpdateSubgroupBackendData {
  name?: string;
  description?: string;
  galleryObjectIds?: string[];
  isActive?: boolean;
  is_active?: boolean;
}

export interface UpdateSubgroupMainImageData {
  objectId: string;
}