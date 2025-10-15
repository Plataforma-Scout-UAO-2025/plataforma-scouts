
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
  photoPrincipal?: string | null;
  isActive?: boolean;
}

export interface UpdateSubgroupBackendData {
  name?: string;
  description?: string;
  photoPrincipal?: string | null;
  isActive?: boolean;
}

export interface UpdateSubgroupMainImageData {
  objectId: string;
}